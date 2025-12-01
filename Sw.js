const CACHE_NAME = 'artist-cyber-fast-v1'; // უნიკალური სახელი ამ პროექტისთვის
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', 
  '/script.js',
  '/manifest.json',
  // აიქონი (თუ კოდში base64-ით არაა, აქ უნდა იყოს)
  // 'icons/icon-512.png', 

  // გარე რესურსები (ზუსტად ის ლინკები, რაც HTML-შია):
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap'
];

// 1. ინსტალაცია: ფაილების ჩაწერა
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] ARTIST: Cache Opening & Preloading...');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.log('[SW] ვერ ჩაიწერა (არაუშავს):', url);
        }
      }
    })
  );
});

// 2. აქტივაცია: ძველი ქეშის წაშლა
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: სწრაფი გახსნა (Stale-While-Revalidate)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // თუ მოთხოვნა API-ზეა, არ ვაკეშებთ (რომ ყოველთვის ახალი იყოს)
  // თუ თქვენი API ლინკი შეიცავს სიტყვას "api", ეს ხაზი გამოტოვებს მას ქეშიდან:
  if (e.request.url.includes('/api/')) {
      return; 
  }

  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(cachedResponse => {
        const fetchPromise = fetch(e.request)
          .then(networkResponse => {
            if(networkResponse && networkResponse.status === 200) {
               cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
             console.log('Offline mode active');
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
