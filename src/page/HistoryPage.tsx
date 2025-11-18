// src/page/HistoryPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import "../style/HistoryPage.css";

const BASE_URL = process.env.REACT_APP_API_URL;

interface Visit {
  id: number;
  summary: string;
  device_id: number;
  visitor_photo_url?: string | null;
  visitor_audio_url?: string | null;
  ai_response_audio_url?: string | null;
  created_at: string;
}

interface Device {
  id: number;
  name: string;
  device_uid: string;
  memo?: string | null;
}

function HistoryPage() {
  const [history, setHistory] = useState<Visit[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token || !BASE_URL) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [visitRes, deviceRes] = await Promise.all([
          fetch(`${BASE_URL}/visits/?skip=0&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/devices/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!visitRes.ok || !deviceRes.ok) {
          throw new Error("API 요청 실패");
        }

        const visitData = await visitRes.json();
        const deviceData = await deviceRes.json();

        setHistory(visitData);
        setDevices(deviceData);
      } catch (e) {
        console.error(e);
        setError("방문 기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // device_id → Device 매핑
  const deviceMap: Record<number, Device> = {};
  devices.forEach((d) => {
    deviceMap[d.id] = d;
  });

  // device_id별 가장 최신 방문 기록
  const latestVisitByDevice: Record<number, Visit> = {};
  history.forEach((v) => {
    const prev = latestVisitByDevice[v.device_id];
    if (!prev || new Date(v.created_at) > new Date(prev.created_at)) {
      latestVisitByDevice[v.device_id] = v;
    }
  });

  // 상태 라벨: 진행중 / 지난 대화
  const getStatusLabel = (visit: Visit) => {
    const latest = latestVisitByDevice[visit.device_id];
    if (!latest || latest.id !== visit.id) return "지난 대화";

    const created = new Date(visit.created_at).getTime();
    const diffMinutes = (Date.now() - created) / 60000;
    return diffMinutes < 3 ? "진행중" : "지난 대화";
  };

  // 최신순 정렬
  const sortedVisits = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 페이지 계산
  const totalPages = Math.max(1, Math.ceil(sortedVisits.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const currentPageVisits = sortedVisits.slice(startIdx, startIdx + pageSize);

  // 전체 개수가 줄어들었을 때 현재 페이지 보정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="history-container">
        <header className="history-header">
          <h1 className="history-logo">ALERTO</h1>
          <h2 className="history-title">지난 대화 목록</h2>
          <p className="history-tip">* 모든 녹화는 30일 까지 기록됩니다 *</p>
        </header>
        <p className="history-empty-text">불러오는 중...</p>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <header className="history-header">
          <h1 className="history-logo">ALERTO</h1>
          <h2 className="history-title">지난 대화 목록</h2>
          <p className="history-tip">* 모든 녹화는 30일 까지 기록됩니다 *</p>
        </header>
        <p className="history-empty-text">{error}</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* 1. 헤더 */}
      <header className="history-header">
        <h1 className="history-logo">ALERTO</h1>
        <h2 className="history-title">지난 대화 목록</h2>
        <p className="history-tip">* 모든 녹화는 30일 까지 기록됩니다 *</p>
      </header>

      {/* 2. 리스트 */}
      <main className="history-main">
        {sortedVisits.length === 0 ? (
          <p className="history-empty-text">지난 방문 기록이 없습니다.</p>
        ) : (
          <div className="history-list">
            {currentPageVisits.map((visit) => {
              const device = deviceMap[visit.device_id];
              const deviceName = device
                ? device.name
                : `기기 ${visit.device_id}`;
              const statusLabel = getStatusLabel(visit);

              const created = new Date(visit.created_at);
              const dateText = `${created.getFullYear()}-${String(
                created.getMonth() + 1
              ).padStart(2, "0")}-${String(created.getDate()).padStart(
                2,
                "0"
              )} ${String(created.getHours()).padStart(2, "0")}:${String(
                created.getMinutes()
              ).padStart(2, "0")}`;

              return (
                <Link
                  key={visit.id}
                  // 🔥 visitId 같이 넘겨주기
                  to={`/device/${visit.device_id}?visitId=${visit.id}`}
                  className="history-item-link"
                >
                  <article className="history-item">
                    <div className="history-item-header">
                      <span className="history-device-name">{deviceName}</span>
                      <span
                        className={
                          statusLabel === "진행중"
                            ? "history-status active"
                            : "history-status"
                        }
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <p className="history-summary">
                      {visit.summary
                        ? visit.summary
                        : "대화 요약 정보가 없습니다."}
                    </p>

                    <p className="history-time">방문 시간 · {dateText}</p>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* 3. 페이지네이션 */}
        {sortedVisits.length > pageSize && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, idx) => {
              const page = idx + 1;
              return (
                <span
                  key={page}
                  className={page === currentPage ? "page-num active" : "page-num"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </span>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default HistoryPage;
