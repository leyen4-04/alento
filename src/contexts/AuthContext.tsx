// 이 파일은 login, logout 함수와 현재 user 정보를 제공합니다.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAuthToken, removeAuthToken, getAuthToken } from '../api/api';
import { useNavigate } from 'react-router-dom';

// 1. 유저 정보 타입 (API 명세서 GET /users/me 참고)
interface User {
  id: number;
  email: string;
  full_name: string;
  is_home: boolean;
  return_time: string | null;
  memo: string | null;
}

// 2. Context가 제공할 값들의 타입
interface AuthContextType {
  user: User | null;      // 현재 로그인된 유저 정보
  token: string | null;   // 현재 JWT 토큰
  isLoading: boolean;     // 로딩 중인지 여부 (앱 로딩 시 토큰 확인용)
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  // (선택) 유저 정보 갱신 함수
  fetchUser: () => Promise<void>;
}

// 3. Context 생성
const AuthContext = createContext<AuthContextType | null>(null);

// 4. Provider 컴포넌트 (이걸로 App.tsx를 감쌀 것)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true); // 앱 첫 로드 시 true
  
  const navigate = useNavigate();

  // 앱이 처음 로드될 때, localStorage의 토큰으로 유저 정보를 가져옴
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // 토큰이 유효한지 확인하기 위해 /users/me 호출
          const userData = await apiFetch('/users/me');
          setUser(userData);
        } catch (error) {
          // 토큰이 만료되었거나 유효하지 않음
          removeAuthToken();
          setToken(null);
          console.error("토큰으로 유저 정보 로드 실패:", error);
        }
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, [token]);

  // 로그인 함수 (POST /token)
  const login = async (email: string, pass: string) => {
    // API 명세서에 /token은 application/x-www-form-urlencoded 라고 명시됨
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", pass);

    const response = await apiFetch('/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body,
    });
    
    setAuthToken(response.access_token);
    setToken(response.access_token);
    // 로그인이 성공하면 토큰을 기반으로 유저 정보를 다시 불러옴
    // (위의 useEffect가 [token] 변경에 의해 자동 실행됨)
  };

  // 회원가입 함수 (POST /users/signup)
  const signUp = async (email: string, pass: string, name: string) => {
    const body = JSON.stringify({
      email: email,
      password: pass,
      full_name: name
    });
    
    await apiFetch('/users/signup', {
      method: 'POST',
      body: body,
    });
    // 회원가입 성공 (보통 로그인 페이지로 이동시키거나 자동 로그인 처리)
  };
  
  // 로그아웃 함수
  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    navigate('/login'); // 로그아웃 시 로그인 페이지로
  };

  // 유저 정보 수동 갱신 (PATCH /users/me/status 이후 등)
  const fetchUser = async () => {
     const userData = await apiFetch('/users/me');
     setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signUp, logout, fetchUser }}>
      {!isLoading && children} {/* 로딩이 끝나면 앱을 보여줌 */}
    </AuthContext.Provider>
  );
};

// 5. Context를 쉽게 사용하기 위한 Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};