import React, { useState, useEffect } from 'react';
import BottomNav from '../components/layout/BottomNav'; 
import '../style/ManagePage.css'; 
import { apiRequest } from '../api/client'; // 작성한 api 유틸 불러오기
import { Device, User } from '../types';    // 작성한 타입 불러오기

function ManagePage() {
  const [deviceData, setDeviceData] = useState<Device[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editNickname, setEditNickname] = useState(""); 
  const [editMemo, setEditMemo] = useState("");

  // 등록 모달 상태
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceUid, setNewDeviceUid] = useState("");

  // ===============================================================
  // ⭐ 사용자 정보 + 기기 목록 불러오기
  // ===============================================================
  const loadInitialData = async () => {
    try {
      const [userRes, deviceRes] = await Promise.all([
        apiRequest<User>("/users/me"),
        apiRequest<Device[]>("/devices/me")
      ]);
      setUserInfo(userRes);
      setDeviceData(deviceRes);
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // ===============================================================
  // ⭐ 기기 수정 모달 열기
  // ===============================================================
  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setEditNickname(device.name);
    setEditMemo(device.memo || "");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDevice(null);
  };

  // ===============================================================
  // ⭐ 기기 수정 저장 (이름 & 메모)
  // ===============================================================
  const saveEdit = async () => {
    if (!editingDevice) return;

    try {
      // 1) 이름 수정
      if (editNickname !== editingDevice.name) {
        await apiRequest(`/devices/${editingDevice.device_uid}/name`, {
          method: "PATCH",
          body: JSON.stringify({ name: editNickname }),
        });
      }

      // 2) 메모 수정
      if (editMemo !== (editingDevice.memo || "")) {
        await apiRequest(`/devices/${editingDevice.device_uid}/memo`, {
          method: "PATCH",
          body: JSON.stringify({ memo: editMemo }),
        });
      }

      // 목록 갱신
      const updatedList = await apiRequest<Device[]>("/devices/me");
      setDeviceData(updatedList);
      closeEditModal();

    } catch (err: any) {
      alert(err.message || "기기 수정 실패");
    }
  };

  // ===============================================================
  // ⭐ 기기 삭제
  // ===============================================================
  const deleteDevice = async (deviceUid: string) => {
    if (!window.confirm("정말 이 기기를 삭제하시겠습니까?")) return;

    try {
      await apiRequest(`/devices/${deviceUid}`, { method: "DELETE" });
      
      // 목록 갱신
      const updatedList = await apiRequest<Device[]>("/devices/me");
      setDeviceData(updatedList);
    } catch (err: any) {
      alert(err.message || "기기 삭제 실패");
    }
  };

  // ===============================================================
  // ⭐ 신규 기기 등록 (API Key 확인 로직 추가됨)
  // ===============================================================
  const registerDevice = async () => {
    if (!newDeviceName || !newDeviceUid) {
      return alert("이름과 UID를 입력하세요!");
    }

    try {
      // 기기 등록 요청
      const newDevice = await apiRequest<Device>("/devices/register", {
        method: "POST",
        body: JSON.stringify({
          name: newDeviceName,
          device_uid: newDeviceUid,
          memo: ""
        })
      });

      // ⭐ 중요: API Key가 있으면 사용자에게 보여줌
      if (newDevice.api_key) {
        alert(
          `✅ 기기 등록 성공!\n\n` +
          `API Key: [ ${newDevice.api_key} ]\n\n` +
          `이 키를 기기(하드웨어)에 입력해주세요.\n` +
          `창을 닫으면 키를 다시 확인할 수 없습니다.`
        );
      } else {
        alert("기기 등록이 완료되었습니다.");
      }

      // 초기화 및 목록 갱신
      setNewDeviceName("");
      setNewDeviceUid("");
      setRegisterModalOpen(false);

      const updatedList = await apiRequest<Device[]>("/devices/me");
      setDeviceData(updatedList);

    } catch (err: any) {
      alert(err.message || "기기 등록 실패");
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

        {deviceData.map((d) => (
          <div key={d.id} className="device-card-manage upgraded-device-card">
            <div className="device-card-top">
              <div className="device-title-box">
                <h3 className="device-nickname">{d.name}</h3>
                <p className="device-id">UID: {d.device_uid}</p>
              </div>
              <span 
                className="arrow edit-button left-arrow"
                onClick={() => openEditModal(d)}
              >
                ›
              </span>
            </div>

            <div className="ai-notes">
              <h4 className="ai-notes-title">기기 메모</h4>
              <pre style={{ whiteSpace: "pre-wrap", color: "#555", fontSize: "0.9rem" }}>
                {d.memo || "메모 없음"}
              </pre>
            </div>

            <button
              className="device-delete-small-btn"
              onClick={() => deleteDevice(d.device_uid)}
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
              placeholder="기기 이름"
            />
            <textarea
              className="modal-textarea"
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              rows={4}
              placeholder="메모를 입력하세요"
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
              placeholder="기기 이름 (예: 현관문)"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
            />
            <input
              className="modal-input"
              placeholder="기기 UID (제품 뒷면 참조)"
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