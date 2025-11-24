import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ✅ page 폴더 기준 한 단계 위로
import BottomNav from "../components/layout/BottomNav";
import "../style/MainPage.css";
import { apiRequest } from "../api/client";


function MainPage() {
  const [userInfo, setUserInfo] = useState<any>(null);

  const [devices, setDevices] = useState<any[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ 유저 정보 로드
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const data = await apiRequest<any>("/users/me");
        setUserInfo(data);
      } catch (err) {
        console.error("유저 정보 로딩 실패:", err);
        setUserInfo(null);
      }
    };

    loadUser();
  }, [navigate]);

  // ✅ 기기 목록 로드
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setDeviceLoading(false);
      return;
    }

    const loadDevices = async () => {
      try {
        setDeviceLoading(true);
        setDeviceError(null);
        const list = await apiRequest<any[]>("/devices/me");
        setDevices(list || []);
      } catch (err) {
        console.error("기기 목록 로딩 실패:", err);
        setDeviceError("기기 목록을 불러오지 못했습니다.");
      } finally {
        setDeviceLoading(false);
      }
    };

    loadDevices();
  }, []);

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
            <Link to="/login" className="login-link">
              로그인/회원가입
            </Link>
          )}
        </div>
      </header>

      {/* 2. 구독 배너 */}
      <div className="subscription-banner">
        <p>
          "Alento+ 구독하고, 고도화된 AI 이상 징후 분석과 24시간 실시간 맞춤
          보안을 경험하세요."
        </p>
      </div>

      {/* 3. 기기 목록 섹션 */}
      <section className="device-list-section">
        {isLoggedIn && (
          <>
            {deviceLoading && (
              <p className="device-description">기기 목록을 불러오는 중...</p>
            )}

            {deviceError && (
              <p className="device-description" style={{ color: "red" }}>
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
                    to={`/device/${device.id}`}
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

      <BottomNav />
    </div>
  );
}

export default MainPage;
