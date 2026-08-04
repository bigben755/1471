"""Backend smoke tests after removal of undefined _inactivity_reminder_loop() call."""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@1471horwich.org.uk", "password": "Squadron1471!"}
CADET = {"email": "cadet@1471horwich.org.uk", "password": "Cadet1471!"}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(session, creds):
    r = session.post(f"{API}/auth/login", json=creds, timeout=15)
    return r


# --- Startup / health ---
def test_api_root_reachable(session):
    r = session.get(f"{API}/", timeout=10)
    # Some apps return 200 or 404 on root, but must not 5xx (backend up)
    assert r.status_code < 500, f"Backend appears down: {r.status_code} {r.text[:200]}"


# --- Auth: admin ---
def test_admin_login_and_me(session):
    r = _login(session, ADMIN)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token in response: {data}"

    me = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    assert me.status_code == 200, f"/auth/me failed: {me.status_code} {me.text[:200]}"
    me_data = me.json()
    assert me_data.get("email") == ADMIN["email"]
    pytest.admin_token = token


# --- Events (exercises DB & indexes) ---
def test_events_list(session):
    token = getattr(pytest, "admin_token", None)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    r = session.get(f"{API}/events", headers=headers, timeout=15)
    assert r.status_code == 200, f"/events failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    assert isinstance(data, list) or isinstance(data, dict), "Unexpected /events shape"


# --- Notices ---
def test_notices_list(session):
    token = getattr(pytest, "admin_token", None)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    r = session.get(f"{API}/notices", headers=headers, timeout=15)
    assert r.status_code == 200, f"/notices failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    assert isinstance(data, (list, dict))


# --- Cadet login (exercises last_login_at / login_reminder_sent_at update) ---
def test_cadet_login(session):
    r = _login(session, CADET)
    assert r.status_code == 200, f"Cadet login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token
    me = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    assert me.status_code == 200
    assert me.json().get("email") == CADET["email"]


# --- Public enquiries POST (Resend send_email path) ---
def test_public_enquiry_submission(session):
    payload = {
        "name": "TEST Smoke Enquiry",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "phone": "07000000000",
        "subject": "Test enquiry",
        "message": "This is an automated smoke test enquiry post-startup fix.",
        "enquiry_type": "general",
        "consent": True,
    }
    r = session.post(f"{API}/enquiries", json=payload, timeout=30)
    assert r.status_code < 400, f"/enquiries failed: {r.status_code} {r.text[:400]}"
