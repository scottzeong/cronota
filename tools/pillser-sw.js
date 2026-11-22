/* Pillser · outgrid — tiny service worker.
   Only shows notifications and handles their buttons ("먹었어요", "나중에").
   It does not cache anything and cannot ring while the page is closed:
   browsers give web pages no way to schedule an alarm in the background. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e => {
  const n = e.notification, data = n.data || {}, act = e.action || 'open', items = data.items || [];
  n.close();
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const page = list.find(c => /Pillser\.html|pillser/i.test(c.url)) || list[0];
    if (page) {
      if (items.length && act !== 'open') page.postMessage({ type: 'pillser-act', act, items });
      try { await page.focus(); } catch (_) {}
      return;
    }
    const base = data.url || self.registration.scope + 'Pillser.html';
    const url = items.length && act !== 'open' ? `${base}?act=${act}&items=${encodeURIComponent(items.join(','))}` : base;
    await self.clients.openWindow(url);
  })());
});
