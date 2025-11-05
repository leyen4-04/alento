// API 명세서에 명시된 기본 주소
const BASE_URL = "http://192.168.100.2:8000";

// 1. localStorage에서 JWT 토큰 가져오기
export const getAuthToken = (): string | null => {
  return localStorage.getItem("my_access_token");
};

// 2. localStorage에 JWT 토큰 저장하기
export const setAuthToken = (token: string) => {
  localStorage.setItem("my_access_token", token);
};

// 3. localStorage에서 토큰 삭제하기 (로그아웃)
export const removeAuthToken = () => {
  localStorage.removeItem("my_access_token");
};

// 4. (참고) 기기 API 키 저장/가져오기
export const getDeviceApiKey = (): string | null => {
  return localStorage.getItem("my_device_api_key");
};
export const setDeviceApiKey = (apiKey: string) => {
  localStorage.setItem("my_device_api_key", apiKey);
};


// 5. 기본 fetch 함수 (나중에 이걸로 모든 통신을 합니다)
// 명세서의 예시처럼 fetch를 사용합니다.
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = { ...options.headers } as Record<string, string>;

  // (자동) JWT 토큰이 있으면 헤더에 추가
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  // (자동) JSON 요청/응답 기본값 설정
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (!headers["Accept"]) {
    headers["Accept"] = "application/json";
  }
  
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // API가 4xx, 5xx 에러를 냈을 때, { detail: "..." } 객체를 throw
    const errorData = await response.json().catch(() => ({})); // JSON 파싱 실패 시 빈 객체
    throw new Error(errorData.detail || "알 수 없는 에러가 발생했습니다.");
  }

  // 성공 시 응답 반환
  // /handle-visit 처럼 오디오 파일을 반환하는 경우 blob()을 사용해야 할 수 있습니다.
  if (response.headers.get("Content-Type")?.includes("audio/")) {
     return response.blob();
  }
  
  // 대부분의 경우 JSON을 반환
  return response.json();
};