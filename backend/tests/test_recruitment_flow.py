"""Integration coverage for the staff-controlled recruitment workflow."""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = ("admin@1471horwich.org.uk", "Squadron1471!")


def _login():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN[0], "password": ADMIN[1]})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def _h(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def prospect():
    token = _login()
    suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": f"TEST_Recruitment Flow {suffix}",
        "email": f"recruitment_flow_{suffix}@example.com",
        "phone": "07000000000",
        "enquiry_type": "cadet",
        "message": "Recruitment workflow integration test",
        "consent": True,
        "age_band": "yr8",
        "dob": "2013-10-01",
    }
    r = requests.post(f"{API}/enquiries", json=payload)
    assert r.status_code in (200, 201), r.text
    enquiry = r.json()
    yield token, enquiry
    requests.delete(f"{API}/enquiries/{enquiry['id']}", headers=_h(token))


def _find(tracker, enquiry_id):
    for rows in tracker["buckets"].values():
        for row in rows:
            if row["id"] == enquiry_id:
                return row
    return None


class TestRecruitmentWorkflow:
    def test_new_prospect_starts_uncategorised(self, prospect):
        token, enquiry = prospect
        r = requests.get(f"{API}/recruitment/tracker", headers=_h(token))
        assert r.status_code == 200, r.text
        data = r.json()
        row = _find(data, enquiry["id"])
        assert row is not None
        assert row["recruitment_category"] == "uncategorised"
        assert row["progress"]["categorised"] is False
        assert data["action_counts"]["needs_categorising"] >= 1

    def test_ready_now_progress_is_timestamped(self, prospect):
        token, enquiry = prospect
        url = f"{API}/recruitment/enquiries/{enquiry['id']}"

        r = requests.patch(url, headers=_h(token), json={"recruitment_category": "ready_now"})
        assert r.status_code == 200, r.text
        assert r.json()["recruitment_category"] == "ready_now"

        r = requests.patch(url, headers=_h(token), json={"open_evening_invite_sent": True})
        assert r.status_code == 200, r.text
        assert r.json()["open_evening_invite_sent_at"]

        r = requests.patch(url, headers=_h(token), json={"joining_instructions_sent": True})
        assert r.status_code == 200, r.text
        assert r.json()["joining_instructions_sent_at"]

        r = requests.patch(url, headers=_h(token), json={"joining_documents_sent": True})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["joining_documents_sent_at"]
        assert len(body["recruitment_history"]) >= 4

    def test_september_2028_has_fixed_target_and_no_joining_stage(self, prospect):
        token, enquiry = prospect
        url = f"{API}/recruitment/enquiries/{enquiry['id']}"
        r = requests.patch(url, headers=_h(token), json={"recruitment_category": "september_2028"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["recruitment_target_date"] == "2028-09-01"

        r = requests.patch(url, headers=_h(token), json={"open_evening_invite_sent": True})
        assert r.status_code == 200, r.text

        r = requests.patch(url, headers=_h(token), json={"joining_instructions_sent": True})
        assert r.status_code == 400

    def test_not_ready_cannot_be_marked_invited(self, prospect):
        token, enquiry = prospect
        url = f"{API}/recruitment/enquiries/{enquiry['id']}"
        r = requests.patch(url, headers=_h(token), json={"recruitment_category": "not_ready"})
        assert r.status_code == 200, r.text
        r = requests.patch(url, headers=_h(token), json={"open_evening_invite_sent": True})
        assert r.status_code == 400

    def test_undo_clears_timestamp(self, prospect):
        token, enquiry = prospect
        url = f"{API}/recruitment/enquiries/{enquiry['id']}"
        requests.patch(url, headers=_h(token), json={"recruitment_category": "ready_now"})
        requests.patch(url, headers=_h(token), json={"open_evening_invite_sent": True})
        r = requests.patch(url, headers=_h(token), json={"open_evening_invite_sent": False})
        assert r.status_code == 200, r.text
        assert r.json()["open_evening_invite_sent_at"] is None
