export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  // ✅ Vite / CRA 둘 다 되는 BASE_URL
  const baseUrl =
    (import.meta as any).env?.VITE_API_URL ||
    process.env.REACT_APP_API_URL ||
    "";

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ngrok 경고 우회
  };

  if (token) {
    (defaultHeaders as any)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  // 먼저 텍스트로 응답을 읽음 (HTML인지 JSON인지 판단)
  const text = await response.text();

  // 🔥 HTML로 시작하면 ngrok 경고 페이지 => JSON 파싱 금지
  if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
    console.error("HTML 응답 감지됨 (ngrok 경고 페이지):", text);
    throw new Error(
      "ngrok 경고 페이지가 응답으로 돌아옴. API 주소 또는 헤더 설정을 확인하세요."
    );
  }

  // 정상 응답이지만 status가 ok가 아닌 경우 → JSON 에러 메시지 파싱
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { detail: text };
    }
    throw new Error(errorData.detail || "API 요청 실패");
  }

  // 정상 JSON 응답 파싱
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON 파싱 실패. 원본 응답:", text);
    throw new Error("API 응답이 JSON 형식이 아닙니다.");
  }
}
