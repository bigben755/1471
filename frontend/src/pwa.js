import { api } from "./api";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export async function enablePush() {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };
  try {
    const { data: vapid } = await api.get("/push/vapid-public-key");
    if (!vapid.enabled) return { ok: false, reason: "disabled" };
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: "denied" };
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.key),
      });
    }
    await api.post("/push/subscribe", { subscription: sub.toJSON() });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error" };
  }
}

export async function disablePush() {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      try { await api.post("/push/unsubscribe", { subscription: sub.toJSON() }); } catch (e) { /* ignore */ }
      await sub.unsubscribe();
    }
    if (navigator.clearAppBadge) { try { await navigator.clearAppBadge(); } catch (e) { /* ignore */ } }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error" };
  }
}

export async function refreshBadge() {
  if (!("setAppBadge" in navigator)) return;
  try {
    const { data } = await api.get("/notifications/unread-count");
    if (data.count > 0) await navigator.setAppBadge(data.count);
    else if (navigator.clearAppBadge) await navigator.clearAppBadge();
  } catch (e) { /* ignore */ }
}
