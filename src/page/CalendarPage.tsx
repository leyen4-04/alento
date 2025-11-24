import React, { useState, useEffect, useMemo } from "react";

import BottomNav from "../components/layout/BottomNav";
import "../style/CalendarPage.css";
import { apiRequest } from "../api/client";
import { Appointment } from "../types";


// 연/월/일 구조체
interface YMD {
  year: number;
  month: number;
  day: number;
}

// 캘린더 생성
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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

  // ⭐ 일정이 있는 날짜들을 Set으로 저장
  const appointmentDateSet = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((appt) => {
      const d = new Date(appt.start_time);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      set.add(dateKey);
    });
    return set;
  }, [appointments]);

  // 일정 불러오기
  const fetchAppointments = async () => {
    try {
      const data = await apiRequest<Appointment[]>("/appointments/");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 일정 추가
  const handleAddAppointment = async () => {
    if (!newTitle.trim() || !newTime)
      return alert("제목과 시간을 입력해주세요.");

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
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "일정 등록 실패");
    } finally {
      setSaving(false);
    }
  };

  // 일정 삭제
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
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    }
  };

  // 달 이동
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

  // 현재 달 & 선택 날짜 필터링
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const d = new Date(appt.start_time);
      if (d.getFullYear() !== currentYear || d.getMonth() + 1 !== currentMonth)
        return false;

      if (selectedDate) return d.getDate() === selectedDate.day;
      return true;
    });
  }, [appointments, currentYear, currentMonth, selectedDate]);

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

            const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth() + 1}-${cell.date.getDate()}`;
            const hasEvent = appointmentDateSet.has(dateKey); // ⭐ 일정 있는 날짜인지 체크

            const isSelected =
              selectedDate &&
              selectedDate.year === cell.date.getFullYear() &&
              selectedDate.month === cell.date.getMonth() + 1 &&
              selectedDate.day === day;

            return (
              <div
                key={idx}
                className={`date-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${
                  hasEvent ? "has-event" : ""   // ⭐ 빨강 표시용 class 추가
                }`}
                onClick={() => handleDateClick(cell.date)}
              >
                <span
                  className={
                    isSelected ? "date-number selected" : "date-number"
                  }
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="schedule-section">
        <h2 className="schedule-title">
          {selectedDate
            ? `${selectedDate.month}월 ${selectedDate.day}일 일정`
            : "이달의 일정"}
        </h2>

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
                      {d.getMonth() + 1}/{d.getDate()} {hh}:{mm}
                    </span>
                  </div>
                  <span className="appointment-status">{appt.status}</span>
                </li>
              );
            })}
          </ul>
        )}

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
