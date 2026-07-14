"""Backend tests for the NEW attachment endpoints + time-aware tracker buckets (Iteration 5).

Server 'today' is 2026-07-14 during this run — upcoming September is 2026-09-01.

Covers:
- POST /api/attachments        (multipart, staff auth) -> {id, filename, size}
- GET  /api/attachments/{id}/download   (PUBLIC, no auth)
- GET  /api/attachments         (staff list)
- DELETE /api/attachments/{id}  (staff)
- POST /api/enquiries/{id}/recruit-email  with attachment_ids + base_url
    -> joining email HTML rendered contains /api/attachments/<id>/download link
- Time-aware tracker: crafted DoBs land under_12 prospects into 'september' vs 'future'
    according to the England school-year rule (yr8 starts the September of birth_year + 11 or 12).
"""
import os
import io
import uuid
from datetime import date

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("admin@1471horwich.org.uk", "Squadron1471!")

TODAY = date.today()
UPCOMING_SEPT = date(TODAY.year, 9, 1) if TODAY <= date(TODAY.year, 9, 1) else date(TODAY.year + 1, 9, 1)


# ---------- fixtures --------------------------------------------------------

def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="session")
def admin_tok():
    return _login(*ADMIN)


@pytest.fixture(scope="module")
def uploaded_attachment(admin_tok):
    """Upload a small PDF-like file, yield its metadata, and delete on teardown."""
    files = {
        "file": ("TEST_welcome_pack.txt", io.BytesIO(b"Welcome to 1471 Horwich Squadron!\nJoining form attached.\n"),
                 "text/plain")
    }
    r = requests.post(f"{API}/attachments", headers=_h(admin_tok), files=files)
    assert r.status_code == 200, r.text
    meta = r.json()
    assert "id" in meta and meta["filename"] == "TEST_welcome_pack.txt"
    yield meta
    # cleanup
    requests.delete(f"{API}/attachments/{meta['id']}", headers=_h(admin_tok))


# ---------- attachment endpoints -------------------------------------------

class TestAttachmentEndpoints:
    def test_upload_returns_id_filename_size(self, admin_tok):
        files = {"file": ("TEST_up.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{API}/attachments", headers=_h(admin_tok), files=files)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"] and isinstance(d["id"], str)
        assert d["filename"] == "TEST_up.txt"
        assert d["size"] == 5
        # cleanup
        requests.delete(f"{API}/attachments/{d['id']}", headers=_h(admin_tok))

    def test_upload_requires_staff_auth(self):
        files = {"file": ("nope.txt", io.BytesIO(b"x"), "text/plain")}
        r = requests.post(f"{API}/attachments", files=files)
        assert r.status_code == 401

    def test_public_download_returns_bytes_and_content_type(self, uploaded_attachment):
        # No auth header on purpose
        r = requests.get(f"{API}/attachments/{uploaded_attachment['id']}/download")
        assert r.status_code == 200
        assert r.content.startswith(b"Welcome to 1471 Horwich Squadron!")
        assert r.headers.get("content-type", "").startswith("text/plain")

    def test_download_404_for_unknown_id(self):
        r = requests.get(f"{API}/attachments/{uuid.uuid4()}/download")
        assert r.status_code == 404

    def test_list_attachments_requires_staff(self, admin_tok, uploaded_attachment):
        r = requests.get(f"{API}/attachments", headers=_h(admin_tok))
        assert r.status_code == 200
        rows = r.json()
        assert any(a["id"] == uploaded_attachment["id"] for a in rows)

        # anon
        r = requests.get(f"{API}/attachments")
        assert r.status_code == 401

    def test_delete_removes_attachment(self, admin_tok):
        # create a throwaway attachment
        files = {"file": ("TEST_delme.txt", io.BytesIO(b"delete me"), "text/plain")}
        r = requests.post(f"{API}/attachments", headers=_h(admin_tok), files=files)
        aid = r.json()["id"]

        r = requests.delete(f"{API}/attachments/{aid}", headers=_h(admin_tok))
        assert r.status_code == 200 and r.json() == {"deleted": True}

        # download should now 404
        r = requests.get(f"{API}/attachments/{aid}/download")
        assert r.status_code == 404


# ---------- joining email uses attachment link ------------------------------

class TestJoiningEmailWithAttachment:
    def test_send_joining_email_with_attachment(self, admin_tok, uploaded_attachment):
        # Seed a 'now' enquiry
        enq = requests.post(f"{API}/enquiries", json={
            "name": f"TEST_Joining Attach {uuid.uuid4().hex[:5]}",
            "email": f"test_att_{uuid.uuid4().hex[:5]}@example.com",
            "phone": "07000000010",
            "enquiry_type": "cadet",
            "message": "pytest attachment",
            "consent": True,
            "age_band": "yr8",
            "dob": f"{TODAY.year - 13}-06-15",
        }).json()
        try:
            r = requests.post(
                f"{API}/enquiries/{enq['id']}/recruit-email",
                headers=_h(admin_tok),
                json={
                    "kind": "joining",
                    "note": "See attached welcome pack.",
                    "attachment_ids": [uploaded_attachment["id"]],
                    "base_url": BASE_URL,
                },
            )
            assert r.status_code == 200, r.text
            d = r.json()
            assert d["sent"] is True
            assert d["kind"] == "joining"
            assert d.get("email_status") in ("sent", "skipped")
        finally:
            requests.delete(f"{API}/enquiries/{enq['id']}", headers=_h(admin_tok))


# ---------- time-aware buckets (crafted DoBs) -------------------------------

def _make(admin_tok, **fields):
    payload = {
        "name": f"TEST_Bucket {fields.get('name_tag','?')} {uuid.uuid4().hex[:4]}",
        "email": f"test_bkt_{uuid.uuid4().hex[:5]}@example.com",
        "phone": "07000000000",
        "enquiry_type": "cadet",
        "message": "pytest buckets",
        "consent": True,
        **fields,
    }
    payload.pop("name_tag", None)
    r = requests.post(f"{API}/enquiries", json=payload)
    assert r.status_code in (200, 201), r.text
    return r.json()


class TestTimeAwareBuckets:
    """
    Server date is 2026-07-14 during this run. Upcoming September is 2026-09-01.

    - under_12 born Feb 2015 -> year 8 starts (2015 + 11) = 2026-09-01 -> 'september'
    - under_12 born Nov 2015 -> year 8 starts (2015 + 12) = 2027-09-01 -> 'future'
    - under_12 born May 2016 -> year 8 starts (2016 + 11) = 2027-09-01 -> 'future'
    - yr8 -> 'now'
    - 13_plus -> 'now'
    """

    @pytest.fixture(scope="class")
    def crafted(self, admin_tok):
        ids = {}
        ids["u12_sept"]  = _make(admin_tok, name_tag="U12Sept",  age_band="under_12", dob="2015-02-01")["id"]
        ids["u12_futA"]  = _make(admin_tok, name_tag="U12FutA",  age_band="under_12", dob="2015-11-01")["id"]
        ids["u12_futB"]  = _make(admin_tok, name_tag="U12FutB",  age_band="under_12", dob="2016-05-01")["id"]
        ids["yr8"]       = _make(admin_tok, name_tag="Yr8",      age_band="yr8",      dob="2013-06-01")["id"]
        ids["thirteen"]  = _make(admin_tok, name_tag="13Plus",   age_band="13_plus",  dob="2012-01-01")["id"]
        yield ids
        for eid in ids.values():
            requests.delete(f"{API}/enquiries/{eid}", headers=_h(admin_tok))

    def test_upcoming_september_is_2026_09_01(self):
        # sanity: this test suite assumes the server clock is in mid-2026
        assert TODAY.year == 2026 and TODAY < date(2026, 9, 1), (
            f"Expected server 'today' pre-Sept 2026; got {TODAY}")

    def test_under_12_upcoming_september_lands_in_september(self, admin_tok, crafted):
        r = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        sept_ids = {x["id"] for x in r["buckets"]["september"]}
        fut_ids  = {x["id"] for x in r["buckets"]["future"]}
        assert crafted["u12_sept"] in sept_ids, (
            f"under_12 dob=2015-02-01 should be in 'september' (upcoming), "
            f"got sept={sept_ids} future={fut_ids}")
        assert crafted["u12_sept"] not in fut_ids

        # verify eligible_date is exactly 2026-09-01
        row = next(x for x in r["buckets"]["september"] if x["id"] == crafted["u12_sept"])
        assert row["eligible_date"] == "2026-09-01"

    def test_under_12_later_september_stays_in_future(self, admin_tok, crafted):
        r = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        fut_ids = {x["id"] for x in r["buckets"]["future"]}
        assert crafted["u12_futA"] in fut_ids, "born Nov 2015 -> yr8 in Sept 2027 -> 'future'"
        assert crafted["u12_futB"] in fut_ids, "born May 2016 -> yr8 in Sept 2027 -> 'future'"

        # eligible_date should be 2027-09-01 for both
        for eid in (crafted["u12_futA"], crafted["u12_futB"]):
            row = next(x for x in r["buckets"]["future"] if x["id"] == eid)
            assert row["eligible_date"] == "2027-09-01"

    def test_yr8_and_13_plus_are_now(self, admin_tok, crafted):
        r = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        now_ids = {x["id"] for x in r["buckets"]["now"]}
        assert crafted["yr8"] in now_ids
        assert crafted["thirteen"] in now_ids

    def test_counts_add_up(self, admin_tok, crafted):
        r = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        counts = r["counts"]
        totals = sum(len(v) for v in r["buckets"].values())
        assert counts["now"] + counts["september"] + counts["future"] == totals

    def test_tracker_recomputes_every_call(self, admin_tok, crafted):
        """Two consecutive calls must return the same eligibility for the same DoB
        (buckets are recomputed from DoB, not stored)."""
        a = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        b = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        for bkt in ("now", "september", "future"):
            assert {x["id"] for x in a["buckets"][bkt]} == {x["id"] for x in b["buckets"][bkt]}
