'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuestStore } from '@/stores/questStore'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { X, Video, FileText, Lock, CheckCircle, AlertTriangle, ArrowRight, Info, Flame, MessageSquare } from 'lucide-react'

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

interface FeedbackData {
  feedback_message: string | null
  feedback_sent_at: string | null
  feedback_sent_by: string | null
}

// =====================================================
// StageModalコンポーネント
// =====================================================

export function StageModal({ stageId, onClose, isOpen }: StageModalProps) {
  const [mounted, setMounted] = useState(false)
  const [showSubmitGuide, setShowSubmitGuide] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const { stageDetails, userProgress, completeStageWithConfirmation } = useQuestStore()

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

  // フィードバックデータ取得
  const fetchFeedback = useCallback(async () => {
    if (!user?.id || !stageId) return

    setLoadingFeedback(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase
        .from('quest_progress')
        .select('feedback_message, feedback_sent_at, feedback_sent_by')
        .eq('user_id', user.id)
        .eq('stage_id', stageId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('フィードバック取得エラー:', error)
        return
      }

      setFeedbackData(data || null)
    } catch (error) {
      console.error('フィードバック取得エラー:', error)
    } finally {
      setLoadingFeedback(false)
    }
  }, [user?.id, stageId])

  // ステージが完了している場合はフィードバックを取得
  useEffect(() => {
    if (stageId && userProgress[stageId] === 'completed') {
      fetchFeedback()
    }
  }, [stageId, userProgress, fetchFeedback])

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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]" onClick={handleBackdropClick}>
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

  // ステージ完了処理（確認ポップアップ付き）
  const handleCompleteWithConfirmation = async () => {
    const result = await completeStageWithConfirmation(stageId)
    if (result.success) {
      // 祝福演出を表示
      setShowCelebration(true)
      // 3秒後にモーダルを閉じる
      setTimeout(() => {
        setShowCelebration(false)
        onClose()
      }, 3000)
    } else if (!result.cancelled) {
      // エラーが発生した場合（キャンセル以外）
      alert(`エラー: ${result.error}`)
    }
  }

  // Googleフォーム送信ガイドの表示
  const handleFormClick = () => {
    setShowSubmitGuide(true)
  }

  // フィードバック表示
  const handleShowFeedback = () => {
    setShowFeedback(true)
  }

  // 祝福演出モーダル
  if (showCelebration) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]">
        <div className="celebration-container">
          <div className="celebration-content">
            <div className="celebration-emojis">
              <span className="celebration-emoji">🎉</span>
              <span className="celebration-emoji">✨</span>
              <span className="celebration-emoji">🏆</span>
              <span className="celebration-emoji">🎊</span>
              <span className="celebration-emoji">⭐</span>
            </div>
            <h2 className="celebration-title">
              おめでとうございます！
            </h2>
            <p className="celebration-subtitle">
              ステージ{stageId}をクリアしました！
            </p>
            <div className="celebration-sparkles">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className={`sparkle sparkle-${i + 1}`}>✨</div>
              ))}
            </div>
          </div>
        </div>
        <style jsx>{`
          .celebration-container {
            position: relative;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: 6px solid #B8860B;
            border-radius: 20px;
            padding: 60px 40px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
            animation: celebration-bounce 0.6s ease-out;
            overflow: hidden;
          }

          .celebration-content {
            position: relative;
            z-index: 2;
          }

          .celebration-emojis {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
          }

          .celebration-emoji {
            font-size: 3rem;
            animation: emoji-bounce 1s ease-in-out infinite;
          }

          .celebration-emoji:nth-child(1) { animation-delay: 0s; }
          .celebration-emoji:nth-child(2) { animation-delay: 0.2s; }
          .celebration-emoji:nth-child(3) { animation-delay: 0.4s; }
          .celebration-emoji:nth-child(4) { animation-delay: 0.6s; }
          .celebration-emoji:nth-child(5) { animation-delay: 0.8s; }

          .celebration-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #8B4513;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: title-glow 2s ease-in-out infinite alternate;
          }

          .celebration-subtitle {
            font-size: 1.5rem;
            color: #654321;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }

          .celebration-sparkles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .sparkle {
            position: absolute;
            font-size: 1.5rem;
            opacity: 0;
            animation: sparkle-float 3s ease-in-out infinite;
          }

          .sparkle-1 { top: 10%; left: 10%; animation-delay: 0.1s; }
          .sparkle-2 { top: 20%; right: 15%; animation-delay: 0.3s; }
          .sparkle-3 { top: 30%; left: 20%; animation-delay: 0.5s; }
          .sparkle-4 { top: 40%; right: 25%; animation-delay: 0.7s; }
          .sparkle-5 { top: 50%; left: 5%; animation-delay: 0.9s; }
          .sparkle-6 { top: 60%; right: 10%; animation-delay: 1.1s; }
          .sparkle-7 { top: 70%; left: 15%; animation-delay: 1.3s; }
          .sparkle-8 { top: 80%; right: 20%; animation-delay: 1.5s; }
          .sparkle-9 { top: 15%; left: 80%; animation-delay: 0.2s; }
          .sparkle-10 { top: 25%; right: 80%; animation-delay: 0.4s; }
          .sparkle-11 { top: 35%; left: 75%; animation-delay: 0.6s; }
          .sparkle-12 { top: 45%; right: 75%; animation-delay: 0.8s; }
          .sparkle-13 { top: 55%; left: 85%; animation-delay: 1.0s; }
          .sparkle-14 { top: 65%; right: 85%; animation-delay: 1.2s; }
          .sparkle-15 { top: 75%; left: 70%; animation-delay: 1.4s; }
          .sparkle-16 { top: 85%; right: 70%; animation-delay: 1.6s; }
          .sparkle-17 { top: 5%; left: 50%; animation-delay: 0.25s; }
          .sparkle-18 { top: 95%; left: 50%; animation-delay: 1.25s; }
          .sparkle-19 { top: 50%; left: 2%; animation-delay: 0.75s; }
          .sparkle-20 { top: 50%; right: 2%; animation-delay: 1.75s; }

          @keyframes celebration-bounce {
            0% { 
              transform: scale(0.3) rotate(-10deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.1) rotate(5deg);
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }

          @keyframes emoji-bounce {
            0%, 100% { 
              transform: translateY(0) rotate(0deg) scale(1);
            }
            50% { 
              transform: translateY(-20px) rotate(10deg) scale(1.1);
            }
          }

          @keyframes title-glow {
            0% { 
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            100% { 
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.8);
            }
          }

          @keyframes sparkle-float {
            0% { 
              opacity: 0;
              transform: translateY(20px) scale(0);
            }
            50% { 
              opacity: 1;
              transform: translateY(-10px) scale(1);
            }
            100% { 
              opacity: 0;
              transform: translateY(-40px) scale(0);
            }
          }

          @media (max-width: 768px) {
            .celebration-container {
              margin: 20px;
              padding: 40px 20px;
            }

            .celebration-title {
              font-size: 2rem;
            }

            .celebration-subtitle {
              font-size: 1.2rem;
            }

            .celebration-emoji {
              font-size: 2rem;
            }
          }
        `}</style>
      </div>,
      document.body
    )
  }

  // フィードバックモーダル
  if (showFeedback) {
    return createPortal(
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]" onClick={handleBackdropClick}>
        <div className="bg-white border-4 border-gray-800 p-8 max-w-lg w-full mx-4 relative rounded-lg">
          <button 
            className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded"
            onClick={() => setShowFeedback(false)}
            aria-label="メッセージモーダルを閉じる"
          >
            <X size={16} />
          </button>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                ステージ{stageId} メッセージ
              </h2>
            </div>
          </div>

          {loadingFeedback ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">メッセージを読み込み中...</p>
            </div>
          ) : feedbackData?.feedback_message ? (
            <div>
              <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3">📝 スタッフからのメッセージ</h3>
                <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">
                  {feedbackData.feedback_message}
                </p>
              </div>
              {feedbackData.feedback_sent_at && (
                <p className="text-sm text-gray-500 text-center">
                  送信日時: {new Date(feedbackData.feedback_sent_at).toLocaleString('ja-JP')}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">メッセージ待ち</h3>
              <p className="text-gray-600">
                スタッフからのメッセージはまだ届いていません。<br />
                しばらくお待ちください。
              </p>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowFeedback(false)}
              className="px-6 py-3 bg-gray-500 text-white border-2 border-gray-700 font-bold hover:bg-gray-600 transition-colors rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // メインモーダル
  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]" onClick={handleBackdropClick}>
      <div className="bg-white border-4 border-gray-800 p-8 max-w-2xl w-full mx-4 relative rounded-lg max-h-[90vh] overflow-y-auto">
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
              <span className="font-bold">メッセージ待ち</span>
            </div>
          )}
        </div>

        {/* クエスト完了フローガイド（挑戦中のみ） */}
        {status === 'current' && (
          <div className="bg-blue-50 border-2 border-blue-200 p-6 mb-8 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-blue-800">📋 クエスト完了の流れ</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-blue-700">まず「動画を見る」を押して学習しましょう</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-blue-700">「クエストに挑む」でGoogleフォームを送信</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-blue-700">フォーム送信後、「クエスト完了を報告」を押す</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                <span className="text-green-700 font-medium">次のステージに進めます！</span>
              </div>
            </div>
          </div>
        )}

        {/* 提出ガイド（フォームクリック後に表示） */}
        {showSubmitGuide && status === 'current' && (
          <div className="bg-green-50 border-2 border-green-200 p-6 mb-8 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="text-lg font-bold text-green-800">✅ 次のステップ</h3>
            </div>
            <p className="text-green-700 mb-4">
              Googleフォームを送信したら、このページに戻って<br />
              <strong>「クエスト完了を報告」ボタン</strong>を押してください！
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <ArrowRight size={16} />
              <span>報告後は次のステージに進むことができます</span>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              onClick={handleFormClick}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-black border-2 border-green-700 font-bold hover:bg-green-600 transition-colors rounded-lg"
            >
             <Flame size={24} />
              クエストに挑む
            </a>
          )}

          {/* フィードバック確認ボタン（完了済みの場合のみ） */}
          {status === 'completed' && (
            <button
              onClick={handleShowFeedback}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-500 text-white border-2 border-purple-700 font-bold hover:bg-purple-600 transition-colors rounded-lg"
            >
              <MessageSquare size={24} />
              メッセージ確認
            </button>
          )}
        </div>

        {/* 完了報告ボタン（挑戦中のみ） */}
        {status === 'current' && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleCompleteWithConfirmation}
              className="px-8 py-3 bg-amber-500 text-white border-2 border-amber-700 font-bold hover:bg-amber-600 transition-colors rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={20} />
              クエスト完了を報告
            </button>
          </div>
        )}

        {/* 重要な注意事項（挑戦中のみ） */}
        {status === 'current' && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-orange-600" size={18} />
              <span className="font-bold text-orange-800">重要</span>
            </div>
            <p className="text-orange-700 text-sm">
              Googleフォームの送信だけでは次のステージに進めません。<br />
              必ず「クエスト完了を報告」ボタンを押して完了してください。
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default StageModal 