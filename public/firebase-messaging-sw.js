/* public/firebase-messaging-sw.js */

importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// ✅ firebase.ts와 1글자도 다르면 안 됨
firebase.initializeApp({
  apiKey: "AIzaSyCrs0hdpZgDozOKMZZYgZiYlzJCefbMMjk",
  authDomain: "alentofcm.firebaseapp.com",
  projectId: "alentofcm",
  storageBucket: "alentofcm.firebasestorage.app",
  messagingSenderId: "37483732714",
  appId: "1:37483732714:web:a8d00160ceb385122c0193",
});

const messaging = firebase.messaging();

// 백그라운드 알림 수신
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] background:", payload);

  const title = payload?.notification?.title || "ALERTO 알림";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/logo192.png",
  };

  self.registration.showNotification(title, options);
});
