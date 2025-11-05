import React from 'react';
import { Link } from 'react-router-dom';
import '../style/RegisterBioPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

function RegisterBioPage() {
  return (
    <div className="register-bio-container">
      {/* 1. 헤더 */}
      <header className="register-bio-header">
        {/* PDF 12페이지의 'ㄱ'을 '뒤로가기'로 해석하여 /manage 페이지로 이동 */}
        <Link to="/manage" className="back-button">{'<'}</Link> 
        <h1 className="page-title">생체 등록</h1>
        <span className="logo">ALERTO</span>
      </header>

      {/* 2. 메인 컨텐츠 */}
      <div className="content-area">
        <h2 className="sub-title">얼굴 등록</h2>

        {/* 얼굴 스캔 프레임 */}
        <div className="scanner-frame">
          {/* L자 모서리 (CSS로 그림) */}
          <div className="corner corner-tl"></div>
          <div className="corner corner-tr"></div>
          
          {/* PDF의 아이콘을 간단한 div로 대체 (CSS로 스타일) */}
          <div className="face-icon-placeholder">
            {/* PDF의 흰색 원형 링 */}
            <div className="face-ring"></div>
            {/* 얼굴 형상 (임시) */}
            <div className="face-shape">
              <div className="eye left"></div>
              <div className="eye right"></div>
              <div className="mouth"></div>
            </div>
          </div>

          <div className="corner corner-bl"></div>
          <div className="corner corner-br"></div>
        </div>

        {/* 3. 안내 문구 */}
        <p className="instructions">
          자동 촬영이 시작됩니다<br />
          잠시 움직이지 말아주세요
        </p>
      </div>

      {/* 4. 하단 '추가' 버튼 */}
      <div className="action-area">
        {/* ManagePage.css의 .add-button과 구별하기 위해 새 클래스 사용 */}
        <button className="add-bio-button">추가</button>
      </div>
    </div>
  );
}

export default RegisterBioPage;

