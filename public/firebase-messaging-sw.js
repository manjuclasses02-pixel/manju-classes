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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// App band ho ya background mein ho, tab bhi notification yahin se dikhta hai.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Manju Classes';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: './icon.svg',
    badge: './icon.svg',
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
