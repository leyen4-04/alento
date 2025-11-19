import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import '../style/DeviceViewPage.css';

// 🔹 visits API에서 transcript 불러오기
import { getVisitTranscript, VisitTranscriptResponse, TranscriptItem } from '../api/visits';

// 채팅 메시지 타입
type ChatMessage = {
  speaker: 'visitor' | 'ai' | 'user';
  text: string;
};

// 초기 채팅 로그 (예시)
const initialChatLog: ChatMessage[] = [
  // { speaker: 'visitor', text: '택배왔습니다' },
  // { speaker: 'visitor', text: 'CJ대한통운입니다' },
  // { speaker: 'ai', text: '안녕하세요. 어느 택배사이신가요?' },
];

// .env
const API_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;

// 백엔드 speaker 문자열 → 프론트 speaker 타입 매핑
function mapSpeaker(raw: string): ChatMessage['speaker'] {
  if (raw === 'visitor') return 'visitor';
  if (raw === 'user') return 'user';
  // 그 외는 모두 ai 로 처리 (예: "ai", "assistant" 등)
  return 'ai';
}

function DeviceViewPage() {
  const { id } = useParams(); // /device/:id
  const location = useLocation();

  // 기기 정보
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceUid, setDeviceUid] = useState<string | null>(null); // ws/conversation 및 ws/stream 에 사용

  // (예전 테스트용) 파일 업로드 상태
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiResponseUrl, setAiResponseUrl] = useState<string | null>(null);

  // 실시간 영상용
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  // 🔹 실시간 대화용
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatLog);
  const [userInput, setUserInput] = useState('');
  const [isConversationActive, setIsConversationActive] = useState(false);
  const conversationWsRef = useRef<WebSocket | null>(null);

  // ---------------------------
  // 1. 기기 정보 로딩 (/devices/me)
  // ---------------------------
  useEffect(() => {
    if (!API_URL || !id) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchDevice = async () => {
      try {
        const res = await fetch(`${API_URL}/devices/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const list = await res.json();
        const found = list.find((d: any) => String(d.id) === String(id));

        if (found) {
          setDeviceName(found.name || null);
          setDeviceUid(found.device_uid || null); // ✅ 여기서 device_uid 저장
        }
      } catch (err) {
        console.error('기기 정보 로딩 실패:', err);
      }
    };

    fetchDevice();
  }, [id]);

  // ---------------------------
  // 2. 특정 visitId 로 들어온 경우 → transcript 불러서 채팅 로그 덮어쓰기
  //    예) /device/1?visitId=3
  // ---------------------------
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const visitIdParam = searchParams.get('visitId');
    if (!visitIdParam) return;

    const visitIdNum = Number(visitIdParam);
    if (Number.isNaN(visitIdNum)) return;

    const token = localStorage.getItem('access_token');
    if (!API_URL || !token) return;

    const fetchTranscript = async () => {
      try {
        // visits.ts 에서 만든 API 함수 사용
        const data: VisitTranscriptResponse = await getVisitTranscript(visitIdNum);

        // transcript → chatMessages 로 변환
        const mapped: ChatMessage[] = data.transcripts.map((t: TranscriptItem) => ({
          speaker: mapSpeaker(t.speaker),
          text: t.message,
        }));

        // 방문 당시 대화만 보이도록 초기 예시 대신 transcript 로 교체
        if (mapped.length > 0) {
          setChatMessages(mapped);
        }
      } catch (err) {
        console.error('대화 내역 요청 중 에러:', err);
      }
    };

    fetchTranscript();
  }, [location.search]);

  // ---------------------------
  // 3. (옵션) 방문 처리 업로드 – 필요시만 사용
  // ---------------------------
  const handleVisitUpload = async () => {
    setUploadError(null);
    setAiResponseUrl(null);

    const apiKey = localStorage.getItem('myDeviceApiKey');

    if (!audioFile || !apiKey) {
      setUploadError('음성 파일과 기기 API 키는 필수입니다.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('audio_file', audioFile);
    if (photoFile) {
      formData.append('photo_file', photoFile);
    }

    try {
      const response = await fetch(`${API_URL}/handle-visit`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAiResponseUrl(audioUrl);
        new Audio(audioUrl).play();
      } else {
        const errorData = await response.json();
        setUploadError(errorData.detail || '방문 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('방문 처리 요청 중 에러:', error);
      setUploadError('서버와 연결할 수 없습니다.');
    } finally {
      setIsUploading(false);
    }
  };

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

  // ---------------------------
  // 4. 실시간 영상 WebSocket (/ws/stream/{device_uid})
  // ---------------------------
  useEffect(() => {
    // ⭐ [수정] id(숫자) 대신 deviceUid(문자열)가 준비되면 실행
    if (!deviceUid) return;

    setWsError(null);

    // ⭐ [수정] URL 끝에 id가 아니라 deviceUid를 붙여야 함
    const streamUrl = WS_URL
      ? `${WS_URL}/ws/stream/${deviceUid}`
      : `ws://${API_URL?.replace(/^https?:\/\//, '')}/ws/stream/${deviceUid}`;

    console.log(`[Video] Connecting to WebSocket: ${streamUrl}`);

    const ws = new WebSocket(streamUrl);

    ws.onopen = () => {
      console.log(`[Video] WebSocket 연결 성공`);
    };

    ws.onmessage = (event) => {
      if (!(event.data instanceof Blob)) return;
      const newUrl = URL.createObjectURL(event.data);
      setVideoSrc(newUrl);
    };

    ws.onerror = (event) => {
      console.error('[Video] WebSocket 에러:', event);
      setWsError('실시간 영상 연결에 실패했습니다.');
    };

    ws.onclose = () => {
      console.log(`[Video] WebSocket 연결 종료`);
    };

    return () => {
      ws.close();
    };
  }, [deviceUid]); // ⭐ [수정] 의존성 배열을 deviceUid로 변경

  // Blob URL 정리
  useEffect(() => {
    if (lastUrl) {
      URL.revokeObjectURL(lastUrl);
    }
    setLastUrl(videoSrc || null);
  }, [videoSrc]);

  // ---------------------------
  // 5. 실시간 대화 WebSocket (/ws/conversation/{device_uid})
  // ---------------------------
  const startConversation = () => {
    if (!deviceUid) {
      alert('기기 UID를 찾을 수 없습니다. 기기 등록을 확인해주세요.');
      return;
    }

    const convUrl = WS_URL
      ? `${WS_URL}/ws/conversation/${deviceUid}`
      : `ws://${API_URL?.replace(/^https?:\/\//, '')}/ws/conversation/${deviceUid}`;

    const ws = new WebSocket(convUrl);
    conversationWsRef.current = ws;

    ws.onopen = () => {
      console.log('대화 WebSocket 연결 성공');
      setIsConversationActive(true);
      setChatMessages((prev) => [
        ...prev,
        { speaker: 'ai', text: '실시간 대화를 시작합니다.' },
      ]);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // 음성 bytes -> 재생
        const audioURL = URL.createObjectURL(event.data);
        new Audio(audioURL).play();
        return;
      }

      const text = event.data.toString();
      setChatMessages((prev) => [...prev, { speaker: 'ai', text }]);
    };

    ws.onerror = (e) => {
      console.error('대화 WebSocket 에러:', e);
    };

    ws.onclose = () => {
      console.log('대화 WebSocket 연결 종료');
      setIsConversationActive(false);
      conversationWsRef.current = null;
    };
  };

  const endConversation = () => {
    const ws = conversationWsRef.current;
    if (!ws) return;
    try {
      ws.send('end');
    } catch (e) {
      console.error(e);
    }
    ws.close();
  };

  // 버튼 토글
  const handleToggleConversation = () => {
    if (isConversationActive) {
      endConversation();
    } else {
      startConversation();
    }
  };

  // 텍스트 전송
  const handleSendText = () => {
    if (!userInput.trim()) return;

    const ws = conversationWsRef.current;
    if (!ws || !isConversationActive) {
      alert('먼저 실시간 대화를 시작해주세요.');
      return;
    }

    const text = userInput.trim();

    // 서버로 전송
    ws.send(text);
    // 화면에는 사용자 말풍선
    setChatMessages((prev) => [...prev, { speaker: 'user', text }]);
    setUserInput('');
  };

  // Enter 로 전송 (Shift+Enter 는 줄바꿈)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // 언마운트 시 소켓 정리
  useEffect(() => {
    return () => {
      if (conversationWsRef.current) {
        conversationWsRef.current.close();
      }
    };
  }, []);

  const titleText = deviceName || `기기 ${id}`;

  return (
    <div className="device-view-container">
      {/* 헤더 */}
      <header className="device-view-header">
        <Link to="/" className="back-button">
          {'<'}
        </Link>
        <h1 className="device-title">{titleText}</h1>
        <span className="logo">ALERTO</span>
      </header>

      {/* 실시간 영상 */}
      <div className="video-feed-wrapper">
        {wsError ? (
          <div className="video-feed error-feed">
            <p>{wsError}</p>
            <span>(WebSocket 연결을 확인해주세요)</span>
          </div>
        ) : videoSrc ? (
          <img
            src={videoSrc}
            alt={`${titleText} 실시간 영상`}
            className="video-feed"
          />
        ) : (
          <div className="video-feed loading-feed">
            <p>실시간 영상 연결 중...</p>
          </div>
        )}

        {videoSrc && !wsError && (
          <>
            <div className="video-overlay-rec">
              <span className="rec-indicator">REC</span>
            </div>
            {/* <div className="video-overlay-zoom">
              <span>보다 자세히 들여다보기.</span>
            </div> */}
          </>
        )}
      </div>

      {/* 기기 이름이 보이는 대화 헤더 */}
      <div className="chat-device-header">
        <span className="chat-device-name">{titleText}</span> 대화 기록
      </div>

      {/* 채팅 로그 */}
      <div className="chat-log-area">
        {chatMessages.map((chat, index) => {
          const sideClass =
            chat.speaker === 'visitor'
              ? 'visitor'
              : chat.speaker === 'user'
              ? 'visitor'
              : 'ai';

          return (
            <div key={index} className={`chat-bubble-wrapper ${sideClass}`}>
              {chat.speaker === 'visitor' && (
                <span className="chat-label">방문자</span>
              )}
              {chat.speaker === 'ai' && (
                <span className="chat-label">AI 초인종</span>
              )}
              {chat.speaker === 'user' && (
                <span className="chat-label">사용자</span>
              )}

              <div className="chat-bubble">{chat.text}</div>
            </div>
          );
        })}
      </div>

      {/* 하단 입력/버튼 영역 */}
      <div className="action-area">
        {isConversationActive ? (
          <>
            {/* ✅ 대화 시작 후에만 입력창 + >> 버튼 보이기 */}
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                placeholder="방문자에게 전달할 말을 입력하세요."
                rows={1}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <button className="chat-send-button" onClick={handleSendText}>
                &gt;&gt;
              </button>
            </div>

            <button
              className="start-conversation-button end"
              onClick={handleToggleConversation}
            >
              실시간 대화 종료
            </button>
          </>
        ) : (
          // 아직 대화를 시작하지 않았을 때는 이 버튼만 보임
          <button
            className="start-conversation-button"
            onClick={handleToggleConversation}
          >
            실시간 대화를 시작합니다
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default DeviceViewPage;