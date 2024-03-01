// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyDzEt0U0TY9-AwSHuSbvS4_MD4xNCzuzVk",
  authDomain: "pushnotification-25892.firebaseapp.com",
  projectId: "pushnotification-25892",
  storageBucket: "pushnotification-25892.appspot.com",
  messagingSenderId: "291573680",
  appId: "1:291573680:web:fde346b9a333abde5bd075",
  measurementId: "G-Q2LVRM69SB"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});