/* ============================================================
   Service Worker — مذاكرتي
   الإشعارات الخلفية الحقيقية (Push API + scheduled reminders)
   ============================================================ */

const CACHE   = "mazakrati-v2";
const OFFLINE = "./mazakrati.html";

/* ── Install ─────────────────────────────────────────────── */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([OFFLINE, "./manifest.json"]).catch(() => {}))
  );
  self.skipWaiting();
});

/* ── Activate ────────────────────────────────────────────── */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch (cache-first) ─────────────────────────────────── */
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(c =>
      c || fetch(e.request).catch(() =>
        new Response("❌ غير متصل بالإنترنت", { status: 503 })
      )
    )
  );
});

/* ── Push (من Firebase Cloud Messaging أو أي push server) ── */
self.addEventListener("push", e => {
  let payload = { title: "مذاكرتي 📚", body: "حان وقت المذاكرة!" };
  try { payload = e.data.json(); } catch (_) {
    try { payload.body = e.data.text(); } catch (_) {}
  }
  e.waitUntil(showNotif(payload.title, payload.body, payload.url));
});

/* ── Notification click ──────────────────────────────────── */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || OFFLINE;

  if (e.action === "snooze") {
    // إعادة جدولة بعد 60 دقيقة
    scheduleOnce(60 * 60 * 1000, "تذكير — مذاكرتي 📚", "مرّت ساعة، هل بدأت جلستك؟");
    return;
  }

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(wins => {
      const w = wins.find(x => x.url.includes("mazakrati"));
      return w ? w.focus() : clients.openWindow(url);
    })
  );
});

/* ── Messages من الصفحة الرئيسية ───────────────────────── */
self.addEventListener("message", e => {
  if (!e.data) return;
  switch (e.data.type) {
    case "SCHEDULE_REMINDERS":
      startReminders();
      e.source && e.source.postMessage({ type: "SW_READY" });
      break;
    case "CANCEL_REMINDERS":
      stopReminders();
      break;
    case "NOTIFY_NOW":
      showNotif(e.data.title || "مذاكرتي 📚", e.data.body || "حان وقت المذاكرة!");
      break;
  }
});

/* ── Helper: عرض إشعار ──────────────────────────────────── */
function showNotif(title, body, url) {
  return self.registration.showNotification(title, {
    body,
    icon:     "./icon-192.png",
    badge:    "./icon-192.png",
    dir:      "rtl",
    lang:     "ar",
    tag:      "mazakrati-reminder",
    renotify: true,
    actions: [
      { action: "open",   title: "افتح التطبيق" },
      { action: "snooze", title: "بعد ساعة"      }
    ],
    data: { url: url || OFFLINE }
  });
}

/* ── Reminders scheduler ─────────────────────────────────── */
let _timers = [];

function scheduleOnce(ms, title, body) {
  const id = setTimeout(() => showNotif(title, body), ms);
  _timers.push(id);
}

function startReminders() {
  stopReminders();
  const TWO_H = 2 * 60 * 60 * 1000;
  (function loop() {
    const id = setTimeout(() => {
      showNotif("مذاكرتي 📚 — تذكير", "لم تبدأ جلسة دراسية منذ فترة. هل أنت مستعد؟");
      loop();
    }, TWO_H);
    _timers.push(id);
  })();
}

function stopReminders() {
  _timers.forEach(clearTimeout);
  _timers = [];
}
