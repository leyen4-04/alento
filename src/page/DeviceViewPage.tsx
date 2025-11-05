import React from 'react';
import { useParams, Link } from 'react-router-dom'; // URL 파라미터를 읽기 위해 useParams 임포트
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/DeviceViewPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

// PDF 10페이지의 대화 내용을 임시 데이터로 만듭니다.
const chatLog = [
  { speaker: "visitor", text: "택배왔습니다" },
  { speaker: "visitor", text: "CJ대한통운입니다" },
  { speaker: "ai", text: "안녕하세요. 어느 택배사이신가요?" }
];

function DeviceViewPage() {
  // URL의 :id 값을 가져옵니다. (예: /device/1 -> id는 '1')
  const { id } = useParams();

  return (
    <div className="device-view-container">
      <header className="device-view-header">
        {/* 뒤로가기 버튼 (임시로 메인페이지로 이동) */}
        <Link to="/" className="back-button">{"<"}</Link>
        <h1 className="device-title">기기 {id}</h1>
        <span className="logo">ALERTO</span>
      </header>

      {/* 실시간 영상 영역 */}
      <div className="video-feed-wrapper">
        {/* PDF의 방문자 이미지를 임시 플레이스홀더로 대체 */}
        <img 
          src="https://placehold.co/1280x720/555555/aaaaaa?text=Live+Video+(Visitor)"
          alt={`기기 ${id} 실시간 영상`}
          className="video-feed"
        />
        
        {/* 영상 위 REC 오버레이 */}
        <div className="video-overlay-rec">
          <span className="rec-indicator">REC</span>
        </div>
        <div className="video-overlay-zoom">
          <span>보다 자세히 들여다보기.</span>
        </div>
      </div>

      {/* 실시간 대화 로그 영역 */}
      <div className="chat-log-area">
        {chatLog.map((chat, index) => (
          <div key={index} className={`chat-bubble-wrapper ${chat.speaker}`}>
            {/* AI 메시지일 경우 라벨 표시 */}
            {chat.speaker === 'ai' && <span className="chat-label">AI 초인종</span>}
            {chat.speaker === 'visitor' && <span className="chat-label">방문자</span>}
            
            <div className="chat-bubble">
              {chat.text}
            </div>
          </div>
        ))}
      </div>


      {/* 실시간 대화 시작 버튼 */}
      <div className="action-area">
        <button className="start-conversation-button">
          실시간 대화를 시작합니다
        </button>
      </div>

      {/* 공통 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default DeviceViewPage;

