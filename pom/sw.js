const CACHE_NAME = 'pomodoro-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'day.jpg',
  'night.gif',
  'day.mp3',
  'night.mp3.mp3',
  'rain.mp3',
  'storm.mp3',
  'forest.mp3',
  'waves.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
