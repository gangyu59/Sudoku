self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('sudoku-cache').then((cache) => {
            return cache.addAll([
                './index.html',
                './style.css',
                './main.js',
                './manifest.json',
                './service-worker.js' // 确保包括自身
                // Add other files you want to cache
            ]);
        }).catch(error => {
            console.error('Caching failed:', error);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(error => {
            console.error('Fetching failed:', error);
        })
    );
});