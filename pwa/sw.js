const CACHE_NAME = 'notes';
const getUrlsToCache = (mode) => {
    const urls = [
        '/',
        '/app.bundle.js',
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
const handleInstall = async (urlsToCache) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
};
const handleFetch = async (req) => {
    const response = await caches.match(req);
    if (response) {
        return response;
    }

    return fetch(req);
};

self.addEventListener('install', (e) => {
    const mode = new URL(location).searchParams.get('mode');
    const urlsToCache = getUrlsToCache(mode);

    e.waitUntil(handleInstall(urlsToCache));
});
self.addEventListener('fetch', (e) => {
    e.respondWith(handleFetch(e.request));
});
