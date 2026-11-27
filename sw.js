// TaskForce service worker: offline cache + push reminders.
const CACHE = 'taskforce-1.04';
const SHELL = ['./', './index.html', './styles.css?v=1.04', './app.js?v=1.04', './logic.js', './store.js', './seed.js', './firebase-config.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/badge-96.png'];

self.addEventListener('install', e => {
  // Cache each file on its own, so one missing file can't stop the app installing.
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first so updates show straight away; fall back to the cache when offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || caches.match('./index.html'))));
});

// Push from the reminder bot (Firebase Cloud Messaging data message).
self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch { p = { data: { title: 'TaskForce', body: e.data && e.data.text() } }; }
  const d = p.data || p;
  const actions = d.jobId ? (d.kind === 'item'
    ? [{ action: 'done', title: 'Replaced' }, { action: 'extend', title: 'Still good' }]
    : [{ action: 'done', title: 'Done' }, { action: 'open', title: 'Open' }]) : [];
  e.waitUntil(self.registration.showNotification(d.title || 'TaskForce', {
    body: d.body || '', tag: d.tag || d.jobId || 'taskforce', renotify: true,
    icon: 'icons/icon-192.png', badge: 'icons/badge-96.png',
    data: { jobId: d.jobId || '', hash: d.hash || (d.jobId ? '#/job/' + d.jobId : '#/home') }, actions
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const data = e.notification.data || {};
  let hash = data.hash || '#/home';
  if (data.jobId && (e.action === 'done' || e.action === 'extend')) hash = '#/job/' + data.jobId + '?do=' + e.action;
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (new URL(c.url).pathname.startsWith(new URL(self.registration.scope).pathname)) {
        await c.focus(); c.postMessage({ type: 'open', hash }); return;
      }
    }
    await clients.openWindow(self.registration.scope + hash);
  })());
});
