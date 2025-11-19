// src/api/client.ts

const BASE_URL = process.env.REACT_APP_API_URL || "";

// 헤더 생성 (토큰 자동 포함)
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // 파일 업로드가 아닐 때만 JSON Content-Type 설정
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// 공통 API 요청 함수
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // endpoint가 '/'로 시작하지 않으면 붙여줌
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  // 응답 상태가 OK가 아닐 경우 에러 처리
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // 백엔드에서 보내주는 'detail' 메시지 사용, 없으면 기본 메시지
    throw new Error(errorData.detail || "API 요청 처리에 실패했습니다.");
  }

  // 204 No Content 등 body가 없는 경우 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}