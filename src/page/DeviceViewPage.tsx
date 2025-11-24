import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

import BottomNav from "../components/layout/BottomNav";
import "../style/DeviceViewPage.css";

import {
  getVisitDetail,
  getVisitTranscript,
  Visit,
  VisitTranscriptResponse,
  TranscriptItem,
} from "../api/visits";


// 채팅 메시지 타입
type ChatMessage = {
  speaker: 'visitor' | 'ai' | 'user';
  text: string;
};

// 백엔드 speaker → 프론트 speaker 타입 변환
function mapSpeaker(raw: string): ChatMessage['speaker'] {
  if (raw === 'visitor') return 'visitor';
  if (raw === 'user') return 'user';
  return 'ai';
}

function DeviceViewPage() {
  const { id } = useParams();
  const location = useLocation();

  // visitId 존재 여부 확인 → 기록 모드 판별
  const visitIdParam = new URLSearchParams(location.search).get('visitId');
  const isHistoryMode = Boolean(visitIdParam);

  const backUrl = isHistoryMode ? "/history" : "/";

  // 기기 정보 (실시간 모드에서 사용)
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceUid, setDeviceUid] = useState<string | null>(null);

  // 저장된 방문 기록용
  const [savedVideoUrl, setSavedVideoUrl] = useState<string | null>(null);

  // 공용 대화 로그
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  // 실시간 모드 전용
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const conversationWsRef = useRef<WebSocket | null>(null);

  const API_URL =
  (import.meta as any).env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "";

const WS_URL =
  (import.meta as any).env?.VITE_WS_URL ||
  process.env.REACT_APP_WS_URL ||
  "";


  /* =========================================================
        #1 기록 모드: 방문 기록 로드
  ========================================================= */
  useEffect(() => {
    if (!isHistoryMode) return;
    if (!visitIdParam) return;

    const visitIdNum = Number(visitIdParam);
    if (isNaN(visitIdNum)) return;

    const loadHistoryData = async () => {
      try {
        // 방문 상세 → 영상 URL 가져오기
        const detail: Visit = await getVisitDetail(visitIdNum);
        setSavedVideoUrl(detail.visitor_video_url);

        // transcript 불러오기
        const transcript: VisitTranscriptResponse =
          await getVisitTranscript(visitIdNum);

        const mappedLogs = transcript.transcripts.map((t) => ({
          speaker: mapSpeaker(t.speaker),
          text: t.message,
        }));

        setChatMessages(mappedLogs);
      } catch (e) {
        console.error('[기록 모드] 데이터 불러오기 실패:', e);
      }
    };

    loadHistoryData();
  }, [isHistoryMode, visitIdParam]);

  /* =========================================================
        #2 실시간 모드: 기기 정보 로드 (/devices/me)
  ========================================================= */
  useEffect(() => {
    if (isHistoryMode) return; // 기록 모드면 실시간 기능 모두 비활성화
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
          setDeviceUid(found.device_uid || null);
        }
      } catch (err) {
        console.error('[실시간 모드] 기기 정보 실패:', err);
      }
    };

    fetchDevice();
  }, [isHistoryMode, id]);

  /* =========================================================
        #3 실시간 영상 WebSocket (/ws/stream/{device_uid})
  ========================================================= */
  useEffect(() => {
    if (isHistoryMode) return; // 기록 모드면 실시간 스트림 해제
    if (!deviceUid) return;

    const streamUrl = WS_URL
      ? `${WS_URL}/ws/stream/${deviceUid}`
      : `ws://${API_URL?.replace(/^https?:\/\//, '')}/ws/stream/${deviceUid}`;

    setWsError(null);
    const ws = new WebSocket(streamUrl);

    ws.onopen = () => console.log('[Video] 연결 성공');
    ws.onerror = () => setWsError('실시간 영상 연결 실패');
    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const newUrl = URL.createObjectURL(event.data);
        setVideoSrc(newUrl);
      }
    };

    return () => ws.close();
  }, [isHistoryMode, deviceUid]);

  // Blob cleanup
  useEffect(() => {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    setLastUrl(videoSrc);
  }, [videoSrc]);

  /* =========================================================
        #4 실시간 대화 WebSocket
  ========================================================= */
  const startConversation = () => {
    if (isHistoryMode) return; // 기록모드에서는 불가능

    if (!deviceUid) {
      alert("기기 UID 없음");
      return;
    }

    const convUrl = WS_URL
      ? `${WS_URL}/ws/conversation/${deviceUid}`
      : `ws://${API_URL?.replace(/^https?:\/\//, '')}/ws/conversation/${deviceUid}`;

    const ws = new WebSocket(convUrl);
    conversationWsRef.current = ws;

    ws.onopen = () => {
      setIsConversationActive(true);
      setChatMessages((prev) => [...prev, { speaker: "ai", text: "실시간 대화를 시작합니다." }]);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const audioURL = URL.createObjectURL(event.data);
        new Audio(audioURL).play();
      } else {
        setChatMessages((prev) => [...prev, { speaker: "ai", text: event.data }]);
      }
    };

    ws.onclose = () => {
      setIsConversationActive(false);
      conversationWsRef.current = null;
    };
  };

  const endConversation = () => {
    const ws = conversationWsRef.current;
    if (!ws) return;
    ws.close();
  };

  const handleSendText = () => {
    if (!userInput.trim()) return;
    const ws = conversationWsRef.current;
    if (!ws || !isConversationActive) return;

    ws.send(userInput);
    setChatMessages((prev) => [...prev, { speaker: "user", text: userInput }]);
    setUserInput("");
  };

  /* =========================================================
        # 출력 렌더링
  ========================================================= */

  const titleText =
    isHistoryMode ? "저장된 방문 기록" : deviceName || `기기 ${id}`;

  return (
    <div className="device-view-container">
      {/* 헤더 */}
      <header className="device-view-header">
        <Link to={backUrl} className="back-button">{'<'}</Link>
        <h1 className="device-title">{titleText}</h1>
        <span className="logo">ALERTO</span>
      </header>

      {/* ======================= 기록 모드 영상 ======================= */}
      {isHistoryMode && (
        <div className="video-feed-wrapper">
          {savedVideoUrl ? (
            <video className="video-feed" src={savedVideoUrl} controls autoPlay muted />
          ) : (
            <div className="video-feed"><p>저장된 영상이 없습니다.</p></div>
          )}
        </div>
      )}

      {/* ======================= 실시간 모드 영상 ======================= */}
      {!isHistoryMode && (
        <div className="video-feed-wrapper">
          {wsError ? (
            <div className="video-feed error-feed">
              <p>{wsError}</p>
            </div>
          ) : videoSrc ? (
            <img src={videoSrc} alt="실시간 영상" className="video-feed" />
          ) : (
            <div className="video-feed loading-feed">
              <p>실시간 영상 연결 중...</p>
            </div>
          )}
        </div>
      )}

      {/* ======================= 대화 로그 ======================= */}
      <div className="chat-log-area">
        {chatMessages.map((chat, index) => {
          return (
            <div key={index} className={`chat-bubble-wrapper ${chat.speaker}`}>
              <span className="chat-label">
                {chat.speaker === 'visitor'
                  ? '방문자'
                  : chat.speaker === 'ai'
                  ? 'AI'
                  : '사용자'}
              </span>
              <div className="chat-bubble">{chat.text}</div>
            </div>
          );
        })}
      </div>

      {/* ======================= 입력창 (실시간 모드만) ======================= */}
      <div className="action-area">
        {!isHistoryMode && (
          <>
            {isConversationActive ? (
              <>
                <div className="chat-input-row">
                  <textarea
                    className="chat-input"
                    rows={1}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="메시지를 입력하세요…"
                  />
                  <button className="chat-send-button" onClick={handleSendText}>
                    ▶
                  </button>
                </div>
                <button className="start-conversation-button end" onClick={endConversation}>
                  실시간 대화 종료
                </button>
              </>
            ) : (
              <button className="start-conversation-button" onClick={startConversation}>
                실시간 대화를 시작합니다
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default DeviceViewPage;
