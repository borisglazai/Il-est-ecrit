// Nettoyage temporaire du cache de la première publication.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}
if ('caches' in window) {
  caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
}
