import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../style/SignUpPage.css";
import { useAuth } from "../contexts/AuthContext";

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth(); // [수정] AuthContext에서 signUp 함수 가져오기

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  
  // [신규] 에러 상태 추가
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 에러 초기화

    if (!email || !password || !fullName) {
      setError("모든 정보를 입력해주세요."); // alert 대신 state 사용
      return;
    }
    if (!isAgreed) {
      setError("이용약관에 동의해주세요.");
      return;
    }

    try {
      // [수정] Context의 signUp 함수 호출
      // 모든 fetch, BASE_URL, body, header 로직은 Context가 알아서 처리
      await signUp(email, password, fullName);

      // 성공
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate('/login'); // 로그인 페이지로 이동
      
    } catch (err: any) {
      // [수정] apiFetch가 throw한 에러를 잡습니다.
      console.error("Sign up error:", err);
      // (예: "이미 등록된 이메일입니다.")
      setError(err.message || "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="signup-container">
        
      <h1 className="signup-title">회원가입</h1>
      
      
      <form className="signup-form" onSubmit={handleSignUp}>
        {/* ... (input 태그들은 동일) ... */}
        <input 
          type="email" 
          placeholder="email@example.com"
          className="signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="*** 비밀번호를 입력해주세요" 
          className="signup-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="이름을 입력해주세요" 
          className="signup-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        
        <div className="terms-agreement">
          <input 
            type="checkbox" 
            id="terms" 
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          /> 
          <label htmlFor="terms">(필수) 이용약관 및 개인정보 처리방침에 동의합니다.</label> 
        </div>

        {/* [신규] 에러 메시지 표시 영역 */}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="signup-button">확인</button> 
      </form>

      <div className="signup-links">
        <span>이미 계정이 있으신가요? </span>
        <Link to="/login">로그인하기</Link>
      </div>
    </div>
  );
}

export default SignUpPage;