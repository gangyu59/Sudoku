self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('sudoku-cache').then((cache) => {
            return cache.addAll([
                './index.html',
                './style.css',
                './main.js',
                './manifest.json'
                // Add other files you want to cache
            ]);
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