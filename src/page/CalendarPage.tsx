// src/page/CalendarPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import BottomNav from "../components/layout/BottomNav";
import "../style/CalendarPage.css";

const BASE_URL = process.env.REACT_APP_API_URL || "";

// 일정 타입 (백엔드 명세 기준)
interface Appointment {
  id: number;
  title: string;
  start_time: string;
  end_time: string | null;
  status: string;
  user_id: number;
  visit_id: number | null;
}

// 캘린더 한 칸 정보
interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

// 연/월/일 구조체
interface YMD {
  year: number;
  month: number; // 1~12
  day: number;
}

// year, month(1~12)를 받아서 6주(42칸)짜리 캘린더 생성
function generateCalendar(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month - 1, 1); // 이번 달 1일
  const start = new Date(firstOfMonth);
  const dayOfWeek = firstOfMonth.getDay(); // 0(일) ~ 6(토)

  // 이번 달 1일이 포함된 주의 일요일로 이동
  start.setDate(firstOfMonth.getDate() - dayOfWeek);

  const cells: CalendarCell[] = [];
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

  // 1) 현재 보고 있는 연/월 (기본: 오늘 기준)
  const now = new Date();
  const [currentMonthInfo, setCurrentMonthInfo] = useState<{
    year: number;
    month: number; // 1~12
  }>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const currentYear = currentMonthInfo.year;
  const currentMonth = currentMonthInfo.month;

  // 2) 선택된 날짜
  const [selectedDate, setSelectedDate] = useState<YMD | null>(null);

  // 3) 일정 목록
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4) 새 일정 추가용 입력값
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState(""); // "HH:MM"
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 현재 월의 캘린더 셀들
  const calendarCells = useMemo(
    () => generateCalendar(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // ───────────────────
  // 일정 목록 불러오기 (GET /appointments/)
  // ───────────────────
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("일정 조회를 위해 로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/appointments/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: Appointment[] = await response.json();
          setAppointments(data);
        } else {
          setError("일정 데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ───────────────────
  // 월 변경 (< / >)
  // ───────────────────
  const goPrevMonth = () => {
    setSelectedDate(null);
    setCurrentMonthInfo(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
    );
  };

  const goNextMonth = () => {
    setSelectedDate(null);
    setCurrentMonthInfo(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
    );
  };

  // ───────────────────
  // 날짜 클릭
  // ───────────────────
  const handleDateClick = (cellDate: Date) => {
    setSelectedDate({
      year: cellDate.getFullYear(),
      month: cellDate.getMonth() + 1,
      day: cellDate.getDate(),
    });
  };

  // ───────────────────
  // 현재 월 일정 + 선택된 날짜 일정 필터링
  // ───────────────────
  const appointmentsThisMonth = appointments.filter((appt) => {
    const d = new Date(appt.start_time);
    return (
      d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
    );
  });

  const filteredAppointments =
    selectedDate === null
      ? appointmentsThisMonth
      : appointmentsThisMonth.filter((appt) => {
          const d = new Date(appt.start_time);
          return (
            d.getFullYear() === selectedDate.year &&
            d.getMonth() + 1 === selectedDate.month &&
            d.getDate() === selectedDate.day
          );
        });

  // ───────────────────
  // 새 일정 추가 (POST /appointments/)
  // ───────────────────
  const handleAddAppointment = async () => {
    setSaveError(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if (!newTitle.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    if (!newTime) {
      alert("시간을 선택해주세요.");
      return;
    }

    // 날짜: 선택된 날짜가 있으면 그걸 쓰고, 없으면 현재 보고 있는 월의 오늘 날짜 사용
    const base = new Date();
    const year = selectedDate?.year ?? currentYear ?? base.getFullYear();
    const month = selectedDate?.month ?? currentMonth ?? base.getMonth() + 1;
    const day =
      selectedDate?.day ??
      (base.getMonth() + 1 === month ? base.getDate() : 1);

    const [hh, mm] = newTime.split(":").map(Number);
    const start = new Date(year, month - 1, day, hh, mm);

    const payload = {
      title: newTitle,
      start_time: start.toISOString(),
      end_time: null,
      status: "SCHEDULED",
      visit_id: null,
    };

    try {
      setSaving(true);

      const res = await fetch(`${BASE_URL}/appointments/`, {
        method: "POST", // ⚠ 서버에 POST /appointments/가 있어야 함
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setSaveError(errData?.detail || "일정 등록에 실패했습니다.");
        return;
      }

      const created: Appointment = await res.json();

      // 리스트에 바로 반영
      setAppointments((prev) => [created, ...prev]);

      setNewTitle("");
      setNewTime("");
      alert("일정이 등록되었습니다!");
    } catch (e) {
      console.error(e);
      setSaveError("일정 등록 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────
  // 렌더링
  // ───────────────────
  return (
    <div className="calendar-container">
      {/* 1. 헤더 */}
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

      {/* 2. 캘린더 그리드 */}
      <div className="calendar-grid">
        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {daysOfWeek.map((day) => (
            <div key={day} className="weekday-cell">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="calendar-dates">
          {calendarCells.map((cell, index) => {
            const y = cell.date.getFullYear();
            const m = cell.date.getMonth() + 1;
            const d = cell.date.getDate();

            const isSelected =
              selectedDate &&
              selectedDate.year === y &&
              selectedDate.month === m &&
              selectedDate.day === d;

            const extraClass = cell.isCurrentMonth ? "" : " other-month";

            return (
              <div
                key={index}
                className={`date-cell${extraClass}`}
                onClick={() => handleDateClick(cell.date)}
              >
                <span
                  className={isSelected ? "date-number selected" : "date-number"}
                >
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 일정 섹션 */}
      <section className="schedule-section">
        <h2 className="schedule-title">
          일정
          {selectedDate && (
            <span style={{ fontSize: "0.85rem", marginLeft: "8px" }}>
              ({selectedDate.month}월 {selectedDate.day}일)
            </span>
          )}
        </h2>

        {loading && (
          <p className="schedule-description">일정을 불러오는 중...</p>
        )}
        {error && <p className="schedule-description">{error}</p>}

        {!loading && !error && filteredAppointments.length === 0 && (
          <p className="schedule-description">
            {selectedDate
              ? "해당 날짜에 등록된 일정이 없습니다."
              : "이 달에는 등록된 일정이 없습니다."}
          </p>
        )}

        {!loading && !error && filteredAppointments.length > 0 && (
          <ul className="appointment-list">
            {filteredAppointments.map((appt) => {
              const d = new Date(appt.start_time);
              const dateText = `${d.getMonth() + 1}월 ${d.getDate()}일`;
              const timeText = `${d.getHours()}시 ${String(
                d.getMinutes()
              ).padStart(2, "0")}분`;

              return (
                <li key={appt.id} className="appointment-item">
                  <div className="appointment-main">
                    <span className="appointment-title">{appt.title}</span>
                    <span className="appointment-datetime">
                      {dateText} {timeText}
                    </span>
                  </div>
                  <span className="appointment-status">
                    {appt.status || "SCHEDULED"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {/* 4. 새 일정 추가 폼 */}
        <div className="schedule-add-box">
          <h3 className="schedule-subtitle">새 일정 추가</h3>

          <label className="schedule-label">제목</label>
          <input
            className="schedule-input"
            placeholder="예: 가스 점검 방문"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <label className="schedule-label">시간</label>
          <input
            type="time"
            className="schedule-input"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />

          {saveError && (
            <p className="schedule-description" style={{ color: "red" }}>
              {saveError}
            </p>
          )}

          <button
            className="schedule-add-button"
            onClick={handleAddAppointment}
            disabled={saving}
          >
            {saving ? "등록 중..." : "일정 등록"}
          </button>

          <p className="schedule-description small">
            📌 먼저 날짜를 클릭하면 그 날짜로 일정이 등록됩니다.
            <br />
            날짜를 선택하지 않으면, 현재 보고 있는 달 기준으로 자동 설정돼요.
          </p>
        </div>
      </section>

      {/* 5. 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default CalendarPage;
