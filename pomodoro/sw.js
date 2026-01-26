const CACHE_NAME = 'pomo-v3'; // Increment this (v3, v4...) to force an update
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './day.gif',
  './bg-image.gif',
  './day.mp3',
  './night.mp3.mp3', 
  './alarm-day.mp3',
  './alarm-night.mp3',
  './rain.mp3',
  './storm.mp3',
  './forest.mp3',
  './waves.mp3',
  './icon.png'
];

// 1. INSTALL: Download everything
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE: Delete the old cache from v1
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. FETCH: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
