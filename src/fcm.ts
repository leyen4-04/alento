// src/fcm.ts
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { apiRequest } from "./api/client";

// 🔥 Firebase 콘솔 Web Push certificate의 VAPID Key 복붙
const VAPID_KEY = "여기에_너_vapid_key_붙여넣기";

export async function requestFCMToken(): Promise<string | null> {
  try {
    // 0) ServiceWorker 지원 체크
    if (!("serviceWorker" in navigator)) {
      console.warn("🛑 이 브라우저는 ServiceWorker를 지원하지 않습니다.");
      return null;
    }

    // ✅ 1) 서비스워커를 우리가 직접 등록
    // public/firebase-messaging-sw.js 가 반드시 있어야 함
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    // 2) 브라우저 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("🛑 알림 권한 거부됨");
      return null;
    }

    // ✅ 3) FCM 토큰 발급 (등록한 SW를 명시적으로 넘김)
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.log("🛑 FCM 토큰 발급 실패");
      return null;
    }

    console.log("✅ FCM Token:", token);
    return token;
  } catch (err) {
    console.error("requestFCMToken error:", err);
    return null;
  }
}

// 4) 토큰 FastAPI에 저장
export async function saveTokenToServer(token: string) {
  try {
    await apiRequest("/users/me/push-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    console.log("✅ FCM 토큰 서버 저장 완료");
  } catch (err) {
    console.error("saveTokenToServer error:", err);
  }
}

// 5) 전체 초기화 함수 (앱 시작 시 1번 호출)
export async function initFCM() {
  const token = await requestFCMToken();
  if (token) {
    await saveTokenToServer(token);
  }

  // 6) 포그라운드 상태 수신
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message:", payload);

    const title = payload?.notification?.title ?? "알림";
    const body = payload?.notification?.body ?? "";

    alert(`${title}\n${body}`);
  });
}
