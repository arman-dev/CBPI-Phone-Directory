/* CBPI Directory - Service Worker v24 - final clean release */
const CACHE = "cbpi-dir-v24";
const CORE = [
  "./",
  "./index.html",
  "./admin.html",
  "./style.css",
  "./app.js",
  "./admin.js",
  "./data.js",
  "./manifest.json",
  "./images/logo.png",
  "./images/icons/icon-192.png",
  "./images/icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
];

// Pre-cache all teacher images that exist in data (we'll just add the ones we know about)
const TEACHER_IMAGES = [];
for (let i = 1; i <= 55; i++) {
  if (i !== 12 && i !== 14) {
    TEACHER_IMAGES.push(`./images/teachers/t_${String(i).padStart(2,'0')}.png`);
  }
}
TEACHER_IMAGES.push("./images/teachers/principal_salam.jpg");
TEACHER_IMAGES.push("./images/teachers/hasina_akter.jpg");

const STAFF_IMAGES = [];
for (let i = 101; i <= 126; i++) {
  STAFF_IMAGES.push(`./images/staff/sl${i}.jpg`);
}
const ALL_ASSETS = [...CORE, ...TEACHER_IMAGES, ...STAFF_IMAGES];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(ALL_ASSETS).catch(err => console.warn("[SW] pre-cache partial:", err))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const url = new URL(e.request.url);
          if (url.origin === self.location.origin || url.hostname.includes("cdnjs")) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone)).catch(()=>{});
          }
        }
        return res;
      }).catch(() => {
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
