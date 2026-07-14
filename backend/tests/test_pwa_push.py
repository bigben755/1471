"""Tests for PWA/Web Push endpoints and static PWA assets."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")

CADET_EMAIL = "cadet@1471horwich.org.uk"
CADET_PASSWORD = "Cadet1471!"
ADMIN_EMAIL = "admin@1471horwich.org.uk"
ADMIN_PASSWORD = "Squadron1471!"


def _login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def cadet_token():
    return _login(CADET_EMAIL, CADET_PASSWORD)


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN_EMAIL, ADMIN_PASSWORD)


# --- Static PWA assets --------------------------------------------------------
class TestStaticPwaAssets:
    def test_manifest_returns_200_and_has_correct_fields(self):
        r = requests.get(f"{BASE_URL}/manifest.json", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "1471 Horwich Squadron RAF Air Cadets"
        assert data["display"] == "standalone"
        assert data["start_url"] == "/portal"
        assert isinstance(data["icons"], list) and len(data["icons"]) >= 3

    def test_sw_js_returns_200(self):
        r = requests.get(f"{BASE_URL}/sw.js", timeout=10)
        assert r.status_code == 200
        assert "push" in r.text.lower()

    def test_icon_192_returns_200(self):
        r = requests.get(f"{BASE_URL}/icons/icon-192.png", timeout=10)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/")

    def test_apple_touch_icon_returns_200(self):
        r = requests.get(f"{BASE_URL}/icons/apple-touch-icon.png", timeout=10)
        assert r.status_code == 200

    def test_icon_512_returns_200(self):
        r = requests.get(f"{BASE_URL}/icons/icon-512.png", timeout=10)
        assert r.status_code == 200


# --- Push endpoints -----------------------------------------------------------
class TestPushEndpoints:
    def test_vapid_public_key_enabled(self):
        r = requests.get(f"{BASE_URL}/api/push/vapid-public-key", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "key" in data
        assert data.get("enabled") is True
        assert isinstance(data["key"], str) and len(data["key"]) > 10

    def test_subscribe_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/push/subscribe",
                          json={"subscription": {"endpoint": "https://example.com/x"}},
                          timeout=10)
        assert r.status_code in (401, 403)

    def test_subscribe_stores_subscription(self, cadet_token):
        sub = {
            "endpoint": "https://fcm.googleapis.com/fcm/send/TEST_PYTEST_UNREACHABLE",
            "keys": {"p256dh": "TESTp256dh", "auth": "TESTauth"},
        }
        r = requests.post(f"{BASE_URL}/api/push/subscribe",
                          headers={"Authorization": f"Bearer {cadet_token}"},
                          json={"subscription": sub}, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"subscribed": True}

    def test_subscribe_rejects_missing_endpoint(self, cadet_token):
        r = requests.post(f"{BASE_URL}/api/push/subscribe",
                          headers={"Authorization": f"Bearer {cadet_token}"},
                          json={"subscription": {}}, timeout=10)
        assert r.status_code == 400

    def test_push_test_returns_sent_true(self, cadet_token):
        # Ensure at least one subscription (previous test set it).
        r = requests.post(f"{BASE_URL}/api/push/test",
                          headers={"Authorization": f"Bearer {cadet_token}"}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"sent": True}

    def test_broadcast_does_not_error_with_unreachable_subscriber(self, admin_token, cadet_token):
        # Cadet has an unreachable fake subscription now.
        r = requests.post(f"{BASE_URL}/api/broadcast",
                          headers={"Authorization": f"Bearer {admin_token}"},
                          json={
                              "title": "TEST_pwa_push_broadcast",
                              "body": "Ignore — pytest regression",
                              "channels": ["dashboard"],
                              "recipient_mode": "roles",
                              "roles": ["cadet"],
                          }, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        # Backend used to raise if pywebpush crashed; we expect graceful handling.
        assert isinstance(data, dict)

    def test_unsubscribe_removes_subscription(self, cadet_token):
        sub = {"endpoint": "https://fcm.googleapis.com/fcm/send/TEST_PYTEST_UNREACHABLE"}
        r = requests.post(f"{BASE_URL}/api/push/unsubscribe",
                          headers={"Authorization": f"Bearer {cadet_token}"},
                          json={"subscription": sub}, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"unsubscribed": True}


# --- Badge (notifications unread-count) --------------------------------------
class TestUnreadCountEndpoint:
    def test_unread_count_returns_int(self, cadet_token):
        r = requests.get(f"{BASE_URL}/api/notifications/unread-count",
                         headers={"Authorization": f"Bearer {cadet_token}"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
