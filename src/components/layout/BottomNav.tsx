import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink를 사용하면 활성 탭 스타일링이 쉬워집니다.
import '../../style/components/BottomNav.css'; // 4번 파일에서 만들 CSS

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {/* NavLink는 현재 경로와 to가 일치하면 'active' 클래스를 자동으로 추가합니다.
        PDF의 '3' 아이콘 순서를 임의로 [기록, 홈, 관리]로 해석했습니다.
      */}
      <NavLink 
        to="/history" 
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        {/* 아이콘은 임시 텍스트입니다. 나중에 아이콘 라이브러리로 교체하세요. */}
        <span className="nav-icon">📜</span>
        <span className="nav-text">지난 기록</span>
      </NavLink>

      <NavLink 
        to="/" 
        end // 정확히 "/"일 때만 active
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-text">메인</span>
      </NavLink>

      <NavLink 
        to="/manage" 
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-text">기기 관리</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
