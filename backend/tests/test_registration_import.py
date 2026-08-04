"""Backend tests for registration automation endpoints.

Covers:
- POST /api/public/register-self
- POST /api/users/import-upload
- GET /api/users/import-template
- GET /api/users/register-qr
"""
import io
import os
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("admin@1471horwich.org.uk", "Squadron1471!")


# ---------- helpers ---------------------------------------------------------

def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def admin_tok():
    return _login(*ADMIN)


@pytest.fixture(scope="module")
def cleanup_ids():
    ids = []
    yield ids
    tok = _login(*ADMIN)
    h = _h(tok)
    for uid in ids:
        requests.delete(f"{API}/users/{uid}", headers=h)


# ---------- self registration ----------------------------------------------

class TestSelfRegistration:
    def test_cadet_self_register_success(self, cleanup_ids):
        first = "TESTSelf"
        last = f"Cadet{uuid.uuid4().hex[:6]}"
        r = requests.post(
            f"{API}/public/register-self",
            json={"role": "cadet", "first_name": first, "last_name": last},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["created"] is True
        assert d["role"] == "cadet"
        assert d["default_password"] == "Squadron123!"
        assert d["must_change_password"] is True
        assert d["login_username"].startswith(last.lower())

        # Resolve ID for cleanup via staff users list.
        tok = _login(*ADMIN)
        users = requests.get(f"{API}/users", headers=_h(tok)).json()
        match = next(
            (u for u in users if u.get("first_name") == first and u.get("last_name") == last and u.get("role") == "cadet"),
            None,
        )
        assert match is not None
        cleanup_ids.append(match["id"])

    def test_duplicate_self_register_returns_400(self, cleanup_ids):
        first = "TESTDup"
        last = f"Cadet{uuid.uuid4().hex[:6]}"
        payload = {"role": "cadet", "first_name": first, "last_name": last}
        r1 = requests.post(f"{API}/public/register-self", json=payload)
        assert r1.status_code == 200, r1.text
        tok = _login(*ADMIN)
        users = requests.get(f"{API}/users", headers=_h(tok)).json()
        match = next(
            (u for u in users if u.get("first_name") == first and u.get("last_name") == last and u.get("role") == "cadet"),
            None,
        )
        assert match is not None
        cleanup_ids.append(match["id"])
        r2 = requests.post(f"{API}/public/register-self", json=payload)
        assert r2.status_code == 400

    def test_cfav_self_register_rejects_non_rafac_email(self):
        r = requests.post(
            f"{API}/public/register-self",
            json={
                "role": "cfav",
                "first_name": "TEST",
                "last_name": "BadEmail",
                "email": "bad@example.com",
                "is_uniformed": True,
            },
        )
        assert r.status_code == 400
        assert "rafac.mod.gov.uk" in r.json()["detail"].lower()


# ---------- bulk import upload ---------------------------------------------

class TestBulkImport:
    def test_csv_import_creates_cadets(self, admin_tok, cleanup_ids):
        csv_data = (
            "role,first_name,last_name,email,is_uniformed\n"
            "cadet,TESTCsv,One,,\n"
            "cadet,TESTCsv,Two,,\n"
        ).encode("utf-8")
        files = {"file": ("members.csv", csv_data, "text/csv")}
        data = {"role_hint": "cadet"}
        r = requests.post(f"{API}/users/import-upload", headers=_h(admin_tok), data=data, files=files)
        assert r.status_code == 200, r.text
        out = r.json()
        assert out["created"] >= 2
        assert out["default_password"] == "Squadron123!"
        for created in out.get("created_users", []):
            if created.get("name", "").startswith("TESTCsv"):
                cleanup_ids.append(created["id"])

    def test_xlsx_import_cfav_invalid_email_reports_error(self, admin_tok):
        try:
            import pandas as pd
        except Exception as exc:
            pytest.skip(f"pandas not available: {exc}")

        df = pd.DataFrame([
            {"role": "cfav", "first_name": "TESTXL", "last_name": "Bad", "email": "not-rafac@example.com", "is_uniformed": "yes"},
        ])
        bio = io.BytesIO()
        with pd.ExcelWriter(bio, engine="openpyxl") as writer:
            df.to_excel(writer, index=False)
        files = {
            "file": (
                "members.xlsx",
                bio.getvalue(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        r = requests.post(
            f"{API}/users/import-upload",
            headers=_h(admin_tok),
            data={"role_hint": "cfav"},
            files=files,
        )
        assert r.status_code == 200, r.text
        out = r.json()
        assert out["created"] == 0
        assert out["errors"] >= 1


# ---------- templates + qr --------------------------------------------------

class TestTemplatesAndQr:
    def test_download_excel_template(self, admin_tok):
        r = requests.get(
            f"{API}/users/import-template",
            headers=_h(admin_tok),
            params={"format": "xlsx", "role": "cadet"},
        )
        assert r.status_code == 200
        assert "spreadsheetml" in r.headers.get("content-type", "")
        assert len(r.content) > 200

    def test_download_word_template(self, admin_tok):
        r = requests.get(
            f"{API}/users/import-template",
            headers=_h(admin_tok),
            params={"format": "docx", "role": "cfav"},
        )
        assert r.status_code == 200
        assert "wordprocessingml" in r.headers.get("content-type", "")
        assert len(r.content) > 200

    def test_download_register_qr_png(self, admin_tok):
        r = requests.get(
            f"{API}/users/register-qr",
            headers=_h(admin_tok),
            params={"role": "cadet", "base_url": BASE_URL},
        )
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type") == "image/png"
        assert r.content.startswith(b"\x89PNG\r\n\x1a\n")
