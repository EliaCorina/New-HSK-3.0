// HSK 3.0 PWA — Service Worker
// Versión de caché — cambiar para forzar actualización
const CACHE_VERSION = 'hsk-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

// Archivos que se cachean al instalar (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  // Google Fonts se cachean dinámicamente
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DATA_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH — Estrategia offline-first =====
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API de Anthropic — siempre network (no cachear respuestas de IA)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(request));
    return;
  }

  // Google Fonts — cache then network
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Para el resto — Cache first, luego network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Cachear respuestas válidas
        if (response.status === 200 && request.method === 'GET') {
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Sin conexión y sin caché — devolver página offline si existe
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', event => {
  let data = {
    title: '📚 HSK 3.0 — Hora de repasar',
    body: 'Tu sesión de estudio diaria te espera. ¡Practica hoy para recordar mejor!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'hsk-daily-review',
    requireInteraction: false,
    actions: [
      { action: 'flashcard', title: '🃏 Flashcards' },
      { action: 'dismiss', title: 'Más tarde' }
    ]
  };

  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch(e) {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      actions: data.actions,
      data: { url: '/?source=notification' }
    })
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const targetUrl = event.action === 'flashcard' 
    ? '/?view=flashcard' 
    : (event.notification.data?.url || '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ===== BACKGROUND SYNC (por si la conexión falla) =====
self.addEventListener('sync', event => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  try {
    const cache = await caches.open(DATA_CACHE);
    const pending = await cache.match('pending-sync');
    if (pending) {
      const data = await pending.json();
      // Aquí iría la lógica de sincronización con tu backend
      console.log('[SW] Syncing progress data:', data);
      await cache.delete('pending-sync');
    }
  } catch (e) {
    console.error('[SW] Sync failed:', e);
  }
}

// ===== PERIODIC BACKGROUND SYNC — repaso diario =====
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-review-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  // Verificar si el usuario ya ha estudiado hoy
  const cache = await caches.open(DATA_CACHE);
  const lastStudy = await cache.match('last-study-date');
  
  if (lastStudy) {
    const dateStr = await lastStudy.text();
    const today = new Date().toDateString();
    if (dateStr === today) return; // Ya estudió hoy
  }

  const messages = [
    { body: '¡Estudia 5 minutos hoy! Mantener el hábito es la clave del éxito.' },
    { body: '¿Recuerdas las palabras de ayer? ¡Repasa y consolida tu memoria!' },
    { body: '每天学习！ Un poco cada día te lleva muy lejos.' },
    { body: 'Tu racha de estudio te espera. ¡No la rompas!' },
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];

  return self.registration.showNotification('📚 HSK 3.0 — Repaso diario', {
    body: msg.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'daily-review',
    data: { url: '/?view=flashcard' }
  });
}

console.log('[SW] Service Worker loaded ✓');
