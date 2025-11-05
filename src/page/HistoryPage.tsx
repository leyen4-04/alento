import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/HistoryPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

// PDF 9페이지의 목록을 임시 데이터(배열)로 만듭니다.
const conversationHistory = [
  {
    id: 1,
    title: "택배 배송 대화 요약",
    summary: "대화 요약 - 문 앞에 두고갑니다",
    time: "방문 시간 - 2025-11-03 14:30"
  },
  {
    id: 2,
    title: "부재중 방문",
    summary: "대화 요약 - 응답없음",
    time: "방문 시간 - 2025-11-03 11:15"
  },
  {
    id: 3,
    title: "방문자: 김철수",
    summary: "대화 요약 - 7시쯤 다시 올게",
    time: "방문 시간 - 2025-11-02 18:22"
  },
  {
    id: 4,
    title: "음식 배달",
    summary: "대화 요약 - 배달왔습니다",
    time: "방문 시간 - 2025-11-02 12:05"
  },
  {
    id: 5,
    title: "소포 도착",
    summary: "대화 요약 - 응답없음",
    time: "방문 시간 - 2025-11-01 08:15"
  },
  {
    id: 6,
    title: "가스점검",
    summary: "대화 요약 - 부재중 이틀 후 재방문",
    time: "방문 시간 - 2025-10-31 13:24"
  },
  {
    id: 7,
    title: "인식되지 않은 방문자",
    summary: "대화 요약 - 벨 누름 후 대기",
    time: "방문 시간 - 2025-10-30 20:32"
  }
];


function HistoryPage() {
  return (
    <div className="history-container">
      {/* 1. 헤더 */}
      <header className="history-header">
        <span className="logo">ALERTO</span>
        <h1 className="history-title">지난 대화 목록</h1>
      </header>
      
      {/* 2. 안내 문구 */}
      <p className="history-notice">
        * 모든 녹화는 30일 까지 기록됩니다 *
      </p>

      {/* 3. 대화 목록 리스트 */}
      <div className="history-list">
        {/*
          conversationHistory 배열을 map() 함수로 순회하며
          각 항목을 <div className="history-card">로 렌더링합니다.
        */}
        {conversationHistory.map((item) => (
          <div key={item.id} className="history-card">
            <h2 className="card-title">{item.title}</h2>
            <p className="card-summary">{item.summary}</p>
            <span className="card-time">{item.time}</span>
          </div>
        ))}
      </div>
      
      {/* 4. 페이지네이션 (PDF의 1 2 3) - 임시 */}
      <div className="pagination">
        <button className="page-num active">1</button>
        <button className="page-num">2</button>
        <button className="page-num">3</button>
      </div>

      {/* 5. 공통 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default HistoryPage;