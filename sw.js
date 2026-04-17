const CACHE_NAME = 'finance-tracker-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event – cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Fetch event – serve from cache, fallback to network, then cache new files
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
          // Cache dynamic requests (except analytics, etc.) – optional
          if (event.request.url.includes('/index.html') || event.request.url.includes('/manifest.json')) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Offline fallback – return a simple offline page
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:2rem;background:#f0f7f3;color:#1a6b3c;}</style></head>
          <body><h1>📴 You are offline</h1><p>My Finance Tracker works offline once installed. Please check your internet connection.</p><p>© 2026 TeaJay Konsult Ltd.</p></body>
          </html>
        `, { status: 200, headers: { 'Content-Type': 'text/html' } });
      })
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});