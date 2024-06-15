const CACHE_STATIC_NAME = "static-v4";
const CACHE_DYNAMIC_NAME = "dynamic-v4";

const OFFLINE_URL = "offline.html";

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_STATIC_NAME).then(function (cache) {
            return cache.addAll(["/index.html", "/index.js", "/login.html", "/login.js", "/create.html", "/create.js", "/index.css", "/news.html", "/news.js", "/PortoSans-Bold.ttf", "/PortoSans-Regular.ttf", OFFLINE_URL]);
        })
    );
});

self.addEventListener("fetch", function (e) {
    async function handleNavigationRequest(request) {
        try {
            const networkResponse = await fetch(request);
            return networkResponse;
        } catch (error) {
            console.log("Fetch failed; returning offline page instead.", error);

            const cache = await caches.open(CACHE_STATIC_NAME);
            const cachedResponse = await cache.match(OFFLINE_URL);
            return cachedResponse;
        }
    }

    if (e.request.mode === "navigate") {
        e.respondWith(handleNavigationRequest(e.request));
    } else {
        e.respondWith(
            caches.match(e.request).then(function (response) {
                if (response) {
                    return response;
                } else {
                    return fetch(e.request)
                        .then(function (res) {
                            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                                cache.put(e.request.url, res.clone());
                                return res;
                            });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            })
        );
    }
});