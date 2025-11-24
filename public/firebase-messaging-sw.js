/* public/firebase-messaging-sw.js */

// ✅ 서비스워커는 compat가 제일 안정적
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

// 🔥🔥🔥 여기 꼭! src/firebase.ts에 있는 "진짜 config" 그대로 복붙
firebase.initializeApp({
  apiKey: "여기_너_진짜_apiKey",
  authDomain: "여기_너_진짜_authDomain",
  projectId: "여기_너_진짜_projectId",
  storageBucket: "여기_너_진짜_storageBucket",
  messagingSenderId: "여기_너_진짜_messagingSenderId",
  appId: "여기_너_진짜_appId",
});

const messaging = firebase.messaging();

// 백그라운드 메시지 핸들링
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload?.notification?.title || "ALERTO 알림";
  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
