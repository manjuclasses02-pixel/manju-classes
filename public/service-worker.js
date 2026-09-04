const CACHE_NAME = 'manju-erp-v1';
const APP_SHELL = ['./', './index.html', './receipt.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-emblem.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache Firebase Auth/Firestore/CDN calls — always hit the network so
  // login and live data stay real-time and correct.
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic')
  ) {
    return;
  }

  // App shell: cache-first, falling back to network, so the UI still opens offline.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
          return res;
        })
        .catch(() => cached);
    })
  );
});
