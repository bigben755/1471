from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

try:
    import resend
except Exception:  # pragma: no cover
    resend = None

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', ADMIN_EMAIL)

STAFF_ROLES = {"admin", "cfav"}
ALL_ROLES = {"admin", "cfav", "cadet", "parent"}

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="1471 Horwich Squadron RAF Air Cadets API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_roles(*roles):
    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker


require_staff = require_roles("admin", "cfav")


async def compute_member_stats(user_id: str) -> dict:
    """Points = attended-event points + bonus. Streak = attended volunteer events."""
    events = await db.events.find({"attendees": user_id}, {"_id": 0}).to_list(2000)
    points = sum(int(e.get("points_value", 0)) for e in events)
    streak = sum(1 for e in events if e.get("participation") == "volunteer")
    bonus = 0
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "bonus_points": 1})
    if u:
        bonus = int(u.get("bonus_points", 0))
    return {"points": points + bonus, "event_points": points, "bonus_points": bonus,
            "streak": streak, "events_attended": len(events)}


def public_user(u: dict) -> dict:
    return {
        "id": u["id"], "email": u["email"], "role": u["role"],
        "first_name": u.get("first_name", ""), "last_name": u.get("last_name", ""),
        "child_ids": u.get("child_ids", []), "bonus_points": int(u.get("bonus_points", 0)),
        "created_at": u.get("created_at"),
    }


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class ResetPassword(BaseModel):
    new_password: str = Field(..., min_length=6)


class UserCreate(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(default="")
    role: str
    password: str = Field(..., min_length=6)
    child_ids: List[str] = []
    model_config = ConfigDict(extra="ignore")


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    child_ids: Optional[List[str]] = None
    bonus_points: Optional[int] = None


class EnquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default="", max_length=40)
    enquiry_type: str
    message: str = Field(..., min_length=5, max_length=4000)
    consent: bool
    model_config = ConfigDict(extra="ignore")


class Enquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    enquiry_type: str
    message: str
    consent: bool
    status: str = "new"
    created_at: str = Field(default_factory=now_iso)


class StatusUpdate(BaseModel):
    status: str


class EventCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = ""
    location: str = ""
    start: str  # ISO datetime
    end: Optional[str] = None
    capacity: int = 0  # 0 = unlimited
    event_type: str = "standard"  # standard | premium
    participation: str = "attend"  # attend | volunteer
    points_value: int = 10
    model_config = ConfigDict(extra="ignore")


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    capacity: Optional[int] = None
    event_type: Optional[str] = None
    participation: Optional[str] = None
    points_value: Optional[int] = None


class AttendanceUpdate(BaseModel):
    attendee_ids: List[str]


class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=2)
    body: str = Field(..., min_length=1)
    roles: List[str]
    requires_ack: bool = False
    model_config = ConfigDict(extra="ignore")


class MessageCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=4000)


# ---------------------------------------------------------------------------
# Email (enquiries)
# ---------------------------------------------------------------------------
def _enquiry_email_html(e: Enquiry) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#EAF5F8;padding:24px;">
      <tr><td align="center"><table width="600" style="background:#fff;border:1px solid #d6e6ec;">
        <tr><td style="background:#002F5F;padding:20px 28px;color:#fff;font-size:18px;font-weight:bold;">1471 Horwich Squadron &mdash; New Website Enquiry</td></tr>
        <tr><td style="height:4px;background:#C60C30;"></td></tr>
        <tr><td style="padding:28px;color:#071A2F;font-size:15px;line-height:1.6;">
          <p><strong>Type:</strong> {e.enquiry_type}</p>
          <p><strong>Name:</strong> {e.name}</p>
          <p><strong>Email:</strong> {e.email}</p>
          <p><strong>Phone:</strong> {e.phone or '&ndash;'}</p>
          <p><strong>Message:</strong></p>
          <p style="padding:14px;background:#EAF5F8;border-left:3px solid #002F5F;">{e.message}</p>
        </td></tr>
      </table></td></tr></table>"""


async def send_enquiry_email(e: Enquiry) -> None:
    if not RESEND_API_KEY or resend is None:
        logger.info("Resend not configured; enquiry stored only (id=%s)", e.id)
        return
    try:
        resend.api_key = RESEND_API_KEY
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL, "to": [NOTIFY_EMAIL],
            "subject": f"New {e.enquiry_type} enquiry - {e.name}",
            "html": _enquiry_email_html(e), "reply_to": e.email,
        })
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to send enquiry email: %s", exc)


# ---------------------------------------------------------------------------
# Public + Auth routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "1471 Horwich Squadron RAF Air Cadets API"}


@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return {"access_token": token, "token_type": "bearer", "user": public_user(user)}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    data = public_user(user)
    if user["role"] in ("cadet", "parent", "cfav", "admin"):
        data["stats"] = await compute_member_stats(user["id"])
    return data


@api_router.post("/auth/change-password")
async def change_password(payload: ChangePassword, user: dict = Depends(get_current_user)):
    full = await db.users.find_one({"id": user["id"]})
    if not verify_password(payload.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one({"id": user["id"]},
                              {"$set": {"password_hash": hash_password(payload.new_password)}})
    return {"updated": True}


# ---------------------------------------------------------------------------
# Enquiries
# ---------------------------------------------------------------------------
@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(payload: EnquiryCreate):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required to submit this form.")
    enquiry = Enquiry(**payload.model_dump())
    await db.enquiries.insert_one(enquiry.model_dump())
    await send_enquiry_email(enquiry)
    return enquiry


@api_router.get("/enquiries", response_model=List[Enquiry])
async def list_enquiries(staff: dict = Depends(require_staff)):
    return await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.patch("/enquiries/{enquiry_id}", response_model=Enquiry)
async def update_enquiry(enquiry_id: str, update: StatusUpdate, staff: dict = Depends(require_staff)):
    if update.status not in {"new", "read", "actioned"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.enquiries.find_one_and_update(
        {"id": enquiry_id}, {"$set": {"status": update.status}},
        projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return res


@api_router.delete("/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, staff: dict = Depends(require_staff)):
    res = await db.enquiries.delete_one({"id": enquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"deleted": True}


# ---------------------------------------------------------------------------
# User management (staff)
# ---------------------------------------------------------------------------
@api_router.get("/users")
async def list_users(staff: dict = Depends(require_staff), role: Optional[str] = None):
    q = {"role": role} if role else {}
    users = await db.users.find(q, {"_id": 0}).sort("first_name", 1).to_list(2000)
    out = []
    for u in users:
        pu = public_user(u)
        if u["role"] in ("cadet",):
            pu["stats"] = await compute_member_stats(u["id"])
        out.append(pu)
    return out


@api_router.post("/users")
async def create_user(payload: UserCreate, staff: dict = Depends(require_staff)):
    if payload.role not in ALL_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    user = {
        "id": str(uuid.uuid4()), "email": payload.email.lower(),
        "password_hash": hash_password(payload.password), "role": payload.role,
        "first_name": payload.first_name, "last_name": payload.last_name,
        "child_ids": payload.child_ids if payload.role == "parent" else [],
        "bonus_points": 0, "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return public_user(user)


@api_router.patch("/users/{user_id}")
async def update_user(user_id: str, payload: UserUpdate, staff: dict = Depends(require_staff)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "role" in updates and updates["role"] not in ALL_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.users.find_one_and_update(
        {"id": user_id}, {"$set": updates}, projection={"_id": 0, "password_hash": 0},
        return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return public_user(res)


@api_router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, payload: ResetPassword, staff: dict = Depends(require_staff)):
    res = await db.users.update_one({"id": user_id},
                                    {"$set": {"password_hash": hash_password(payload.new_password)}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"updated": True}


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, staff: dict = Depends(require_staff)):
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["role"] == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete the admin account")
    await db.users.delete_one({"id": user_id})
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
def event_view(e: dict, user_id: str, staff: bool) -> dict:
    bids = e.get("bids", [])
    attendees = e.get("attendees", [])
    cap = int(e.get("capacity", 0))
    bid_count = len(bids)
    if cap <= 0:
        colour = "green"
    else:
        ratio = bid_count / cap
        colour = "green" if ratio < 0.5 else ("amber" if ratio < 1.0 else "red")
    view = {
        "id": e["id"], "title": e["title"], "description": e.get("description", ""),
        "location": e.get("location", ""), "start": e["start"], "end": e.get("end"),
        "capacity": cap, "event_type": e.get("event_type", "standard"),
        "participation": e.get("participation", "attend"),
        "points_value": int(e.get("points_value", 0)),
        "bid_count": bid_count, "attendee_count": len(attendees),
        "colour": colour, "my_bid": user_id in bids, "my_attendance": user_id in attendees,
    }
    if staff:
        view["bids"] = bids
        view["attendees"] = attendees
    return view


@api_router.get("/events")
async def list_events(user: dict = Depends(get_current_user)):
    staff = user["role"] in STAFF_ROLES
    events = await db.events.find({}, {"_id": 0}).sort("start", 1).to_list(2000)
    return [event_view(e, user["id"], staff) for e in events]


@api_router.get("/events/{event_id}")
async def get_event(event_id: str, user: dict = Depends(get_current_user)):
    e = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    staff = user["role"] in STAFF_ROLES
    view = event_view(e, user["id"], staff)
    if staff:
        bidders = await db.users.find({"id": {"$in": e.get("bids", [])}},
                                      {"_id": 0, "password_hash": 0}).to_list(500)
        view["bidders"] = [public_user(b) for b in bidders]
    return view


@api_router.post("/events")
async def create_event(payload: EventCreate, staff: dict = Depends(require_staff)):
    event = payload.model_dump()
    event.update({"id": str(uuid.uuid4()), "bids": [], "attendees": [],
                  "created_by": staff["id"], "created_at": now_iso()})
    await db.events.insert_one(event)
    return event_view(event, staff["id"], True)


@api_router.patch("/events/{event_id}")
async def update_event(event_id: str, payload: EventUpdate, staff: dict = Depends(require_staff)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    e = await db.events.find_one_and_update({"id": event_id}, {"$set": updates},
                                            projection={"_id": 0}, return_document=True)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_view(e, staff["id"], True)


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, staff: dict = Depends(require_staff)):
    res = await db.events.delete_one({"id": event_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"deleted": True}


@api_router.post("/events/{event_id}/bid")
async def toggle_bid(event_id: str, user: dict = Depends(require_roles("cadet"))):
    e = await db.events.find_one({"id": event_id})
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    bids = e.get("bids", [])
    if user["id"] in bids:
        bids.remove(user["id"])
        action = "withdrawn"
    else:
        cap = int(e.get("capacity", 0))
        if cap > 0 and len(bids) >= cap:
            raise HTTPException(status_code=400, detail="This event is already full")
        bids.append(user["id"])
        action = "placed"
    await db.events.update_one({"id": event_id}, {"$set": {"bids": bids}})
    return {"action": action, "bid_count": len(bids), "my_bid": user["id"] in bids}


@api_router.post("/events/{event_id}/attendance")
async def set_attendance(event_id: str, payload: AttendanceUpdate, staff: dict = Depends(require_staff)):
    e = await db.events.find_one({"id": event_id})
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.events.update_one({"id": event_id}, {"$set": {"attendees": payload.attendee_ids}})
    e["attendees"] = payload.attendee_ids
    return event_view(e, staff["id"], True)


# ---------------------------------------------------------------------------
# Notices
# ---------------------------------------------------------------------------
@api_router.get("/notices")
async def list_notices(user: dict = Depends(get_current_user)):
    if user["role"] in STAFF_ROLES:
        notices = await db.notices.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    else:
        notices = await db.notices.find({"roles": user["role"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    acks = await db.notice_acks.find({"user_id": user["id"]}, {"_id": 0, "notice_id": 1}).to_list(2000)
    acked = {a["notice_id"] for a in acks}
    for n in notices:
        n["acknowledged"] = n["id"] in acked
    return notices


@api_router.get("/notices/pending")
async def pending_notices(user: dict = Depends(get_current_user)):
    notices = await db.notices.find(
        {"roles": user["role"], "requires_ack": True}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    acks = await db.notice_acks.find({"user_id": user["id"]}, {"_id": 0, "notice_id": 1}).to_list(2000)
    acked = {a["notice_id"] for a in acks}
    return [n for n in notices if n["id"] not in acked]


@api_router.post("/notices/{notice_id}/ack")
async def ack_notice(notice_id: str, user: dict = Depends(get_current_user)):
    await db.notice_acks.update_one(
        {"notice_id": notice_id, "user_id": user["id"]},
        {"$set": {"notice_id": notice_id, "user_id": user["id"], "at": now_iso()}},
        upsert=True)
    return {"acknowledged": True}


@api_router.post("/notices")
async def create_notice(payload: NoticeCreate, staff: dict = Depends(require_staff)):
    roles = [r for r in payload.roles if r in ALL_ROLES]
    if not roles:
        raise HTTPException(status_code=400, detail="Select at least one valid audience")
    notice = {"id": str(uuid.uuid4()), "title": payload.title, "body": payload.body,
              "roles": roles, "requires_ack": payload.requires_ack,
              "created_by": f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Staff",
              "created_at": now_iso()}
    await db.notices.insert_one(notice)
    notice.pop("_id", None)
    return {k: v for k, v in notice.items() if k != "_id"}


@api_router.delete("/notices/{notice_id}")
async def delete_notice(notice_id: str, staff: dict = Depends(require_staff)):
    res = await db.notices.delete_one({"id": notice_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found")
    await db.notice_acks.delete_many({"notice_id": notice_id})
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Messages (member <-> staff board)
# ---------------------------------------------------------------------------
@api_router.get("/messages/thread")
async def my_thread(user: dict = Depends(require_roles("cadet", "parent"))):
    msgs = await db.messages.find({"member_id": user["id"]}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    await db.messages.update_many(
        {"member_id": user["id"], "from_staff": True, "read_by_member": {"$ne": True}},
        {"$set": {"read_by_member": True}})
    return msgs


@api_router.post("/messages/thread")
async def post_to_thread(payload: MessageCreate, user: dict = Depends(require_roles("cadet", "parent"))):
    msg = {"id": str(uuid.uuid4()), "member_id": user["id"],
           "member_name": f"{user.get('first_name','')} {user.get('last_name','')}".strip(),
           "from_staff": False, "author": user.get("first_name", "Member"),
           "body": payload.body, "created_at": now_iso(),
           "read_by_member": True, "read_by_staff": False}
    await db.messages.insert_one(msg)
    return {k: v for k, v in msg.items() if k != "_id"}


@api_router.get("/messages/threads")
async def staff_threads(staff: dict = Depends(require_staff)):
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$member_id",
                    "member_name": {"$first": "$member_name"},
                    "last_body": {"$first": "$body"},
                    "last_at": {"$first": "$created_at"},
                    "unread": {"$sum": {"$cond": [{"$and": [
                        {"$eq": ["$from_staff", False]},
                        {"$ne": ["$read_by_staff", True]}]}, 1, 0]}}}},
        {"$sort": {"last_at": -1}},
    ]
    rows = await db.messages.aggregate(pipeline).to_list(1000)
    out = []
    for r in rows:
        member = await db.users.find_one({"id": r["_id"]}, {"_id": 0, "password_hash": 0})
        out.append({"member_id": r["_id"],
                    "member_name": r.get("member_name") or (member and f"{member.get('first_name','')} {member.get('last_name','')}".strip()) or "Member",
                    "member_role": member["role"] if member else "member",
                    "last_body": r["last_body"], "last_at": r["last_at"], "unread": r["unread"]})
    return out


@api_router.get("/messages/thread/{member_id}")
async def staff_view_thread(member_id: str, staff: dict = Depends(require_staff)):
    msgs = await db.messages.find({"member_id": member_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    await db.messages.update_many(
        {"member_id": member_id, "from_staff": False, "read_by_staff": {"$ne": True}},
        {"$set": {"read_by_staff": True}})
    return msgs


@api_router.post("/messages/thread/{member_id}")
async def staff_reply(member_id: str, payload: MessageCreate, staff: dict = Depends(require_staff)):
    member = await db.users.find_one({"id": member_id}, {"_id": 0, "password_hash": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    msg = {"id": str(uuid.uuid4()), "member_id": member_id,
           "member_name": f"{member.get('first_name','')} {member.get('last_name','')}".strip(),
           "from_staff": True, "author": f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Staff",
           "body": payload.body, "created_at": now_iso(),
           "read_by_member": False, "read_by_staff": True}
    await db.messages.insert_one(msg)
    return {k: v for k, v in msg.items() if k != "_id"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup / seed
# ---------------------------------------------------------------------------
async def seed_users():
    demo = [
        {"email": ADMIN_EMAIL.lower(), "password": ADMIN_PASSWORD, "role": "admin",
         "first_name": "Squadron", "last_name": "Admin"},
        {"email": "cfav@1471horwich.org.uk", "password": "Cfav1471!", "role": "cfav",
         "first_name": "Alex", "last_name": "Instructor"},
        {"email": "cadet@1471horwich.org.uk", "password": "Cadet1471!", "role": "cadet",
         "first_name": "Sam", "last_name": "Cadet"},
        {"email": "parent@1471horwich.org.uk", "password": "Parent1471!", "role": "parent",
         "first_name": "Jordan", "last_name": "Parent"},
    ]
    ids = {}
    for d in demo:
        existing = await db.users.find_one({"email": d["email"]})
        if existing is None:
            uid = str(uuid.uuid4())
            await db.users.insert_one({
                "id": uid, "email": d["email"], "password_hash": hash_password(d["password"]),
                "role": d["role"], "first_name": d["first_name"], "last_name": d["last_name"],
                "child_ids": [], "bonus_points": 0, "created_at": now_iso()})
            ids[d["role"]] = uid
        else:
            if not verify_password(d["password"], existing["password_hash"]):
                await db.users.update_one({"email": d["email"]},
                                          {"$set": {"password_hash": hash_password(d["password"])}})
            ids[d["role"]] = existing["id"]
    # Link demo parent to demo cadet
    if ids.get("parent") and ids.get("cadet"):
        await db.users.update_one({"id": ids["parent"]}, {"$set": {"child_ids": [ids["cadet"]]}})

    # Seed a welcome notice requiring acknowledgement (idempotent)
    if await db.notices.find_one({"title": "Welcome to the 1471 Members Area"}) is None:
        await db.notices.insert_one({
            "id": str(uuid.uuid4()),
            "title": "Welcome to the 1471 Members Area",
            "body": "Welcome! Please keep your contact details up to date and check the calendar regularly to bid for upcoming events.",
            "roles": ["cadet", "parent", "cfav"], "requires_ack": True,
            "created_by": "Squadron Admin", "created_at": now_iso()})


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.events.create_index("start")
    await db.notice_acks.create_index([("notice_id", 1), ("user_id", 1)], unique=True)
    await db.messages.create_index("member_id")
    await seed_users()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
