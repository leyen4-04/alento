import React, { useState, useEffect, useContext } from "react";

import BottomNav from "../components/layout/BottomNav";
import { UserContext } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../api/client";


function ProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const { refreshUser } = useContext(UserContext);
  const { logout } = useAuth();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<any>("/users/me");
        setUserInfo(data);
        setEditName(data.full_name || "");
        setEditMemo(data.memo || "");
      } catch (err) {
        console.error("유저 정보 로딩 실패:", err);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const saveUserInfo = async () => {
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: editName,
          memo: editMemo,
        }),
      });

      alert("저장되었습니다!");
      await refreshUser();
    } catch (err: any) {
      alert(err.message || "저장 실패");
    }
  };

  if (loading) return <div className="manage-container">로딩 중...</div>;
  if (!userInfo)
    return <div className="manage-container">로그인이 필요합니다.</div>;

  return (
    <div className="manage-container">
      <header className="manage-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">
          {userInfo?.full_name ? `${userInfo.full_name} 님` : ""}
        </h1>
      </header>

      <section className="edit-card glass-v2">
  <div className="edit-head">
    <div className="edit-badge">✦</div>
    <div>
      <h2 className="edit-title">내 정보 수정</h2>
      <p className="edit-sub">이름과 메모를 바꿀 수 있어요</p>
    </div>
  </div>

  <div className="edit-form">
    <label className="edit-label">이름</label>
    <input
      className="edit-input"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="이름을 입력하세요"
    />

    <label className="edit-label">메모</label>
    <textarea
      className="edit-textarea"
      value={editMemo}
      onChange={(e) => setEditMemo(e.target.value)}
      placeholder="메모를 입력하세요"
      rows={4}
    />
  </div>

  <div className="edit-actions">
    <button className="btn-v2 primary" onClick={saveUserInfo}>
      저장
    </button>
    <button className="btn-v2 neutral" onClick={logout}>
      로그아웃
    </button>
  </div>
</section>


      <BottomNav />
    </div>
  );
}

export default ProfilePage;
