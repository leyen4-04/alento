// src/api/apiClient.ts
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "";

const NGROK_HEADER = { "ngrok-skip-browser-warning": "true" };

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  const text = await res.text();

  // ✅ ngrok 경고/에러 페이지면 JSON 파싱 금지
  if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
    console.error("HTML 응답 감지:", text);
    throw new Error("ngrok 경고/에러 페이지가 응답으로 옴. API_URL 확인!");
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // 문자열 응답 허용
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      "요청 중 오류가 발생했습니다.";
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }

  return data;
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),   // ✅ 여기 ... 이 맞음
    },
  });
  return handleResponse(res) as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res) as Promise<T>;
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res) as Promise<T>;
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
  });
  return handleResponse(res) as Promise<T>;
}

// 로그인용 form POST
export async function postForm<T>(path: string, form: URLSearchParams): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
    body: form.toString(),
  });
  return handleResponse(res) as Promise<T>;
}
