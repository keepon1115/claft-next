'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Map, Compass, Star, Trophy, Zap } from 'lucide-react'
import StageNode from './StageNode'
import CategoryBlock from './CategoryBlock'
import CategoryModal from './CategoryModal'
import JibunMediaLibrary from '@/components/quest/JibunMediaLibrary'
import { useCategorySystem } from '@/hooks/useCategorySystem'
import { useAuth } from '@/hooks/useAuth'
import type { StageProgress } from '@/stores/questStore'

interface QuestMapProps {
  stages: StageProgress[]
  statistics: {
    currentStage: number
    completedStages: number
    totalStages: number
  }
  onStageClick: (stageId: number) => void
  theme?: 'sky' | 'twilight' | 'moon'
  area?: '1-6' | '7-12' | 'jibun'
}

export default function QuestMap({ stages, statistics, onStageClick, theme = 'sky', area = '1-6' }: QuestMapProps) {
  const skyObjectsRef = useRef<HTMLDivElement>(null)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const { isAuthenticated } = useAuth()

  // カテゴリシステムの初期化
  const {
    modalOptions,
    isModalOpen,
    openModal,
    closeModal,
    generateDemoCategories,
    generateDemoProgress,
    loadCategoryVideos,
  } = useCategorySystem({
    userMainQuestProgress: statistics.completedStages,
    isAuthenticated,
    area,
  })

  // デモカテゴリデータを生成
  const demoCategories = generateDemoCategories()
  const demoProgress = generateDemoProgress()

  // 7-12: カテゴリ動画を必要に応じて読み込み（将来のUIで使用）
  // 例: 初回にお金カテゴリの先頭ページをプリフェッチ（UI改修で活用予定）
  useEffect(() => {
    if (area !== '7-12') return
    // 軽いプリフェッチ例（失敗しても無視）
    loadCategoryVideos({ categoryId: 'money', page: 1, pageSize: 12 }).catch(() => {})
  }, [area, loadCategoryVideos])

  const handleImageError = (stageId: number) => {
    setImageErrors(prev => ({ ...prev, [stageId]: true }))
  }

  // 空/夕景オブジェクト（雲/UFO/星）を生成
  useEffect(() => {
    if (!skyObjectsRef.current) return

    const createSkyObjects = () => {
      if (!skyObjectsRef.current) return
      skyObjectsRef.current.innerHTML = ''
      
      const NUM_SKY_OBJECTS = 7
      
      for (let i = 0; i < NUM_SKY_OBJECTS; i++) {
        const obj = document.createElement('div')
        obj.classList.add('sky-object')
        
        // テーマに応じてオブジェクトを変える
        const type = theme === 'twilight'
          ? (Math.random() < 0.85 ? 'cloud' : 'ufo')
          : (Math.random() < 0.95 ? 'cloud' : 'ufo')
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
  }, [theme])

  // 描画対象ステージIDの配列をエリアで切替（ジブンクラフトは数値ステージなし）
  const stageIds = area === '7-12' ? [7,8,9,10,11,12] : area === '1-6' ? [1,2,3,4,5,6] : []

  return (
    <>
      {/* テーマ別背景オブジェクトコンテナ */}
      <div ref={skyObjectsRef} className={`${theme}-objects-container`} />
      
      <div className="quest-container">
        {/* ピクセルアート風クエストマップ */}
        <div className="pixel-quest-map">
          {/* マップヘッダー（クリア済み統計） */}
          <div className="map-header-stats">
            <div className="stat-card-header">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span>クリア済み: {statistics.completedStages}</span>
            </div>
          </div>
          <div className="pixel-stage-grid">
            {stageIds.map((stageNumber) => {
              const stage = stages.find(s => s.stageId === stageNumber) || {
                stageId: stageNumber,
                status: stageNumber === (area === '7-12' ? 7 : 1) ? 'current' : 'locked'
              } as any
              const status = stage.status

              return (
                <div 
                  key={stageNumber}
                  className={`pixel-stage-node ${status}`}
                  onClick={() => onStageClick(stageNumber)}
                  data-stage={stageNumber}
                >
                  {/* ステージ番号（左寄せ） */}
                  <div className="stage-number-left">
                    <span className="stage-number-text">{stageNumber}</span>
                  </div>
                  
                  {/* ステータスバッジ（右側） */}
                  <div className="stage-status-badges">
                    {status === 'completed' && (
                      <div className="clear-badge">CLEAR!</div>
                    )}
                    
                    {(status === 'current' || status === 'pending_approval') && (
                      <div className="current-badge">
                        <div className="current-icon">📍</div>
                      </div>
                    )}
                    
                    {status === 'locked' && (
                      <div className="lock-badge">
                        <div className="lock-icon">🔒</div>
                      </div>
                    )}
                  </div>
                  
                  {/* ステージアイコン */}
                  <div className="pixel-stage-icon">
                    {
                      // 画像が用意されていれば表示、なければ絵文字フォールバック
                      imageErrors[stageNumber]
                        ? <span className="stage-emoji">{stage.fallbackIcon || '✨'}</span>
                        : (
                          <Image
                            src={`/images/quest/stage-${stageNumber}.png`}
                            alt={`ステージ${stageNumber} アイコン`}
                            width={120}
                            height={120}
                            className="stage-image"
                            onError={() => handleImageError(stageNumber)}
                          />
                        )
                    }
                    {status === 'completed' && (
                      <div className="clear-effect" />
                    )}
                  </div>
                  {/* ステージ情報 */}
                  <div className="pixel-stage-info">
                    <h3 className="stage-title">{stage.title}</h3>
                    <p className="stage-description">{stage.description}</p>
                  </div>
                  


                </div>
              )
            })}
          </div>

          {/* ジブンクラフト: メディアライブラリ（ファセット検索） */}
          {area === 'jibun' && (
            <div className="jibun-media-wrapper">
              <JibunMediaLibrary />
            </div>
          )}

        </div>

        {/* 1-6 / 7-12 のカテゴリーブロック */}
        {(area === '1-6' || area === '7-12') && (
          <div className="category-blocks">
            {demoCategories.map((category) => {
              const getCategoryClass = (categoryId: string) => {
                switch (categoryId) {
                  case 'money-economics':
                    return 'category-block--money'
                  case 'presentation-communication':
                    return 'category-block--presentation'
                  case 'ai-it-skills':
                    return 'category-block--ai'
                  case 'sdgs-environment':
                    return 'category-block--sdgs'
                  default:
                    return ''
                }
              }

              return (
                <CategoryBlock
                  key={category.id}
                  category={category}
                  userMainQuestProgress={statistics.completedStages}
                  userCategoryProgress={demoProgress.filter(p => p.category_id === category.id)}
                  onOpenModal={openModal}
                  className={`mb-8 ${getCategoryClass(category.id)}`}
                  area={area}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* カテゴリモーダル */}
      <CategoryModal
        options={modalOptions}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* ピクセルアート風スタイル */}
      <style jsx>{`
        /* フォント設定 */
        .quest-container {
          font-family: 'DotGothic16', 'M PLUS Rounded 1c', monospace;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 12px 40px;
          position: relative;
          z-index: 10;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        @media (min-width: 768px) {
          .quest-container {
            padding: 30px 16px 40px;
          }
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
        .twilight-objects-container {
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
        /* 夕景の微弱な星 */
        :global(.star) {
          width: 2px;
          height: 2px;
          background: rgba(255,255,255,.9);
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(255,255,255,.8);
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
          border: 3px solid #333;
          padding: 16px;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 0 rgba(0,0,0,0.3);
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
          .pixel-quest-map {
            border: 4px solid #333;
            padding: 24px 32px 32px;
            box-shadow: 0 0 0 2px #666, 8px 8px 0 0 rgba(0,0,0,0.3);
            margin-bottom: 40px;
          }
        }

        /* マップヘッダー統計 */
        .map-header-stats {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        @media (min-width: 768px) {
          .map-header-stats {
            margin-bottom: 24px;
          }
        }

        .stat-card-header {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
          font-weight: bold;
          font-size: 0.9rem;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2), 3px 3px 0 0 rgba(0,0,0,0.2);
        }

        @media (min-width: 768px) {
          .stat-card-header {
            padding: 12px 20px;
            font-size: 1rem;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2), 4px 4px 0 0 rgba(0,0,0,0.2);
          }
        }

        /* ステージグリッド */
        .pixel-stage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px 32px;
          row-gap: 80px;
          padding: 60px 20px 20px;
        }

        @media (max-width: 767px) {
          .pixel-stage-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            row-gap: 70px;
            padding: 50px 0 16px;
          }
        }

        /* ステージノード */
        .pixel-stage-node {
          position: relative;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }



        .pixel-stage-node:hover {
          transform: translateY(-5px) scale(1.05);
        }

        /* ステージアイコン */
        .pixel-stage-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 12px;
          position: relative;
          background: #E8F5E9;
          border: 3px solid #333;
          box-shadow: 0 0 0 2px #666, 4px 4px 0 0 rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .pixel-stage-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 16px;
            border: 4px solid #333;
            box-shadow: 0 0 0 2px #666, 6px 6px 0 0 rgba(0,0,0,0.3);
            font-size: 64px;
          }
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

        /* ステージ番号（左寄せ） */
        .stage-number-left {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 32px;
          height: 32px;
          background: #4DB6F7;
          border: 2px solid #2C88C7;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 0 1px #5AC8F7, 2px 2px 0 0 rgba(0,0,0,0.3);
          z-index: 15;
        }

        @media (min-width: 768px) {
          .stage-number-left {
            top: 10px;
            left: 10px;
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
        }

        .pixel-stage-node.locked .stage-number-left {
          background: #757575;
          border-color: #616161;
          box-shadow: 0 0 0 1px #9E9E9E, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .pixel-stage-node.completed .stage-number-left {
          background: #8EE38F;
          border-color: #6CBD6C;
        }

        /* ステータスバッジコンテナ */
        .stage-status-badges {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 15;
        }

        @media (min-width: 768px) {
          .stage-status-badges {
            top: 10px;
            right: 10px;
          }
        }

        /* CLEARバッジ */
        .clear-badge {
          background: #FFD700;
          border: 2px solid #B8860B;
          padding: 4px 8px;
          font-weight: bold;
          font-size: 12px;
          color: #654321;
          letter-spacing: 1px;
          box-shadow: 0 0 0 1px #DAA520, 2px 2px 0 0 rgba(0,0,0,0.5);
          animation: bounce-in 0.5s ease;
          border-radius: 4px;
        }

        @media (min-width: 768px) {
          .clear-badge {
            padding: 6px 12px;
            font-size: 14px;
          }
        }

        /* 現在地バッジ */
        .current-badge {
          background: #FF6B6B;
          border: 2px solid #DC143C;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 0 0 1px #FF8787, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .current-icon {
          font-size: 14px;
          line-height: 1;
        }

        @media (min-width: 768px) {
          .current-badge {
            padding: 6px 8px;
          }
          .current-icon {
            font-size: 16px;
          }
        }

        /* ロックバッジ */
        .lock-badge {
          background: #9E9E9E;
          border: 2px solid #616161;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 0 0 1px #BDBDBD, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .lock-icon {
          font-size: 14px;
          line-height: 1;
          opacity: 0.8;
        }

        @media (min-width: 768px) {
          .lock-badge {
            padding: 6px 8px;
          }
          .lock-icon {
            font-size: 16px;
          }
        }

        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }





        /* ステージ情報 */
        .pixel-stage-info {
          background: white;
          border: 2px solid #333;
          padding: 8px 12px;
          margin-top: 12px;
          position: relative;
          box-shadow: 0 0 0 1px #666, 3px 3px 0 0 rgba(0,0,0,0.2);
        }

        @media (min-width: 768px) {
          .pixel-stage-info {
            border: 3px solid #333;
            padding: 12px 16px;
            margin-top: 16px;
            box-shadow: 0 0 0 1px #666, 4px 4px 0 0 rgba(0,0,0,0.2);
          }
        }

        .stage-title {
          font-size: 0.95rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
          line-height: 1.3;
        }

        @media (min-width: 768px) {
          .stage-title {
            font-size: 1.1rem;
            margin-bottom: 4px;
          }
        }

        .stage-description {
          font-size: 0.8rem;
          color: #666;
          line-height: 1.3;
        }

        @media (min-width: 768px) {
          .stage-description {
            font-size: 0.9rem;
            line-height: 1.4;
          }
        }



        /* カテゴリーブロック */
        /* カテゴリーブロック */
        .category-blocks {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(2, minmax(420px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1100px) {
          .category-blocks {
            grid-template-columns: 1fr;
          }
        }








      `}</style>
    </>
  )
} 