// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// ✅ 너가 준 firebaseConfig 그대로
const firebaseConfig = {
  apiKey: "AIzaSyCrs0hdpZgDozOKMZZYgZiYlzJCefbMMjk",
  authDomain: "alentofcm.firebaseapp.com",
  projectId: "alentofcm",
  storageBucket: "alentofcm.firebasestorage.app",
  messagingSenderId: "37483732714",
  appId: "1:37483732714:web:a8d00160ceb385122c0193",
  measurementId: "G-4RCPM8QM8C",
};

const app = initializeApp(firebaseConfig);

// ✅ FCM에서 쓰는 messaging export
export const messaging = getMessaging(app);

export default app;
