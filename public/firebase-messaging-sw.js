importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDpIKZmesZdMXFF_JYhRC_gJvV1JYDL1wU",
    authDomain: "klchat-3add0.firebaseapp.com",
    projectId: "klchat-3add0",
    storageBucket: "klchat-3add0.firebasestorage.app",
    messagingSenderId: "631186819737",
    appId: "1:631186819737:web:2b661b9e7d302e3b85c608",
    measurementId: "G-LW7HZNL2YH"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('background message ', payload);
  
    const notificationTitle = payload.data.title;
    // const notificationTitle = payload.notification.title;
    const notificationOptions = { 
        // body: payload.notification.body,
        body: payload.data.body,
        data: { click_action: payload.data?.click_action || 'http://localhost:5173/'},
        // icon: payload.notification.icon
     };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
    console.log('service worker installed, skipping waiting');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('notificationclick', function(event) {
    console.log('notification click ', event.notification);
    
    const url = event.notification.data?.click_action || '/';
    console.log('url ', url);
    
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                console.log('client list ', clientList);
                
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        console.log('client at URL, focusing ', client);
                        return client.focus();
                    }
                }
                
                for (const client of clientList) {
                    if (client.url.includes('klchat.onrender.com') && 'focus' in client) {
                        console.log('found existing client, focusing and navigating ', client);
                        return client.focus()
                            .then(() => {
                                if ('navigate' in client) {
                                    return client.navigate(url);
                                }
                            });
                    }
                }
                
                console.log('no matching url, opening new window', url);
                return clients.openWindow(url);
            })
            .catch(error => {
                console.error('error in notification click ', error);
                return clients.openWindow(url);
            })
    );
});