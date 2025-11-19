// src/api/apiClient.ts
const BASE_URL = process.env.REACT_APP_API_URL || '';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // 여기서 {} 를 Record<string, string> 이라고 "우겨" 줌
    return {} as Record<string, string>;
  }

  return { Authorization: `Bearer ${token}` };
}

// TS에서 Response 타입 시비 안 걸리게 any 사용
async function handleResponse(res: any) {
  if (!res.ok) {
    let message = '요청 중 오류가 발생했습니다.';

    try {
      const data = await res.json();
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          message = data.detail[0].msg;
        }
      }
    } catch {
      // 응답이 JSON이 아니면 그냥 기본 메시지 사용
    }

    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // 그냥 문자열 응답이면 그대로 반환
    return text as any;
  }
}

export async function get<T>(path: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers,
  });

  return handleResponse(res) as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse(res) as Promise<T>;
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse(res) as Promise<T>;
}

export async function del<T>(path: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  });

  return handleResponse(res) as Promise<T>;
}

// src/api/apiClient.ts

// ... (위에 BASE_URL, getAuthHeader, handleResponse, get/postJson/patchJson/del 그대로 두고)

// 🔹 x-www-form-urlencoded로 보내는 POST (로그인 /token 용)
export async function postForm<T>(path: string, form: URLSearchParams): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...getAuthHeader(),
    },
    body: form.toString(),
  });

  return handleResponse(res) as Promise<T>;
}
