// ============================================================
// Firebase Cloud Messaging — background service worker
// Yeh alag file hai (main service-worker.js se) kyunki Firebase
// Messaging ko root scope pe apna khud ka dedicated SW chahiye
// taaki app band ya background mein bhi push notification aa sake.
// 👉 Yahan neeche firebaseConfig ko index.html jaisa hi bharein.
// ============================================================
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBKEe3RRYV0uxpv6J9MXd4q3HuxJg5ssak",
  authDomain: "manju-classes.firebaseapp.com",
  projectId: "manju-classes",
  storageBucket: "manju-classes.firebasestorage.app",
  messagingSenderId: "731543724576",
  appId: "1:731543724576:web:8eb00a315d2c6e2b0d9245"
});

const messaging = firebase.messaging();

// App band ho ya background mein ho, tab bhi notification yahin se dikhta hai.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Manju Classes';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

// Notification pe click karte hi app khul jaye.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
