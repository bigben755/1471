from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import io
import json
import base64
import logging
import uuid
import asyncio
from datetime import datetime, timezone, timedelta, date
from typing import List, Optional

import jwt
import bcrypt
import httpx
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
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
fs = AsyncIOMotorGridFSBucket(db)

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', ADMIN_EMAIL)

# Emergent managed email proxy (constant — never read base URL from env)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMERGENT_EMAIL_KEY = os.environ.get('EMERGENT_EMAIL_KEY', '').strip()
EMAIL_FROM_NAME = os.environ.get('EMAIL_FROM_NAME', '1471 Horwich Squadron')

AGE_BANDS = {
    "under_12": "12 and under",
    "yr7_starting_yr8": "In Year 7, starting Year 8 in September",
    "yr8": "12 and in Year 8",
    "13_plus": "13 and over",
}

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
    dob: Optional[str] = None
    age_band: Optional[str] = None
    model_config = ConfigDict(extra="ignore")


class Enquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    enquiry_type: str
    message: str
    consent: bool
    dob: Optional[str] = None
    age_band: Optional[str] = None
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


class Audience(BaseModel):
    mode: str = "all"  # all | roles | users | parent_of
    roles: List[str] = []
    user_ids: List[str] = []
    cadet_id: Optional[str] = None
    model_config = ConfigDict(extra="ignore")


class BroadcastCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    body: str = Field(..., min_length=1, max_length=8000)
    audience: Audience = Field(default_factory=Audience)
    channels: List[str] = ["dashboard"]
    model_config = ConfigDict(extra="ignore")


class NewsletterCreate(BaseModel):
    subject: str = Field(..., min_length=2, max_length=200)
    heading: str = Field(default="", max_length=200)
    intro: str = Field(default="", max_length=4000)
    body: str = Field(..., min_length=1, max_length=20000)
    model_config = ConfigDict(extra="ignore")


class NewsletterSend(BaseModel):
    audience: Audience = Field(default_factory=Audience)
    channels: List[str] = ["dashboard", "email"]
    model_config = ConfigDict(extra="ignore")


# ---------------------------------------------------------------------------
# Email (Emergent managed email proxy)
# ---------------------------------------------------------------------------
def _email_shell(title: str, inner: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#EAF5F8;padding:24px;">
      <tr><td align="center"><table width="600" style="background:#fff;border:1px solid #d6e6ec;">
        <tr><td style="background:#002F5F;padding:20px 28px;color:#fff;font-size:18px;font-weight:bold;">1471 Horwich Squadron RAF Air Cadets</td></tr>
        <tr><td style="height:4px;background:#C60C30;"></td></tr>
        <tr><td style="padding:28px;color:#071A2F;font-size:15px;line-height:1.6;">
          <h2 style="margin:0 0 14px;color:#002F5F;font-size:20px;">{title}</h2>
          {inner}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#F3F8FA;color:#5b6b78;font-size:12px;">1471 Horwich Squadron RAF Air Cadets &middot; This message was sent from the Squadron members area.</td></tr>
      </table></td></tr></table>"""


def _enquiry_email_html(e: Enquiry) -> str:
    band = AGE_BANDS.get(e.age_band or "", "")
    extra = ""
    if e.dob or band:
        extra = f"""<p><strong>Date of birth:</strong> {e.dob or '&ndash;'}</p>
          <p><strong>Age band:</strong> {band or '&ndash;'}</p>"""
    inner = f"""
      <p><strong>Type:</strong> {e.enquiry_type}</p>
      <p><strong>Name:</strong> {e.name}</p>
      <p><strong>Email:</strong> {e.email}</p>
      <p><strong>Phone:</strong> {e.phone or '&ndash;'}</p>
      {extra}
      <p><strong>Message:</strong></p>
      <p style="padding:14px;background:#EAF5F8;border-left:3px solid #002F5F;">{e.message}</p>"""
    return _email_shell("New website enquiry", inner)


def _text_to_html(text: str) -> str:
    safe = (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    paras = [p.strip() for p in safe.split("\n\n") if p.strip()]
    return "".join(f'<p style="margin:0 0 12px;">{p.replace(chr(10), "<br/>")}</p>' for p in paras)


def _broadcast_email_html(title: str, body: str, from_name: str) -> str:
    inner = _text_to_html(body) + f'<p style="margin-top:20px;color:#5b6b78;font-size:13px;">&mdash; {from_name}</p>'
    return _email_shell(title, inner)


def _newsletter_email_html(nl: dict) -> str:
    parts = []
    if nl.get("intro"):
        parts.append(f'<p style="font-size:16px;color:#334;">{_text_to_html(nl["intro"])}</p>')
    parts.append(_text_to_html(nl.get("body", "")))
    return _email_shell(nl.get("heading") or nl.get("subject", "Squadron newsletter"), "".join(parts))


async def send_email(to: str, subject: str, html: str, reply_to: Optional[str] = None) -> str:
    """Send one email via the managed proxy. Returns 'sent' | 'skipped' | 'failed'."""
    if not EMERGENT_EMAIL_KEY:
        logger.info("Email not configured; skipped send to %s", to)
        return "skipped"
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                headers={"X-Email-Key": EMERGENT_EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return "sent"
    except Exception as exc:  # pragma: no cover
        logger.error("Email send failed to %s: %s", to, exc)
        return "failed"


async def send_enquiry_email(e: Enquiry) -> None:
    await send_email(NOTIFY_EMAIL, f"New {e.enquiry_type} enquiry - {e.name}",
                     _enquiry_email_html(e), reply_to=e.email)


# ---------------------------------------------------------------------------
# Web Push (VAPID) — notifications + app icon badge on installed PWA
# ---------------------------------------------------------------------------
from pywebpush import webpush, WebPushException  # noqa: E402

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "").strip()
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:admin@1471horwich.org.uk")


def _load_vapid_pem() -> Optional[str]:
    b64 = os.environ.get("VAPID_PRIVATE_PEM_B64", "").strip()
    if not b64:
        return None
    path = "/tmp/vapid_private.pem"
    with open(path, "wb") as f:
        f.write(base64.b64decode(b64))
    return path


VAPID_PEM_PATH = _load_vapid_pem()


def _send_one_push(subscription: dict, payload: str) -> None:
    webpush(subscription_info=subscription, data=payload,
            vapid_private_key=VAPID_PEM_PATH, vapid_claims={"sub": VAPID_SUBJECT})


async def push_to_user(user_id: str, title: str, body: str, url: str = "/portal") -> None:
    if not VAPID_PEM_PATH:
        return
    subs = await db.push_subscriptions.find({"user_id": user_id}).to_list(20)
    if not subs:
        return
    badge = await db.notifications.count_documents({"user_id": user_id, "read": False})
    payload = json.dumps({"title": title, "body": (body or "")[:180], "url": url, "badge": badge})
    for s in subs:
        try:
            await asyncio.to_thread(_send_one_push, s["subscription"], payload)
        except WebPushException as exc:
            code = getattr(getattr(exc, "response", None), "status_code", None)
            if code in (404, 410):
                await db.push_subscriptions.delete_one({"_id": s["_id"]})
        except Exception as exc:  # pragma: no cover
            logger.error("Push failed for %s: %s", user_id, exc)


# ---------------------------------------------------------------------------
# Recruitment eligibility + broadcast helpers
# ---------------------------------------------------------------------------
def _eligible_date_obj(e: dict):
    """Canonical date a prospective cadet becomes eligible (date obj), or None."""
    band = e.get("age_band")
    if not band:
        return None
    try:
        cd = datetime.fromisoformat(e.get("created_at", "")).date()
    except Exception:
        cd = date.today()
    if band in ("yr8", "13_plus"):
        return cd  # already eligible when they enquired
    if band == "yr7_starting_yr8":
        s = date(cd.year, 9, 1)
        if cd > s:
            s = date(cd.year + 1, 9, 1)
        return s
    if band == "under_12":
        dob = e.get("dob")
        if not dob:
            return None
        try:
            d = datetime.fromisoformat(dob).date()
        except Exception:
            try:
                d = datetime.strptime(dob, "%Y-%m-%d").date()
            except Exception:
                return None
        # England school-year rule: Year 8 starts the September of birth_year + (12 if born Sep-Dec else 11)
        yr = d.year + (12 if d.month >= 9 else 11)
        return date(yr, 9, 1)
    return None


def eligible_date(e: dict) -> Optional[str]:
    ed = _eligible_date_obj(e)
    return ed.isoformat() if ed else None


def compute_eligibility(e: dict) -> Optional[str]:
    """Time-aware bucket: prospects move now <- september <- future as time passes."""
    if not e.get("age_band"):
        return None
    ed = _eligible_date_obj(e)
    if ed is None:
        return "future"  # cadet enquiry with no date of birth on record
    today = date.today()
    if ed <= today:
        return "now"
    ns = date(today.year, 9, 1)
    if today > ns:
        ns = date(today.year + 1, 9, 1)
    return "september" if ed <= ns else "future"


def countdown_text(target_iso: str) -> str:
    target = date.fromisoformat(target_iso)
    days = (target - date.today()).days
    if days <= 0:
        return "you can join us now"
    months, rem = days // 30, days % 30
    if months >= 1:
        out = f"about {months} month{'s' if months != 1 else ''}"
        if rem:
            out += f", {rem} day{'s' if rem != 1 else ''}"
        return out
    return f"{days} day{'s' if days != 1 else ''}"


def _joining_instructions_html(name: str, note: str = "", attachments: Optional[list] = None, base_url: str = "") -> str:
    note_html = f'<p style="padding:12px;background:#EAF5F8;border-left:3px solid #002F5F;">{note}</p>' if note else ""
    docs_html = ""
    if attachments:
        items = "".join(
            f'<li style="margin:4px 0;"><a href="{base_url}/api/attachments/{a["id"]}/download" style="color:#002F5F;">{a["filename"]}</a></li>'
            for a in attachments)
        docs_html = f'<p><strong>Documents to download</strong></p><ul style="padding-left:20px;">{items}</ul>'
    inner = f"""
      <p>Hi {name},</p>
      <p>Great news &mdash; you&rsquo;re old enough to join 1471 Horwich Squadron RAF Air Cadets, and we&rsquo;d love to welcome you along.</p>
      {note_html}
      <p><strong>When we parade</strong><br/>Monday &amp; Thursday evenings, 19:00&ndash;21:30.</p>
      <p><strong>Where</strong><br/>1471 (Horwich) ATC Sqn HQ, St Joseph&rsquo;s Secondary School &amp; Sports College, Chorley New Road, Horwich, BL6 6HW.</p>
      {docs_html}
      <p><strong>What to do next</strong><br/>Come along on a parade night with a parent or carer, in comfortable clothing. You don&rsquo;t need any experience or kit. Please reply to this email to let us know which evening you&rsquo;ll visit so we can look out for you.</p>
      <p>We look forward to meeting you!</p>
      <p>1471 Horwich Squadron staff team</p>"""
    return _email_shell("You can join us &mdash; here&rsquo;s how", inner)


def _countdown_html(name: str, target_iso: str, note: str = "") -> str:
    when = date.fromisoformat(target_iso).strftime("%d %B %Y").lstrip("0")
    note_html = f'<p style="padding:12px;background:#EAF5F8;border-left:3px solid #002F5F;">{note}</p>' if note else ""
    inner = f"""
      <p>Hi {name},</p>
      <p>Thanks for your interest in joining 1471 Horwich Squadron RAF Air Cadets!</p>
      <p>You&rsquo;re not quite old enough to join just yet &mdash; cadets can normally start from Year 8 (age 12). Based on the details you gave us, you&rsquo;ll be able to join us from <strong>{when}</strong>.</p>
      <p style="font-size:18px;color:#C60C30;font-weight:bold;">That&rsquo;s {countdown_text(target_iso)} to go!</p>
      {note_html}
      <p>We&rsquo;ll be in touch nearer the time. In the meantime, follow us on Facebook to see what our cadets get up to.</p>
      <p>See you soon,<br/>1471 Horwich Squadron staff team</p>"""
    return _email_shell("Not long to go until you can join!", inner)


async def send_recruit_email(e: dict, kind: Optional[str], note: str,
                             attachments: Optional[list] = None, base_url: str = "") -> dict:
    first = (e.get("name", "there").strip().split(" ") or ["there"])[0]
    elig = compute_eligibility(e)
    k = "joining" if elig == "now" else (kind if kind in ("joining", "countdown") else "countdown")
    if k == "joining":
        status = await send_email(e["email"], "Joining 1471 Horwich Squadron \u2014 here's how",
                                  _joining_instructions_html(first, note, attachments, base_url),
                                  reply_to=NOTIFY_EMAIL)
        target = None
    else:
        target = eligible_date(e)
        if not target:
            return {"sent": False, "error": "no_date"}
        status = await send_email(e["email"], "Not long until you can join 1471 Horwich Squadron!",
                                  _countdown_html(first, target, note), reply_to=NOTIFY_EMAIL)
    set_fields = {"last_recruit_email": {"kind": k, "at": now_iso(), "status": status}}
    if status == "sent":
        set_fields["status"] = "actioned"
    await db.enquiries.update_one({"id": e["id"]}, {"$set": set_fields})
    return {"sent": status == "sent", "email_status": status, "kind": k, "eligible_date": target}


async def resolve_recipients(a: Audience) -> List[dict]:
    if a.mode == "all":
        q = {}
    elif a.mode == "roles":
        roles = [r for r in a.roles if r in ALL_ROLES]
        if not roles:
            return []
        q = {"role": {"$in": roles}}
    elif a.mode == "users":
        if not a.user_ids:
            return []
        q = {"id": {"$in": a.user_ids}}
    elif a.mode == "parent_of":
        if not a.cadet_id:
            return []
        q = {"role": "parent", "child_ids": a.cadet_id}
    else:
        return []
    return await db.users.find(q, {"_id": 0, "password_hash": 0}).to_list(5000)


async def deliver_broadcast(users: List[dict], title: str, body: str, channels: List[str],
                            from_name: str, kind: str, email_html: Optional[str] = None,
                            link: Optional[str] = None, link_label: Optional[str] = None) -> dict:
    channels = [c for c in channels if c in ("dashboard", "email")] or ["dashboard"]
    docs, emails_sent = [], 0
    for u in users:
        email_status = "n/a"
        if "email" in channels and u.get("email"):
            html = email_html or _broadcast_email_html(title, body, from_name)
            email_status = await send_email(u["email"], title, html)
            if email_status == "sent":
                emails_sent += 1
        if "dashboard" in channels:
            docs.append({"id": str(uuid.uuid4()), "user_id": u["id"], "title": title,
                         "body": body, "from_name": from_name, "kind": kind,
                         "channels": channels, "email_status": email_status,
                         "link": link, "link_label": link_label,
                         "read": False, "created_at": now_iso()})
    if docs:
        await db.notifications.insert_many(docs)
        for d in docs:
            await push_to_user(d["user_id"], title, d.get("body", ""), "/portal")
    return {"recipients": len(users), "dashboard_delivered": len(docs), "emails_sent": emails_sent,
            "email_configured": bool(EMERGENT_EMAIL_KEY)}


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


def _enquiry_out(e: dict) -> dict:
    e = {k: v for k, v in e.items() if k != "_id"}
    e["eligibility"] = compute_eligibility(e)
    e["age_band_label"] = AGE_BANDS.get(e.get("age_band") or "", "")
    e["eligible_date"] = eligible_date(e)
    return e


@api_router.get("/enquiries")
async def list_enquiries(staff: dict = Depends(require_staff)):
    rows = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [_enquiry_out(e) for e in rows]


@api_router.get("/enquiries/tracker")
async def enquiries_tracker(staff: dict = Depends(require_staff)):
    """Prospective-cadet enquiries grouped by joining eligibility."""
    rows = await db.enquiries.find({"age_band": {"$ne": None}}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    buckets = {"now": [], "september": [], "future": []}
    for e in rows:
        out = _enquiry_out(e)
        if out["eligibility"] in buckets:
            buckets[out["eligibility"]].append(out)
    return {"buckets": buckets,
            "counts": {k: len(v) for k, v in buckets.items()},
            "labels": {"now": "Can join now", "september": "Eligible in September",
                       "future": "Eligible in the future"}}


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


class RecruitEmail(BaseModel):
    kind: Optional[str] = None  # joining | countdown
    note: str = Field(default="", max_length=2000)
    attachment_ids: List[str] = []
    base_url: str = ""
    model_config = ConfigDict(extra="ignore")


class RecruitBulk(BaseModel):
    eligibility: str
    note: str = Field(default="", max_length=2000)
    attachment_ids: List[str] = []
    base_url: str = ""
    model_config = ConfigDict(extra="ignore")


async def _fetch_attachments(ids: List[str]) -> list:
    if not ids:
        return []
    rows = await db.attachments.find({"id": {"$in": ids}}, {"_id": 0}).to_list(50)
    order = {aid: i for i, aid in enumerate(ids)}
    rows.sort(key=lambda a: order.get(a["id"], 999))
    return rows


@api_router.post("/enquiries/recruit-email/bulk")
async def recruit_email_bulk(payload: RecruitBulk, staff: dict = Depends(require_staff)):
    if payload.eligibility not in ("now", "september", "future"):
        raise HTTPException(status_code=400, detail="Invalid eligibility group")
    atts = await _fetch_attachments(payload.attachment_ids)
    rows = await db.enquiries.find({"age_band": {"$ne": None}}, {"_id": 0}).to_list(2000)
    sent, skipped = 0, 0
    for e in rows:
        if compute_eligibility(e) == payload.eligibility:
            res = await send_recruit_email(e, None, payload.note, atts, payload.base_url)
            if res.get("email_status") == "sent":
                sent += 1
            else:
                skipped += 1
    return {"sent": sent, "skipped": skipped,
            "kind": "joining" if payload.eligibility == "now" else "countdown"}


@api_router.post("/enquiries/{enquiry_id}/recruit-email")
async def recruit_email(enquiry_id: str, payload: RecruitEmail, staff: dict = Depends(require_staff)):
    e = await db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    atts = await _fetch_attachments(payload.attachment_ids)
    res = await send_recruit_email(e, payload.kind, payload.note, atts, payload.base_url)
    if not res.get("sent") and res.get("error") == "no_date":
        raise HTTPException(status_code=400,
                            detail="Cannot work out an eligibility date for this enquiry (no date of birth on record).")
    return res


# ---------------------------------------------------------------------------
# Attachments (GridFS-backed; download link is public/unguessable)
# ---------------------------------------------------------------------------
@api_router.post("/attachments")
async def upload_attachment(file: UploadFile = File(...), staff: dict = Depends(require_staff)):
    data = await file.read()
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (maximum 15MB).")
    aid = str(uuid.uuid4())
    gid = await fs.upload_from_stream(file.filename or "file", data,
                                      metadata={"attachment_id": aid, "content_type": file.content_type})
    doc = {"id": aid, "filename": file.filename or "file",
           "content_type": file.content_type or "application/octet-stream",
           "size": len(data), "gridfs_id": str(gid), "uploaded_by": staff["id"], "created_at": now_iso()}
    await db.attachments.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/attachments")
async def list_attachments(staff: dict = Depends(require_staff)):
    return await db.attachments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/attachments/{attachment_id}/download")
async def download_attachment(attachment_id: str):
    doc = await db.attachments.find_one({"id": attachment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Attachment not found")
    stream = await fs.open_download_stream(ObjectId(doc["gridfs_id"]))
    data = await stream.read()
    return Response(content=data, media_type=doc["content_type"],
                    headers={"Content-Disposition": f'inline; filename="{doc["filename"]}"'})


@api_router.delete("/attachments/{attachment_id}")
async def delete_attachment(attachment_id: str, staff: dict = Depends(require_staff)):
    doc = await db.attachments.find_one({"id": attachment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Attachment not found")
    try:
        await fs.delete(ObjectId(doc["gridfs_id"]))
    except Exception:
        pass
    await db.attachments.delete_one({"id": attachment_id})
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Document library (GridFS-backed, browsable + shareable)
# ---------------------------------------------------------------------------
class DocumentSend(BaseModel):
    audience: Audience = Field(default_factory=Audience)
    channels: List[str] = ["dashboard", "email"]
    message: str = Field(default="", max_length=2000)
    base_url: str = ""
    model_config = ConfigDict(extra="ignore")


class DocumentMeta(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = Field(default="General", max_length=80)
    visible_roles: List[str] = []
    model_config = ConfigDict(extra="ignore")


def _document_out(d: dict) -> dict:
    return {k: v for k, v in d.items() if k not in ("_id", "gridfs_id")}


def _document_email_html(title: str, message: str, link: str, from_name: str) -> str:
    msg = f'<p>{message}</p>' if message else ""
    inner = f"""
      {msg}
      <p>A document has been shared with you: <strong>{title}</strong></p>
      <p><a href="{link}" style="display:inline-block;background:#C60C30;color:#fff;padding:12px 22px;text-decoration:none;font-weight:bold;">Download document</a></p>
      <p style="font-size:12px;color:#5b6b78;">Or copy this link: {link}</p>
      <p style="margin-top:18px;">&mdash; {from_name}</p>"""
    return _email_shell(title, inner)


@api_router.post("/documents")
async def upload_document(file: UploadFile = File(...), title: str = Form(...),
                          category: str = Form("General"), visible_roles: str = Form(""),
                          staff: dict = Depends(require_staff)):
    data = await file.read()
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (maximum 15MB).")
    roles = [r for r in visible_roles.split(",") if r in ALL_ROLES]
    gid = await fs.upload_from_stream(file.filename or "file", data,
                                      metadata={"content_type": file.content_type})
    doc = {"id": str(uuid.uuid4()), "title": title.strip(), "category": (category or "General").strip(),
           "filename": file.filename or "file", "content_type": file.content_type or "application/octet-stream",
           "size": len(data), "gridfs_id": str(gid), "visible_roles": roles,
           "uploaded_by": staff["id"],
           "uploaded_by_name": f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Staff",
           "created_at": now_iso()}
    await db.documents.insert_one(doc)
    return _document_out(doc)


@api_router.get("/documents")
async def list_documents(staff: dict = Depends(require_staff)):
    rows = await db.documents.find({}, {"gridfs_id": 0}).sort("created_at", -1).to_list(1000)
    return [_document_out(d) for d in rows]


@api_router.get("/documents/library")
async def library_documents(user: dict = Depends(get_current_user)):
    rows = await db.documents.find({"visible_roles": user["role"]}, {"gridfs_id": 0}).sort("created_at", -1).to_list(1000)
    return [_document_out(d) for d in rows]


@api_router.patch("/documents/{document_id}")
async def update_document(document_id: str, payload: DocumentMeta, staff: dict = Depends(require_staff)):
    roles = [r for r in payload.visible_roles if r in ALL_ROLES]
    d = await db.documents.find_one_and_update(
        {"id": document_id},
        {"$set": {"title": payload.title.strip(), "category": (payload.category or "General").strip(),
                  "visible_roles": roles}},
        projection={"_id": 0, "gridfs_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    return d


@api_router.get("/documents/{document_id}/download")
async def download_document(document_id: str):
    doc = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    stream = await fs.open_download_stream(ObjectId(doc["gridfs_id"]))
    data = await stream.read()
    return Response(content=data, media_type=doc["content_type"],
                    headers={"Content-Disposition": f'inline; filename="{doc["filename"]}"'})


@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, staff: dict = Depends(require_staff)):
    doc = await db.documents.find_one({"id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        await fs.delete(ObjectId(doc["gridfs_id"]))
    except Exception:
        pass
    await db.documents.delete_one({"id": document_id})
    return {"deleted": True}


@api_router.post("/documents/{document_id}/send")
async def send_document(document_id: str, payload: DocumentSend, staff: dict = Depends(require_staff)):
    doc = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    users = await resolve_recipients(payload.audience)
    if not users:
        raise HTTPException(status_code=400, detail="No recipients match this audience")
    from_name = f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Squadron Staff"
    abs_link = f"{payload.base_url}/api/documents/{document_id}/download"
    rel_link = f"/api/documents/{document_id}/download"
    title = f"Document: {doc['title']}"
    body = (payload.message + "\n\n" if payload.message else "") + f"{doc['title']} ({doc['filename']})"
    email_html = _document_email_html(doc["title"], payload.message, abs_link, from_name)
    result = await deliver_broadcast(users, title, body, payload.channels, from_name, "document",
                                     email_html=email_html, link=rel_link, link_label="Download document")
    return result


# ---------------------------------------------------------------------------
# Blog / News (staff author; published posts are public + shown in portal)
# ---------------------------------------------------------------------------
def _slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return (s or "post")[:60] + "-" + uuid.uuid4().hex[:6]


class BlogCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    excerpt: str = Field(default="", max_length=500)
    body: str = Field(..., min_length=1, max_length=40000)
    cover_image_url: str = Field(default="", max_length=1000)
    images: List[str] = []
    status: str = "draft"  # draft | published
    model_config = ConfigDict(extra="ignore")


def _blog_out(b: dict) -> dict:
    return {k: v for k, v in b.items() if k != "_id"}


def _blog_public(b: dict) -> dict:
    return {"title": b["title"], "slug": b["slug"], "excerpt": b.get("excerpt", ""),
            "cover_image_url": b.get("cover_image_url", ""), "images": b.get("images", []),
            "body": b.get("body", ""), "author_name": b.get("author_name", ""),
            "published_at": b.get("published_at")}


@api_router.post("/blogs")
async def create_blog(payload: BlogCreate, staff: dict = Depends(require_staff)):
    now = now_iso()
    b = {"id": str(uuid.uuid4()), "slug": _slugify(payload.title),
         "title": payload.title, "excerpt": payload.excerpt, "body": payload.body,
         "cover_image_url": payload.cover_image_url, "images": payload.images,
         "status": payload.status if payload.status in ("draft", "published") else "draft",
         "author_id": staff["id"],
         "author_name": f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Staff",
         "created_at": now, "updated_at": now,
         "published_at": now if payload.status == "published" else None}
    await db.blogs.insert_one(b)
    return _blog_out(b)


@api_router.get("/blogs")
async def list_blogs(staff: dict = Depends(require_staff)):
    rows = await db.blogs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.patch("/blogs/{blog_id}")
async def update_blog(blog_id: str, payload: BlogCreate, staff: dict = Depends(require_staff)):
    existing = await db.blogs.find_one({"id": blog_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    upd = {"title": payload.title, "excerpt": payload.excerpt, "body": payload.body,
           "cover_image_url": payload.cover_image_url, "images": payload.images,
           "status": payload.status if payload.status in ("draft", "published") else "draft",
           "updated_at": now_iso()}
    if payload.status == "published" and not existing.get("published_at"):
        upd["published_at"] = now_iso()
    if payload.status == "draft":
        upd["published_at"] = None
    b = await db.blogs.find_one_and_update({"id": blog_id}, {"$set": upd},
                                           projection={"_id": 0}, return_document=True)
    return b


@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, staff: dict = Depends(require_staff)):
    res = await db.blogs.delete_one({"id": blog_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"deleted": True}


@api_router.post("/blogs/upload-image")
async def upload_blog_image(file: UploadFile = File(...), staff: dict = Depends(require_staff)):
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (maximum 8MB).")
    iid = str(uuid.uuid4())
    gid = await fs.upload_from_stream(file.filename or "image", data,
                                      metadata={"content_type": file.content_type, "blog_image_id": iid})
    await db.blog_images.insert_one({"id": iid, "gridfs_id": str(gid),
                                     "content_type": file.content_type or "image/jpeg", "created_at": now_iso()})
    return {"id": iid, "url": f"/api/blogs/image/{iid}"}


@api_router.get("/blogs/image/{image_id}")
async def get_blog_image(image_id: str):
    img = await db.blog_images.find_one({"id": image_id}, {"_id": 0})
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    stream = await fs.open_download_stream(ObjectId(img["gridfs_id"]))
    data = await stream.read()
    return Response(content=data, media_type=img["content_type"],
                    headers={"Cache-Control": "public, max-age=86400"})


@api_router.get("/public/blogs")
async def public_blogs():
    rows = await db.blogs.find({"status": "published"}, {"_id": 0}).sort("published_at", -1).to_list(200)
    return [{"title": b["title"], "slug": b["slug"], "excerpt": b.get("excerpt", ""),
             "cover_image_url": b.get("cover_image_url", ""), "author_name": b.get("author_name", ""),
             "published_at": b.get("published_at")} for b in rows]


@api_router.get("/public/blogs/{slug}")
async def public_blog(slug: str):
    b = await db.blogs.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not b:
        raise HTTPException(status_code=404, detail="Post not found")
    return _blog_public(b)


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
    recipients = await db.users.find({"role": {"$in": roles}}, {"id": 1}).to_list(5000)
    for u in recipients:
        await push_to_user(u["id"], f"Notice: {payload.title}", payload.body, "/portal")
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


# ---------------------------------------------------------------------------
# Broadcast messages / notifications (staff -> targeted members)
# ---------------------------------------------------------------------------
@api_router.post("/broadcast")
async def create_broadcast(payload: BroadcastCreate, staff: dict = Depends(require_staff)):
    users = await resolve_recipients(payload.audience)
    if not users:
        raise HTTPException(status_code=400, detail="No recipients match this audience")
    from_name = f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Squadron Staff"
    result = await deliver_broadcast(users, payload.title, payload.body, payload.channels, from_name, "message")
    await db.broadcasts.insert_one({
        "id": str(uuid.uuid4()), "title": payload.title, "body": payload.body,
        "channels": result and payload.channels, "audience": payload.audience.model_dump(),
        "sent_by": from_name, "created_at": now_iso(), "result": result})
    return result


@api_router.get("/notifications")
async def my_notifications(user: dict = Depends(get_current_user)):
    return await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/notifications/unread-count")
async def unread_count(user: dict = Depends(get_current_user)):
    n = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"count": n}


@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"id": notification_id, "user_id": user["id"]},
                                      {"$set": {"read": True}})
    return {"read": True}


@api_router.post("/notifications/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"], "read": False},
                                       {"$set": {"read": True}})
    return {"read": True}


# ---------------------------------------------------------------------------
# Newsletters (staff compose + preview + send)
# ---------------------------------------------------------------------------
def _newsletter_out(n: dict) -> dict:
    return {k: v for k, v in n.items() if k != "_id"}


@api_router.get("/newsletters")
async def list_newsletters(staff: dict = Depends(require_staff)):
    rows = await db.newsletters.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/newsletters")
async def create_newsletter(payload: NewsletterCreate, staff: dict = Depends(require_staff)):
    nl = {"id": str(uuid.uuid4()), **payload.model_dump(), "status": "draft",
          "created_by": f"{staff.get('first_name','')} {staff.get('last_name','')}".strip() or "Staff",
          "created_at": now_iso(), "sent_at": None, "result": None}
    await db.newsletters.insert_one(nl)
    return _newsletter_out(nl)


@api_router.patch("/newsletters/{newsletter_id}")
async def update_newsletter(newsletter_id: str, payload: NewsletterCreate, staff: dict = Depends(require_staff)):
    n = await db.newsletters.find_one_and_update(
        {"id": newsletter_id}, {"$set": payload.model_dump()},
        projection={"_id": 0}, return_document=True)
    if not n:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return n


@api_router.delete("/newsletters/{newsletter_id}")
async def delete_newsletter(newsletter_id: str, staff: dict = Depends(require_staff)):
    res = await db.newsletters.delete_one({"id": newsletter_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return {"deleted": True}


@api_router.post("/newsletters/preview")
async def preview_newsletter(payload: NewsletterCreate, staff: dict = Depends(require_staff)):
    return {"html": _newsletter_email_html(payload.model_dump())}


@api_router.post("/newsletters/{newsletter_id}/send")
async def send_newsletter(newsletter_id: str, payload: NewsletterSend, staff: dict = Depends(require_staff)):
    nl = await db.newsletters.find_one({"id": newsletter_id}, {"_id": 0})
    if not nl:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    users = await resolve_recipients(payload.audience)
    if not users:
        raise HTTPException(status_code=400, detail="No recipients match this audience")
    from_name = nl.get("created_by") or "Squadron Staff"
    dash_body = (nl.get("intro", "") + ("\n\n" if nl.get("intro") else "") + nl.get("body", "")).strip()
    email_html = _newsletter_email_html(nl)
    result = await deliver_broadcast(users, nl["subject"], dash_body, payload.channels,
                                     from_name, "newsletter", email_html=email_html)
    await db.newsletters.update_one({"id": newsletter_id},
                                    {"$set": {"status": "sent", "sent_at": now_iso(),
                                              "audience": payload.audience.model_dump(),
                                              "channels": payload.channels, "result": result}})
    return result


# ---------------------------------------------------------------------------
# Calendar: ICS subscribe feed + Word (.docx) training-programme import
# ---------------------------------------------------------------------------
class ImportedEvent(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    start: str
    end: Optional[str] = None
    description: str = ""
    location: str = ""
    model_config = ConfigDict(extra="ignore")


class EventsImport(BaseModel):
    events: List[ImportedEvent]
    model_config = ConfigDict(extra="ignore")


def _ics_escape(t: str) -> str:
    return (t or "").replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def _ics_dt(iso: str) -> Optional[str]:
    if not iso:
        return None
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except Exception:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


@api_router.get("/calendar/events.ics")
async def events_ics():
    rows = await db.events.find({}, {"_id": 0}).sort("start", 1).to_list(2000)
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0",
             "PRODID:-//1471 Horwich Squadron//RAF Air Cadets//EN", "CALSCALE:GREGORIAN",
             "METHOD:PUBLISH", "X-WR-CALNAME:1471 Horwich Squadron Events"]
    for e in rows:
        dtstart = _ics_dt(e.get("start", ""))
        if not dtstart:
            continue
        lines += ["BEGIN:VEVENT", f"UID:{e['id']}@1471horwich.org.uk",
                  f"DTSTAMP:{_ics_dt(e.get('created_at') or now_iso()) or dtstart}",
                  f"DTSTART:{dtstart}"]
        dtend = _ics_dt(e.get("end") or "")
        if dtend:
            lines.append(f"DTEND:{dtend}")
        lines.append(f"SUMMARY:{_ics_escape(e.get('title', ''))}")
        if e.get("location"):
            lines.append(f"LOCATION:{_ics_escape(e['location'])}")
        if e.get("description"):
            lines.append(f"DESCRIPTION:{_ics_escape(e['description'])}")
        lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")
    body = "\r\n".join(lines) + "\r\n"
    return Response(content=body, media_type="text/calendar; charset=utf-8",
                    headers={"Content-Disposition": 'inline; filename="1471-horwich-events.ics"'})


def _parse_docx_events(data: bytes) -> list:
    from docx import Document as DocxDocument
    from dateutil import parser as dateparser
    doc = DocxDocument(io.BytesIO(data))
    rows = []
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                rows.append(cells)
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            rows.append([t])
    year = datetime.now(timezone.utc).year
    headers = {"date", "activity", "event", "events", "notes", "week", "time", "programme", "program"}
    out, seen = [], set()
    for cells in rows:
        if all(c.lower() in headers for c in cells):
            continue
        date_obj, date_cell = None, None
        for c in cells:
            if not any(ch.isdigit() for ch in c):
                continue
            try:
                d1 = dateparser.parse(c, fuzzy=True, dayfirst=True, default=datetime(year, 1, 1))
                d2 = dateparser.parse(c, fuzzy=True, dayfirst=True, default=datetime(year, 6, 15))
            except Exception:
                continue
            # Only accept a fully-specified day+month (reject bare years like "2026")
            if d1.date() == d2.date():
                date_obj, date_cell = d1, c
                break
        if not date_obj:
            continue
        others = [c for c in cells if c != date_cell]
        title = max(others, key=len) if others else (cells[0].replace(date_cell, "").strip(" -–—:") or "Squadron event")
        d = date_obj.date()
        key = (d.isoformat(), title.lower())
        if key in seen:
            continue
        seen.add(key)
        out.append({"title": title[:200], "start": f"{d.isoformat()}T19:00:00",
                    "end": f"{d.isoformat()}T21:30:00", "description": "", "location": "Squadron HQ",
                    "date_label": d.strftime("%a %d %b %Y")})
    return out


@api_router.post("/events/import-docx")
async def import_docx(file: UploadFile = File(...), staff: dict = Depends(require_staff)):
    if not (file.filename or "").lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Please upload a Word .docx document.")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (maximum 10MB).")
    try:
        events = _parse_docx_events(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read the document: {exc}")
    return {"events": events, "count": len(events)}


@api_router.post("/events/import")
async def import_events(payload: EventsImport, staff: dict = Depends(require_staff)):
    created = 0
    for ie in payload.events:
        event = {"id": str(uuid.uuid4()), "title": ie.title, "description": ie.description,
                 "location": ie.location or "Squadron HQ", "start": ie.start, "end": ie.end,
                 "capacity": 0, "event_type": "standard", "participation": "attend", "points_value": 10,
                 "bids": [], "attendees": [], "created_by": staff["id"], "created_at": now_iso()}
        await db.events.insert_one(event)
        created += 1
    return {"created": created}


# ---------------------------------------------------------------------------
# Push subscriptions
# ---------------------------------------------------------------------------
class PushSubscription(BaseModel):
    subscription: dict
    model_config = ConfigDict(extra="ignore")


@api_router.get("/push/vapid-public-key")
async def vapid_public_key():
    return {"key": VAPID_PUBLIC_KEY, "enabled": bool(VAPID_PEM_PATH and VAPID_PUBLIC_KEY)}


@api_router.post("/push/subscribe")
async def push_subscribe(payload: PushSubscription, user: dict = Depends(get_current_user)):
    endpoint = payload.subscription.get("endpoint")
    if not endpoint:
        raise HTTPException(status_code=400, detail="Invalid subscription")
    await db.push_subscriptions.update_one(
        {"endpoint": endpoint},
        {"$set": {"endpoint": endpoint, "user_id": user["id"], "subscription": payload.subscription,
                  "updated_at": now_iso()}},
        upsert=True)
    return {"subscribed": True}


@api_router.post("/push/unsubscribe")
async def push_unsubscribe(payload: PushSubscription, user: dict = Depends(get_current_user)):
    endpoint = payload.subscription.get("endpoint")
    if endpoint:
        await db.push_subscriptions.delete_one({"endpoint": endpoint, "user_id": user["id"]})
    return {"unsubscribed": True}


@api_router.post("/push/test")
async def push_test(user: dict = Depends(get_current_user)):
    await push_to_user(user["id"], "1471 Horwich Squadron",
                       "Notifications are working \u2014 you'll be alerted here.", "/portal")
    return {"sent": True}


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
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await db.documents.create_index([("visible_roles", 1), ("created_at", -1)])
    await db.push_subscriptions.create_index("endpoint", unique=True)
    await seed_users()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
