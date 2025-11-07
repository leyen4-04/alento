// src/page/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/LoginPage.css';


function LoginPage() {
  const navigate = useNavigate();
  // 1. 이메일, 비밀번호 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. 로그인 폼 제출 시 실행될 함수
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지

    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // .env 파일에 설정된 주소 사용 (없으면 기본값)
      // .env에서 값을 가져오고, 없으면 빈 문자열('') 또는 기본 주소를 사용
      const BASE_URL = process.env.REACT_APP_API_URL || '';
      // API 명세서에 따라 x-www-form-urlencoded 형식으로 데이터 준비
      const formData = new URLSearchParams();
      formData.append('username', email);  // 명세서: 이메일을 'username' 필드에 담아야 함
      formData.append('password', password);

      // 백엔드에 로그인 요청 전송
      const response = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. 로그인 성공: JWT 토큰을 로컬 스토리지에 저장
        // (참고: 현재 백엔드 명세에는 access_token만 있고 refresh_token은 없습니다.
        // 만약 나중에 refresh_token이 추가되면 동일한 방식으로 저장하면 됩니다.)
        localStorage.setItem('access_token', data.access_token);
        
        console.log("로그인 성공! 토큰:", data.access_token); // 개발 확인용 (배포 시 제거)
        navigate('/'); // 메인 페이지로 이동
      } else {
        // 로그인 실패: 에러 메시지 표시
        alert(data.detail || "로그인 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("로그인 요청 중 에러 발생:", error);
      alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="login-container">
      <img src={"/Bell.png"} alt='picture1' height='60px' width='88px' />  
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