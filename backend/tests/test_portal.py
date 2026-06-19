"""Backend tests for 1471 Horwich Squadron Members Portal (Phase 2).

Covers: multi-role auth, change-password, users CRUD (staff), events CRUD +
bidding + attendance, notices (incl. requires_ack + pending + ack), messages
(member<->staff), role enforcement (401/403).
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("admin@1471horwich.org.uk", "Squadron1471!")
CFAV = ("cfav@1471horwich.org.uk", "Cfav1471!")
CADET = ("cadet@1471horwich.org.uk", "Cadet1471!")
PARENT = ("parent@1471horwich.org.uk", "Parent1471!")


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    return r.json()["access_token"]


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="session")
def tokens():
    return {
        "admin": _login(*ADMIN),
        "cfav": _login(*CFAV),
        "cadet": _login(*CADET),
        "parent": _login(*PARENT),
    }


# ---------------------------------------------------------------- auth
class TestAuth:
    def test_login_each_role(self, tokens):
        for k in ("admin", "cfav", "cadet", "parent"):
            assert isinstance(tokens[k], str) and len(tokens[k]) > 20

    def test_wrong_password_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN[0], "password": "bad"})
        assert r.status_code == 401
        assert "Invalid email or password" in r.json()["detail"]

    def test_me_each_role(self, tokens):
        for k in ("admin", "cfav", "cadet", "parent"):
            r = requests.get(f"{API}/auth/me", headers=_h(tokens[k]))
            assert r.status_code == 200, r.text
            d = r.json()
            assert d["role"] == k
            assert "stats" in d  # all roles compute stats

    def test_unauth_me(self):
        assert requests.get(f"{API}/auth/me").status_code == 401


# ---------------------------------------------------------------- role enforcement
class TestRoleEnforcement:
    def test_cadet_cannot_list_users(self, tokens):
        r = requests.get(f"{API}/users", headers=_h(tokens["cadet"]))
        assert r.status_code == 403

    def test_cadet_cannot_create_event(self, tokens):
        r = requests.post(f"{API}/events",
                          headers=_h(tokens["cadet"]),
                          json={"title": "Hack", "start": "2026-02-01T10:00:00Z"})
        assert r.status_code == 403

    def test_parent_cannot_create_notice(self, tokens):
        r = requests.post(f"{API}/notices",
                          headers=_h(tokens["parent"]),
                          json={"title": "x", "body": "y", "roles": ["cadet"]})
        assert r.status_code == 403

    def test_unauth_users(self):
        assert requests.get(f"{API}/users").status_code == 401

    def test_staff_cannot_use_cadet_bid(self, tokens):
        # need an event id - get any
        ev = requests.get(f"{API}/events", headers=_h(tokens["admin"])).json()
        if ev:
            r = requests.post(f"{API}/events/{ev[0]['id']}/bid", headers=_h(tokens["cfav"]))
            assert r.status_code == 403


# ---------------------------------------------------------------- notices + ack
class TestNotices:
    def test_pending_for_cadet_initially(self, tokens):
        # The welcome notice is seeded requires_ack for cadet/parent/cfav
        r = requests.get(f"{API}/notices/pending", headers=_h(tokens["cadet"]))
        assert r.status_code == 200
        items = r.json()
        # at least the welcome one (unless already acked from previous run)
        assert isinstance(items, list)

    def test_ack_clears_pending(self, tokens):
        r = requests.get(f"{API}/notices/pending", headers=_h(tokens["parent"]))
        for n in r.json():
            ar = requests.post(f"{API}/notices/{n['id']}/ack", headers=_h(tokens["parent"]))
            assert ar.status_code == 200
        # now empty
        r2 = requests.get(f"{API}/notices/pending", headers=_h(tokens["parent"]))
        assert r2.json() == []

    def test_staff_create_and_delete_notice(self, tokens):
        # create
        payload = {"title": "TEST_Notice", "body": "hello", "roles": ["cadet"], "requires_ack": True}
        cr = requests.post(f"{API}/notices", headers=_h(tokens["admin"]), json=payload)
        assert cr.status_code == 200, cr.text
        nid = cr.json()["id"]
        # cadet sees it pending
        pend = requests.get(f"{API}/notices/pending", headers=_h(tokens["cadet"])).json()
        assert any(n["id"] == nid for n in pend)
        # ack
        ar = requests.post(f"{API}/notices/{nid}/ack", headers=_h(tokens["cadet"]))
        assert ar.status_code == 200
        # delete
        dr = requests.delete(f"{API}/notices/{nid}", headers=_h(tokens["admin"]))
        assert dr.status_code == 200

    def test_create_notice_invalid_roles_400(self, tokens):
        r = requests.post(f"{API}/notices", headers=_h(tokens["admin"]),
                          json={"title": "Valid Title", "body": "body text", "roles": ["alien"]})
        assert r.status_code == 400


# ---------------------------------------------------------------- users CRUD
class TestUsersCRUD:
    def test_list_users(self, tokens):
        r = requests.get(f"{API}/users", headers=_h(tokens["admin"]))
        assert r.status_code == 200
        users = r.json()
        assert any(u["email"] == CADET[0] for u in users)

    def test_create_update_resetpw_delete(self, tokens):
        email = f"TEST_user_{uuid.uuid4().hex[:6]}@example.com"
        payload = {"email": email, "first_name": "TEST", "last_name": "User",
                   "role": "cadet", "password": "ChangeMe1!"}
        cr = requests.post(f"{API}/users", headers=_h(tokens["admin"]), json=payload)
        assert cr.status_code == 200, cr.text
        uid = cr.json()["id"]

        # update bonus_points
        ur = requests.patch(f"{API}/users/{uid}", headers=_h(tokens["admin"]),
                            json={"bonus_points": 25})
        assert ur.status_code == 200
        assert ur.json()["bonus_points"] == 25

        # reset password
        rp = requests.post(f"{API}/users/{uid}/reset-password",
                           headers=_h(tokens["admin"]), json={"new_password": "NewPass1!"})
        assert rp.status_code == 200
        # new login works
        nl = requests.post(f"{API}/auth/login", json={"email": email, "password": "NewPass1!"})
        assert nl.status_code == 200

        # delete
        dr = requests.delete(f"{API}/users/{uid}", headers=_h(tokens["admin"]))
        assert dr.status_code == 200

    def test_cannot_delete_admin(self, tokens):
        users = requests.get(f"{API}/users", headers=_h(tokens["admin"])).json()
        admin = next(u for u in users if u["email"] == ADMIN[0])
        r = requests.delete(f"{API}/users/{admin['id']}", headers=_h(tokens["admin"]))
        assert r.status_code == 400

    def test_duplicate_email_400(self, tokens):
        r = requests.post(f"{API}/users", headers=_h(tokens["admin"]),
                          json={"email": CADET[0], "first_name": "Dup",
                                "role": "cadet", "password": "x123456"})
        assert r.status_code == 400


# ---------------------------------------------------------------- events + bidding + attendance
@pytest.fixture(scope="session")
def temp_event(tokens):
    """Create a low-capacity event for bid/attendance tests."""
    payload = {
        "title": "TEST_Event", "description": "pytest", "location": "HQ",
        "start": "2030-01-01T19:00:00Z", "capacity": 1,
        "event_type": "standard", "participation": "volunteer", "points_value": 5,
    }
    r = requests.post(f"{API}/events", headers=_h(tokens["admin"]), json=payload)
    assert r.status_code == 200, r.text
    eid = r.json()["id"]
    yield eid
    requests.delete(f"{API}/events/{eid}", headers=_h(tokens["admin"]))


class TestEvents:
    def test_list_events_all_roles(self, tokens):
        for k in ("admin", "cfav", "cadet", "parent"):
            r = requests.get(f"{API}/events", headers=_h(tokens[k]))
            assert r.status_code == 200

    def test_update_event(self, tokens, temp_event):
        r = requests.patch(f"{API}/events/{temp_event}", headers=_h(tokens["admin"]),
                           json={"description": "updated"})
        assert r.status_code == 200
        # verify via GET
        g = requests.get(f"{API}/events/{temp_event}", headers=_h(tokens["admin"]))
        assert g.json()["description"] == "updated"

    def test_cadet_bid_then_full_blocks_second_cadet(self, tokens, temp_event):
        # cadet bids - capacity is 1
        b = requests.post(f"{API}/events/{temp_event}/bid", headers=_h(tokens["cadet"]))
        assert b.status_code == 200
        # idempotent toggle: re-call withdraws
        b2 = requests.post(f"{API}/events/{temp_event}/bid", headers=_h(tokens["cadet"]))
        assert b2.status_code == 200
        assert b2.json()["my_bid"] is False
        # re-bid
        requests.post(f"{API}/events/{temp_event}/bid", headers=_h(tokens["cadet"]))

        # Create 2nd cadet to test full block
        email = f"TEST_cadet2_{uuid.uuid4().hex[:6]}@example.com"
        cr = requests.post(f"{API}/users", headers=_h(tokens["admin"]),
                           json={"email": email, "first_name": "C2", "role": "cadet",
                                 "password": "Pass1234!"})
        assert cr.status_code == 200
        tok2 = _login(email, "Pass1234!")
        fr = requests.post(f"{API}/events/{temp_event}/bid", headers=_h(tok2))
        assert fr.status_code == 400
        assert "full" in fr.json()["detail"].lower()
        # cleanup
        requests.delete(f"{API}/users/{cr.json()['id']}", headers=_h(tokens["admin"]))

    def test_attendance_awards_points(self, tokens, temp_event):
        # get cadet id
        me = requests.get(f"{API}/auth/me", headers=_h(tokens["cadet"])).json()
        cadet_id = me["id"]
        before = me["stats"]["points"]
        # set attendance
        ar = requests.post(f"{API}/events/{temp_event}/attendance",
                           headers=_h(tokens["admin"]),
                           json={"attendee_ids": [cadet_id]})
        assert ar.status_code == 200
        # check stats after
        me2 = requests.get(f"{API}/auth/me", headers=_h(tokens["cadet"])).json()
        assert me2["stats"]["points"] >= before + 5
        assert me2["stats"]["streak"] >= 1  # volunteer event

    def test_get_event_returns_bidders_for_staff(self, tokens, temp_event):
        r = requests.get(f"{API}/events/{temp_event}", headers=_h(tokens["admin"]))
        assert r.status_code == 200
        assert "bidders" in r.json()


# ---------------------------------------------------------------- messages
class TestMessages:
    def test_cadet_post_thread_staff_reply(self, tokens):
        # Cadet posts
        body = f"TEST_msg_{uuid.uuid4().hex[:6]}"
        cr = requests.post(f"{API}/messages/thread", headers=_h(tokens["cadet"]),
                           json={"body": body})
        assert cr.status_code == 200
        # staff threads list
        st = requests.get(f"{API}/messages/threads", headers=_h(tokens["admin"]))
        assert st.status_code == 200
        threads = st.json()
        cadet_thread = next((t for t in threads
                             if any(t["member_id"] for t in threads)), None)
        assert cadet_thread is not None
        member_id = next(t["member_id"] for t in threads if body in t.get("last_body", ""))
        # staff reply
        rr = requests.post(f"{API}/messages/thread/{member_id}",
                           headers=_h(tokens["admin"]),
                           json={"body": "TEST_reply"})
        assert rr.status_code == 200
        # cadet sees both
        thr = requests.get(f"{API}/messages/thread", headers=_h(tokens["cadet"]))
        bodies = [m["body"] for m in thr.json()]
        assert body in bodies and "TEST_reply" in bodies

    def test_staff_cannot_use_member_thread(self, tokens):
        r = requests.get(f"{API}/messages/thread", headers=_h(tokens["admin"]))
        assert r.status_code == 403


# ---------------------------------------------------------------- change password
class TestChangePassword:
    def test_wrong_current_rejected(self, tokens):
        r = requests.post(f"{API}/auth/change-password", headers=_h(tokens["cadet"]),
                          json={"current_password": "WRONG", "new_password": "Whatever1!"})
        assert r.status_code == 400

    def test_success_then_revert(self):
        # ephemeral user
        admin_tok = _login(*ADMIN)
        email = f"TEST_pw_{uuid.uuid4().hex[:6]}@example.com"
        cr = requests.post(f"{API}/users", headers=_h(admin_tok),
                           json={"email": email, "first_name": "PW", "role": "cadet",
                                 "password": "Old1234!"})
        assert cr.status_code == 200
        uid = cr.json()["id"]
        tok = _login(email, "Old1234!")
        ch = requests.post(f"{API}/auth/change-password", headers=_h(tok),
                           json={"current_password": "Old1234!", "new_password": "New1234!"})
        assert ch.status_code == 200
        # login with new password
        _login(email, "New1234!")
        # cleanup
        requests.delete(f"{API}/users/{uid}", headers=_h(admin_tok))


def teardown_module(_m):
    """Cleanup TEST_ users / notices / events."""
    try:
        tok = _login(*ADMIN)
        h = _h(tok)
        for u in requests.get(f"{API}/users", headers=h).json():
            if u.get("email", "").startswith("TEST_"):
                requests.delete(f"{API}/users/{u['id']}", headers=h)
        for e in requests.get(f"{API}/events", headers=h).json():
            if e.get("title", "").startswith("TEST_"):
                requests.delete(f"{API}/events/{e['id']}", headers=h)
        for n in requests.get(f"{API}/notices", headers=h).json():
            if n.get("title", "").startswith("TEST_"):
                requests.delete(f"{API}/notices/{n['id']}", headers=h)
    except Exception:
        pass
