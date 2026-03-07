const CACHE_NAME = 'acai-ellegance-v2';
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

// 3. Interceção: Serve o site da memória se não houver internet
self.addEventListener('fetch', (event) => {
  // Ignora pedidos para outros domínios (como Google Analytics ou Firebase) na estratégia Cache-First
  // para evitar erros de CORS opacos, mas tenta cachear fontes e bibliotecas conhecidas.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se estiver na cache, devolve o da cache (Rápido!)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não, vai à internet buscar (Network)
      return fetch(event.request).catch(() => {
        // Se falhar (sem net), não faz nada ou mostra página de erro (opcional)
        console.log('Sem internet e sem cache para:', event.request.url);
      });
    })
  );
});
