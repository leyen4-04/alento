import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider 임포트

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
import RegisterBioPage from './page/RegisterBioPage'; // RegisterBioPage 임포트

function App() {
  return (
    <Router> {/* [수정] Router가 최상위 부모가 됩니다. */}
      <AuthProvider> {/* [수정] AuthProvider가 Router의 자식이 됩니다. */}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/signup" element={<SignUpPage />} /> 
          <Route path="/find-account" element={<FindAccountPage />} /> 
          <Route path="/device/:id" element={<DeviceViewPage />} /> 
          <Route path="/history" element={<HistoryPage />} /> 
          <Route path="/calendar" element={<CalendarPage />} /> 
          <Route path="/subscription" element={<SubscriptionPage />} /> 
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/manage/register-bio" element={<RegisterBioPage />} /> {/* 생체 등록 라우트 */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;