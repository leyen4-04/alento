import React from 'react';
import { Link } from 'react-router-dom'; // 페이지 이동을 위한 Link 임포트
import '../style/LoginPage.css'; // 로그인 페이지 전용 CSS (아래 예시 참고)

function LoginPage() {
  return (
    <div className="login-container">
      <h1 className="login-title">ALERTO</h1> 
      
      <form className="login-form">
        <input 
          type="email" 
          placeholder="이메일 ID를 입력하세요"
          className="login-input" 
        />
        <input 
          type="password" 
          placeholder="비밀번호를 입력하세요" 
          className="login-input" 
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