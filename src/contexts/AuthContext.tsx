// 로그인과 로그아웃 함수와 현재 유저의 정보를 제공
import React, { createContext, useContext, useState, useEffect } from 'react';
// [수정] api.ts 파일에서 import 하도록 변경
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
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

// 3. Context 생성
const AuthContext = createContext<AuthContextType | null>(null);

// 4. Provider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // 앱이 처음 로드될 때, localStorage의 토큰으로 유저 정보를 가져옴
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          const userData = await apiFetch('/users/me');
          setUser(userData);
        } catch (error) {
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
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", pass);

    const response = await apiFetch('/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });
    
    setAuthToken(response.access_token);
    setToken(response.access_token);
    // useEffect가 [token] 변경에 의해 자동 실행되어 유저 정보를 가져옴
  };

  // 회원가입 함수 (POST /users/signup)
  const signUp = async (email: string, pass: string, name: string) => {
    const body = JSON.stringify({
      email: email,
      password: pass,
      full_name: name
    });
    
    // apiFetch가 자동으로 BASE_URL과 헤더를 설정해줍니다.
    await apiFetch('/users/signup', {
      method: 'POST',
      body: body,
    });
    // 회원가입 성공
  };
  
  // 로그아웃 함수
  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // 유저 정보 수동 갱신
  const fetchUser = async () => {
     const userData = await apiFetch('/users/me');
     setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signUp, logout, fetchUser }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// [삭제] api.ts의 내용이 여기에 있으면 안 됩니다.