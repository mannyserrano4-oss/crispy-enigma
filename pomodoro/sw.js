const CACHE_NAME = 'pomo-v1';

// List every local file you want available offline
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './day.jpg',
  './night-bg.gif',
  './day.mp3',
  './night.mp3.mp3', // Matches the filename in your code
  './alarm-day.mp3',
  './alarm-night.mp3',
  './rain.mp3',
  './storm.mp3',
  './forest.mp3',
  './waves.mp3',
  './icon.png'
];

// 1. Install: Photocopying the files into the browser's memory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Fetch: Serving the photocopies when there's no internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
