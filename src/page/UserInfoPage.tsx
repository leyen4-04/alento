import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";


function UserInfoPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_URL;

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
        }
      } catch (err) {
        console.error("유저 정보 로딩 실패:", err);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return <div className="manage-container">로딩 중...</div>;
  if (!userInfo) return <div className="manage-container">로그인이 필요합니다.</div>;

  return (
    <div className="manage-container">
      <header className="manage-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">{userInfo.full_name} 님</h1>
      </header>

      <section className="manage-section">
        <h2 className="section-title">내 정보</h2>

        <div className="info-box">
          <p><strong>이메일:</strong> {userInfo.email}</p>
          <p><strong>이름:</strong> {userInfo.full_name}</p>
          <p><strong>메모:</strong></p>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {userInfo.memo || "메모 없음"}
          </pre>
        </div>

        {/* 수정 페이지로 이동 */}
        <Link to="/profile" className="modal-save" style={{ textAlign: "center" }}>
          정보 수정하기
        </Link>
      </section>

      <BottomNav />
    </div>
  );
}

export default UserInfoPage;
