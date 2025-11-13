import React, { useState, useEffect } from 'react';
import BottomNav from '../components/layout/BottomNav'; 
import '../style/ManagePage.css'; 

function ManagePage() {

  const [deviceData, setDeviceData] = useState<any[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editNickname, setEditNickname] = useState(""); 
  const [editMemo, setEditMemo] = useState("");

  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceUid, setNewDeviceUid] = useState("");

  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // ===============================================================
  // ⭐ 사용자 정보 + 기기 목록 불러오기
  // ===============================================================
  useEffect(() => {
    const loadInitialData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return setLoading(false);

      try {
        const userRes = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) setUserInfo(await userRes.json());

        const deviceRes = await fetch(`${BASE_URL}/devices/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (deviceRes.ok) setDeviceData(await deviceRes.json());

      } catch (err) {
        console.error("데이터 로딩 실패", err);
      }

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // ===============================================================
  // ⭐ 기기 수정 모달 열기
  // ===============================================================
  const openEditModal = (index: number) => {
    const d = deviceData[index];
    setEditingIndex(index);
    setEditNickname(d.name);
    setEditMemo(d.memo || "");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingIndex(null);
  };

  // ===============================================================
  // ⭐ 기기 수정 저장
  // ===============================================================
  const saveEdit = async () => {
    if (editingIndex === null) return;

    const token = localStorage.getItem("access_token");
    const target = deviceData[editingIndex];

    try {
      await fetch(`${BASE_URL}/devices/${target.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editNickname,
          memo: editMemo
        })
      });

      const listRes = await fetch(`${BASE_URL}/devices/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (listRes.ok) setDeviceData(await listRes.json());

    } catch (err) {
      console.error("기기 수정 실패", err);
    }

    closeEditModal();
  };

  // ===============================================================
  // ⭐ NEW: 기기 삭제 기능 추가
  // ===============================================================
  const deleteDevice = async (id: number) => {
    const ok = window.confirm("정말 이 기기를 삭제하시겠습니까?");
    if (!ok) return;

    const token = localStorage.getItem("access_token");

    try {
      await fetch(`${BASE_URL}/devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      // 삭제 후 목록 새로고침
      const res = await fetch(`${BASE_URL}/devices/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDeviceData(await res.json());

    } catch (err) {
      console.error("기기 삭제 실패", err);
    }
  };

  // ===============================================================
  // ⭐ 신규 기기 등록
  // ===============================================================
  const registerDevice = async () => {
    if (!newDeviceName || !newDeviceUid) {
      return alert("이름과 UID를 입력하세요!");
    }

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${BASE_URL}/devices/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newDeviceName,
          device_uid: newDeviceUid,
          memo: ""
        })
      });

      if (res.ok) {
        alert("기기 등록 완료!");
        setNewDeviceName("");
        setNewDeviceUid("");
        setRegisterModalOpen(false);

        const listRes = await fetch(`${BASE_URL}/devices/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (listRes.ok) setDeviceData(await listRes.json());
      }

    } catch (err) {
      console.error("기기 등록 실패", err);
    }
  };

  // ===============================================================

  return (
    <div className="manage-container">

      <header className="manage-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">
          {loading ? "..." : userInfo ? `${userInfo.full_name} 님` : "사용자"}
        </h1>
      </header>

      <section className="manage-section">
        <h2 className="section-title">기기 목록</h2>

        {deviceData.map((d, i) => (
          <div key={i} className="device-card-manage upgraded-device-card">

            <div className="device-card-top">
              <div className="device-title-box">
                <h3 className="device-nickname">{d.name}</h3>
                <p className="device-id">UID: {d.device_uid}</p>
              </div>

              <span 
                className="arrow edit-button left-arrow"
                onClick={() => openEditModal(i)}
              >
                ›
              </span>
            </div>

            <div className="ai-notes">
              <h4 className="ai-notes-title">기기 메모</h4>
              <pre style={{ whiteSpace: "pre-wrap" }}>{d.memo}</pre>
            </div>

            {/* ⭐ NEW: 삭제 버튼 추가 */}
            <button
              className="device-delete-small-btn"
              onClick={() => deleteDevice(d.id)}
            >
              삭제
            </button>

          </div>
        ))}

        <button className="add-button" onClick={() => setRegisterModalOpen(true)}>
          + 기기 추가
        </button>

      </section>

      <BottomNav />

      {/* 수정 모달 */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <h3 className="modal-title">기기 정보 수정</h3>

            <input
              className="modal-input"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
            />

            <textarea
              className="modal-textarea"
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              rows={4}
            />

            <div className="modal-buttons">
              <button className="modal-save" onClick={saveEdit}>저장</button>
              <button className="modal-cancel" onClick={closeEditModal}>취소</button>
            </div>

          </div>
        </div>
      )}

      {/* 기기 등록 모달 */}
      {registerModalOpen && (
        <div className="modal-overlay" onClick={() => setRegisterModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <h3 className="modal-title">새 기기 등록</h3>

            <input
              className="modal-input"
              placeholder="기기 이름"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
            />

            <input
              className="modal-input"
              placeholder="기기 UID"
              value={newDeviceUid}
              onChange={(e) => setNewDeviceUid(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="modal-save" onClick={registerDevice}>등록</button>
              <button className="modal-cancel" onClick={() => setRegisterModalOpen(false)}>취소</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManagePage;
