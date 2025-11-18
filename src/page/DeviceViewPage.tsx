// src/page/DeviceViewPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // ✅ useLocation 추가
import BottomNav from '../components/layout/BottomNav';
import '../style/DeviceViewPage.css';

// 채팅 메시지 타입
type ChatMessage = {
  speaker: 'visitor' | 'ai' | 'user';
  text: string;
};

// 초기 채팅 로그 (예시)
const initialChatLog: ChatMessage[] = [
  { speaker: 'visitor', text: '택배왔습니다' },
  { speaker: 'visitor', text: 'CJ대한통운입니다' },
  { speaker: 'ai', text: '안녕하세요. 어느 택배사이신가요?' },
];

// transcript API 응답 타입
interface TranscriptItem {
  id: number;
  speaker: string;
  message: string;
  created_at: string;
}

interface TranscriptResponse {
  visit_id: number;
  summary: string;
  created_at: string;
  transcripts: TranscriptItem[];
}

// .env
const API_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;

function DeviceViewPage() {
  const { id } = useParams(); // /device/:id
  const location = useLocation(); // ✅ 쿼리 파라미터 읽기용

  // URL ?visitId=123 꺼내기
  const searchParams = new URLSearchParams(location.search);
  const visitIdParam = searchParams.get('visitId');
  const visitId = visitIdParam ? Number(visitIdParam) : null;

  // 기기 정보
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceUid, setDeviceUid] = useState<string | null>(null); // ws/conversation 에 사용

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

  // 🔹 실시간 / 과거 대화 공통 채팅 로그
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
  // 2. (옵션) 방문 처리 업로드 – 필요시만 사용
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
  // 3. 실시간 영상 WebSocket (/ws/stream/{device_id})
  // ---------------------------
  useEffect(() => {
    if (!id || !API_URL) return;

    setWsError(null);

    const streamUrl = WS_URL
      ? `${WS_URL}/ws/stream/${id}`
      : `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/stream/${id}`;

    const ws = new WebSocket(streamUrl);

    ws.onopen = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 성공`);
    };

    ws.onmessage = (event) => {
      const newUrl = URL.createObjectURL(event.data);
      setVideoSrc(newUrl);
    };

    ws.onerror = (event) => {
      console.error('WebSocket 에러:', event);
      setWsError('실시간 영상 연결에 실패했습니다.');
    };

    ws.onclose = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 종료`);
    };

    return () => {
      ws.close();
    };
  }, [id]);

  // Blob URL 정리
  useEffect(() => {
    if (lastUrl) {
      URL.revokeObjectURL(lastUrl);
    }
    setLastUrl(videoSrc || null);
  }, [videoSrc]);

  // ---------------------------
  // 4. 지난 대화 transcript 로드 (/visits/{visit_id}/transcript)
  // ---------------------------
  useEffect(() => {
    if (!API_URL) return;
    if (!visitId) {
      // 방문 ID가 없으면 (History에서 안 온 경우) 샘플 로그 유지
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchTranscript = async () => {
      try {
        const res = await fetch(`${API_URL}/visits/${visitId}/transcript`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error('대화 내역 불러오기 실패:', await res.text());
          return;
        }

        const data: TranscriptResponse = await res.json();

        const mapped: ChatMessage[] = data.transcripts.map((t) => {
          let speaker: 'visitor' | 'ai' | 'user' = 'visitor';
          const s = t.speaker.toLowerCase();

          if (s === 'ai' || s === 'assistant') speaker = 'ai';
          else if (s === 'user' || s === 'owner' || s === 'host') speaker = 'user';

          return { speaker, text: t.message };
        });

        if (mapped.length > 0) {
          setChatMessages(mapped);
        } else {
          // transcript가 비어있으면 summary라도 보여주기
          setChatMessages([
            {
              speaker: 'ai',
              text: data.summary || '대화 내역이 없습니다.',
            },
          ]);
        }
      } catch (err) {
        console.error('대화 내역 요청 중 에러:', err);
      }
    };

    fetchTranscript();
  }, [visitId]);

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
            <div className="video-overlay-zoom">
              <span>보다 자세히 들여다보기.</span>
            </div>
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
          const sideClass = chat.speaker === 'visitor' ? 'visitor' : 'ai';

          return (
            <div
              key={index}
              className={`chat-bubble-wrapper ${sideClass}`}
            >
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
              <button
                className="chat-send-button"
                onClick={handleSendText}
              >
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
