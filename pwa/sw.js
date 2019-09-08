importScripts('/swApi.js');

const CACHE_NAME = 'notes';
const getUrlsToCache = () => {
    const mode = new URL(location).searchParams.get('mode');
    const urls = [
        '/',
        '/app.bundle.js',
        '/actionTypes.json',
    ];

    switch (mode) {
        case 'development':
            return urls;
        case 'production':
            return urls.map((url) => `/todo${url}`);
        default:
            throw new Error('Environment mode must be either "development" or "production"');
    }
};
const handleInstall = async () => {
    const urlsToCache = getUrlsToCache();
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
};
const handleActivate = async () => {
    let promises;

    const cacheNames = await caches.keys();
    promises = cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName));
    await Promise.all(promises);

    const cache = await caches.open(CACHE_NAME);
    const responses = await cache.matchAll();
    const urlsToCache = getUrlsToCache();
    promises = responses
        .map((response) => response.url.replace(location.origin, ''))
        .filter((url) => !urlsToCache.includes(url))
        .map((url) => cache.delete(url));
    await Promise.all(promises);
};
const handleFetch = async (req) => {
    let response, isResponseOk;

    try {
        response = await fetch(req);
        isResponseOk = response.ok;
    } catch {
        isResponseOk = false;
    }

    if (isResponseOk) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, response.clone());
    } else {
        const cachedResponse = await caches.match(req);
        if (cachedResponse) {
            return cachedResponse;
        }
    }

    return response;
};

self.addEventListener('install', (e) => {
    e.waitUntil(handleInstall());
});
self.addEventListener('activate', (e) => {
    e.waitUntil(handleActivate());
});
self.addEventListener('fetch', (e) => {
    e.respondWith(handleFetch(e.request));
});
