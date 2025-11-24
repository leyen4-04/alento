import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ✅ page 폴더 기준 한 단계 위로
import BottomNav from "../components/layout/BottomNav";
import "../style/HistoryPage.css";
import { apiRequest } from "../api/client";
import { Visit, Device } from "../types";

function HistoryPage() {
  const [history, setHistory] = useState<Visit[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitData, deviceData] = await Promise.all([
        apiRequest<Visit[]>("/visits/?skip=0&limit=100"),
        apiRequest<Device[]>("/devices/me"),
      ]);
      setHistory(visitData);
      setDevices(deviceData);
    } catch (e: any) {
      setError(e.message || "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteVisit = async (e: React.MouseEvent, visitId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("이 방문 기록을 삭제하시겠습니까?")) return;

    try {
      await apiRequest(`/visits/${visitId}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((v) => v.id !== visitId));
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    }
  };

  const deviceMap: Record<number, Device> = {};
  devices.forEach((d) => {
    deviceMap[d.id] = d;
  });

  // ✅ 버그 수정된 정렬
  const sortedVisits = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sortedVisits.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const currentPageVisits = sortedVisits.slice(startIdx, startIdx + pageSize);

  if (loading)
    return (
      <div className="history-container">
        <p className="history-empty-text">로딩 중.</p>
        <BottomNav />
      </div>
    );
  if (error)
    return (
      <div className="history-container">
        <p className="history-empty-text">{error}</p>
        <BottomNav />
      </div>
    );

  return (
    <div className="history-container">
      <header className="history-header">
        <h1 className="history-logo">ALERTO</h1>
        <h2 className="history-title">지난 대화 목록</h2>
        <p className="history-tip">* 모든 녹화는 30일 까지 기록됩니다 *</p>
      </header>

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
                  to={`/device/${visit.device_id}?visitId=${visit.id}`}
                  className="history-item-link"
                >
                  <article className="history-item">
                    <div className="history-item-header">
                      <span className="history-device-name">{deviceName}</span>

                      <button
                        onClick={(e) => deleteVisit(e, visit.id)}
                        aria-label="삭제"
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#ff5c5c",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <p className="history-summary">
                      {visit.summary || "대화 요약 정보가 없습니다."}
                    </p>

                    {visit.visitor_video_url && (
                      <div
                        className="history-video-wrapper"
                        style={{ marginTop: "12px", marginBottom: "8px" }}
                      >
                        <video
                          width="100%"
                          controls
                          muted
                          autoPlay
                          preload="metadata"
                          style={{
                            borderRadius: "8px",
                            backgroundColor: "#000",
                            display: "block",
                            pointerEvents: "none",
                          }}
                        >
                          <source
                            src={visit.visitor_video_url}
                            type="video/mp4"
                          />
                          브라우저가 비디오 태그를 지원하지 않습니다.
                        </video>
                      </div>
                    )}

                    <p className="history-time">방문 시간 · {dateText}</p>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

       {sortedVisits.length > pageSize && (
  <div className="pagination">
    {(() => {
      const groupSize = 5;
      const currentGroupStart =
        Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
      const currentGroupEnd = Math.min(
        currentGroupStart + groupSize - 1,
        totalPages
      );

      const pages = Array.from(
        { length: currentGroupEnd - currentGroupStart + 1 },
        (_, i) => currentGroupStart + i
      );

      const hasPrevGroup = currentGroupStart > 1;
      const hasNextGroup = currentGroupEnd < totalPages;

      return (
        <>
          {/* 이전 묶음 (<) 필요하면 같이 넣음 */}
          {hasPrevGroup && (
            <span
              className="page-num arrow"
              onClick={() => setCurrentPage(currentGroupStart - 1)}
            >
              {"<"}
            </span>
          )}

          {/* 현재 묶음 5개 */}
          {pages.map((p) => (
            <span
              key={p}
              className={p === currentPage ? "page-num active" : "page-num"}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </span>
          ))}

          {/* 다음 묶음 (>) */}
          {hasNextGroup && (
            <span
              className="page-num arrow"
              onClick={() => setCurrentPage(currentGroupEnd + 1)}
            >
              {">"}
            </span>
          )}
        </>
      );
    })()}
  </div>
)}

      </main>

      <BottomNav />
    </div>
  );
}

export default HistoryPage;
