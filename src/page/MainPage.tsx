import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 3번 파일에서 만들 하단 탭
import '../style/MainPage.css'; // 2번 파일에서 만들 CSS

function MainPage() {
  return (
    <div className="main-container">
      {/* 1. 헤더 */}
      <header className="main-header">
        <h1 className="main-logo">ALERTO</h1>
        <Link to="/login" className="login-link">로그인/회원가입</Link>
      </header>

      {/* 2. 구독 배너 */}
      <div className="subscription-banner">
        <p>"Alento+ 구독하고, 고도화된 AI 이상 징후 분석과 24시간 실시간 맞춤 보안을 경험하세요."</p>
      </div>

      {/* 3. 기기 목록 */}
      <section className="device-list-section">
        {/* 기기 목록은 나중에 실제 데이터(배열)를 .map()으로 반복 렌더링 */}
        
        {/* 기기 1 */}
        <Link to="/device/1" className="device-card">
          {/* PDF의 복도 이미지를 임시 플레이스홀더로 대체 */}
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
        
        {/* ... (기기 추가) ... */}
      </section>
      
      {/* 4. 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default MainPage;