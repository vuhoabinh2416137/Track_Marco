const CACHE_NAME = 'macrotrack-v2-cache';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear all old caches
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for everything: Always try network, never serve stale Next.js chunks or HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Do not intercept Next.js chunks or API
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/_next/')
  ) {
    return;
  }

  // Network first with offline fallback for static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
