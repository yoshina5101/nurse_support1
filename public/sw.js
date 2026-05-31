// あかり PWA Service Worker（最小構成）
// 役割：インストール可能化と、オフライン時の簡易フォールバック。
// 動的・認証ありのアプリのため、積極的なキャッシュはしない（常に最新を取りに行く）。

const CACHE = "akari-v1";
const OFFLINE_ASSETS = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // GET以外・APIや認証は常にネットワーク（キャッシュしない）
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api")) {
    return;
  }
  // ネットワーク優先。失敗時のみキャッシュ（静的アセット）を返す。
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r || Response.error()))
  );
});
