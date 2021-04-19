const STATIC_CACHE = "static-cache-v1";
const URL_CACHE = "data-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll([
                "/",
                "/db.js",
                "/index.js",
                "/manifest.json",
                "/styles.css",
                "/icons/icon-192x192.png",
                "/icons/icon-512x512.png"
            ]))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("fetch", function (event) {
    const offlineFn = async () => {
        try {
            const cache = await caches.open(URL_CACHE);
            try {
                const response = await fetch(event.request)
                if (response.status === 200) {
                    cache.put(event.request.url, response.clone())
                    return response;
                }
            } catch (err) {
                return cache.match(event.request)
            }
        } catch (err) {
            console.log(err)
        }
    }
    const onlineFn = async () => {
        try {
            return await fetch(event.request);
        } catch (err) {
            const response = caches.match(event.request)
            if (response) {
                return response;
            } else if (event.request.headers.get("accept").includes("text/html")) {
                return caches.match("/");
            }
        }
    }

    if (event.request.url.includes("/api/")) {
        event.respondWith(offlineFn())
        return;
    }
    event.respondWith(onlineFn());
});
