// Service worker di Cucina di Casa.
// Per pubblicare una nuova versione: aumenta il numero qui sotto (v1 -> v2 ...).
// I telefoni scaricano la nuova versione e l'app si ricarica da sola.
const VERSIONE = "cucina-v6";
const RUNTIME = "cucina-runtime";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./firebase-config.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

// Host esterni da tenere in cache per l'uso offline (SDK Firebase e font).
// Il traffico dati di Firestore/Auth (googleapis.com) NON passa dalla cache.
const ESTERNI = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSIONE && k !== RUNTIME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // La configurazione Firebase: prima la rete, così una modifica arriva subito.
    if (url.pathname.endsWith("/firebase-config.js")) {
      e.respondWith(
        fetch(req).then(r => {
          const copia = r.clone();
          caches.open(VERSIONE).then(c => c.put(req, copia));
          return r;
        }).catch(() => caches.match(req))
      );
      return;
    }
    // App shell: prima la cache (aggiornata a ogni nuova VERSIONE).
    e.respondWith(
      caches.match(req, { ignoreSearch: req.mode === "navigate" })
        .then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : null))
        .then(r => r || fetch(req))
    );
    return;
  }

  if (ESTERNI.includes(url.hostname)) {
    // Stale-while-revalidate: risponde dalla cache e aggiorna in background.
    e.respondWith(
      caches.open(RUNTIME).then(c => c.match(req).then(hit => {
        const rete = fetch(req).then(r => {
          if (r.ok || r.type === "opaque") c.put(req, r.clone());
          return r;
        }).catch(() => hit);
        return hit || rete;
      }))
    );
  }
});
