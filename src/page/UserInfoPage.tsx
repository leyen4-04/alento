import React from "react";
import BottomNav from "../components/layout/BottomNav";
import "../style/ManagePage.css"; // 기존 유지
import "../style/UserInfoPage.css"; // ✅ 새로 추가할 CSS
import { useAuth } from "../contexts/AuthContext";

function UserInfoPage() {
  const { user, logout, token } = useAuth();

  if (!token) {
    return <div className="manage-container">로그인이 필요합니다.</div>;
  }

  if (!user) {
    return <div className="manage-container">로딩 중...</div>;
  }

  return (
    <div className="manage-container userinfo-bg">
      <header className="manage-header userinfo-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">{user.full_name} 님</h1>
      </header>

      {/* ✅ Apple / Glassmorphism 카드 */}
      <div className="profile-shell">
        <section className="profile-card glass">
          {/* 상단 프로필 헤더 */}
          <div className="profile-header">
            <div className="avatar">
              {user.full_name?.[0] ?? "U"}
            </div>
            <div className="profile-title">
              <h2>내 정보</h2>
              <p className="profile-sub">계정 및 기본 설정</p>
            </div>
          </div>

          {/* 정보 리스트 */}
          <div className="info-list">
            <div className="info-row">
              <span className="label">이메일</span>
              <span className="value">{user.email}</span>
            </div>

            <div className="divider" />

            <div className="info-row">
              <span className="label">이름</span>
              <span className="value">{user.full_name}</span>
            </div>

            <div className="divider" />

            <div className="info-row memo-row">
              <span className="label">메모</span>
              <span className="value muted">
                {user.memo?.trim() ? user.memo : "메모 없음"}
              </span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/profile")}
            >
              정보 수정
            </button>

            <button className="btn btn-ghost" onClick={logout}>
              로그아웃
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

export default UserInfoPage;
