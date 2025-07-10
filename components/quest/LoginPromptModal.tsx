'use client'

import React, { useEffect } from 'react'
import { Lock, Sparkles } from 'lucide-react'

// ==========================================
// ログイン促進モーダルコンポーネント
// ==========================================

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
  stageId: number
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  onLoginClick,
  stageId
}) => {
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

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border-4 border-gray-800 p-8 max-w-md w-full mx-4 relative rounded-lg">
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded"
          onClick={onClose}
          aria-label="モーダルを閉じる"
        >
          ×
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">🚪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            冒険者登録が必要です！
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            ステージ{stageId}の詳細を見るには<br />
            冒険者登録（ログイン）が必要です。
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="text-blue-600" size={20} />
              <span className="font-bold text-blue-800">冒険者登録の特典</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✨ あなただけの進捗を記録</li>
              <li>🎯 クエストに挑戦可能</li>
              <li>💬 スタッフからのメッセージ受信</li>
              <li>🏆 冒険の成果を確認</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold hover:bg-gray-200 transition-colors rounded-lg"
            >
              後で登録する
            </button>
            <button
              onClick={onLoginClick}
              className="flex-1 px-4 py-3 bg-blue-600 text-white border-2 border-blue-800 font-bold hover:bg-blue-700 transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              冒険者登録
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPromptModal 