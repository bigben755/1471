"""Backend tests for the recruit-email endpoints (Phase 3).

Covers:
- POST /api/enquiries/{id}/recruit-email  (kind=joining, kind=countdown)
- POST /api/enquiries/recruit-email/bulk   (per eligibility bucket)
- Edge case: countdown for a 'future' enquiry that lacks dob -> 400
- Persistence: after send, enquiry.last_recruit_email is populated and status is 'actioned'
- Tracker: eligible_date + last_recruit_email surface in _enquiry_out
"""
import os
import uuid
from datetime import date

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


@pytest.fixture(scope="session")
def admin_tok():
    return _login(*ADMIN)


def _create_enquiry(payload):
    """Public enquiry create (no auth). Ensures TEST_ prefix on name."""
    r = requests.post(f"{API}/enquiries", json=payload)
    assert r.status_code in (200, 201), r.text
    return r.json()


@pytest.fixture(scope="module")
def seeded_enquiries(admin_tok):
    """Create one enquiry per bucket + one 'future' with NO dob."""
    today = date.today()
    base = {"enquiry_type": "cadet", "consent": True}
    # 'now' bucket: yr8
    now_enq = _create_enquiry({
        **base,
        "name": f"TEST_Recruit Now {uuid.uuid4().hex[:5]}",
        "email": f"test_now_{uuid.uuid4().hex[:5]}@example.com",
        "phone": "07000000001",
        "message": "pytest now",
        "age_band": "yr8",
        "dob": f"{today.year - 13}-06-15",  # 13yo -> yr8 bucket
    })
    # 'september' bucket: yr7_starting_yr8
    sept_enq = _create_enquiry({
        **base,
        "name": f"TEST_Recruit Sept {uuid.uuid4().hex[:5]}",
        "email": f"test_sept_{uuid.uuid4().hex[:5]}@example.com",
        "phone": "07000000002",
        "message": "pytest sept",
        "age_band": "yr7_starting_yr8",
        "dob": f"{today.year - 11}-10-05",
    })
    # 'future' bucket WITH dob (under_12) -> real countdown date
    future_enq = _create_enquiry({
        **base,
        "name": f"TEST_Recruit Future {uuid.uuid4().hex[:5]}",
        "email": f"test_future_{uuid.uuid4().hex[:5]}@example.com",
        "phone": "07000000003",
        "message": "pytest future dob",
        "age_band": "under_12",
        "dob": f"{today.year - 9}-05-01",
    })
    # 'future' bucket WITHOUT dob (for 400 test)
    future_no_dob = _create_enquiry({
        **base,
        "name": f"TEST_Recruit NoDOB {uuid.uuid4().hex[:5]}",
        "email": f"test_nodob_{uuid.uuid4().hex[:5]}@example.com",
        "phone": "07000000004",
        "message": "pytest future no-dob",
        "age_band": "under_12",
    })

    ids = {
        "now": now_enq["id"],
        "september": sept_enq["id"],
        "future": future_enq["id"],
        "future_no_dob": future_no_dob["id"],
    }
    yield ids
    # cleanup
    h = _h(admin_tok)
    for eid in ids.values():
        requests.delete(f"{API}/enquiries/{eid}", headers=h)


# ---------- tracker ---------------------------------------------------------

class TestTracker:
    def test_tracker_returns_buckets_with_eligible_date(self, admin_tok, seeded_enquiries):
        r = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok))
        assert r.status_code == 200, r.text
        d = r.json()
        assert set(d["buckets"].keys()) == {"now", "september", "future"}
        assert d["counts"]["now"] >= 1
        assert d["counts"]["september"] >= 1
        assert d["counts"]["future"] >= 2  # our future + future_no_dob

        # locate our seeded ones and verify eligible_date presence rules
        def _find(bucket, eid):
            return next((x for x in d["buckets"][bucket] if x["id"] == eid), None)

        now = _find("now", seeded_enquiries["now"])
        assert now is not None
        assert now.get("eligible_date")  # today's date

        sept = _find("september", seeded_enquiries["september"])
        assert sept is not None
        assert sept["eligible_date"], "september bucket must expose eligible_date"

        fut = _find("future", seeded_enquiries["future"])
        assert fut is not None
        assert fut["eligible_date"], "future w/ dob must expose eligible_date"
        # eligible_date must be strictly in the future for a 9yo
        assert fut["eligible_date"] > date.today().isoformat()

        fut_nd = _find("future", seeded_enquiries["future_no_dob"])
        assert fut_nd is not None
        assert fut_nd.get("eligible_date") in (None, ""), "no-dob future must NOT have eligible_date"


# ---------- per-prospect email ---------------------------------------------

class TestPerProspectEmail:
    def test_joining_email_now_bucket(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/{seeded_enquiries['now']}/recruit-email",
            headers=_h(admin_tok),
            json={"kind": "joining", "note": "pytest note joining"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent") is True
        assert d.get("kind") == "joining"
        assert d.get("email_status") in ("sent", "skipped")

        # Verify persistence via tracker
        tr = requests.get(f"{API}/enquiries/tracker", headers=_h(admin_tok)).json()
        row = next((x for x in tr["buckets"]["now"] if x["id"] == seeded_enquiries["now"]), None)
        assert row is not None
        assert row.get("last_recruit_email"), "last_recruit_email should be persisted"
        assert row["last_recruit_email"]["kind"] == "joining"
        assert row["status"] == "actioned"

    def test_countdown_email_september_bucket(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/{seeded_enquiries['september']}/recruit-email",
            headers=_h(admin_tok),
            json={"kind": "countdown"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent") is True
        assert d.get("kind") == "countdown"
        assert d.get("eligible_date"), "countdown response must include eligible_date"

    def test_countdown_email_future_bucket_with_dob(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/{seeded_enquiries['future']}/recruit-email",
            headers=_h(admin_tok),
            json={"kind": "countdown"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent") is True
        assert d.get("kind") == "countdown"
        # School-year rule: 9yo should be able to join in a specific future September
        assert d["eligible_date"] > date.today().isoformat()

    def test_countdown_no_dob_returns_400(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/{seeded_enquiries['future_no_dob']}/recruit-email",
            headers=_h(admin_tok),
            json={"kind": "countdown"},
        )
        assert r.status_code == 400, r.text
        assert "date of birth" in r.json()["detail"].lower()

    def test_recruit_email_requires_staff(self, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/{seeded_enquiries['now']}/recruit-email",
            json={"kind": "joining"},
        )
        assert r.status_code == 401

    def test_recruit_email_unknown_enquiry_404(self, admin_tok):
        r = requests.post(
            f"{API}/enquiries/does-not-exist/recruit-email",
            headers=_h(admin_tok),
            json={"kind": "joining"},
        )
        assert r.status_code == 404


# ---------- bulk email ------------------------------------------------------

class TestBulkEmail:
    def test_bulk_joining_now(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/recruit-email/bulk",
            headers=_h(admin_tok),
            json={"eligibility": "now"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent", 0) >= 1
        assert d.get("kind") == "joining"

    def test_bulk_countdown_september(self, admin_tok, seeded_enquiries):
        r = requests.post(
            f"{API}/enquiries/recruit-email/bulk",
            headers=_h(admin_tok),
            json={"eligibility": "september"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent", 0) >= 1
        assert d.get("kind") == "countdown"

    def test_bulk_countdown_future_skips_no_dob(self, admin_tok, seeded_enquiries):
        """A 'future' enquiry with no dob should be skipped, not blow up."""
        r = requests.post(
            f"{API}/enquiries/recruit-email/bulk",
            headers=_h(admin_tok),
            json={"eligibility": "future"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        # at least our future-with-dob is sent, our no-dob is skipped
        assert d.get("sent", 0) >= 1
        assert d.get("skipped", 0) >= 1
        assert d.get("kind") == "countdown"

    def test_bulk_invalid_bucket_400(self, admin_tok):
        r = requests.post(
            f"{API}/enquiries/recruit-email/bulk",
            headers=_h(admin_tok),
            json={"eligibility": "bogus"},
        )
        assert r.status_code == 400

    def test_bulk_requires_staff(self):
        r = requests.post(
            f"{API}/enquiries/recruit-email/bulk",
            json={"eligibility": "now"},
        )
        assert r.status_code == 401
