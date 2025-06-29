'use client';

import React from 'react';

// =====================================================
// 型定義
// =====================================================

interface BackgroundAnimationsProps {
  className?: string;
}

// =====================================================
// メインコンポーネント
// =====================================================

const BackgroundAnimations: React.FC<BackgroundAnimationsProps> = ({ className = '' }) => {
  return (
    <div className={`background-wrapper ${className}`}>
      {/* 空レイヤー */}
      <div className="parallax-layer sky-layer"></div>
      
      {/* 雲レイヤー */}
      <div className="parallax-layer clouds">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
      </div>
      
      {/* 都市シルエット */}
      <div className="city-silhouette"></div>
      
      {/* スタイル定義（既存のCSSを完全再現） */}
      <style jsx>{`
        .background-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .parallax-layer {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .sky-layer {
          background: linear-gradient(180deg, 
            #87CEEB 0%,     /* 空色 */
            #98D8E8 20%,    /* 少し薄い空色 */
            #B0E0E6 40%,    /* パウダーブルー */
            #E0F6FF 70%,    /* 非常に薄い青 */
            #F0F8FF 100%    /* アリスブルー */
          );
        }

        .clouds {
          z-index: 1;
        }

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          opacity: 0.7;
          animation: drift 20s infinite linear;
        }

        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
        }

        .cloud1 {
          width: 80px;
          height: 30px;
          top: 20%;
          left: -100px;
          animation-duration: 25s;
          animation-delay: 0s;
        }

        .cloud1::before {
          width: 50px;
          height: 50px;
          top: -25px;
          left: 10px;
        }

        .cloud1::after {
          width: 60px;
          height: 40px;
          top: -15px;
          right: 10px;
        }

        .cloud2 {
          width: 60px;
          height: 25px;
          top: 30%;
          left: -80px;
          animation-duration: 30s;
          animation-delay: -10s;
        }

        .cloud2::before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 5px;
        }

        .cloud2::after {
          width: 50px;
          height: 35px;
          top: -10px;
          right: 5px;
        }

        .cloud3 {
          width: 100px;
          height: 35px;
          top: 15%;
          left: -120px;
          animation-duration: 35s;
          animation-delay: -20s;
        }

        .cloud3::before {
          width: 60px;
          height: 60px;
          top: -30px;
          left: 15px;
        }

        .cloud3::after {
          width: 70px;
          height: 50px;
          top: -20px;
          right: 15px;
        }

        @keyframes drift {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(100vw + 200px));
          }
        }

        .city-silhouette {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          background: linear-gradient(180deg, 
            transparent 0%,
            rgba(0, 0, 0, 0.1) 30%,
            rgba(0, 0, 0, 0.2) 60%,
            rgba(0, 0, 0, 0.3) 100%
          );
          z-index: 2;
        }

        .city-silhouette::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 0, 0, 0.1) 10%,
            rgba(0, 0, 0, 0.15) 20%,
            rgba(0, 0, 0, 0.1) 30%,
            rgba(0, 0, 0, 0.2) 40%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.15) 60%,
            rgba(0, 0, 0, 0.1) 70%,
            rgba(0, 0, 0, 0.18) 80%,
            rgba(0, 0, 0, 0.1) 90%,
            transparent 100%
          );
          clip-path: polygon(
            0% 100%,
            2% 60%,
            5% 70%,
            8% 50%,
            12% 65%,
            15% 45%,
            18% 55%,
            22% 40%,
            25% 50%,
            28% 35%,
            32% 45%,
            35% 30%,
            38% 40%,
            42% 25%,
            45% 35%,
            48% 20%,
            52% 30%,
            55% 15%,
            58% 25%,
            62% 10%,
            65% 20%,
            68% 5%,
            72% 15%,
            75% 25%,
            78% 20%,
            82% 30%,
            85% 25%,
            88% 35%,
            92% 30%,
            95% 40%,
            98% 35%,
            100% 45%,
            100% 100%
          );
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .cloud {
            transform: scale(0.8);
          }
          
          .city-silhouette {
            height: 150px;
          }
          
          .city-silhouette::before {
            height: 60px;
          }
        }

        @media (max-width: 480px) {
          .cloud {
            transform: scale(0.6);
          }
          
          .city-silhouette {
            height: 120px;
          }
          
          .city-silhouette::before {
            height: 50px;
          }
        }

        /* アニメーションの最適化 */
        @media (prefers-reduced-motion: reduce) {
          .cloud {
            animation-duration: 60s;
          }
        }

        /* パフォーマンス最適化 */
        .cloud,
        .city-silhouette,
        .sky-layer {
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default BackgroundAnimations; 