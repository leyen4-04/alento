import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';   // ⭐ useNavigate 추가
import BottomNav from '../components/layout/BottomNav';
import '../style/MainPage.css';

function MainPage() {

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<any>(null);

  // 기기 목록 상태
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // ⭐ 라우터 이동 훅
  const navigate = useNavigate();

  // 로그인한 사용자 정보 불러오기 + 로그인 안 되어 있으면 로그인 화면으로 이동
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // 🔸 토큰이 없으면 곧바로 로그인 페이지로 이동
    if (!token) {
      navigate("/login");
      return;
    }

    if (!BASE_URL) return;

    fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUserInfo(data))
      .catch(err => console.error("유저 정보 로딩 실패:", err));
  }, [BASE_URL, navigate]);

  // 내 기기 목록 불러오기 (GET /devices/me)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!BASE_URL) {
      setDeviceLoading(false);
      return;
    }
    if (!token) {
      setDeviceLoading(false);
      return;
    }

    setDeviceLoading(true);
    setDeviceError(null);

    fetch(`${BASE_URL}/devices/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("기기 목록 응답 실패");
        }
        return res.json();
      })
      .then(data => {
        setDevices(data || []);
      })
      .catch(err => {
        console.error("기기 목록 로딩 실패:", err);
        setDeviceError("기기 목록을 불러오지 못했습니다.");
      })
      .finally(() => setDeviceLoading(false));
  }, [BASE_URL]);

  const isLoggedIn = !!userInfo;

  return (
    <div className="main-container">
      
      {/* 1. 헤더 */}
      <header className="main-header">
        <h1 className="main-logo">ALERTO</h1>

        <div className="header-right-box">
          {isLoggedIn ? (
            <span className="login-link">{userInfo.full_name} 님</span>
          ) : (
            <Link to="/login" className="login-link">로그인/회원가입</Link>
          )}
        </div>
      </header>

      {/* 2. 구독 배너 */}
      <div className="subscription-banner">
        <p>"Alento+ 구독하고, 고도화된 AI 이상 징후 분석과 24시간 실시간 맞춤 보안을 경험하세요."</p>
      </div>

      {/* 3. 기기 목록 섹션 */}
      <section className="device-list-section">
        {isLoggedIn && (
          <>
            {deviceLoading && (
              <p className="device-description">기기 목록을 불러오는 중...</p>
            )}

            {deviceError && (
              <p className="device-description" style={{ color: 'red' }}>
                {deviceError}
              </p>
            )}

            {!deviceLoading && !deviceError && devices.length === 0 && (
              <p className="device-description">
                아직 등록된 기기가 없습니다.
                <br />
                하단 탭의 <strong>기기 관리</strong>에서 기기를 추가해 주세요.
              </p>
            )}

            {!deviceLoading && !deviceError && devices.length > 0 && (
              <>
                {devices.map((device) => (
                  <Link
                    key={device.id}
                    to={`/device/${device.id}`}  // DeviceViewPage 라우트와 맞춰 사용
                    className="device-card"
                  >
                    <img
                      src="https://placehold.co/600x400/eeeeee/aaaaaa?text=Device+View"
                      alt={`${device.name || "기기"} 뷰`}
                      className="device-thumbnail"
                    />
                    <div className="device-info">
                      <h3>{device.name || "이름 없는 기기"}</h3>
                      <p className="device-memo">
                        {device.memo || "기기 메모가 없습니다."}
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </>
        )}
      </section>

      {/* 4. 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

export default MainPage;
