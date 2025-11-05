import React from 'react';
import { Link } from 'react-router-dom'; // 로그인 페이지로 돌아가기 위한 Link
import '../style/SignUpPage.css'; // 회원가입 페이지 전용 CSS (아래 2번 참고)

function SignUpPage() {
  return (
    <div className="signup-container">
      <h1 className="signup-title">회원가입</h1> 
      
      <form className="signup-form">
        <input 
          type="email" 
          placeholder="email@example.com"
          className="signup-input" 
        />
        <input 
          type="password" 
          placeholder="*** 비밀번호를 입력해주세요" 
          className="signup-input" 
        />
        <input 
          type="text" 
          placeholder="이름을 입력해주세요" 
          className="signup-input" 
        />
        <input 
          type="tel" // 휴대폰 번호이므로 type="tel"을 사용합니다.
          placeholder="휴대폰 번호를 입력해주세요" 
          className="signup-input" 
        />
        
        {/* 디자인 상 [cite: 24] 체크박스에 라벨이 없어 임의로 추가했습니다. */}
        <div className="terms-agreement">
          <input type="checkbox" id="terms" /> 
          <label htmlFor="terms">(필수) 이용약관 및 개인정보 처리방침에 동의합니다.</label> 
        </div>

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