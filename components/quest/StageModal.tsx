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
// StageModalコンポーネント
// =====================================================

export function StageModal({ stageId, onClose, isOpen }: StageModalProps) {
  const [isVideoWatched, setIsVideoWatched] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const { 
    stageDetails, 
    userProgress, 
    updateStageProgress, 
    submitStage,
    isSyncing 
  } = useQuestStore()

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
      // モーダル開いている間はスクロール無効
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

  // 動画視聴状態をローカルストレージから復元
  useEffect(() => {
    if (stageId) {
      const watched = localStorage.getItem(`stage_${stageId}_video_watched`) === 'true'
      setIsVideoWatched(watched)
    }
  }, [stageId])

  // 動画視聴ハンドラー
  const handleVideoWatch = useCallback(() => {
    if (!stageId || !stageDetails[stageId]?.videoUrl) return

    // 動画URLを新しいタブで開く
    window.open(stageDetails[stageId].videoUrl, '_blank')
    
    // ローカルストレージに視聴フラグを保存
    localStorage.setItem(`stage_${stageId}_video_watched`, 'true')
    setIsVideoWatched(true)
  }, [stageId, stageDetails])

  // クエスト挑戦ハンドラー
  const handleQuestChallenge = useCallback(async () => {
    if (!stageId) return

    const stage = stageDetails[stageId]
    if (!stage) return

    // ゲストユーザーの場合の処理
    if (!isAuthenticated) {
      onClose()
      setTimeout(() => {
        const shouldLogin = confirm('クエストに挑戦するにはログインが必要です。ログインしますか？')
        if (shouldLogin) {
          // 認証モーダルを開く処理（既存のAuthModalコンポーネントとの連携が必要）
          window.dispatchEvent(new CustomEvent('openAuthModal'))
        }
      }, 100)
      return
    }

    // 動画視聴チェック
    if (!isVideoWatched) {
      alert('先に動画を視聴してください')
      return
    }

    try {
      // Googleフォームを新しいタブで開く
      if (stage.formUrl) {
        window.open(stage.formUrl, '_blank')
      }

      // ステータスをpending_approvalに更新
      const result = await submitStage(stageId, {
        google_form_submitted: true,
        submitted_at: new Date().toISOString()
      })

      if (result.success) {
        onClose()
        setTimeout(() => {
          alert('お題を提出しました！管理者の承認をお待ちください。')
        }, 100)
      } else {
        alert(result.error || '進捗の保存に失敗しました。')
      }
    } catch (error) {
      console.error('クエスト提出エラー:', error)
      alert('クエストの提出に失敗しました。')
    }
  }, [stageId, stageDetails, isAuthenticated, isVideoWatched, onClose, submitStage])

  // ゲスト用動画視聴ハンドラー
  const handleGuestVideoWatch = useCallback(() => {
    onClose()
    setTimeout(() => {
      const shouldLogin = confirm('動画を視聴するにはログインが必要です。ログインしますか？')
      if (shouldLogin) {
        window.dispatchEvent(new CustomEvent('openAuthModal'))
      }
    }, 100)
  }, [onClose])

  // ゲスト用クエスト挑戦ハンドラー
  const handleGuestQuestChallenge = useCallback(() => {
    onClose()
    setTimeout(() => {
      const shouldLogin = confirm('クエストに挑戦するにはログインが必要です。ログインしますか？')
      if (shouldLogin) {
        window.dispatchEvent(new CustomEvent('openAuthModal'))
      }
    }, 100)
  }, [onClose])

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
      <div className="modal-overlay" onClick={handleBackdropClick}>
        <div className="modal-content">
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="モーダルを閉じる"
          >
            <X size={20} />
          </button>
          <h2 className="modal-title">🔒 ステージロック中</h2>
          <p className="modal-description">
            このステージはまだ開放されていません！<br />
            前のステージをクリアして進めましょう。
          </p>
          <div className="modal-buttons">
            <button className="modal-button quest" onClick={onClose}>
              戻る
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .modal-overlay {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1001;
            align-items: center;
            justify-content: center;
          }
          
          .modal-content {
            background: #F5F5DC;
            border: 4px solid #8B4513;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 0 0 2px #A0522D, 8px 8px 0 0 rgba(0,0,0,0.5);
            position: relative;
          }
          
          .modal-close {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            background: #DC143C;
            border: 2px solid #8B0000;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            font-weight: bold;
            box-shadow: 2px 2px 0 0 rgba(0,0,0,0.5);
          }
          
          .modal-close:hover {
            transform: translate(-1px, -1px);
            box-shadow: 3px 3px 0 0 rgba(0,0,0,0.5);
          }
          
          .modal-close:active {
            transform: translate(1px, 1px);
            box-shadow: 1px 1px 0 0 rgba(0,0,0,0.5);
          }
          
          .modal-title {
            font-size: 1.6rem;
            color: #8B4513;
            margin-bottom: 16px;
            font-weight: bold;
            text-align: center;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
          }
          
          .modal-description {
            color: #654321;
            margin-bottom: 20px;
            line-height: 1.6;
            text-align: center;
          }
          
          .modal-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
          
          .modal-button {
            flex: 1;
            padding: 12px 24px;
            border: 3px solid;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.1s ease;
            position: relative;
          }
          
          .modal-button.quest {
            background: #2196F3;
            border-color: #1976D2;
            color: white;
            box-shadow: 0 0 0 1px #42A5F5, 4px 4px 0 0 rgba(0,0,0,0.3);
          }
          
          .modal-button.quest:hover {
            transform: translate(-2px, -2px);
            box-shadow: 0 0 0 1px #42A5F5, 6px 6px 0 0 rgba(0,0,0,0.3);
          }
          
          .modal-button:active {
            transform: translate(1px, 1px);
            box-shadow: 0 0 0 1px currentColor, 2px 2px 0 0 rgba(0,0,0,0.3);
          }
          
          @media (max-width: 767px) {
            .modal-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </div>,
      document.body
    )
  }

  // メインモーダル
  return createPortal(
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="モーダルを閉じる"
        >
          <X size={20} />
        </button>
        
        <h2 className="modal-title">
          ステージ {stageId}: {stage.title}
        </h2>
        
        <p className="modal-description">
          {stage.description}
        </p>
        
        <div className="modal-message">
          {stage.message}
        </div>
        
                 <div className="modal-buttons">
           {/* 動画視聴ボタン - current状態またはゲストの場合のみ表示 */}
           {(status === 'current' || isGuest) && (
             <button
               className="modal-button video"
               onClick={isGuest ? handleGuestVideoWatch : handleVideoWatch}
               disabled={isVideoWatched && !isGuest}
             >
               {isVideoWatched && !isGuest ? '✅ 動画視聴済み' : '🎬 動画を見る'}
             </button>
           )}
           
           {/* クエスト挑戦ボタン - current状態の場合 */}
           {status === 'current' && !isGuest && (
             <button
               className="modal-button quest"
               onClick={handleQuestChallenge}
               disabled={isSyncing}
             >
               {isSyncing ? '⏳ 処理中...' : '⚔️ クエストに挑む'}
             </button>
           )}
           
           {/* ゲスト用クエストボタン */}
           {isGuest && (
             <button
               className="modal-button quest"
               onClick={handleGuestQuestChallenge}
             >
               ⚔️ クエストに挑む
             </button>
           )}
           
           {/* 承認待ち状態 - 動画ボタンは非表示、クエストボタンのみ表示 */}
           {status === 'pending_approval' && (
             <button
               className="modal-button quest pending"
               disabled
             >
               ⏳ 承認待ち
             </button>
           )}
           
           {/* 完了状態 - 両方のボタンを非表示（条件で制御済み） */}
         </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1001;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: #F5F5DC;
          border: 4px solid #8B4513;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 0 0 2px #A0522D, 8px 8px 0 0 rgba(0,0,0,0.5);
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: #DC143C;
          border: 2px solid #8B0000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          font-weight: bold;
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.5);
        }
        
        .modal-close:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 0 rgba(0,0,0,0.5);
        }
        
        .modal-close:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 0 rgba(0,0,0,0.5);
        }
        
        .modal-title {
          font-size: 1.6rem;
          color: #8B4513;
          margin-bottom: 16px;
          font-weight: bold;
          text-align: center;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
        }
        
        .modal-description {
          color: #654321;
          margin-bottom: 20px;
          line-height: 1.6;
          text-align: center;
        }
        
        .modal-message {
          background: #FFF9C4;
          border: 2px solid #F9A825;
          padding: 16px;
          margin-bottom: 24px;
          text-align: center;
          font-style: italic;
          color: #5D4037;
          box-shadow: inset 0 0 8px rgba(0,0,0,0.1);
        }
        
        .modal-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        
        .modal-button {
          flex: 1;
          padding: 12px 24px;
          border: 3px solid;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.1s ease;
          position: relative;
        }
        
        .modal-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .modal-button.video {
          background: #4CAF50;
          border-color: #388E3C;
          color: white;
          box-shadow: 0 0 0 1px #66BB6A, 4px 4px 0 0 rgba(0,0,0,0.3);
        }
        
        .modal-button.video:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 0 0 0 1px #66BB6A, 6px 6px 0 0 rgba(0,0,0,0.3);
        }
        
        .modal-button.quest {
          background: #2196F3;
          border-color: #1976D2;
          color: white;
          box-shadow: 0 0 0 1px #42A5F5, 4px 4px 0 0 rgba(0,0,0,0.3);
        }
        
        .modal-button.quest:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 0 0 0 1px #42A5F5, 6px 6px 0 0 rgba(0,0,0,0.3);
        }
        
        .modal-button.quest.pending {
          background: #ff9800;
          border-color: #f57c00;
          color: white;
          box-shadow: 0 0 0 1px #ffb74d, 4px 4px 0 0 rgba(0,0,0,0.3);
        }
        
        .modal-button:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 0 0 0 1px currentColor, 2px 2px 0 0 rgba(0,0,0,0.3);
        }
        
        @media (max-width: 767px) {
          .modal-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>,
    document.body
  )
}

export default StageModal 