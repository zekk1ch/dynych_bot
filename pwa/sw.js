const URL_PREFIX = new URL(location).searchParams.get('mode') === 'production' ? '/todo' : '';
const URLS_TO_CACHE = [
    '/',
    '/app.bundle.js',
    '/actionTypes.json',
].map((url) => `${URL_PREFIX}${url}`);
const CACHE_NAME = 'notes';

const handleInstall = async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(URLS_TO_CACHE);
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
    promises = responses
        .map((response) => response.url.replace(location.origin, ''))
        .filter((url) => !URLS_TO_CACHE.includes(url))
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

importScripts(`${URL_PREFIX}/swApi.js`);
