const V = 'primer-v4';
const SHELL = ['/', '/app', '/scan', '/decks', '/teacher', '/welcome', '/manifest.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))); self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const p = new URL(r.url).pathname;
  // Only successful responses are cached. Caching a 404 (e.g. an icon that did not exist yet)
  // would pin the error in the cache: the manifest would fail on every launch until the cache was bumped.
  const put = (res) => { if (res.ok) { const c = res.clone(); caches.open(V).then((x) => x.put(r, c)); } return res; };
  if (p.startsWith('/_next/static') || p.startsWith('/icons')) {            // immutable: cache first (may come from the CDN origin)
    e.respondWith(caches.match(r).then((h) => h || fetch(r).then(put))); return;
  }
  e.respondWith(fetch(r).then(put).catch(() => caches.match(r).then((h) => h || caches.match('/'))));  // pages + API GETs: network first
});
