// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// API 기본 URL (.env에서 가져오기)
const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.100.7:8000';

// User 타입 (백엔드 /users/me 응답 기준 - 필요시 수정)
interface User {
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  // ... (백엔드가 주는 다른 필드들)
}

// Context가 제공할 값들의 타입
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

// Context 생성 (기본값은 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // 1. 앱 로드 시 localStorage에서 토큰 확인
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 2. 토큰이 변경될 때 (로그인 시) /users/me 호출
  useEffect(() => {
    if (token) {
      const getMyInfo = async () => {
        try {
          // apiFetch 내부 로직을 사용 (헤더 주입)
          // (이것이 main.tsx에서 구현하려던 getMyInfo 기능입니다)
          const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (response.ok) {
            const userData: User = await response.json();
            setUser(userData); // 사용자 정보 저장
          } else {
            // 토큰이 유효하지 않은 경우
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          logout(); // 에러 발생 시 로그아웃
        }
      };
      getMyInfo();
    } else {
      setUser(null); // 토큰 없으면 유저 정보도 없음
    }
  }, [token]); // 'token'이 바뀔 때마다 실행

  // 3. 로그인 함수 (LoginPage에서 사용)
  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    // LoginPage.tsx의 명세에 따라 'username' 사용
    formData.append('username', email); 
    formData.append('password', password);

    const response = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "로그인 정보가 올바르지 않습니다.");
    }

    // 성공: 토큰 저장 (localStorage와 state)
    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    
    // 로그인이 성공하면 useEffect[token]이 실행되어 /users/me를 호출함
  };

  // 4. 회원가입 함수 (SignUpPage에서 사용)
  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // API 명세에 따라 full_name으로 전송
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
    // 회원가입 성공 (data에 사용자 정보가 담겨있음)
  };
  
  // 5. 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    navigate('/login'); // 로그아웃 시 로그인 페이지로
  };

  // 6. ✨ 인증된 API 요청 함수 (main.tsx의 핵심 요청 사항)
  // 이 함수가 GET /visits/ 등 모든 인증이 필요한 요청을 처리합니다.
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem('access_token'); // 항상 최신 토큰 사용

    if (!currentToken) {
      logout(); // 토큰 없으면 로그아웃
      throw new Error("인증이 필요합니다.");
    }

    // main.tsx의 설명처럼 Authorization 헤더를 기본으로 설정
    const defaultHeaders: HeadersInit = {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
      ...options.headers, // 사용자가 제공한 헤더가 기본값을 덮어쓸 수 있음
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: defaultHeaders,
    });

    // 401 Unauthorized (토큰 만료 등)
    if (response.status === 401) {
      logout(); // 자동으로 로그아웃
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }

    return response; // 호출한 컴포넌트가 응답을 처리하도록 response 객체 반환
  };

  // Context가 하위 컴포넌트에 제공할 값들
  const value = {
    token,
    user,
    login,
    signUp,
    logout,
    apiFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 7. useAuth 커스텀 훅 (컴포넌트에서 쉽게 사용)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}