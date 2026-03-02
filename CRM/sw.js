const CACHE_NAME = 'blackbook-v1';

// Initial files to save
const urlsToCache = [
  './',
  './index.html',
  './icon.png',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// UPGRADED FETCH EVENT: Dynamic Caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. Return the cached version if we already have it
        if (response) {
          return response;
        }
        
        // 2. If it's NOT in the cache, go get it from the internet
        return fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // 3. Clone the response and save it to the cache for next time! (This catches your FontAwesome .woff2 files automatically)
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            // We specifically don't cache API calls or browser extensions, only assets
            if (event.request.url.startsWith('http')) {
               cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
