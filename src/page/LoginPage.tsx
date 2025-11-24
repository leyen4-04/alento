// src/page/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/LoginPage.css";
import { useAuth } from "../contexts/AuthContext"; // ✅ AuthContext login 사용

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ context login

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      await login(email, password); // ✅ 여기서 token state 갱신 + /users/me 자동 호출
      alert("로그인 성공!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("로그인 실패:", err);
      alert(err.message || "로그인 정보가 올바르지 않습니다.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">ALERTO</h1>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="이메일 ID를 입력하세요"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-options">
          <input type="checkbox" id="keep-login" />
          <label htmlFor="keep-login">로그인 유지</label>
        </div>

        <button type="submit" className="login-button">로그인</button>
      </form>

      <div className="login-links">
        <Link to="/signup">회원가입</Link>
        <span className="divider">|</span>
        <Link to="/find-account">아이디/비밀번호 찾기</Link>
      </div>
    </div>
  );
}

export default LoginPage;
