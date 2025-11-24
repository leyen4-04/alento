// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCrs6hdpZgDozOKMZZYgZiYlzJCefbMMjk",
  authDomain: "alentofcm.firebaseapp.com",
  projectId: "alentofcm",
  storageBucket: "alentofcm.firebasestorage.app",
  messagingSenderId: "37483732714",
  appId: "1:37483732714:web:a8de00160ceb385122c0193",
  measurementId: "G-4RCPM8M8C",
};

const app = initializeApp(firebaseConfig);

// Web Push용 messaging
export const messaging = getMessaging(app);
