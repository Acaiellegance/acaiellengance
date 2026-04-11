const CACHE_NAME = 'acai-ellegance-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logoacai.jpeg',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Fredoka:wght@400;600&display=swap'
];

// 1. Instalação: Guarda os ficheiros na memória (Cache)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo service worker a assumir imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] A guardar ficheiros...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigas para atualizar o site
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] A remover cache antiga:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Interceção: Serve o site da memória se não houver internet (Network-First)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      // Se tiver internet, devolve a versão real e atualiza no cache
      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        if (event.request.url.startsWith('http')) {
          cache.put(event.request, responseClone);
        }
      });
      return networkResponse;
    }).catch(() => {
      // Se falhar (sem net), busca do cache
      return caches.match(event.request);
    })
  );
});
