import React from "react";
import BottomNav from "../components/layout/BottomNav";
import "../style/ManagePage.css"; // UserInfoPage가 manage 스타일을 쓰고 있어서 유지
import { useAuth } from "../contexts/AuthContext";

function UserInfoPage() {
  const { user, logout, token } = useAuth();

  // ✅ AuthContext 기준으로 로그인 판정
  if (!token) {
    return <div className="manage-container">로그인이 필요합니다.</div>;
  }

  // 토큰은 있는데 user가 아직 로딩중일 수도 있으니 로딩 표시
  if (!user) {
    return <div className="manage-container">로딩 중...</div>;
  }

  return (
    <div className="manage-container">
      <header className="manage-header">
        <span className="logo">ALERTO</span>

        <h1 className="user-greeting">
          {user.full_name} 님
        </h1>
      </header>

      <section className="manage-section">
        <h2 className="section-title">내 정보</h2>

        <p><strong>이메일:</strong> {user.email}</p>
        <p><strong>이름:</strong> {user.full_name}</p>

        <p><strong>메모:</strong></p>
        <p>{user.memo || "메모 없음"}</p>

        <button
          className="modal-save"
          style={{
            marginTop: "20px",
            backgroundColor: "#007bff",
          }}
          onClick={() => {
            window.location.href = "/profile";
          }}
        >
          정보 수정하기
        </button>

        <button
          className="modal-save"
          style={{
            marginTop: "15px",
            backgroundColor: "#ff4d4d",
          }}
          onClick={logout}
        >
          로그아웃
        </button>
      </section>

      <BottomNav />
    </div>
  );
}

export default UserInfoPage;
