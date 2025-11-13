import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext<any>(null);

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  // 앱 시작 시 로그인한 사용자 정보를 자동으로 불러오기
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data); // 유저 정보 저장
      }
    };

    loadUser();
  }, []);

  // 다른 페이지에서 정보 수정 후 호출 → 최신 정보 다시 불러오기
  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) setUser(await res.json());
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
