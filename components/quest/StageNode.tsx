'use client'

import React, { useState, useEffect } from 'react'
import OptimizedImage from '@/components/common/OptimizedImage'
import type { StageStatus, StageProgress } from '@/stores/questStore'

// =====================================================
// 型定義
// =====================================================

export interface StageNodeProps {
  /** ステージの詳細情報 */
  stage: StageProgress
  /** クリック時のハンドラー */
  onClick?: (stageId: number) => void
  /** パスラインの表示有無 */
  showPathLine?: boolean
  /** 追加のクラス名 */
  className?: string
  /** グリッド内での位置（アニメーション用） */
  gridPosition?: number
  /** デバッグモード */
  debug?: boolean
}

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * ステータスに応じたCSSクラスを生成
 */
function getStatusClasses(status: StageStatus): string {
  const baseClasses = ['stage-node']
  
  switch (status) {
    case 'locked':
      baseClasses.push('locked')
      break
    case 'current':
      baseClasses.push('current')
      break
    case 'completed':
      baseClasses.push('completed')
      break
    case 'pending_approval':
      baseClasses.push('current', 'pending')
      break
  }
  
  return baseClasses.join(' ')
}

/**
 * グリッド位置に応じた変形クラスを取得
 */
function getGridTransformClasses(gridPosition?: number): string {
  if (!gridPosition) return ''
  
  // レスポンシブ対応：デスクトップは3列、モバイルは2列
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth > 767 : true
  
  if (isDesktop) {
    // デスクトップ: 2番目と5番目のアイテムを下にオフセット
    if (gridPosition === 2 || gridPosition === 5) {
      return 'md:translate-y-10'
    }
  } else {
    // モバイル: 偶数番目のアイテムを下にオフセット（ただし5番目は除く）
    if (gridPosition % 2 === 0 && gridPosition !== 5) {
      return 'translate-y-10'
    }
  }
  
  return ''
}

// =====================================================
// メインコンポーネント
// =====================================================

export default function StageNode({
  stage,
  onClick,
  showPathLine = true,
  className = '',
  gridPosition,
  debug = false
}: StageNodeProps) {
  const [imageError, setImageError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドのマウント確認
  useEffect(() => {
    setIsClient(true)
  }, [])

  // クリックハンドラー
  const handleClick = () => {
    if (onClick && (stage.status !== 'locked' || stage.stageId === 1)) {
      onClick(stage.stageId)
    }
  }

  // 画像エラーハンドラー
  const handleImageError = () => {
    setImageError(true)
  }

  // 承認待ちかどうか
  const isPendingApproval = stage.status === 'pending_approval'
  
  // デバッグ情報
  if (debug) {
    console.log(`StageNode ${stage.stageId}:`, {
      status: stage.status,
      statusClasses: getStatusClasses(stage.status),
      gridPosition,
      transformClasses: getGridTransformClasses(gridPosition)
    })
  }

  return (
    <>
      <style jsx>{`
        .stage-node {
          position: relative;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .stage-node:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .stage-node.locked {
          cursor: not-allowed;
        }

        .stage-node.locked:hover {
          transform: none;
        }

        /* グリッド位置による変形（CSS-in-JSで動的に適用） */
        .stage-node.position-2,
        .stage-node.position-5 {
          transform: translateY(40px);
        }

        .stage-node.position-2:hover,
        .stage-node.position-5:hover {
          transform: translateY(35px) scale(1.05);
        }

        /* モバイル対応 */
        @media (max-width: 767px) {
          .stage-node.position-2,
          .stage-node.position-5 {
            transform: translateY(0);
          }

          .stage-node.position-even {
            transform: translateY(40px);
          }

          .stage-node.position-even:hover {
            transform: translateY(35px) scale(1.05);
          }

          .stage-node.position-5 {
            transform: translateY(0);
          }

          .stage-node.position-5:hover {
            transform: translateY(-5px) scale(1.05);
          }
        }

        /* ステージアイコン */
        .stage-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 16px;
          position: relative;
          background: #e8f5e9;
          border: 4px solid #333;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 0 rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .stage-node.locked .stage-icon,
        .stage-node.current .stage-icon {
          background: #9e9e9e;
        }

        .stage-node.completed .stage-icon {
          background: #fff9c4;
          box-shadow: 0 0 0 2px #ffd700, 6px 6px 0 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.5);
        }

        /* アイコン画像 */
        .icon-image {
          width: 64px;
          height: 64px;
          object-fit: contain;
          image-rendering: pixelated;
          transition: filter 0.3s ease;
          filter: grayscale(1);
        }

        .stage-node.completed .icon-image {
          filter: grayscale(0);
        }

        .stage-node.locked .icon-image {
          filter: grayscale(1);
          opacity: 0.7;
        }

        /* フォールバックアイコン */
        .icon-fallback {
          font-size: 64px;
          filter: grayscale(1);
        }

        .stage-node.completed .icon-fallback {
          filter: grayscale(0);
        }

        .stage-node.locked .icon-fallback {
          filter: grayscale(1);
          opacity: 0.7;
        }

        /* クリアエフェクト */
        .clear-effect {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          object-fit: contain;
          z-index: 2;
          animation: effect-animation 2s ease-in-out infinite;
        }

        @keyframes effect-animation {
          0%, 100% { 
            transform: translateY(0) scale(1) rotate(0deg); 
            opacity: 0.9; 
          }
          25% { 
            transform: translateY(-5px) scale(1.1) rotate(5deg); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(0) scale(1) rotate(0deg); 
            opacity: 0.9; 
          }
          75% { 
            transform: translateY(-3px) scale(1.05) rotate(-5deg); 
            opacity: 1; 
          }
        }

        /* クリアバッジ */
        .clear-badge {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: #ffd700;
          border: 3px solid #b8860b;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 14px;
          color: #654321;
          letter-spacing: 1px;
          box-shadow: 0 0 0 1px #daa520, 3px 3px 0 0 rgba(0,0,0,0.5);
          z-index: 10;
          animation: bounce-in 0.5s ease;
          border-radius: 4px;
        }

        @keyframes bounce-in {
          0% { 
            transform: translateX(-50%) translateY(-20px) scale(0); 
          }
          50% { 
            transform: translateX(-50%) translateY(0) scale(1.2); 
          }
          100% { 
            transform: translateX(-50%) translateY(0) scale(1); 
          }
        }

        /* 承認待ちバッジ */
        .pending-badge {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff9800;
          border: 3px solid #f57c00;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 12px;
          color: white;
          letter-spacing: 1px;
          box-shadow: 0 0 0 1px #ffb74d, 3px 3px 0 0 rgba(0,0,0,0.5);
          z-index: 10;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* ステージ番号バッジ */
        .stage-number-badge {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          background: #4db6f7;
          border: 3px solid #2c88c7;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 0 1px #5ac8f7, 3px 3px 0 0 rgba(0,0,0,0.3);
          z-index: 5;
          padding: 2px;
        }

        .stage-number-badge::before,
        .stage-number-badge::after {
          content: '';
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          box-shadow: 0 0 0 1px #2c88c7;
        }

        .stage-number-badge::before {
          left: 10px;
        }

        .stage-number-badge::after {
          right: 10px;
        }

        .stage-number-text {
          margin-top: 14px;
        }

        .stage-node.locked .stage-number-badge {
          background: #757575;
          border-color: #616161;
          box-shadow: 0 0 0 1px #9e9e9e, 3px 3px 0 0 rgba(0,0,0,0.3);
        }

        .stage-node.locked .stage-number-badge::before,
        .stage-node.locked .stage-number-badge::after {
          background: #ccc;
          box-shadow: 0 0 0 1px #616161;
        }

        .stage-node.completed .stage-number-badge {
          background: #8ee38f;
          border-color: #6cbd6c;
        }

        .stage-node.completed .stage-number-badge::before,
        .stage-node.completed .stage-number-badge::after {
          box-shadow: 0 0 0 1px #6cbd6c;
        }

        /* ヒーローフェイス */
        .hero-face {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background-color: #ffeb3b;
          border: 3px solid #fbc02d;
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

        .hero-mouth {
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
          0%, 100% { 
            transform: translateX(-50%) translateY(0); 
          }
          50% { 
            transform: translateX(-50%) translateY(-4px); 
          }
        }

        /* ステージ情報 */
        .stage-info {
          background: white;
          border: 3px solid #333;
          padding: 12px 16px;
          margin-top: 16px;
          position: relative;
          box-shadow: 0 0 0 1px #666, 4px 4px 0 0 rgba(0,0,0,0.2);
          border-radius: 4px;
        }

        .stage-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
          line-height: 1.3;
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
            #8b4513,
            #8b4513 10px,
            #d2691e 10px,
            #d2691e 20px
          );
          top: 60px;
          right: -60px;
          transform: translateY(-50%);
          z-index: 1;
        }

        /* パスライン非表示条件 */
        .stage-node:nth-child(3n) .path-line,
        .stage-node:last-child .path-line {
          display: none;
        }

        @media (max-width: 767px) {
          .stage-node:nth-child(3n) .path-line {
            display: block;
          }
          
          .stage-node:nth-child(2n) .path-line,
          .stage-node:last-child .path-line {
            display: none;
          }
        }
      `}</style>

      <div
        className={[
          getStatusClasses(stage.status),
          gridPosition && `position-${gridPosition}`,
          gridPosition && gridPosition % 2 === 0 && 'position-even',
          className
        ].filter(Boolean).join(' ')}
        onClick={handleClick}
        role="button"
        tabIndex={stage.status === 'locked' && stage.stageId !== 1 ? -1 : 0}
        aria-label={`ステージ${stage.stageId}: ${stage.title} - ${stage.status}`}
      >
        {/* クリアバッジ */}
        {stage.status === 'completed' && (
          <div className="clear-badge">
            CLEAR!
          </div>
        )}

        {/* 承認待ちバッジ */}
        {isPendingApproval && (
          <div className="pending-badge">
            承認待ち
          </div>
        )}

        {/* ヒーローフェイス */}
        {(stage.status === 'current' || isPendingApproval) && (
          <div className="hero-face">
            <div className="hero-mouth"></div>
          </div>
        )}

        {/* ステージアイコン */}
        <div className="stage-icon">
          {/* アイコン画像 */}
          {stage.iconImage && !imageError && isClient && (
            <OptimizedImage
              src={stage.iconImage}
              alt={`ステージ${stage.stageId}アイコン`}
              width={64}
              height={64}
              className="icon-image"
              onError={handleImageError}
              priority={stage.stageId <= 3} // 最初の3ステージは優先読み込み
              enableBlur={true}
              fallbackSrc="/icon-192.png"
            />
          )}

          {/* フォールバックアイコン */}
          {(!stage.iconImage || imageError) && (
            <span className="icon-fallback">
              {stage.fallbackIcon}
            </span>
          )}

          {/* クリアエフェクト */}
          {stage.status === 'completed' && (
            <div className="clear-effect">
              ✨
            </div>
          )}
        </div>

        {/* ステージ番号バッジ */}
        <div className="stage-number-badge">
          <span className="stage-number-text">{stage.stageId}</span>
        </div>

        {/* ステージ情報 */}
        <div className="stage-info">
          <h3 className="stage-title">{stage.title}</h3>
          <p className="stage-description">{stage.description}</p>
        </div>

        {/* パスライン */}
        {showPathLine && <div className="path-line"></div>}
      </div>
    </>
  )
} 