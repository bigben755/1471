/* 1471 Horwich Squadron service worker — push + badge */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || "1471 Horwich Squadron";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "/portal" },
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    if (typeof data.badge === "number" && self.navigator.setAppBadge) {
      try {
        if (data.badge > 0) await self.navigator.setAppBadge(data.badge);
        else if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
      } catch (e) { /* ignore */ }
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/portal";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes(url.replace(/^https?:\/\/[^/]+/, "")) && "focus" in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
