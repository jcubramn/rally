// Keep private client records network-only. Cache only the public offline notice.
const CACHE='rally-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('rally-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate'&&new URL(event.request.url).origin===self.location.origin){event.respondWith(fetch(event.request).catch(async()=>await caches.match('/offline.html')||new Response('Connect to the internet to open Rally.',{status:503,headers:{'Content-Type':'text/plain'}})));}});
