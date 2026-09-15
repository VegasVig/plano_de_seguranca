/* Vegas — service worker. Mantém o app funcionando sem sinal. */
var CACHE = 'vegas-v3';
var ARQUIVOS = [
  'index.html', 'painel.html', 'manifest.json',
  'css/app.css',
  'js/config.js', 'js/logo.js', 'js/schema.js', 'js/engine.js', 'js/pops.js',
  'js/storage.js', 'js/sync.js', 'js/report.js', 'js/app.js',
  'img/logo-branca.png', 'img/logo-escura.png',
  'img/icon-192.png', 'img/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ARQUIVOS.map(function (a) { return new Request(a, { cache: 'reload' }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; })
                           .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  /* Chamadas ao Apps Script e ao Drive nunca vão para o cache */
  if (e.request.method !== 'GET' || url.indexOf('script.google.com') > -1 || url.indexOf('drive.google.com') > -1) return;

  e.respondWith(
    caches.match(e.request).then(function (r) {
      if (r) {
        /* atualiza em segundo plano, serve o cache na hora */
        fetch(e.request).then(function (n) {
          if (n && n.ok) caches.open(CACHE).then(function (c) { c.put(e.request, n); });
        }).catch(function () {});
        return r;
      }
      return fetch(e.request).then(function (n) {
        if (n && n.ok && n.type === 'basic') {
          var copia = n.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        }
        return n;
      }).catch(function () { return caches.match('index.html'); });
    })
  );
});
