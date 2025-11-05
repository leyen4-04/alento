import React from 'react';
import { Link } from 'react-router-dom';
import '../style/SubscriptionPage.css'; // 이 페이지 전용 CSS (아래 2번 참고)

function SubscriptionPage() {
  // 개인용 플랜 특징
  const personalFeatures = [
    "24시간 녹화",
    "실시간 영상제공",
    "영상 저장 30일",
    "인당 3개 기기 접근 가능",
  ];

  // 기업용 플랜 특징 (개인용과 동일하네요)
  const businessFeatures = [
    "24시간 녹화",
    "실시간 영상제공",
    "영상 저장 30일",
    "인당 3개 기기 접근 가능",
  ];

  return (
    <div className="subscription-container">
      <header className="subscription-header">
        {/* '기기 관리' 페이지(manage)로 돌아가는 것을 가정 */}
        <Link to="/manage" className="back-button">{"<"}</Link>
        <h1 className="subscription-title">구독제</h1>
        <span className="placeholder"></span> {/* 제목 중앙 정렬용 빈 공간 */}
      </header>

      <div className="cards-wrapper">
        {/* 1. 개인용 카드 */}
        <div className="subscription-card personal">
          <h2 className="card-title">개인용</h2>
          <div className="price-info">
            <span className="original-price">₩10,000</span>
            <span className="discounted-price">4,990원</span>
          </div>
          <ul className="feature-list">
            {personalFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                - {feature}
              </li>
            ))}
          </ul>
          <button className="subscribe-button">구독하기</button>
        </div>

        {/* 2. 기업용 카드 */}
        <div className="subscription-card business">
          <h2 className="card-title">기업용</h2>
          <div className="price-info">
            <span className="original-price">₩198,000/</span>
            <span className="discounted-price">99,900원</span>
          </div>
          <ul className="feature-list">
            {businessFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                - {feature}
              </li>
            ))}
          </ul>
          <button className="subscribe-button">구독하기</button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;