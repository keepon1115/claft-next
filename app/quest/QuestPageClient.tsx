'use client'

import { useEffect, useState } from 'react'
import QuestMap from '@/components/quest/QuestMap'

// =====================================================
// 空のオブジェクト型定義
// =====================================================

interface SkyObject {
  id: number
  type: 'cloud' | 'ufo'
  top: number
  duration: number
  direction: 'ltr' | 'rtl'
  startY: number
  endY: number
  delay: number
  startPosition: number
}

// =====================================================
// 横画面推奨メッセージコンポーネント
// =====================================================

function RotationNotice() {
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    // モバイルデバイスかどうかの判定
    function isMobileDevice() {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             (window.innerWidth <= 770 && 'ontouchstart' in window)
    }

    // 画面の向きをチェック
    function checkOrientation() {
      const isLandscape = window.innerHeight < window.innerWidth
      const isMobile = isMobileDevice()
      
      if (isMobile && !isLandscape) {
        // スマートフォンで縦画面の場合
        setShowNotice(true)
        document.body.style.overflow = 'hidden'
      } else {
        // 横画面またはデスクトップの場合
        setShowNotice(false)
        document.body.style.overflow = 'auto'
      }
    }

    // 初期チェック
    checkOrientation()

    // イベントリスナー
    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100)
    }
    
    const handleResize = () => {
      checkOrientation()
    }
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkOrientation, 100)
      }
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.body.style.overflow = 'auto'
    }
  }, [])

  if (!showNotice) return null

  return (
    <div className="rotation-notice">
      <div className="rotation-notice-icon">📱</div>
      <h2>横画面でお楽しみください</h2>
      <p>
        このアプリは横画面でのご利用を推奨しています。<br />
        スマートフォンを横向きにしてお楽しみください。
      </p>
      
      <style jsx>{`
        .rotation-notice {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .rotation-notice-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: rotate-icon 2s ease-in-out infinite;
        }
        
        .rotation-notice h2 {
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .rotation-notice p {
          font-size: 18px;
          line-height: 1.6;
          max-width: 350px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes rotate-icon {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(75deg); }
          100% { transform: rotate(90deg); }
        }
        
        @media (max-width: 480px) {
          .rotation-notice-icon {
            font-size: 60px;
          }
          
          .rotation-notice h2 {
            font-size: 22px;
          }
          
          .rotation-notice p {
            font-size: 16px;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}

// =====================================================
// 空のアニメーションコンポーネント
// =====================================================

function SkyObjectsContainer() {
  const [skyObjects, setSkyObjects] = useState<SkyObject[]>([])

  useEffect(() => {
    const NUM_SKY_OBJECTS = 7
    const objects: SkyObject[] = []

    for (let i = 0; i < NUM_SKY_OBJECTS; i++) {
      const type = Math.random() < 0.95 ? 'cloud' : 'ufo'
      const direction = Math.random() < 0.5 ? 'ltr' : 'rtl'
      const duration = Math.random() * 25 + 20
      const top = Math.random() * 70 + 5
      const startY = Math.random() * 10 - 5
      const endY = Math.random() * 10 - 5
      const delay = Math.random() * duration * 0.8
      const startPosition = Math.random() * 100 + 100

      objects.push({
        id: i,
        type,
        top,
        duration,
        direction,
        startY,
        endY,
        delay,
        startPosition
      })
    }

    setSkyObjects(objects)
  }, [])

  return (
    <div className="sky-objects-container">
      {skyObjects.map((obj) => (
        <div
          key={obj.id}
          className={`sky-object ${obj.type}`}
          style={{
            top: `${obj.top}%`,
            animationDuration: `${obj.duration}s`,
            animationDelay: `${obj.delay}s`,
            animationName: obj.direction === 'ltr' ? 'float-sky-ltr' : 'float-sky-rtl',
            [obj.direction === 'ltr' ? 'left' : 'right']: `-${obj.startPosition}px`,
            '--sy': `${obj.startY}px`,
            '--ey': `${obj.endY}px`,
          } as React.CSSProperties}
        >
          {obj.type === 'ufo' && '🛸'}
        </div>
      ))}
      
      <style jsx>{`
        .sky-objects-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .sky-object {
          position: fixed;
          opacity: 0.8;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 1;
          pointer-events: none;
        }
        
        .sky-object.cloud {
          width: 100px;
          height: 40px;
          background: white;
          border-radius: 100px;
          box-shadow: 20px 10px 0 10px white, -20px 10px 0 5px white;
        }
        
        .sky-object.ufo {
          font-size: 40px;
          text-align: center;
          animation: ufo-wobble 3s ease-in-out infinite alternate, float-sky-ltr var(--duration) linear infinite;
        }
        
        @keyframes ufo-wobble {
          from { 
            transform: translateY(-3px) rotate(-2deg); 
          }
          to { 
            transform: translateY(3px) rotate(2deg); 
          }
        }
        
        @keyframes float-sky-ltr {
          from { 
            transform: translateX(0) translateY(var(--sy, 0)); 
          }
          to { 
            transform: translateX(calc(100vw + 200px)) translateY(var(--ey, 0)); 
          }
        }
        
        @keyframes float-sky-rtl {
          from { 
            transform: translateX(0) translateY(var(--sy, 0)); 
          }
          to { 
            transform: translateX(calc(-100vw - 200px)) translateY(var(--ey, 0)); 
          }
        }
      `}</style>
    </div>
  )
}

// =====================================================
// メインクライアントコンポーネント
// =====================================================

export default function QuestPageClient() {
  return (
    <div className="quest-page">
      {/* 横画面推奨メッセージ */}
      <RotationNotice />
      
      {/* 空のアニメーション */}
      <SkyObjectsContainer />
      
      {/* メインコンテンツ */}
      <main className="main-content">
        <QuestMap />
      </main>
      
      <style jsx>{`
        .quest-page {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%);
          overflow-x: hidden;
          font-family: 'DotGothic16', 'M PLUS Rounded 1c', sans-serif;
          line-height: 1.6;
          color: #2c2c2c;
          padding-bottom: 100px;
        }
        
        .main-content {
          position: relative;
          z-index: 10;
          padding: 80px 16px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* レスポンシブ対応 */
        @media (max-width: 770px) {
          .main-content {
            padding: 60px 10px 40px;
          }
        }
        
        @media (max-width: 480px) {
          .main-content {
            padding: 50px 8px 40px;
          }
        }
        
        /* 高さが低い画面での調整 */
        @media (max-width: 770px) and (max-height: 500px) {
          .main-content {
            padding: 40px 10px 20px;
          }
        }
        
        /* デスクトップ・大画面対応 */
        @media (min-width: 1200px) {
          .main-content {
            padding: 100px 20px 60px;
          }
        }
      `}</style>
    </div>
  )
} 