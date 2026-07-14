"""Backend Phase 2 tests:
 - Prospective cadet eligibility (Join form dob + age_band -> tracker buckets)
 - Broadcast/notifications (targeted messaging)
 - Newsletters (create/preview/send)
 - Inbox / unread-count / read-all
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

CREDS = {
    "admin":  ("admin@1471horwich.org.uk",  "Squadron1471!"),
    "cadet":  ("cadet@1471horwich.org.uk",  "Cadet1471!"),
    "parent": ("parent@1471horwich.org.uk", "Parent1471!"),
    "cfav":   ("cfav@1471horwich.org.uk",   "Cfav1471!"),
}

# Track created ids for cleanup
CREATED_ENQUIRIES: list = []
CREATED_NEWSLETTERS: list = []


def _login(role):
    email, pw = CREDS[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"{role} login failed: {r.text}"
    j = r.json()
    return j["access_token"], j["user"]


@pytest.fixture(scope="session")
def admin_token():
    tok, _ = _login("admin")
    return tok


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def cadet_ctx():
    tok, user = _login("cadet")
    return {"headers": {"Authorization": f"Bearer {tok}"}, "user": user}


@pytest.fixture(scope="session")
def parent_ctx():
    tok, user = _login("parent")
    return {"headers": {"Authorization": f"Bearer {tok}"}, "user": user}


def _post_enquiry(age_band: str, dob: str, name_suffix: str) -> str:
    payload = {
        "name": f"TEST_Phase2 {name_suffix}",
        "email": f"TEST_p2_{name_suffix.replace(' ', '_')}@example.com",
        "phone": "07123456789",
        "enquiry_type": "Join as a Cadet",
        "message": "Phase 2 recruitment tracker test.",
        "consent": True,
        "dob": dob,
        "age_band": age_band,
    }
    r = requests.post(f"{API}/enquiries", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["age_band"] == age_band
    assert d["dob"] == dob
    CREATED_ENQUIRIES.append(d["id"])
    return d["id"]


# ---- Public: cadet enquiry accepts dob/age_band ----
class TestCadetEnquiryEligibility:
    def test_enquiry_with_yr8_maps_to_now(self, admin_headers):
        eid = _post_enquiry("yr8", "2012-05-14", "YR8")
        r = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        assert r.status_code == 200
        buckets = r.json()["buckets"]
        assert any(e["id"] == eid for e in buckets["now"]), "yr8 must be in 'now' bucket"

    def test_enquiry_with_13_plus_maps_to_now(self, admin_headers):
        eid = _post_enquiry("13_plus", "2010-03-01", "13PLUS")
        r = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        assert r.status_code == 200
        assert any(e["id"] == eid for e in r.json()["buckets"]["now"])

    def test_enquiry_with_yr7_maps_to_september_or_now(self, admin_headers):
        # yr7_starting_yr8 lands in 'september' unless we're past 1 Sept in current cycle
        eid = _post_enquiry("yr7_starting_yr8", "2013-11-20", "YR7")
        r = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        assert r.status_code == 200
        buckets = r.json()["buckets"]
        found = None
        for k, lst in buckets.items():
            if any(e["id"] == eid for e in lst):
                found = k; break
        # accept september OR now (post-Sept edge case) but NOT future
        assert found in ("september", "now"), f"yr7 landed in unexpected bucket {found}"

    def test_enquiry_with_under_12_maps_to_future(self, admin_headers):
        eid = _post_enquiry("under_12", "2015-06-10", "U12")
        r = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        assert r.status_code == 200
        assert any(e["id"] == eid for e in r.json()["buckets"]["future"])

    def test_tracker_counts_match_buckets(self, admin_headers):
        r = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("now", "september", "future"):
            assert d["counts"][k] == len(d["buckets"][k])
        # labels present
        assert d["labels"]["now"] == "Can join now"

    def test_tracker_requires_staff(self):
        r = requests.get(f"{API}/enquiries/tracker")
        assert r.status_code == 401

    def test_non_cadet_enquiry_not_in_tracker(self, admin_headers):
        # No dob/age_band -> should not appear
        payload = {
            "name": "TEST_Phase2 Volunteer",
            "email": "TEST_p2_volunteer@example.com",
            "phone": "",
            "enquiry_type": "Become an Adult Volunteer",
            "message": "Adult volunteer enquiry test.",
            "consent": True,
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 200
        eid = r.json()["id"]
        CREATED_ENQUIRIES.append(eid)
        r2 = requests.get(f"{API}/enquiries/tracker", headers=admin_headers)
        all_ids = [e["id"] for lst in r2.json()["buckets"].values() for e in lst]
        assert eid not in all_ids


# ---- Broadcast + notifications ----
class TestBroadcast:
    def test_broadcast_requires_staff(self):
        r = requests.post(f"{API}/broadcast", json={
            "title": "x", "body": "y",
            "audience": {"mode": "all", "roles": [], "user_ids": [], "cadet_id": None},
            "channels": ["dashboard"],
        })
        assert r.status_code == 401

    def test_broadcast_to_role_cadet(self, admin_headers, cadet_ctx):
        payload = {
            "title": "TEST_Phase2 Cadet broadcast",
            "body": "Hello cadets, this is a test broadcast.",
            "audience": {"mode": "roles", "roles": ["cadet"], "user_ids": [], "cadet_id": None},
            "channels": ["dashboard"],
        }
        r = requests.post(f"{API}/broadcast", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["recipients"] >= 1
        assert d["dashboard_delivered"] >= 1
        # Verify cadet inbox contains this notification
        time.sleep(0.5)
        r2 = requests.get(f"{API}/notifications", headers=cadet_ctx["headers"])
        assert r2.status_code == 200
        titles = [n["title"] for n in r2.json()]
        assert payload["title"] in titles

    def test_broadcast_parent_of_cadet(self, admin_headers, cadet_ctx, parent_ctx):
        cadet_id = cadet_ctx["user"]["id"]
        payload = {
            "title": "TEST_Phase2 Parent-of-cadet",
            "body": "This message goes only to the cadet's parent.",
            "audience": {"mode": "parent_of", "roles": [], "user_ids": [], "cadet_id": cadet_id},
            "channels": ["dashboard"],
        }
        r = requests.post(f"{API}/broadcast", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        assert r.json()["recipients"] >= 1
        time.sleep(0.5)
        r2 = requests.get(f"{API}/notifications", headers=parent_ctx["headers"])
        assert r2.status_code == 200
        assert payload["title"] in [n["title"] for n in r2.json()]

    def test_unread_count_and_read_all(self, cadet_ctx):
        # Cadet has just been broadcast to; unread-count should be >= 1
        r = requests.get(f"{API}/notifications/unread-count", headers=cadet_ctx["headers"])
        assert r.status_code == 200
        before = r.json()["count"]
        assert before >= 1
        # mark all read
        r2 = requests.post(f"{API}/notifications/read-all", headers=cadet_ctx["headers"])
        assert r2.status_code == 200
        r3 = requests.get(f"{API}/notifications/unread-count", headers=cadet_ctx["headers"])
        assert r3.status_code == 200
        assert r3.json()["count"] == 0


# ---- Newsletters ----
class TestNewsletters:
    def test_newsletter_crud_preview_send(self, admin_headers, cadet_ctx):
        # Create
        payload = {"subject": "TEST_Phase2 Newsletter", "heading": "Weekly Update",
                   "intro": "Hi all,", "body": "Paragraph one.\n\nParagraph two."}
        r = requests.post(f"{API}/newsletters", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        nl = r.json()
        assert nl["subject"] == payload["subject"]
        assert nl["status"] == "draft"
        nid = nl["id"]
        CREATED_NEWSLETTERS.append(nid)

        # Preview
        rp = requests.post(f"{API}/newsletters/preview", json=payload, headers=admin_headers)
        assert rp.status_code == 200
        assert "<" in rp.json()["html"]  # some HTML

        # List includes it
        rl = requests.get(f"{API}/newsletters", headers=admin_headers)
        assert rl.status_code == 200
        assert any(n["id"] == nid for n in rl.json())

        # PATCH
        rpp = requests.patch(f"{API}/newsletters/{nid}",
                             json={**payload, "subject": "TEST_Phase2 Newsletter (edited)"},
                             headers=admin_headers)
        assert rpp.status_code == 200
        assert rpp.json()["subject"].endswith("(edited)")

        # Send to cadets (dashboard only for speed)
        rs = requests.post(f"{API}/newsletters/{nid}/send",
                          json={"audience": {"mode": "roles", "roles": ["cadet"],
                                             "user_ids": [], "cadet_id": None},
                                "channels": ["dashboard"]},
                          headers=admin_headers)
        assert rs.status_code == 200, rs.text
        assert rs.json()["recipients"] >= 1

        # Cadet inbox now has newsletter kind
        time.sleep(0.5)
        rn = requests.get(f"{API}/notifications", headers=cadet_ctx["headers"])
        assert rn.status_code == 200
        assert any(n["kind"] == "newsletter" and "TEST_Phase2 Newsletter" in n["title"]
                   for n in rn.json())

        # Newsletter status is now 'sent'
        rl2 = requests.get(f"{API}/newsletters", headers=admin_headers)
        row = next(n for n in rl2.json() if n["id"] == nid)
        assert row["status"] == "sent"
        assert row.get("sent_at")

    def test_newsletters_require_staff(self):
        r = requests.get(f"{API}/newsletters")
        assert r.status_code == 401


def teardown_module(_module):
    """Cleanup TEST_ enquiries + newsletters + notifications for demo users."""
    try:
        tok, _ = _login("admin")
        h = {"Authorization": f"Bearer {tok}"}
        # enquiries
        for eid in CREATED_ENQUIRIES:
            requests.delete(f"{API}/enquiries/{eid}", headers=h)
        # newsletters
        for nid in CREATED_NEWSLETTERS:
            requests.delete(f"{API}/newsletters/{nid}", headers=h)
    except Exception as e:
        print(f"Cleanup error: {e}")
