const cacheKey = 'GroceryList-v1';
const cacheKeyAllowList = [cacheKey];
const cacheUrls = [
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/grocerylist.js',
    '/images/screenshot_wide.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const cache = await caches.open(cacheKey);
        await cache.addAll(cacheUrls);
    }));
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        return Promise.all(keys.map((key) => {
            if (!cacheKeyAllowList.includes(keys)) {
                return caches.delete(key);
            }
        }));
    }));
});

self.addEventListener('fetch', (e) => {
    const url = e.request.url;
    if (e.request.method != 'GET' || url.includes('browser-sync')) {
        return;
    }
    e.respondWith(
        (async () => {
            try {
                const response = await fetch(e.request);
                const cache = await caches.open(cacheKey);
                cache.put(e.request, response.clone());
                return response;
            } catch(err) {
                const cached_response = await caches.match(e.request);
                if (cached_response) {
                    return cached_response;
                }
                return err;
            }
        })(),
    );
});
