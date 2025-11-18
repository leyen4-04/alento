// src/page/DeviceViewPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import "../style/DeviceViewPage.css";

// ======================
// 타입 정의
// ======================
type ChatSpeaker = "visitor" | "ai" | "user";

type ChatMessage = {
  speaker: ChatSpeaker;
  text: string;
};

type DeviceInfo = {
  id: number;
  name: string;
  device_uid: string;
  memo?: string | null;
};

// ======================
// 환경 변수
// ======================
const API_URL = process.env.REACT_APP_API_URL; // http://...
const WS_URL = process.env.REACT_APP_WS_URL;   // ws://...

function DeviceViewPage() {
  const { id } = useParams(); // /device/:id  → 문자열

  // 1) 기기 정보
  const [device, setDevice] = useState<DeviceInfo | null>(null);

  // 2) 실시간 영상
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null);
  const [videoWsError, setVideoWsError] = useState<string | null>(null);

  // 3) 실시간 대화
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );
  const conversationWsRef = useRef<WebSocket | null>(null);

  // =====================================
  // 1. 기기 정보 로딩 : GET /devices/me
  //    → name, device_uid 가져오기
  // =====================================
  useEffect(() => {
    if (!API_URL || !id) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchDevice = async () => {
      try {
        const res = await fetch(`${API_URL}/devices/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("기기 정보 로딩 실패:", res.status);
          return;
        }

        const list: DeviceInfo[] = await res.json();
        const found = list.find((d) => String(d.id) === String(id));

        if (found) {
          setDevice(found);
        }
      } catch (err) {
        console.error("기기 정보 로딩 에러:", err);
      }
    };

    fetchDevice();
  }, [id]);

  const titleText = device?.name || `기기 ${id ?? ""}`;

  // =====================================
  // 2. 실시간 영상 WebSocket
  //     /ws/stream/{device_id}
  // =====================================
  useEffect(() => {
    if (!id || !WS_URL) return;

    setVideoWsError(null);

    const streamUrl = `${WS_URL}/ws/stream/${id}`;
    const ws = new WebSocket(streamUrl);

    ws.onopen = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 성공`);
    };

    ws.onmessage = (event) => {
      // 서버에서 오는 건 바이너리(이미지 프레임)라고 가정
      if (event.data instanceof Blob) {
        const blobUrl = URL.createObjectURL(event.data);
        setVideoSrc(blobUrl);
      }
    };

    ws.onerror = (event) => {
      console.error("영상 WebSocket 에러:", event);
      setVideoWsError("실시간 영상 연결에 실패했습니다.");
    };

    ws.onclose = () => {
      console.log(`WebSocket /ws/stream/${id} 연결 종료`);
    };

    return () => {
      ws.close();
    };
  }, [id]);

  // 기존 Blob URL 정리 (메모리 누수 방지)
  useEffect(() => {
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
    if (videoSrc) {
      setLastBlobUrl(videoSrc);
    }
  }, [videoSrc]);

  // =====================================
  // 3. 실시간 대화 WebSocket
  //     /ws/conversation/{device_uid}
  // =====================================

  // (1) 대화 시작
  const startConversation = () => {
    if (!device?.device_uid) {
      alert("기기 UID를 찾을 수 없습니다. 기기 등록을 먼저 확인해주세요.");
      return;
    }
    if (!WS_URL) {
      alert("WebSocket 서버 주소(WS_URL)가 설정되어 있지 않습니다.");
      return;
    }

    setConversationError(null);

    const convUrl = `${WS_URL}/ws/conversation/${device.device_uid}`;
    const ws = new WebSocket(convUrl);
    conversationWsRef.current = ws;

    ws.onopen = () => {
      console.log("대화 WebSocket 연결 성공");
      setIsConversationActive(true);
      // 시스템 메시지 느낌으로 하나 추가
      setChatMessages((prev) => [
        ...prev,
        { speaker: "ai", text: "실시간 대화를 시작합니다." },
      ]);
    };

    ws.onmessage = (event) => {
      // 명세서: bytes → AI 음성(mp3), text → AI 응답 텍스트
      if (event.data instanceof Blob) {
        const audioURL = URL.createObjectURL(event.data);
        const audio = new Audio(audioURL);
        audio.play().catch((e) =>
          console.error("AI 응답 음성 재생 실패:", e)
        );
        return;
      }

      const text = event.data.toString();
      console.log("AI 응답 텍스트:", text);

      // 화면에는 AI 말풍선으로 추가
      setChatMessages((prev) => [...prev, { speaker: "ai", text }]);
    };

    ws.onerror = (e) => {
      console.error("대화 WebSocket 에러:", e);
      setConversationError("대화 WebSocket 연결에 문제가 발생했습니다.");
    };

    ws.onclose = () => {
      console.log("대화 WebSocket 연결 종료");
      setIsConversationActive(false);
      conversationWsRef.current = null;
    };
  };

  // (2) 대화 종료
  const endConversation = () => {
    const ws = conversationWsRef.current;
    if (!ws) return;
    try {
      // 명세서: "end" 를 보내면 서버가 대화 종료 처리
      ws.send("end");
    } catch (e) {
      console.error("대화 종료 전송 에러:", e);
    }
    ws.close();
  };

  // (3) 버튼으로 토글
  const handleToggleConversation = () => {
    if (isConversationActive) {
      endConversation();
    } else {
      startConversation();
    }
  };

  // (4) 사용자가 텍스트 전송
  const handleSendText = () => {
    const text = userInput.trim();
    if (!text) return;

    const ws = conversationWsRef.current;
    if (!ws || !isConversationActive) {
      alert("먼저 실시간 대화를 시작해주세요.");
      return;
    }

    // 명세서: 프론트에서 텍스트를 보내면
    // 서버가 TTS로 변환하여 기기로 전달
    ws.send(text);

    // 화면에는 "user" 말풍선으로 추가
    setChatMessages((prev) => [...prev, { speaker: "user", text }]);
    setUserInput("");
  };

  // Enter 전송 (Shift+Enter 는 줄바꿈)
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // 언마운트 시 대화 소켓 정리
  useEffect(() => {
    return () => {
      if (conversationWsRef.current) {
        try {
          conversationWsRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // ======================
  // UI 렌더링
  // ======================
  return (
    <div className="device-view-container">
      {/* 헤더 */}
      <header className="device-view-header">
        <Link to="/" className="back-button">
          {"<"}
        </Link>
        <h1 className="device-title">{titleText}</h1>
        <span className="logo">ALERTO</span>
      </header>

      {/* 실시간 영상 영역 */}
      <div className="video-feed-wrapper">
        {videoWsError ? (
          <div className="video-feed error-feed">
            <p>{videoWsError}</p>
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

        {videoSrc && !videoWsError && (
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
        {chatMessages.map((chat, idx) => {
          // 방문자 → 왼쪽, 나/AI → 오른쪽 정렬
          const sideClass =
            chat.speaker === "visitor" ? "visitor" : "ai";

          return (
            <div
              key={idx}
              className={`chat-bubble-wrapper ${sideClass}`}
            >
              {chat.speaker === "visitor" && (
                <span className="chat-label">방문자</span>
              )}
              {chat.speaker === "ai" && (
                <span className="chat-label">AI 초인종</span>
              )}
              {chat.speaker === "user" && (
                <span className="chat-label">사용자</span>
              )}
              <div className="chat-bubble">{chat.text}</div>
            </div>
          );
        })}

        {conversationError && (
          <p className="chat-error-text">{conversationError}</p>
        )}
      </div>

      {/* 하단 입력 / 버튼 영역 */}
      <div className="action-area">
        {isConversationActive ? (
          <>
            {/* 대화 중일 때만 입력창 + >> 버튼 표시 */}
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
