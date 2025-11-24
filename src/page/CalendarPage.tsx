import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; // ✅ Link 추가

import BottomNav from "../components/layout/BottomNav";
import "../style/CalendarPage.css";
import { apiRequest } from "../api/client";
import { Appointment, Visit } from "../types"; // ✅ Visit 타입 추가

// 연/월/일 구조체
interface YMD {
  year: number;
  month: number;
  day: number;
}

// 캘린더 생성 함수
function generateCalendar(year: number, month: number) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const start = new Date(firstOfMonth);
  const dayOfWeek = firstOfMonth.getDay();
  start.setDate(firstOfMonth.getDate() - dayOfWeek);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      date: d,
      isCurrentMonth: d.getMonth() === month - 1,
    });
  }
  return cells;
}

function CalendarPage() {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const now = new Date();

  const [currentMonthInfo, setCurrentMonthInfo] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const [selectedDate, setSelectedDate] = useState<YMD | null>(null);

  // ✅ 상태 관리: 일정(Appointment) + 방문기록(Visit)
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  // 입력 상태
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [saving, setSaving] = useState(false);

  // 상세 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const currentYear = currentMonthInfo.year;
  const currentMonth = currentMonthInfo.month;

  const calendarCells = useMemo(
    () => generateCalendar(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // ✅ 데이터 통합 로딩 (일정 + 방문기록)
  const fetchData = async () => {
    try {
      // 두 API를 병렬로 호출
      const [apptData, visitData] = await Promise.all([
        apiRequest<Appointment[]>("/appointments/"),
        apiRequest<Visit[]>("/visits/?skip=0&limit=100"), // 필요한 만큼 limit 설정
      ]);
      setAppointments(apptData);
      setVisits(visitData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ 날짜에 '일정'이나 '방문'이 있는지 체크용 Set
  const eventDateSet = useMemo(() => {
    const set = new Set<string>();

    // 1. 일정 날짜 추가
    appointments.forEach((appt) => {
      const d = new Date(appt.start_time);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      set.add(key);
    });

    // 2. 방문 기록 날짜 추가
    visits.forEach((visit) => {
      const d = new Date(visit.created_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      set.add(key);
    });

    return set;
  }, [appointments, visits]);

  // ✅ 선택된 날짜의 '방문 기록' 필터링
  const filteredVisits = useMemo(() => {
    if (!selectedDate) return [];

    return visits.filter((visit) => {
      const d = new Date(visit.created_at);
      return (
        d.getFullYear() === selectedDate.year &&
        d.getMonth() + 1 === selectedDate.month &&
        d.getDate() === selectedDate.day
      );
    });
  }, [visits, selectedDate]);

  // ✅ 선택된 날짜의 '일정' 필터링
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const d = new Date(appt.start_time);
      if (selectedDate) {
        return (
          d.getFullYear() === selectedDate.year &&
          d.getMonth() + 1 === selectedDate.month &&
          d.getDate() === selectedDate.day
        );
      }
      // 날짜 선택 안 됨 -> 이번 달 전체
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });
  }, [appointments, currentYear, currentMonth, selectedDate]);

  // 일정 추가 핸들러
  const handleAddAppointment = async () => {
    if (!newTitle.trim() || !newTime) return alert("제목과 시간을 입력해주세요.");

    const year = selectedDate?.year ?? currentYear;
    const month = selectedDate?.month ?? currentMonth;
    const day = selectedDate?.day ?? now.getDate();
    const [hh, mm] = newTime.split(":").map(Number);

    const start = new Date(year, month - 1, day, hh, mm);
    const end = new Date(start.getTime() + 30 * 60000); // 기본 30분 일정

    try {
      setSaving(true);
      await apiRequest("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      alert("일정이 등록되었습니다.");
      setNewTitle("");
      setNewTime("");
      fetchData(); // 목록 갱신
    } catch (err: any) {
      alert(err.message || "일정 등록 실패");
    } finally {
      setSaving(false);
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteAppointment = async () => {
    if (!selectedAppt) return;
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;

    try {
      await apiRequest(`/appointments/${selectedAppt.id}`, {
        method: "DELETE",
      });
      alert("삭제되었습니다.");
      setDetailModalOpen(false);
      setSelectedAppt(null);
      fetchData(); // 목록 갱신
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    }
  };

  // 달 이동 핸들러
  const goPrevMonth = () => {
    setSelectedDate(null);
    setCurrentMonthInfo((prev) =>
      prev.month === 1
        ? { year: prev.year - 1, month: 12 }
        : { year: prev.year, month: prev.month - 1 }
    );
  };

  const goNextMonth = () => {
    setSelectedDate(null);
    setCurrentMonthInfo((prev) =>
      prev.month === 12
        ? { year: prev.year + 1, month: 1 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  };

  const openDetailModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setDetailModalOpen(true);
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <span className="logo">ALERTO</span>

        <div className="month-nav">
          <button className="nav-arrow" onClick={goPrevMonth}>
            {"<"}
          </button>
          <span className="current-month">
            {currentYear}년 {currentMonth}월
          </span>
          <button className="nav-arrow" onClick={goNextMonth}>
            {">"}
          </button>
        </div>
      </header>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {daysOfWeek.map((d) => (
            <div key={d} className="weekday-cell">
              {d}
            </div>
          ))}
        </div>

        <div className="calendar-dates">
          {calendarCells.map((cell, idx) => {
            const day = cell.date.getDate();
            const dateKey = `${cell.date.getFullYear()}-${
              cell.date.getMonth() + 1
            }-${cell.date.getDate()}`;

            // ✅ 일정이나 방문 기록이 있으면 빨간 점 표시
            const hasEvent = eventDateSet.has(dateKey);

            const isSelected =
              selectedDate &&
              selectedDate.year === cell.date.getFullYear() &&
              selectedDate.month === cell.date.getMonth() + 1 &&
              selectedDate.day === day;

            return (
              <div
                key={idx}
                className={`date-cell ${
                  !cell.isCurrentMonth ? "other-month" : ""
                } ${hasEvent ? "has-event" : ""}`}
                onClick={() => handleDateClick(cell.date)}
              >
                <span
                  className={isSelected ? "date-number selected" : "date-number"}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ⭐ 하단 스케줄 섹션 */}
      <section className="schedule-section">
        <h2 className="schedule-title">
          {selectedDate
            ? `${selectedDate.month}월 ${selectedDate.day}일 기록`
            : "날짜를 선택해주세요"}
        </h2>

        {/* 1. 방문 기록(녹화 영상) 리스트 표시 */}
        {selectedDate && (
          <div className="visit-list-section" style={{ marginBottom: "20px" }}>
            <h3 className="schedule-subtitle" style={{ color: "#d9534f" }}>
              🚨 감지된 영상 기록
            </h3>
            {filteredVisits.length === 0 ? (
              <p className="schedule-description">저장된 영상이 없습니다.</p>
            ) : (
              <ul className="appointment-list">
                {filteredVisits.map((visit) => {
                  const d = new Date(visit.created_at);
                  const timeStr = `${String(d.getHours()).padStart(
                    2,
                    "0"
                  )}:${String(d.getMinutes()).padStart(2, "0")}`;

                  // ✅ 클릭 시 DeviceViewPage(기록 모드)로 이동
                  return (
                    <li key={visit.id} className="appointment-item">
                      <Link
                        to={`/device/${visit.device_id}?visitId=${visit.id}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div className="appointment-main">
                          <span className="appointment-title">방문자 감지</span>
                          <span className="appointment-datetime">{timeStr}</span>
                        </div>
                        <span
                          className="appointment-status"
                          style={{ color: "#007bff", fontSize: "0.9rem" }}
                        >
                          영상 보기 &gt;
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }} />

        {/* 2. 기존 일정(Appointment) 리스트 표시 */}
        <div className="appointment-list-section">
          <h3 className="schedule-subtitle">📅 나의 일정</h3>
          {filteredAppointments.length === 0 ? (
            <p className="schedule-description">등록된 일정이 없습니다.</p>
          ) : (
            <ul className="appointment-list">
              {filteredAppointments.map((appt) => {
                const d = new Date(appt.start_time);
                const hh = String(d.getHours()).padStart(2, "0");
                const mm = String(d.getMinutes()).padStart(2, "0");

                return (
                  <li
                    key={appt.id}
                    className="appointment-item"
                    onClick={() => openDetailModal(appt)}
                  >
                    <div className="appointment-main">
                      <span className="appointment-title">{appt.title}</span>
                      <span className="appointment-datetime">
                        {hh}:{mm}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 일정 추가 입력창 */}
        <div className="schedule-add-box">
          <h3 className="schedule-subtitle">새 일정 추가</h3>

          <input
            className="schedule-input"
            placeholder="일정 제목"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <input
            type="time"
            className="schedule-input"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />

          <button
            className="schedule-add-button"
            onClick={handleAddAppointment}
            disabled={saving}
          >
            {saving ? "등록중..." : "일정 등록"}
          </button>
        </div>
      </section>

      <BottomNav />

      {/* 일정 상세/삭제 모달 */}
      {detailModalOpen && selectedAppt && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">일정 상세</h3>
            <p>
              <strong>제목:</strong> {selectedAppt.title}
            </p>
            <p>
              <strong>시간:</strong>{" "}
              {new Date(selectedAppt.start_time).toLocaleString()}
            </p>

            <div className="modal-buttons" style={{ marginTop: "20px" }}>
              <button
                className="modal-cancel"
                onClick={() => setDetailModalOpen(false)}
              >
                닫기
              </button>

              <button
                className="modal-save"
                style={{ backgroundColor: "#ff4d4d" }}
                onClick={handleDeleteAppointment}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;