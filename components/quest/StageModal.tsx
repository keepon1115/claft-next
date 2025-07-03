'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuestStore } from '@/stores/questStore'
import { useAuth } from '@/hooks/useAuth'
import { X, Video, FileText, Lock, CheckCircle, AlertTriangle } from 'lucide-react'

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
// StageModalコンポーネント
// =====================================================

export function StageModal({ stageId, onClose, isOpen }: StageModalProps) {
  const [mounted, setMounted] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const { stageDetails, userProgress, completeStage, submitStage } = useQuestStore()

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
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-yellow-800" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">ステージロック中</h2>
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

  // ステージ完了処理
  const handleComplete = async () => {
    const result = await completeStage(stageId)
    if (result.success) {
      onClose()
    }
  }

  // ステージ提出処理
  const handleSubmit = async () => {
    const result = await submitStage(stageId)
    if (result.success) {
      onClose()
    }
  }

  // メインモーダル
  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white border-4 border-gray-800 p-8 max-w-2xl w-full mx-4 relative rounded-lg">
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded"
          onClick={onClose}
          aria-label="モーダルを閉じる"
        >
          <X size={16} />
        </button>
        
        {/* ステージヘッダー */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            ステージ {stageId}: {stage.title}
          </h2>
          <p className="text-lg text-gray-600">
            {stage.description}
          </p>
        </div>

        {/* ステージメッセージ */}
        <div className="bg-yellow-50 border-2 border-yellow-200 p-6 mb-8 rounded-lg">
          <p className="text-xl text-yellow-800 font-medium text-center italic">
            『{stage.message}』
          </p>
        </div>

        {/* ステータスバッジ */}
        <div className="flex justify-center mb-8">
          {status === 'completed' && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle size={20} />
              <span className="font-bold">クリア済み！</span>
            </div>
          )}
          {status === 'pending_approval' && (
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
              <AlertTriangle size={20} />
              <span className="font-bold">承認待ち</span>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stage.videoUrl && (
            <a
              href={stage.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white border-2 border-blue-700 font-bold hover:bg-blue-600 transition-colors rounded-lg"
            >
              <Video size={24} />
              動画を見る
            </a>
          )}
          
          {stage.formUrl && (
            <a
              href={stage.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white border-2 border-green-700 font-bold hover:bg-green-600 transition-colors rounded-lg"
            >
              <FileText size={24} />
              クエストに挑む
            </a>
          )}
        </div>

        {/* 完了・提出ボタン */}
        {status === 'current' && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-purple-500 text-white border-2 border-purple-700 font-bold hover:bg-purple-600 transition-colors rounded-lg"
            >
              クエストを提出する
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default StageModal 