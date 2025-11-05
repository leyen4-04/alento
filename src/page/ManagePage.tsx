import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/ManagePage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

// PDF 11, 13페이지의 임시 데이터
const userData = {
  name: "홍길동",
};

const deviceData = {
  nickname: "기기 별명",
  id: "기기 고유 ID",
  owner: "대표자 명",
  warranty: "20xx - xx-xx까지",
  aiNotes: [
    "참고할 내용 1",
    "참고할 내용 2",
    "참고할 내용 3",
  ]
};

function ManagePage() {
  return (
    <div className="manage-container">
      {/* 1. 헤더 */}
      <header className="manage-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">{userData.name} 님</h1>
      </header>

      {/* 2. 구독하기 버튼 */}
      <div className="manage-section">
        <Link to="/subscription" className="subscribe-link-button">
          구독하기
        </Link>
      </div>

      {/* 3. 기기 관리 섹션 */}
      <section className="manage-section">
        <h2 className="section-title">기기관리</h2>
        {/* 임시 기기 카드 */}
        <div className="device-card-manage">
          <div className="card-header">
            <h3 className="device-nickname">{deviceData.nickname}</h3>
            <span className="device-owner">{deviceData.owner}</span>
            <span className="arrow">{">"}</span>
          </div>
          <p className="device-id">{deviceData.id}</p>
          <p className="device-warranty">보증 기간 - {deviceData.warranty}</p>
          <div className="ai-notes">
            <h4 className="ai-notes-title">AI가 참고할 내용</h4>
            <ul>
              {deviceData.aiNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
        <button className="add-button">+ 기기 추가</button>
      </section>

      {/* 4. 생체 등록 섹션 */}
      <section className="manage-section">
        <h2 className="section-title">생체 등록</h2>
        <div className="bio-card">
          {/* 임시 생체 등록자 아바타 */}
          <div className="avatar-placeholder"></div>
          <div className="avatar-placeholder"></div>
          <span className="arrow">{">"}</span>
        </div>
        {/* PDF 12페이지(생체 등록)로 이동하는 링크 (경로 임시) */}
        <Link to="/manage/register-bio" className="add-button">
          + 등록 추가
        </Link>
      </section>
      
      {/* 5. 공통 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default ManagePage;
