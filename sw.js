const CACHE_NAME = 'uniqlock-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/mainScript.js',
  '/js/clickWorker.js',
  '/js/fetchWorker.js',
  '/js/modules/defaultData.js',
  '/js/modules/customizedData.js',
  '/assets/fonts/27_UniqloRegular.woff',
  '/assets/fonts/7_UniqloBold.woff',
  '/assets/fonts/54_UNIQLOCK_mini_8pt_st.woff',
  '/assets/icons/Icon - Sound On - 11x10 - black.png',
  '/assets/icons/Icon - Sound Off - 24x10 - black.png',
  '/assets/icons/pwa-192x192.png',
  '/assets/icons/pwa-512x512.png',
  '/favicon.ico',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses or non-GET requests
        if (!response || response.status !== 200 || event.request.method !== 'GET') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache media files (videos, music) on first request
        if (event.request.url.includes('/assets/videos/') ||
            event.request.url.includes('/assets/music/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});
