// src/fcm.ts
import { getToken, onMessage, isSupported } from "firebase/messaging";
import { messaging } from "./firebase";
import { apiRequest } from "./api/client";

// ✅ .env에서 VAPID 키 가져오기 (없으면 null 처리)
const VAPID_KEY =
  process.env.REACT_APP_FIREBASE_VAPID_KEY?.trim() || "";

/**
 * VAPID 키가 비어있거나 placeholder면 getToken 호출 자체를 막음
 * (지금 너 에러 = atob가 한글/빈 문자열을 디코딩하다 터진 거)
 */
function isValidVapidKey(key: string) {
  if (!key) return false;
  if (key.includes("여기에")) return false; // placeholder 방지
  return key.length > 20; // 대충 정상 길이 체크
}

export async function requestFCMToken(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("🛑 이 브라우저는 FCM을 지원하지 않음");
      return null;
    }

    if (!isValidVapidKey(VAPID_KEY)) {
      console.log("🛑 VAPID_KEY가 설정되지 않았습니다. FCM 토큰 발급 스킵");
      return null;
    }

    // 1) 브라우저 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("🛑 알림 권한 거부됨");
      return null;
    }

    // 2) FCM 토큰 발급
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

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

// 3) 토큰 FastAPI에 저장
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

// 4) 전체 초기화 함수 (앱 시작 시 1번 호출)
export async function initFCM() {
  const token = await requestFCMToken();
  if (token) {
    await saveTokenToServer(token);
  }

  // 5) 포그라운드 상태 수신
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message:", payload);

    const title = payload?.notification?.title ?? "알림";
    const body = payload?.notification?.body ?? "";

    alert(`${title}\n${body}`);
  });
}
