import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/FindAccountPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

// 'email' 또는 'password' 탭 상태를 관리
type ActiveTab = 'email' | 'password';

function FindAccountPage() {
  // 현재 활성화된 탭을 관리하는 state. 기본값 'email'
  const [activeTab, setActiveTab] = useState<ActiveTab>('email');

  return (
    <div className="find-account-container">
      <h1 className="find-account-title">이메일 / 비밀번호 찾기</h1>

      {/* 탭 네비게이션 */}
      <div className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          이메일 찾기
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          비밀번호 찾기
        </button>
      </div>

      {/* activeTab 값에 따라 다른 폼을 보여줍니다.
        (조건부 렌더링)
      */}

      {/* 1. 이메일 찾기 폼 (PDF 2페이지) */}
      {activeTab === 'email' && (
        <form className="find-account-form">
          <input 
            type="text" 
            placeholder="생년월일을 입력하세요 8자리 (YYYYMMDD)"
            className="find-account-input" 
          />
          <input 
            type="tel" 
            placeholder="가입시 인증한 휴대폰 번호 입력"
            className="find-account-input" 
          />
          <button type="submit" className="find-account-button">확인</button>
        </form>
      )}

      {/* 2. 비밀번호 찾기 폼 (PDF 3페이지) */}
      {activeTab === 'password' && (
        <form className="find-account-form">
          <input 
            type="email" 
            placeholder="이메일 ID를 입력하세요"
            className="find-account-input" 
          />
          <button type="button" className="auth-button">인증하기</button>
          
          <input 
            type="text" 
            placeholder="인증번호 입력"
            className="find-account-input" 
          />
          <button type="submit" className="find-account-button">확인</button>
        </form>
      )}

      <div className="back-to-login">
        <Link to="/login">로그인 페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

export default FindAccountPage;