'use client'

import React from 'react'
import Image from 'next/image'
import { Lock, CheckCircle, Play, Book, Code, Clock, Trophy } from 'lucide-react'
import type { MinecraftStageProgress, MinecraftStageStatus } from '@/stores/minecraftSdgsStore'

interface MinecraftStageNodeProps {
  stage: MinecraftStageProgress
  onClick: () => void
  imageError?: boolean
  onImageError?: () => void
}

export default function MinecraftStageNode({ 
  stage, 
  onClick, 
  imageError, 
  onImageError 
}: MinecraftStageNodeProps) {
  
  // ステージの進行状況に応じたクラス名を決定
  const getStatusClass = (status: MinecraftStageStatus): string => {
    switch (status) {
      case 'locked': return 'locked'
      case 'current': return 'current'
      case 'sdgs_video_watched': return 'sdgs-progress'
      case 'sdgs_work_completed': return 'sdgs-completed'
      case 'programming_video_watched': return 'programming-progress'
      case 'programming_work_completed': return 'programming-completed'
      case 'completed': return 'completed'
      case 'pending_approval': return 'pending'
      default: return 'locked'
    }
  }

  // ステージの進行状況に応じたアイコンを決定
  const getProgressIcon = (status: MinecraftStageStatus) => {
    switch (status) {
      case 'locked': return <Lock size={20} className="text-gray-400" />
      case 'current': return <Play size={20} className="text-white" />
      case 'sdgs_video_watched': return <Book size={20} className="text-blue-300" />
      case 'sdgs_work_completed': return <CheckCircle size={20} className="text-green-300" />
      case 'programming_video_watched': return <Code size={20} className="text-purple-300" />
      case 'programming_work_completed': return <CheckCircle size={20} className="text-purple-300" />
      case 'completed': return <CheckCircle size={20} className="text-yellow-300" />
      case 'pending_approval': return <Clock size={20} className="text-orange-300" />
      default: return <Lock size={20} className="text-gray-400" />
    }
  }

  // SDGs目標番号の表示用テキスト
  const getSdgsText = (sdgsGoal?: number): string => {
    if (!sdgsGoal || sdgsGoal === 0) return ''
    return `SDG ${sdgsGoal}`
  }

  const statusClass = getStatusClass(stage.status)
  const isClickable = stage.status !== 'locked' // 完了済みステージもクリック可能にする

  return (
    <div 
      className={`minecraft-stage-node ${statusClass}`}
      onClick={isClickable ? onClick : undefined}
      data-stage={stage.stageId}
    >
      {/* SDGs目標バッジ */}
      {stage.sdgsGoal && stage.sdgsGoal > 0 && (
        <div className="minecraft-sdgs-badge">
          {getSdgsText(stage.sdgsGoal)}
        </div>
      )}

      {/* クリア完了バッジ */}
      {stage.status === 'completed' && (
        <div className="minecraft-clear-badge">CLEAR!</div>
      )}
      
      {/* 進行状況インジケーター */}
      <div className="minecraft-progress-indicator">
        {getProgressIcon(stage.status)}
      </div>
      
      {/* ステージアイコン */}
      <div className="minecraft-stage-icon">
        {imageError || !stage.iconUrl ? (
          <span className="stage-emoji">{stage.fallbackIcon}</span>
        ) : (
          <Image
            src={stage.iconUrl}
            alt={`${stage.title} アイコン`}
            width={80}
            height={80}
            className="stage-image pixel-art"
            onError={onImageError}
          />
        )}
        
        {/* ブロック風エフェクト */}
        {stage.status === 'completed' && (
          <div className="minecraft-complete-effect" />
        )}
      </div>
      
      {/* ステージ情報 */}
      <div className="minecraft-stage-info">
        <h3 className="minecraft-stage-title">{stage.title}</h3>
        {stage.stageId >= 3 && (
          <div className="minecraft-limited-badge">※マイクラコース限定</div>
        )}
      </div>

      {/* マイクラブロック風テクスチャ */}
      <div className="minecraft-block-texture" />

      <style jsx>{`
        .minecraft-progress-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 6;
        }

        .minecraft-complete-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle, 
            rgba(255, 215, 0, 0.3) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            transparent 100%
          );
          animation: minecraft-shine 2s ease-in-out infinite;
          border-radius: 0;
        }

        @keyframes minecraft-shine {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        .minecraft-step-progress {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 10px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .minecraft-step-progress .step {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border-radius: 0;
        }

        .minecraft-step-progress .step.active {
          background: var(--minecraft-emerald);
          border-color: var(--minecraft-grass);
          color: white;
          box-shadow: 0 0 8px rgba(80, 200, 120, 0.5);
        }

        .minecraft-block-texture {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="8" height="8" fill="%23ffffff" opacity="0.05"/><rect x="8" y="8" width="8" height="8" fill="%23ffffff" opacity="0.05"/></svg>') repeat;
          pointer-events: none;
          border-radius: 0;
        }

        /* ステージ状態別スタイル拡張 */
        .minecraft-stage-node.sdgs-progress {
          background: linear-gradient(135deg, 
            #4FC3F7 0%, 
            var(--minecraft-grass) 100%
          );
        }

        .minecraft-stage-node.sdgs-completed {
          background: linear-gradient(135deg, 
            #66BB6A 0%, 
            var(--minecraft-emerald) 100%
          );
        }

        .minecraft-stage-node.programming-progress {
          background: linear-gradient(135deg, 
            #AB47BC 0%, 
            var(--minecraft-emerald) 100%
          );
        }

        .minecraft-stage-node.programming-completed {
          background: linear-gradient(135deg, 
            #9C27B0 0%, 
            var(--minecraft-gold) 100%
          );
        }

        .minecraft-stage-node.pending {
          background: linear-gradient(135deg, 
            #FF9800 0%, 
            var(--minecraft-wood) 100%
          );
          animation: minecraft-pending-pulse 2s ease-in-out infinite;
        }

        @keyframes minecraft-pending-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .minecraft-limited-badge {
          font-size: 10px;
          color: #FF6B35;
          font-weight: bold;
          text-align: center;
          margin-top: 4px;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .minecraft-step-progress {
            gap: 3px;
            padding: 5px;
          }
          
          .minecraft-step-progress .step {
            width: 16px;
            height: 16px;
          }
          
          .minecraft-stage-info {
            font-size: 12px;
          }

          .minecraft-limited-badge {
            font-size: 9px;
            padding: 1px 4px;
          }
        }
      `}</style>
    </div>
  )
}