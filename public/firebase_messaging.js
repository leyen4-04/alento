// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCrs6hdpZgDozOKMZZYgZiYlzJCefbMMjk",
  authDomain: "alentofcm.firebaseapp.com",
  projectId: "alentofcm",
  storageBucket: "alentofcm.firebasestorage.app",
  messagingSenderId: "37483732714",
  appId: "1:37483732714:web:a8de00160ceb385122c0193",
});

const messaging = firebase.messaging();

// 백그라운드 수신
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM background message]", payload);

  const title = payload?.notification?.title || "알림";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/logo.png", // public/logo.png 있으면 자동 사용
  };

  self.registration.showNotification(title, options);
});
