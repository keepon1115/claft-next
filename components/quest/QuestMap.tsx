'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Map, Compass, Star, Trophy, Zap } from 'lucide-react'
import StageNode from './StageNode'
import type { StageProgress } from '@/stores/questStore'

interface QuestMapProps {
  stages: StageProgress[]
  statistics: {
    currentStage: number
    completedStages: number
    totalStages: number
  }
  onStageClick: (stageId: number) => void
}

export default function QuestMap({ stages, statistics, onStageClick }: QuestMapProps) {
  const skyObjectsRef = useRef<HTMLDivElement>(null)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (stageId: number) => {
    setImageErrors(prev => ({ ...prev, [stageId]: true }))
  }

  // 空中オブジェクト（雲とUFO）を生成
  useEffect(() => {
    if (!skyObjectsRef.current) return

    const createSkyObjects = () => {
      if (!skyObjectsRef.current) return
      skyObjectsRef.current.innerHTML = ''
      
      const NUM_SKY_OBJECTS = 7
      
      for (let i = 0; i < NUM_SKY_OBJECTS; i++) {
        const obj = document.createElement('div')
        obj.classList.add('sky-object')
        
        // 95%確率で雲、5%確率でUFO
        const type = Math.random() < 0.95 ? 'cloud' : 'ufo'
        obj.classList.add(type)
        
        // ランダムな位置と動きを設定
        obj.style.top = `${Math.random() * 70 + 5}%`
        const duration = Math.random() * 25 + 20
        obj.style.animationDuration = `${duration}s`
        
        const startY = Math.random() * 10 - 5
        const endY = Math.random() * 10 - 5
        obj.style.setProperty('--sy', `${startY}px`)
        obj.style.setProperty('--ey', `${endY}px`)
        
        // 左から右、または右から左にランダムに移動
        if (Math.random() < 0.5) {
          obj.style.left = `-${Math.random() * 100 + 100}px`
          obj.style.animationName = 'float-sky-ltr'
        } else {
          obj.style.right = `-${Math.random() * 100 + 100}px`
          obj.style.animationName = 'float-sky-rtl'
        }
        
        obj.style.animationDelay = `${Math.random() * duration * 0.8}s`
        skyObjectsRef.current.appendChild(obj)
      }
    }

    createSkyObjects()
  }, [])

  // ステージの静的データ
  const stageStaticData = {
    1: { title: '君はどんな冒険者？', description: '〜学びの地図をひらこう〜', iconUrl: '/images/quest/stage-1.png', fallbackIcon: '🏠' },
    2: { title: '新時代の冒険者に必要なものって？', description: '〜武器と道具の話〜', iconUrl: '/images/quest/stage-2.png', fallbackIcon: '🌲' },
    3: { title: '君はどんなキャラ？', description: '〜自分を育てる育成ゲーム〜', iconUrl: '/images/quest/stage-3.png', fallbackIcon: '⚔️' },
    4: { title: 'ちがうって、おもしろい', description: '〜正解がないから広がる世界〜', iconUrl: '/images/quest/stage-4.png', fallbackIcon: '🛡️' },
    5: { title: '「？」が世界をひらく', description: '〜ワクワク＆もやもや〜', iconUrl: '/images/quest/stage-5.png', fallbackIcon: '👥' },
    6: { title: 'つくってつたえると気づける', description: '〜違いを生かして未来を創る〜', iconUrl: '/images/quest/stage-6.png', fallbackIcon: '🏰' }
  }

  return (
    <>
      {/* 空中オブジェクトコンテナ */}
      <div ref={skyObjectsRef} className="sky-objects-container" />
      
      <div className="quest-container">
        {/* プログレス統計 */}
        <div className="progress-stats">
          <div className="stat-card">
            <Star className="w-5 h-5 text-yellow-300" />
            <span>現在のステージ: {statistics.currentStage || 1}</span>
          </div>
          <div className="stat-card">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span>クリア済み: {statistics.completedStages}</span>
          </div>
          <div className="stat-card">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span>総ステージ数: {statistics.totalStages}</span>
          </div>
        </div>

        {/* ピクセルアート風クエストマップ */}
        <div className="pixel-quest-map">
          <div className="pixel-stage-grid">
            {[1, 2, 3, 4, 5, 6].map((stageNumber) => {
              const stage = stages.find(s => s.stageId === stageNumber) || {
                stageId: stageNumber,
                status: stageNumber === 1 ? 'current' : 'locked',
                progress: 0
              }
              const staticInfo = stageStaticData[stageNumber as keyof typeof stageStaticData]
              const status = stage.status

              return (
                <div 
                  key={stageNumber}
                  className={`pixel-stage-node ${status}`}
                  onClick={() => onStageClick(stageNumber)}
                  data-stage={stageNumber}
                >
                  {/* CLEARバッジ */}
                  {status === 'completed' && (
                    <div className="clear-badge">CLEAR!</div>
                  )}
                  
                  {/* ヒーローフェイス（現在のステージに表示） */}
                  {(status === 'current' || status === 'pending_approval') && (
                    <div className="hero-face">
                      <div className="mouth"></div>
                    </div>
                  )}
                  
                  {/* ステージアイコン */}
                  <div className="pixel-stage-icon">
                    {imageErrors[stageNumber] || !staticInfo.iconUrl ? (
                      <span className="stage-emoji">{staticInfo.fallbackIcon}</span>
                    ) : (
                      <Image
                        src={staticInfo.iconUrl}
                        alt={`${staticInfo.title} アイコン`}
                        width={120}
                        height={120}
                        className="stage-image"
                        onError={() => handleImageError(stageNumber)}
                      />
                    )}
                    {status === 'completed' && (
                      <div className="clear-effect" />
                    )}
                  </div>
                  {/* ステージ情報 */}
                  <div className="pixel-stage-info">
                    <h3 className="stage-title">{staticInfo.title}</h3>
                    <p className="stage-description">{staticInfo.description}</p>
                  </div>
                  
                  {/* ナンバーバッジ */}
                  <div className="stage-number-badge">
                    <span className="stage-number-text">{stageNumber}</span>
                  </div>
                  
                  {/* パスライン（最後のステージ以外） */}
                  {stageNumber < 6 && <div className="path-line" />}
                </div>
              )
            })}
          </div>

          {/* フッター情報 */}
          <div className="quest-map-footer">
            <div className="pixel-hint-box">
              <div className="hint-header">
                <Compass className="w-6 h-6" />
                <h3>冒険のヒント</h3>
              </div>
              <p>
                各ステージをクリックして詳細を確認できます。<br />
                ステージを順番にクリアして、あなただけの冒険ストーリーを進めましょう！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ピクセルアート風スタイル */}
      <style jsx>{`
        /* フォント設定 */
        .quest-container {
          font-family: 'DotGothic16', 'M PLUS Rounded 1c', monospace;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 16px 40px;
          position: relative;
          z-index: 10;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        /* 空中オブジェクト */
        .sky-objects-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        :global(.sky-object) {
          position: fixed;
          opacity: 0.8;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 1;
          pointer-events: none;
        }

        :global(.cloud) {
          width: 100px;
          height: 40px;
          background: white;
          border-radius: 100px;
          box-shadow: 20px 10px 0 10px white, -20px 10px 0 5px white;
        }

        :global(.ufo) {
          font-size: 40px;
          text-align: center;
          animation: ufo-wobble 3s ease-in-out infinite alternate !important;
        }

        :global(.ufo::before) {
          content: '🛸';
        }

        @keyframes ufo-wobble {
          from { transform: translateY(-3px) rotate(-2deg); }
          to { transform: translateY(3px) rotate(2deg); }
        }

        @keyframes float-sky-ltr {
          from { transform: translateX(0) translateY(var(--sy, 0)); }
          to { transform: translateX(calc(100vw + 200px)) translateY(var(--ey, 0)); }
        }

        @keyframes float-sky-rtl {
          from { transform: translateX(0) translateY(var(--sy, 0)); }
          to { transform: translateX(calc(-100vw - 200px)) translateY(var(--ey, 0)); }
        }

        /* ピクセルクエストマップ */
        .pixel-quest-map {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 4px solid #333;
          padding: 32px;
          box-shadow: 0 0 0 2px #666, 8px 8px 0 0 rgba(0,0,0,0.3);
          margin-bottom: 40px;
        }

        /* ステージグリッド */
        .pixel-stage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 32px;
          padding: 0 20px;
        }

        @media (max-width: 767px) {
          .pixel-stage-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            padding: 0;
          }
        }

        /* ステージノード */
        .pixel-stage-node {
          position: relative;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .pixel-stage-node[data-stage="2"], 
        .pixel-stage-node[data-stage="5"] {
          transform: translateY(40px);
        }

        @media (max-width: 767px) {
          .pixel-stage-node:nth-child(even) {
            transform: translateY(40px);
          }
          .pixel-stage-node[data-stage="5"] {
            transform: translateY(0);
          }
        }

        .pixel-stage-node:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .pixel-stage-node[data-stage="2"]:hover, 
        .pixel-stage-node[data-stage="5"]:hover {
          transform: translateY(35px) scale(1.05);
        }

        @media (max-width: 767px) {
          .pixel-stage-node:nth-child(even):hover {
            transform: translateY(35px) scale(1.05);
          }
          .pixel-stage-node[data-stage="5"]:hover {
            transform: translateY(-5px) scale(1.05);
          }
        }

        /* ステージアイコン */
        .pixel-stage-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 16px;
          position: relative;
          background: #E8F5E9;
          border: 4px solid #333;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 0 rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .pixel-stage-node.locked .pixel-stage-icon {
          background: #9E9E9E;
        }

        .pixel-stage-node.completed .pixel-stage-icon {
          background: #FFF9C4;
          box-shadow: 0 0 0 2px #FFD700, 6px 6px 0 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.5);
        }

        .stage-emoji {
          font-size: 64px;
          filter: grayscale(1);
          transition: filter 0.3s ease;
        }

        .pixel-stage-node.completed .stage-emoji {
          filter: grayscale(0);
        }

        .stage-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        .pixel-stage-node.locked .stage-emoji {
          filter: grayscale(1);
          opacity: 0.7;
        }

        /* CLEARエフェクト */
        .clear-effect {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: radial-gradient(circle, #FFD700 0%, transparent 70%);
          border-radius: 50%;
          animation: effect-animation 2s ease-in-out infinite;
        }

        @keyframes effect-animation {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.9; }
          25% { transform: translateY(-5px) scale(1.1) rotate(5deg); opacity: 1; }
          50% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.9; }
          75% { transform: translateY(-3px) scale(1.05) rotate(-5deg); opacity: 1; }
        }

        /* CLEARバッジ */
        .clear-badge {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFD700;
          border: 3px solid #B8860B;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 14px;
          color: #654321;
          letter-spacing: 1px;
          box-shadow: 0 0 0 1px #DAA520, 3px 3px 0 0 rgba(0,0,0,0.5);
          z-index: 10;
          animation: bounce-in 0.5s ease;
        }

        @keyframes bounce-in {
          0% { transform: translateX(-50%) translateY(-20px) scale(0); }
          50% { transform: translateX(-50%) translateY(0) scale(1.2); }
          100% { transform: translateX(-50%) translateY(0) scale(1); }
        }

        /* ナンバーバッジ */
        .stage-number-badge {
          position: relative;
          margin: 16px auto 0;
          width: 44px;
          height: 44px;
          background: #4DB6F7;
          border: 3px solid #2C88C7;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 0 1px #5AC8F7, 3px 3px 0 0 rgba(0,0,0,0.3);
          padding: 2px;
        }

        .stage-number-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          left: 10px;
          box-shadow: 0 0 0 1px #2C88C7;
        }

        .stage-number-badge::after {
          content: '';
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          right: 10px;
          box-shadow: 0 0 0 1px #2C88C7;
        }

        .stage-number-text {
          margin-top: 14px;
        }

        .pixel-stage-node.locked .stage-number-badge {
          background: #757575;
          border-color: #616161;
          box-shadow: 0 0 0 1px #9E9E9E, 3px 3px 0 0 rgba(0,0,0,0.3);
        }

        .pixel-stage-node.locked .stage-number-badge::before,
        .pixel-stage-node.locked .stage-number-badge::after {
          background: #ccc;
          box-shadow: 0 0 0 1px #616161;
        }

        .pixel-stage-node.completed .stage-number-badge {
          background: #8EE38F;
          border-color: #6CBD6C;
        }

        .pixel-stage-node.completed .stage-number-badge::before,
        .pixel-stage-node.completed .stage-number-badge::after {
          box-shadow: 0 0 0 1px #6CBD6C;
        }

        /* ヒーローフェイス */
        .hero-face {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background-color: #FFEB3B;
          border: 3px solid #FBC02D;
          border-radius: 50%;
          z-index: 20;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
          animation: hero-face-bounce 1.5s ease-in-out infinite;
        }

        .hero-face::before,
        .hero-face::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 8px;
          background-color: #333;
          border-radius: 3px / 4px;
          top: 12px;
        }

        .hero-face::before {
          left: 9px;
        }

        .hero-face::after {
          right: 9px;
        }

        .mouth {
          position: absolute;
          width: 16px;
          height: 2px;
          background-color: #333;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 1px;
        }

        @keyframes hero-face-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }

        /* ステージ情報 */
        .pixel-stage-info {
          background: white;
          border: 3px solid #333;
          padding: 12px 16px;
          margin-top: 16px;
          position: relative;
          box-shadow: 0 0 0 1px #666, 4px 4px 0 0 rgba(0,0,0,0.2);
        }

        .stage-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .stage-description {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.4;
        }

        /* パスライン */
        .path-line {
          position: absolute;
          width: 60px;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            #8B4513,
            #8B4513 10px,
            #D2691E 10px,
            #D2691E 20px
          );
          top: 60px;
          right: -60px;
          transform: translateY(-50%);
          z-index: 1;
        }

        .pixel-stage-node[data-stage="3"] .path-line,
        .pixel-stage-node[data-stage="6"] .path-line {
          display: none;
        }

        @media (max-width: 767px) {
          .pixel-stage-node[data-stage="3"] .path-line {
            display: block;
          }
          .pixel-stage-node:nth-child(even) .path-line,
          .pixel-stage-node[data-stage="6"] .path-line {
            display: none;
          }
        }

        /* フッター */
        .quest-map-footer {
          margin-top: 32px;
        }

        .pixel-hint-box {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          text-align: center;
          color: white;
        }

        .hint-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .hint-header h3 {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .pixel-hint-box p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        /* プログレス統計 */
        .progress-stats {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 12px 20px;
          border-radius: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-weight: bold;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 3px 3px 0 0 rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  )
} 