'use client'

import React, { useState, useEffect, memo } from 'react'
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
const getStatusClasses = (status: StageStatus): string => {
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
const getGridTransformClasses = (gridPosition?: number): string => {
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

function StageNode({
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

  // ステージアイコンのスタイル
  const iconStyle = {
    backgroundImage: stage.status === 'completed' ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : undefined,
    backgroundColor: stage.status === 'locked' ? '#9e9e9e' : '#e8f5e9'
  }

  // ステージ番号のスタイル
  const numberStyle = {
    color: stage.status === 'completed' ? '#fff' : '#333',
    textShadow: stage.status === 'completed' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
  }

  return (
    <div 
      className={`${getStatusClasses(stage.status)} ${getGridTransformClasses(gridPosition)} ${className}`}
      onClick={handleClick}
      role="button"
      aria-label={`ステージ ${stage.stageId}`}
    >
      <div className="stage-icon" style={iconStyle}>
        {imageError || !stage.iconUrl ? (
          <span className="text-6xl" style={numberStyle}>
            {stage.fallbackIcon}
          </span>
        ) : (
          <OptimizedImage
            src={stage.iconUrl}
            alt={`ステージ ${stage.stageId} アイコン`}
            width={80}
            height={80}
            onError={handleImageError}
            className="rounded"
            fallbackSrc="/icon-192.png"
          />
        )}
        
        {isPendingApproval && (
          <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-xs">⏳</span>
          </div>
        )}
      </div>

      <div className="stage-info">
        <h3 className="text-lg font-bold text-white mb-1 drop-shadow">
          ステージ {stage.stageId}
        </h3>
        <p className="text-sm text-white/80">
          {stage.title}
        </p>
      </div>

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
          opacity: 0.7;
        }

        .stage-node.locked:hover {
          transform: none;
        }

        .stage-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 16px;
          position: relative;
          border: 4px solid #333;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 0 rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          transition: all 0.3s ease;
          overflow: hidden;
          border-radius: 16px;
        }

        .stage-info {
          opacity: 0.9;
          transition: opacity 0.3s ease;
        }

        .stage-node:hover .stage-info {
          opacity: 1;
        }

        .stage-node.completed .stage-icon {
          border-color: #2E7D32;
          box-shadow: 0 0 0 2px #4CAF50, 6px 6px 0 0 rgba(0,0,0,0.3);
        }

        .stage-node.current .stage-icon {
          border-color: #1976D2;
          box-shadow: 0 0 0 2px #2196F3, 6px 6px 0 0 rgba(0,0,0,0.3);
        }

        .stage-node.pending .stage-icon {
          border-color: #FFA000;
          box-shadow: 0 0 0 2px #FFC107, 6px 6px 0 0 rgba(0,0,0,0.3);
        }

        @media (max-width: 767px) {
          .stage-icon {
            width: 100px;
            height: 100px;
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  )
}

// メモ化したコンポーネントをエクスポート
export default memo(StageNode) 