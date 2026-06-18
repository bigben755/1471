"""Backend tests for 1471 Horwich Squadron API.

Covers auth (login, /auth/me), enquiry create (public), and admin enquiry CRUD.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://raf-horwich.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@1471horwich.org.uk"
ADMIN_PASSWORD = "Squadron1471!"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---- Health / root ----
class TestRoot:
    def test_api_root(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---- Auth ----
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["token_type"] == "bearer"
        assert d["user"]["email"] == ADMIN_EMAIL
        assert isinstance(d["access_token"], str) and len(d["access_token"]) > 20

    def test_login_invalid_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPass!"})
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_unknown_email(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_requires_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---- Enquiry public POST ----
class TestEnquiryCreate:
    def test_create_enquiry_success(self):
        payload = {
            "name": "TEST_Sam Pytest",
            "email": "TEST_sam@example.com",
            "phone": "07123 456789",
            "enquiry_type": "Join as a Cadet",
            "message": "Pytest backend test enquiry.",
            "consent": True,
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["email"] == payload["email"]
        assert d["status"] == "new"
        assert "id" in d
        # store for cleanup
        TestEnquiryCreate.created_id = d["id"]

    def test_create_enquiry_consent_false_returns_400(self):
        payload = {
            "name": "TEST_NoConsent",
            "email": "TEST_noconsent@example.com",
            "phone": "",
            "enquiry_type": "Ask a question",
            "message": "Should be rejected.",
            "consent": False,
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 400
        assert "Consent" in r.json()["detail"]

    def test_create_enquiry_invalid_email_returns_422(self):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
            "phone": "",
            "enquiry_type": "Ask a question",
            "message": "Bad email test.",
            "consent": True,
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 422

    def test_create_enquiry_short_name_returns_422(self):
        payload = {
            "name": "A",
            "email": "TEST_short@example.com",
            "phone": "",
            "enquiry_type": "Ask a question",
            "message": "Short name test.",
            "consent": True,
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 422


# ---- Enquiry admin endpoints ----
class TestEnquiryAdmin:
    def test_list_requires_auth(self):
        r = requests.get(f"{API}/enquiries")
        assert r.status_code == 401

    def test_list_with_auth(self, auth_headers):
        r = requests.get(f"{API}/enquiries", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_stats_with_auth(self, auth_headers):
        r = requests.get(f"{API}/enquiries/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert "total" in d and "new" in d

    def test_full_crud_flow(self, auth_headers):
        # create
        payload = {
            "name": "TEST_CRUD User",
            "email": "TEST_crud@example.com",
            "phone": "07111111111",
            "enquiry_type": "Become an Adult Volunteer",
            "message": "CRUD test enquiry.",
            "consent": True,
        }
        cr = requests.post(f"{API}/enquiries", json=payload)
        assert cr.status_code == 200
        eid = cr.json()["id"]

        # list contains it
        lr = requests.get(f"{API}/enquiries", headers=auth_headers)
        assert lr.status_code == 200
        assert any(e["id"] == eid for e in lr.json())

        # patch -> read
        pr = requests.patch(f"{API}/enquiries/{eid}", json={"status": "read"}, headers=auth_headers)
        assert pr.status_code == 200
        assert pr.json()["status"] == "read"

        # patch -> actioned
        pr2 = requests.patch(f"{API}/enquiries/{eid}", json={"status": "actioned"}, headers=auth_headers)
        assert pr2.status_code == 200
        assert pr2.json()["status"] == "actioned"

        # invalid status
        bad = requests.patch(f"{API}/enquiries/{eid}", json={"status": "garbage"}, headers=auth_headers)
        assert bad.status_code == 400

        # delete
        dr = requests.delete(f"{API}/enquiries/{eid}", headers=auth_headers)
        assert dr.status_code == 200
        # delete again -> 404
        dr2 = requests.delete(f"{API}/enquiries/{eid}", headers=auth_headers)
        assert dr2.status_code == 404

    def test_patch_requires_auth(self):
        r = requests.patch(f"{API}/enquiries/does-not-exist", json={"status": "read"})
        assert r.status_code == 401

    def test_delete_requires_auth(self):
        r = requests.delete(f"{API}/enquiries/does-not-exist")
        assert r.status_code == 401


def teardown_module(_module):
    """Cleanup TEST_ prefixed enquiries."""
    try:
        tok = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()["access_token"]
        h = {"Authorization": f"Bearer {tok}"}
        items = requests.get(f"{API}/enquiries", headers=h).json()
        for e in items:
            if e.get("name", "").startswith("TEST_") or e.get("email", "").startswith("TEST_"):
                requests.delete(f"{API}/enquiries/{e['id']}", headers=h)
    except Exception:
        pass
