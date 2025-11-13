import React, { useState, useEffect } from 'react'; // [수정] useEffect 임포트
import { useParams, Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import '../style/DeviceViewPage.css';


// PDF 10페이지의 대화 내용을 임시 데이터로 만듭니다.
const chatLog = [
  { speaker: "visitor", text: "택배왔습니다" },
  { speaker: "visitor", text: "CJ대한통운입니다" },
  { speaker: "ai", text: "안녕하세요. 어느 택배사이신가요?" }
];

// [신규] .env 변수 2개 가져오기
const API_URL = process.env.REACT_APP_API_URL; // http://...
const WS_URL = process.env.REACT_APP_WS_URL;   // ws://...

function DeviceViewPage() {
  // URL의 :id 값을 가져옵니다. (예: /device/1 -> id는 '1')
  const { id } = useParams();
  
  // [추가] 파일 업로드 테스트를 위한 State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiResponseUrl, setAiResponseUrl] = useState<string | null>(null);

  // [신규] WebSocket 영상 스트리밍을 위한 State
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null); // (선택) 웹소켓 에러 표시용

  /**
   * [신규] 방문 처리(파일 업로드) 테스트 함수
   */
  const handleVisitUpload = async () => {
    // 이전 에러/성공 URL 초기화
    setUploadError(null);
    setAiResponseUrl(null);

    // ★ 기기 API 키 (제공된 스니펫대로 localStorage에서 가져옴을 가정)
    // 참고: 실제 앱에서는 이 페이지의 device 'id'를 기반으로
    // 부모 컴포넌트나 context에서 API 키를 가져와야 할 수 있습니다.
    const apiKey = localStorage.getItem("myDeviceApiKey");

    if (!audioFile || !apiKey) {
      setUploadError("음성 파일과 기기 API 키는 필수입니다.");
      return;
    }

    setIsUploading(true);

    // FormData 준비
    const formData = new FormData();
    formData.append("audio_file", audioFile);
    if (photoFile) {
      formData.append("photo_file", photoFile);
    }

    try {
      // ★ 제공된 스니펫의 엔드포인트 사용
      const response = await fetch("http://192.168.100.3:8000/handle-visit", { // 주소오류
        method: "POST",
        headers: {
          "X-API-Key": apiKey // ★ 기기 인증 헤더
        },
        body: formData,
      });

      if (response.ok) {
        // 성공: 응답이 '음성 파일(Blob)'
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAiResponseUrl(audioUrl); // State에 저장
        
        console.log("AI 응답 음성 수신 성공! URL:", audioUrl);
        new Audio(audioUrl).play(); // 즉시 재생
        
      } else {
        // 실패: 응답이 'JSON'
        const errorData = await response.json();
        setUploadError(errorData.detail || "방문 처리에 실패했습니다.");
      }

    } catch (error) {
      console.error("방문 처리 요청 중 에러:", error);
      setUploadError("서버와 연결할 수 없습니다.");
    } finally {
      setIsUploading(false); // 로딩 종료
    }
  };

  // [신규] 파일 입력(input) 변경 핸들러
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    } else {
      setAudioFile(null);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    } else {
      setPhotoFile(null);
    }
  };

  /**
   * [신규] 실시간 영상 WebSocket 연결 (개발 순서 4)
   */
  useEffect(() => {
    // 1. WebSocket 서버 주소로 연결을 시작합니다.
    // (id가 없는 경우 연결 시도 방지)
    if (!id) return;
    
    setWsError(null); // 이전 에러 초기화
    
    // (제공된 스니펫의 URL 형식 사용)
    const ws = new WebSocket(`ws://192.168.100.7:8000/ws/stream/${id}`);

    ws.onopen = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 성공`);
    };

    // 2. 서버로부터 메시지(영상 프레임)가 올 때마다 실행
    ws.onmessage = (event) => {
      // event.data는 이미지 바이트(Blob)입니다.
      // 3. 이 바이트를 <img> 태그가 읽을 수 있는 임시 URL로 변환
      const newUrl = URL.createObjectURL(event.data);
      
      // 4. <img> 태그의 src를 이 새 URL로 업데이트
      setVideoSrc(newUrl);
    };

    // (선택) 에러 핸들링
    ws.onerror = (event) => {
      console.error("WebSocket 에러:", event);
      setWsError("실시간 영상 연결에 실패했습니다.");
    };

    ws.onclose = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 종료`);
    };

    // 5. 컴포넌트가 사라질 때(unmount) 연결을 닫습니다.
    return () => {
      ws.close();
      // (메모리 누수 방지 - lastUrl은 아래 별도 useEffect에서 처리)
    };
    
  }, [id]); // deviceId(id)가 바뀔 때마다 새 연결 시작

  /**
   * [신규] 메모리 누수 방지를 위해, 이전 임시 URL을 폐기
   */
  useEffect(() => {
    // videoSrc가 (새 URL로) 업데이트된 '후에' 실행됩니다.
    if (lastUrl) {
      // 6. 이전에 사용했던 임시 URL(lastUrl)을 폐기
      URL.revokeObjectURL(lastUrl);
    }
    // 현재 URL(videoSrc)을 '다음' 폐기를 위해 'lastUrl'로 저장
    setLastUrl(videoSrc);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc]); // videoSrc가 변경될 때마다 이 effect 실행
  
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
        {/* [수정] 플레이스홀더 대신 WebSocket 영상 렌더링 */}

        {/* 1. 에러가 발생한 경우 (wsError) */}
        {wsError ? (
          <div className="video-feed error-feed">
            <p>{wsError}</p>
            <span>(WebSocket 연결을 확인해주세요)</span>
          </div>
        ) : 
        
        /* 2. 정상 연결 중 (videoSrc가 있는 경우) */
        videoSrc ? (
          <img 
            src={videoSrc} 
            alt={`기기 ${id} 실시간 영상`}
            className="video-feed"
          />
        ) : 
        
        /* 3. 로딩 중 (videoSrc가 아직 없는 경우) */
        (
          <div className="video-feed loading-feed">
            <p>실시간 영상 연결 중...</p>
          </div>
        )}
        
        {/* 영상 위 REC 오버레이 (영상 있을 때만 표시되도록 수정) */}
        {videoSrc && !wsError && (
          <>
            <div className="video-overlay-rec">
              <span className="rec-indicator">REC</span>
            </div>
            <div className="video-overlay-zoom">
              <span>보다 자세히 들여다보기.</span>
            </div>
          </>
        )}
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
      
      {/* [추가] 방문 처리 테스트 영역 */}
      <div className="visit-test-area">
        <h3 className="test-title">개발: 방문 처리(handle-visit) 테스트</h3>
        
        {/* 1. 음성 파일 (필수) */}
        <div className="test-input-group">
          <label htmlFor="audio-input">1. 음성 파일 (필수)</label>
          <input 
            type="file" 
            id="audio-input"
            accept="audio/*"
            onChange={handleAudioChange}
            disabled={isUploading}
          />
        </div>

        {/* 2. 사진 파일 (선택) */}
        <div className="test-input-group">
          <label htmlFor="photo-input">2. 사진 파일 (선택)</label>
          <input 
            type="file" 
            id="photo-input"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={isUploading}
          />
        </div>

        {/* 3. 전송 버튼 */}
        <button 
          className="test-upload-button"
          onClick={handleVisitUpload}
          disabled={isUploading}
        >
          {isUploading ? "전송 중..." : "방문 테스트 시작"}
        </button>

        {/* 4. 결과 표시 */}
        {uploadError && (
          <div className="test-result error">
            <p>실패: {uploadError}</p>
          </div>
        )}
        {aiResponseUrl && (
          <div className="test-result success">
            <p>성공! AI 응답 음성:</p>
            {/* 오디오 컨트롤러 표시 */}
            <audio src={aiResponseUrl} controls />
          </div>
        )}
      </div>
      

      {/* 공통 하단 네비게이션 */}
      <BottomNav  />
    </div>
  );
}

export default DeviceViewPage;

