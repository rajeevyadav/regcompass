/* ============================================================
   RegCompass — service worker
   ------------------------------------------------------------
   Simple offline-first cache: every app file is pre-cached at
   install time, so the app keeps working with no connection.
   Bump CACHE_VERSION whenever any app file changes so users
   receive the update on their next visit.
   ============================================================ */

'use strict';

const CACHE_VERSION = 'regcompass-v1.0.5';

const APP_FILES = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

/* Pre-cache the whole app on install. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_FILES)),
  );
  self.skipWaiting();
});

/* Drop caches from previous versions on activate. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

/* Cache-first for app files; network for everything else (external links). */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
