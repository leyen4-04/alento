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

      <section className="manage-section">
        <h2 className="section-title">내 정보 수정</h2>

        <label className="edit-label">이름</label>
        <input
          className="modal-input"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />

        <label className="edit-label">메모</label>
        <textarea
          className="modal-textarea"
          rows={4}
          value={editMemo}
          onChange={(e) => setEditMemo(e.target.value)}
        />

        <button className="modal-save" onClick={saveUserInfo}>
          저장
        </button>

        <button
          onClick={logout}
          className="modal-save"
          style={{ backgroundColor: "#ff4d4d", marginTop: "15px" }}
        >
          로그아웃
        </button>
      </section>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;
