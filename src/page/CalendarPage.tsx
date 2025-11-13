import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/CalendarPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

function CalendarPage() {
  
  // 캘린더 헤더/요일 (임시 데이터)
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  // 캘린더 날짜 (임시 데이터 - 6주치, 42칸)
  const dates = [
    "28", "29", "30", "1", "2", "3", "4",
    "5", "6", "7", "8", "9", "10", "11",
    "12", "13", "14", "15", "16", "17", "18",
    "19", "20", "21", "22", "23", "24", "25",
    "26", "27", "28", "29", "30", "31", "1",
    "2", "3" , "4", "5", "6", "7", "8"
  ];

  // / [신규] API로 받아올 일정 데이터를 위한 state
  const [appointments, setAppointments] = useState<any[]>([]); // API 응답(배열)
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  // [신규] 페이지가 처음 로드될 때 '내 일정'을 불러옵니다. (GET /appointments/)
  useEffect(() => {
    const fetchAppointments = async () => {
      
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ★ 'Authorization' 헤더를 사용하는 인증 패턴 ★
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

      // 1. 토큰 가져오기
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("일정 조회를 위해 로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        // 2. fetch에 'Authorization' 헤더 추가하여 API 호출
        const response = await fetch("http://192.168.100.3:8000/appointments/", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        if (response.ok) {
          const data = await response.json();
          setAppointments(data); // 성공 시 state에 일정 데이터 저장
        } else {
          setError("일정 데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchAppointments(); // 함수 실행
  }, []); // 빈 배열 [] : 페이지가 처음 로드될 때 1회만 실행

  return (
    <div className="calendar-container">
      {/* 1. 헤더 */}
      <header className="calendar-header">
        <span className="logo">ALERTO</span>
        {/* 날짜 네비게이션 */}
        <div className="month-nav">
          <button className="nav-arrow">{"<"}</button>
          <span className="current-month">2025년 10월</span>
          <button className="nav-arrow">{">"}</button>
        </div>
      </header>

      {/* 2. 캘린더 그리드 */}
      <div className="calendar-grid">
        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {daysOfWeek.map(day => (
            <div key={day} className="weekday-cell">{day}</div>
          ))}
        </div>
        {/* 날짜 */}
        <div className="calendar-dates">
          {dates.map((date, index) => (
            <div key={index} className="date-cell">
              {/* PDF의 28일처럼 오늘 날짜/선택된 날짜 스타일 */}
              {date === "28" && index > 20 ? (
                <span className="date-number selected">{date}</span>
              ) : (
                <span className="date-number">{date}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. 일정 섹션 */}
      <section className="schedule-section">
        <h2 className="schedule-title">일정</h2>
        <div className="schedule-details">
          <span className="schedule-date">2025년 10월 28일 화요일</span>
          <span className="schedule-time">오전 3:00</span>
          <p className="schedule-description">약속 및 설명추가</p>
        </div>
      </section>

      {/* 4. 공통 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default CalendarPage;