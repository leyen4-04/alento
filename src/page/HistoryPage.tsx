// [신규] React에서 useState와 useEffect를 가져옵니다.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/HistoryPage.css'; // 이 페이지 전용 CSS

// [수정] PDF 9페이지의 임시 데이터(배열)를 삭제합니다.
// const conversationHistory = [ ... ];

function HistoryPage() {

  // [신규] API 데이터를 저장할 state들을 선언합니다.
  const [history, setHistory] = useState<any[]>([]); // API 응답(배열)
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  // [신규] 페이지가 처음 로드될 때 '방문 기록'을 불러옵니다. (GET /visits/)
  useEffect(() => {
    const fetchHistory = async () => {
      
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ★ 'Authorization' 헤더를 사용하는 인증 패턴 ★
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

      // 1. 토큰 가져오기
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("방문 기록 조회를 위해 로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        // 2. fetch에 'Authorization' 헤더 추가하여 API 호출
        // (참고: /visits/?skip=0&limit=20 처럼 파라미터를 넘겨 페이지네이션 구현 가능)
        const response = await fetch("http://192.168.100.7:8000/visits/", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        if (response.ok) {
          const data = await response.json();
          setHistory(data); // 성공 시 state에 방문 기록 저장
        } else {
          setError("방문 기록을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchHistory(); // 함수 실행
  }, []); // 빈 배열 [] : 페이지가 처음 로드될 때 1회만 실행

  
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

        {/* [수정] 로딩 및 에러 상태를 표시합니다. */}
        {loading && <p>방문 기록을 불러오는 중입니다...</p>}
        {error && <p className="error-message">{error}</p>}

        {/* [수정] 'conversationHistory' 대신 API로 받아온 'history' state를 map으로 순회합니다. */}
        {!loading && !error && history.map((item) => (
          <div key={item.id} className="history-card">
            {/* [수정] API 명세서에 'title'이 없고 'summary'가 있으므로, 
              'summary'를 제목으로 사용합니다. (API 응답: { id, summary, created_at, ... })
            */}
            <h2 className="card-title">{item.summary}</h2>
            
            {/* [수정] API에 별도 summary 내용이 없으므로 p 태그는 생략하거나
              다른 정보(예: 기기 ID)를 표시할 수 있습니다. 여기서는 생략합니다.
            */}
             {/* <p className="card-summary">{item.summary}</p> */}

            {/* [수정] 'time' 대신 'created_at' 필드를 사용하고, 날짜 형식을 변환합니다. */}
           <span className="card-time">
              방문 시간 - {new Date(item.created_at).toLocaleString('ko-KR')}
            </span>

            {/* (선택) API에 있는 사진/음성 URL을 활용할 수 있습니다. */}
            {item.visitor_photo_url && (
              <img src={item.visitor_photo_url} alt="방문자 사진" style={{width: '100%', height: 'auto', marginTop: '10px'}} />
            )}
            </div>
          ))}

        {/* 데이터가 없는 경우 */}
        {!loading && !error && history.length === 0 && (
          <p>지난 방문 기록이 없습니다.</p>
        )}
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