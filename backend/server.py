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
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
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

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="1471 Horwich Squadron RAF Air Cadets API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
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


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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
    status: str = "new"  # new | read | actioned
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
def _build_email_html(e: Enquiry) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#EAF5F8;padding:24px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d6e6ec;">
          <tr><td style="background:#002F5F;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">
            1471 Horwich Squadron &mdash; New Website Enquiry
          </td></tr>
          <tr><td style="height:4px;background:#C60C30;"></td></tr>
          <tr><td style="padding:28px;color:#071A2F;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 14px;"><strong>Type:</strong> {e.enquiry_type}</p>
            <p style="margin:0 0 14px;"><strong>Name:</strong> {e.name}</p>
            <p style="margin:0 0 14px;"><strong>Email:</strong> {e.email}</p>
            <p style="margin:0 0 14px;"><strong>Phone:</strong> {e.phone or '&ndash;'}</p>
            <p style="margin:0 0 6px;"><strong>Message:</strong></p>
            <p style="margin:0;padding:14px;background:#EAF5F8;border-left:3px solid #002F5F;">{e.message}</p>
            <p style="margin:18px 0 0;color:#51626F;font-size:12px;">Received {e.created_at}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def send_enquiry_email(e: Enquiry) -> None:
    if not RESEND_API_KEY or resend is None:
        logger.info("Resend not configured; enquiry stored only (id=%s)", e.id)
        return
    try:
        resend.api_key = RESEND_API_KEY
        params = {
            "from": SENDER_EMAIL,
            "to": [NOTIFY_EMAIL],
            "subject": f"New {e.enquiry_type} enquiry - {e.name}",
            "html": _build_email_html(e),
            "reply_to": e.email,
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Enquiry email sent (id=%s)", e.id)
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to send enquiry email: %s", exc)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "1471 Horwich Squadron RAF Air Cadets API"}


@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return {"access_token": token, "token_type": "bearer",
            "user": {"email": user["email"], "name": user.get("name", "Admin")}}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"email": admin["email"], "name": admin.get("name", "Admin")}


@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(payload: EnquiryCreate):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required to submit this form.")
    enquiry = Enquiry(**payload.model_dump())
    await db.enquiries.insert_one(enquiry.model_dump())
    await send_enquiry_email(enquiry)
    return enquiry


@api_router.get("/enquiries", response_model=List[Enquiry])
async def list_enquiries(admin: dict = Depends(get_current_admin)):
    docs = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.patch("/enquiries/{enquiry_id}", response_model=Enquiry)
async def update_enquiry(enquiry_id: str, update: StatusUpdate, admin: dict = Depends(get_current_admin)):
    if update.status not in {"new", "read", "actioned"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.enquiries.find_one_and_update(
        {"id": enquiry_id}, {"$set": {"status": update.status}},
        projection={"_id": 0}, return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return res


@api_router.delete("/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.enquiries.delete_one({"id": enquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"deleted": True}


@api_router.get("/enquiries/stats")
async def enquiry_stats(admin: dict = Depends(get_current_admin)):
    total = await db.enquiries.count_documents({})
    new = await db.enquiries.count_documents({"status": "new"})
    return {"total": total, "new": new}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Squadron Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user %s", ADMIN_EMAIL)
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()},
                                  {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Updated admin password for %s", ADMIN_EMAIL)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.enquiries.create_index("created_at")
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
