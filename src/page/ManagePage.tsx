// [수정] React에서 useState와 useEffect를 가져옵니다.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav'; // 공통 하단 탭
import '../style/ManagePage.css'; // 이 페이지 전용 CSS

// PDF 11, 13페이지의 임시 데이터
const userData = {
  name: "홍길동",
};

const deviceData = {
  nickname: "기기 별명",
  id: "기기 고유 ID",
  owner: "대표자 명",
  warranty: "20xx - xx-xx까지",
  aiNotes: [
    "참고할 내용 1",
    "참고할 내용 2",
    "참고할 내용 3",
  ]
};

// [신규] .env 변수 가져오기
const BASE_URL = process.env.REACT_APP_API_URL;


function ManagePage() {

  // [신규] API 데이터를 저장할 state들을 선언합니다.
  const [userInfo, setUserInfo] = useState<any>(null); // 사용자 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지

  // [신규] '내 상태 업데이트' (PATCH /users/me/status)를 위한 state
  const [isHome, setIsHome] = useState(true);
  const [returnTime, setReturnTime] = useState("");
  const [memo, setMemo] = useState("");

  // [신규] '기기 등록' (POST /devices/register)을 위한 state
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceUid, setNewDeviceUid] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);

  
  // [신규] 1. 페이지가 처음 로드될 때 사용자 정보를 불러옵니다. (GET /users/me)
  useEffect(() => {
    const fetchUserInfo = async () => {
      
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ★ 바로 이 부분입니다! (GET /users/me) ★
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

      // 1. 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        // 2. fetch의 headers 객체에 'Authorization' 추가
        const response = await fetch("http://192.168.100.3:8000/users/me", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            // (GET에는 'Content-Type'이 필수는 아닙니다)
          }
        });

      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data); // state에 사용자 정보 저장
          
          // [신규] 불러온 정보로 '내 상태' 폼 초기화
          setIsHome(data.is_home);
          setReturnTime(data.return_time || "");
          setMemo(data.memo || "");

        } else {
          setError("사용자 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo(); // 함수 실행
  }, []); // 빈 배열 [] : 페이지가 처음 로드될 때 1회만 실행

  // [신규] 2. '내 상태' 업데이트 버튼 클릭 시 실행될 함수 (PATCH /users/me/status)
  const handleUpdateStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("http://192.168.100.7:8000/users/me/status", {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, // ★ 여기도 '출입증'이 필요합니다 ★
          'Content-Type': 'application/json'  // (PATCH에는 Content-Type 필수)
        },
        body: JSON.stringify({ // 보낼 데이터
          is_home: isHome,
          return_time: returnTime,
          memo: memo
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserInfo(updatedUser); // 최신 정보로 state 업데이트
        alert("상태가 업데이트되었습니다.");
      } else {
        alert("상태 업데이트에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 연결에 실패했습니다.");
    }
  };


  // [신규] 3. '기기 추가' 버튼 클릭 시 실행될 함수 (POST /devices/register)
  const handleRegisterDevice = async () => {
    const token = localStorage.getItem('access_token');
    if (!newDeviceName || !newDeviceUid || !token) {
      setRegisterError("기기 이름과 고유 ID를 모두 입력해주세요.");
      return;
    }
    setRegisterError(null);

    try {
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ★ '+ 기기 추가'는 이 함수를 실행합니다! (POST) ★
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      const BASE_URL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${BASE_URL}/devices/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // ★ 여기도 '출입증'이 필요합니다 ★
          'Content-Type': 'application/json'  // (POST에는 Content-Type 필수)
        },
        body: JSON.stringify({
          name: newDeviceName,
          device_uid: newDeviceUid
        })
      });

      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

      if (response.ok) {
        const newDevice = await response.json();
        alert(`기기 등록 성공! API 키: ${newDevice.api_key}\n(이 키를 기기에 입력해야 합니다)`);
        // (참고: 이 api_key를 localStorage.setItem("myDeviceApiKey", newDevice.api_key)로
        // 저장해두면 DeviceViewPage의 파일 업로드 테스트가 동작합니다.)
        setNewDeviceName("");
        setNewDeviceUid("");
        // (실제라면 여기서 기기 목록을 다시 불러와야 합니다)
      } else {
        const errData = await response.json();
        setRegisterError(errData.detail?.[0]?.msg || "기기 등록에 실패했습니다.");
      }
    } catch (err) {
      setRegisterError("서버 연결에 실패했습니다.");
    }
  };
  
  return (
    <div className="manage-container">
     {/* 1. 헤더 ( [수정] 임시 userData 대신 실제 userInfo state 사용 ) */}
      <header className="manage-header">
        <span className="logo">ALERTO</span>
        <h1 className="user-greeting">
          {/* 로딩 중이거나, userInfo가 있으면 이름을 표시 */}
          {loading ? '...' : (userInfo ? `${userInfo.full_name} 님` : '로그인 필요')}
        </h1>
      </header>
      {/* 2. 구독하기 버튼 */}
      <div className="manage-section">
        <Link to="/subscription" className="subscribe-link-button">
          구독하기
        </Link>
      </div>

      {/* 3. 기기 관리 섹션 */}
      <section className="manage-section">
        <h2 className="section-title">기기관리</h2>
        {/* 임시 기기 카드 */}
        <div className="device-card-manage">
          <div className="card-header">
            <h3 className="device-nickname">{deviceData.nickname}</h3>
            <span className="device-owner">{deviceData.owner}</span>
            <span className="arrow">{">"}</span>
          </div>
          <p className="device-id">{deviceData.id}</p>
          <p className="device-warranty">보증 기간 - {deviceData.warranty}</p>
          <div className="ai-notes">
            <h4 className="ai-notes-title">AI가 참고할 내용</h4>
            <ul>
              {deviceData.aiNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
            {/* [신규] '+ 기기 추가' 버튼을 '기기 등록 폼'으로 변경 */}
        <div className="add-device-form">
          {/* ▼ 1. '기기 이름' 입력창 추가 ▼ */}
          <input
            type="text"
            placeholder="새 기기 이름"
            className="manage-input" 
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
          />
          {/* ▼ 2. '기기 고유 ID' 입력창 추가 ▼ */}
          <input
            type="text"
            placeholder="새 기기 고유 ID (UID)"
            className="manage-input" 
            value={newDeviceUid}
            onChange={(e) => setNewDeviceUid(e.target.value)}
          />

          {/* ▼ 3. 기존 버튼에 onClick 연결 ▼ */}
          <button className="add-button" onClick={handleRegisterDevice}>
            + 기기 추가
          </button>
          
          {/* ▼ 4. 에러 메시지 표시 영역 추가 ▼ */}
          {registerError && <p className="error-message">{registerError}</p>}
        </div>      </section>

      {/* 4. 생체 등록 섹션 */}
      <section className="manage-section">
        <h2 className="section-title">생체 등록</h2>
        <div className="bio-card">
          {/* 임시 생체 등록자 아바타 */}
          <div className="avatar-placeholder"></div>
          <div className="avatar-placeholder"></div>
          <span className="arrow">{">"}</span>
        </div>
        {/* PDF 12페이지(생체 등록)로 이동하는 링크 (경로 임시) */}
        <Link to="/manage/register-bio" className="add-button">
          + 등록 추가
        </Link>
      </section>
      
      {/* 5. 공통 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default ManagePage;
