import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from "./contexts/UserContext";

// 페이지 임포트
import MainPage from './page/MainPage';
import LoginPage from './page/LoginPage';
import SignUpPage from './page/SignUpPage';
import FindAccountPage from './page/FindAccountPage';
import DeviceViewPage from './page/DeviceViewPage';
import HistoryPage from './page/HistoryPage';
import CalendarPage from './page/CalendarPage';
import SubscriptionPage from './page/SubscriptionPage';
import ManagePage from './page/ManagePage';
import RegisterBioPage from './page/RegisterBioPage';
import ProfilePage from './page/ProfilePage';
import UserInfoPage from "./page/UserInfoPage";

// 🔥 FCM 초기화 함수 불러오기
import { initFCM } from "./fcm";

function App() {

  // 🔥 앱 시작할 때 FCM 초기화
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // 로그인된 상태에서만 initFCM 실행
    if (token) {
      initFCM();
    }
  }, []);

  return (
    <UserProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/user" element={<UserInfoPage />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/find-account" element={<FindAccountPage />} />
            <Route path="/device/:id" element={<DeviceViewPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/manage" element={<ManagePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/manage/register-bio" element={<RegisterBioPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
