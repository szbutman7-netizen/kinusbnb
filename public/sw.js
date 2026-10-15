const CACHE_NAME = "kinus-cache-v1.0.1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only intercept GET requests — never intercept POST, PUT, DELETE
  if (event.request.method !== "GET") {
    return;
  }

  // Pass through fetch handler with cache fallback for GET requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
