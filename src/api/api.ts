// API 명세서에 명시된 기본 주소
// 192.168.100.7이 맞는 주소라고 하셨으니, 이 주소를 사용합니다.
// 만약 100.2가 맞다면 여기를 수정하세요.
const BASE_URL = process.env.REACT_APP_API_URL || '';  //env v파일 주소
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


// 5. 기본 fetch 함수 (모든 통신은 이 함수를 통합니다)
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
  // /handle-visit 처럼 오디오 파일을 반환하는 경우 blob()을 사용
  if (response.headers.get("Content-Type")?.includes("audio/")) {
     return response.blob();
  }
  
  // 204 No Content 처럼 응답 본문이 없는 경우
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return null; // 또는 { success: true } 같은 객체 반환
  }

  // 대부분의 경우 JSON을 반환
  return response.json();
};