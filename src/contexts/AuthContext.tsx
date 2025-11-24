// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserContext } from "./UserContext"; // 같은 폴더라 경로 OK

// ✅ FCM 초기화 import 추가
import { initFCM } from "../fcm";

// ✅ CRA/Vite 둘 다 대응 + ngrok 주소 보장
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://192.168.100.7:8000";

interface User {
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  memo?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const userContext = useContext(UserContext) as any;
  const clearUser = userContext?.clearUser;

  // 1) 앱 로드 시 토큰 복구
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) setToken(storedToken);
  }, []);

  // 2) 토큰 생기면 유저 정보 로드 + ✅ FCM 초기화
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    // ✅ 로그인/자동로그인으로 token 생긴 순간 FCM 붙이기
    initFCM();

    const getMyInfo = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            // ✅ ngrok HTML 경고 페이지 막기
            "ngrok-skip-browser-warning": "true",
          },
        });

        const text = await res.text();

        // ✅ HTML 응답이면 바로 로그아웃(=무한루프 방지)
        if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
          console.error("HTML 응답 감지(/users/me):", text);
          logout();
          return;
        }

        if (!res.ok) {
          logout();
          return;
        }

        const userData: User = JSON.parse(text);
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        logout();
      }
    };

    getMyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 3) 로그인
  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "ngrok-skip-browser-warning": "true",
      },
      body: formData.toString(),
    });

    const text = await res.text();

    if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
      console.error("HTML 응답 감지(/token):", text);
      throw new Error("ngrok 경고 페이지가 응답으로 옴. 주소/헤더 확인!");
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.detail || "로그인 정보가 올바르지 않습니다.");
    }

    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token); // ✅ 여기서 user 로딩 useEffect + initFCM 둘 다 돌아감
  };

  // 4) 회원가입
  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${BASE_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    const text = await res.text();

    if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
      throw new Error("ngrok 경고 페이지가 응답으로 옴. 주소/헤더 확인!");
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  };

  // 5) 로그아웃 (Provider가 Router 밖이어도 안전하게)
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    if (clearUser) clearUser();
    window.location.replace("/login");
  };

  // 6) 인증 API fetch
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) {
      logout();
      throw new Error("인증이 필요합니다.");
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
    return res;
  };

  const value: AuthContextType = {
    token,
    user,
    login,
    signUp,
    logout,
    apiFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
