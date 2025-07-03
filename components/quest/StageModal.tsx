'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuestStore } from '@/stores/questStore'
import { useAuth } from '@/stores/authStore'
import { X } from 'lucide-react'

// =====================================================
// StageModal型定義
// =====================================================

interface StageModalProps {
  /** 表示するステージID */
  stageId: number | null
  /** モーダルを閉じるコールバック */
  onClose: () => void
  /** モーダルが開いているか */
  isOpen: boolean
}

// =====================================================
// 最小限のStageModalコンポーネント（styled-jsx除去）
// =====================================================

export function StageModal({ stageId, onClose, isOpen }: StageModalProps) {
  const [mounted, setMounted] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const { stageDetails, userProgress } = useQuestStore()

  // モーダル外クリック検出
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // ESCキーでモーダル閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // マウント状態管理
  useEffect(() => {
    setMounted(true)
  }, [])

  // モーダルが閉じているか、ステージIDがない場合は何も表示しない
  if (!isOpen || !stageId || !mounted) {
    return null
  }

  const stage = stageDetails[stageId]
  if (!stage) {
    return null
  }

  const status = userProgress[stageId]
  const isStage1 = stageId === 1
  const isGuest = !isAuthenticated && isStage1

  // ロックされているステージ（ステージ1以外）へのアクセス制御
  if (status === 'locked' && !isStage1) {
    return createPortal(
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="bg-yellow-100 border-4 border-yellow-800 p-8 max-w-md w-full mx-4 relative rounded-lg">
          <button 
            className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded"
            onClick={onClose}
            aria-label="モーダルを閉じる"
          >
            <X size={16} />
          </button>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">🔒 ステージロック中</h2>
          <p className="text-yellow-700 mb-6 text-center leading-relaxed">
            このステージはまだ開放されていません！<br />
            前のステージをクリアして進めましょう。
          </p>
          <div className="flex justify-center">
            <button 
              className="px-6 py-3 bg-blue-500 text-white border-2 border-blue-700 font-bold hover:bg-blue-600 transition-colors rounded"
              onClick={onClose}
            >
              戻る
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // メインモーダル（簡素化版）
  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-yellow-100 border-4 border-yellow-800 p-8 max-w-md w-full mx-4 relative rounded-lg">
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded"
          onClick={onClose}
          aria-label="モーダルを閉じる"
        >
          <X size={16} />
        </button>
        
        <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">
          ステージ {stageId}: {stage.title}
        </h2>
        
        <p className="text-yellow-700 mb-6 text-center leading-relaxed">
          {stage.description}
        </p>
        
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mb-6 text-center italic text-yellow-800 rounded">
          {stage.message}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            className="flex-1 px-4 py-3 bg-green-500 text-white border-2 border-green-700 font-bold hover:bg-green-600 transition-colors rounded"
            onClick={() => alert('動画機能（テスト版）')}
          >
            🎬 動画を見る
          </button>
          
          <button
            className="flex-1 px-4 py-3 bg-blue-500 text-white border-2 border-blue-700 font-bold hover:bg-blue-600 transition-colors rounded"
            onClick={() => alert('クエスト機能（テスト版）')}
          >
            ⚔️ クエストに挑む
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default StageModal 