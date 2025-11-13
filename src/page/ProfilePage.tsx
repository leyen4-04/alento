import React, { useState, useEffect, useContext } from "react";
import BottomNav from "../components/layout/BottomNav";

// ⭐ NEW: UserContext 불러오기
import { UserContext } from "../contexts/UserContext";

function ProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const BASE_URL = process.env.REACT_APP_API_URL;

  // ⭐ NEW: 전역 사용자 상태 함수 가져오기
  const { refreshUser } = useContext(UserContext);

  // 사용자 정보 불러오기
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserInfo(data);
          setEditName(data.full_name || "");
          setEditMemo(data.memo || "");
        }
      } catch (err) {
        console.error("유저 정보 로딩 실패:", err);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // 정보 저장
  const saveUserInfo = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("로그인이 필요합니다.");

    const res = await fetch(`${BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: editName,
        memo: editMemo,
      }),
    });

    if (res.ok) {
      alert("저장되었습니다!");

      // ⭐ NEW: 저장 후 전역 사용자 정보 새로고침 (자동 반영!)
      await refreshUser();
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
      </section>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;
