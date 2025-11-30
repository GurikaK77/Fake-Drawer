const CACHE_NAME = 'cyber-artist-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-512x512.png', // დარწმუნდი რომ ეს ფაილი არსებობს
  // გარე რესურსების დაქეშვა (ფონტები და აიკონები)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap'
];

// ინსტალაცია: ფაილების ჩამოტვირთვა და შენახვა
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// აქტივაცია: ძველი ქეშის წაშლა (თუ ვერსია შეიცვალა)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// მოთხოვნის დამუშავება: ჯერ ნახულობს ქეშში, თუ არაა - ინტერნეტში
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // თუ ფაილი ნაპოვნია ქეშში, აბრუნებს მას
        if (response) {
          return response;
        }
        // თუ არა, მიმართავს ინტერნეტს
        return fetch(event.request).catch(() => {
            // თუ ინტერნეტიც არაა და ქეშიც არაა (მაგალითად ახალ გვერდზე გადასვლა)
            // აქ შეიძლება დავაბრუნოთ offline.html თუ გვაქვს, მაგრამ ამ თამაშისთვის საჭირო არაა
        });
      })
  );
});
