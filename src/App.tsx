import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;