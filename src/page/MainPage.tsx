import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import '../style/MainPage.css';

function MainPage() {

  // ⭐ NEW: 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<any>(null);

  // ⭐ NEW: API 기본 URL
  const BASE_URL = process.env.REACT_APP_API_URL;

  // ⭐ NEW: 로그인한 사용자 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUserInfo(data))
      .catch(err => console.error("유저 정보 로딩 실패:", err));
  }, []);

  return (
    <div className="main-container">
      
      {/* 1. 헤더 */}
      <header className="main-header">
        <h1 className="main-logo">ALERTO</h1>

        {/* ⭐ ADD: 오른쪽 박스 */}
        <div className="header-right-box">

          {/* 로그인 / 회원가입 or 사용자명 */}
          {userInfo ? (
            <span className="login-link">{userInfo.full_name} 님</span>
          ) : (
            <Link to="/login" className="login-link">로그인/회원가입</Link>
          )}
        </div>
      </header>

      {/* 2. 구독 배너 */}
      <div className="subscription-banner">
        <p>"Alento+ 구독하고, 고도화된 AI 이상 징후 분석과 24시간 실시간 맞춤 보안을 경험하세요."</p>
      </div>

      {/* 3. 기기 목록 */}
      <section className="device-list-section">

        {/* 기기 1 */}
        <Link to="/device/1" className="device-card">
          <img 
            src="https://placehold.co/600x400/eeeeee/aaaaaa?text=Device+1+View" 
            alt="기기 1 뷰"
            className="device-thumbnail"
          />
          <div className="device-info">
            <h3>기기 1</h3>
          </div>
        </Link>

        {/* 기기 2 */}
        <Link to="/device/2" className="device-card">
          <img 
            src="https://placehold.co/600x400/eeeeee/aaaaaa?text=Device+2+View" 
            alt="기기 2 뷰"
            className="device-thumbnail"
          />
          <div className="device-info">
            <h3>기기 2</h3>
          </div>
        </Link>

      </section>

      {/* 4. 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default MainPage;
