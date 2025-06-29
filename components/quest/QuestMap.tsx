'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'
import StageNode from './StageNode'
import { DynamicStageModal } from '@/components/dynamic/DynamicStageModal'

// =====================================================
// QuestMap型定義
// =====================================================

interface QuestMapProps {
  /** 追加のCSSクラス */
  className?: string
  /** ヘッダーを表示するか */
  showHeader?: boolean
  /** 冒険ログボタンを表示するか */
  showAdventureLog?: boolean
  /** メインクエストボタンを表示するか */
  showMainQuestButton?: boolean
}

// =====================================================
// QuestMapコンポーネント
// =====================================================

export function QuestMap({ 
  className = '',
  showHeader = true,
  showAdventureLog = true,
  showMainQuestButton = true
}: QuestMapProps) {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { isAuthenticated } = useAuth()
  const { 
    stageDetails, 
    userProgress, 
    statistics,
    initialize,
    isInitialized,
    isLoading,
    currentUserId
  } = useQuestStore()

  // 初期化
  useEffect(() => {
    if (!isInitialized) {
      initialize(currentUserId || undefined)
    }
  }, [initialize, isInitialized, currentUserId])

  // ステージクリックハンドラー
  const handleStageClick = useCallback((stageId: number) => {
    const status = userProgress[stageId]
    
    // ステージ1は未ログインでもアクセス可能
    if (stageId === 1 || isAuthenticated) {
      setSelectedStageId(stageId)
      setIsModalOpen(true)
    } else {
      // 他のステージで未ログインの場合
      const shouldLogin = confirm('このステージにアクセスするにはログインが必要です。ログインしますか？')
      if (shouldLogin) {
        window.dispatchEvent(new CustomEvent('openAuthModal'))
      }
    }
  }, [userProgress, isAuthenticated])

  // モーダルを閉じる
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedStageId(null)
  }, [])

  // 冒険ログ表示
  const showAdventureLogModal = useCallback(() => {
    let logText = "📖 これまでの冒険の記録\n\n"
    let completedCount = 0
    let pendingCount = 0
    
    for (let i = 1; i <= 6; i++) {
      const status = userProgress[i]
      const stage = stageDetails[i]
      
      if (status === 'completed') {
        logText += `ステージ${i}: ${stage?.title || ''} - ✅ クリア済み\n`
        completedCount++
      } else if (status === 'current') {
        logText += `ステージ${i}: ${stage?.title || ''} - 🎯 挑戦中\n`
      } else if (status === 'pending_approval') {
        logText += `ステージ${i}: ${stage?.title || ''} - ⏳ 承認待ち\n`
        pendingCount++
      }
    }
    
    if (completedCount === 0 && !Object.values(userProgress).some(s => s === 'current' || s === 'pending_approval')) {
      logText += 'まだ冒険は始まったばかりです！'
    }
    
    if (pendingCount > 0) {
      logText += `\n⏳ ${pendingCount}個のクエストが承認待ちです`
    }
    
    alert(logText)
  }, [userProgress, stageDetails])

  // メインクエストボタンクリック
  const handleMainQuestClick = useCallback(() => {
    if (!isAuthenticated) {
      // ログインしていない場合はステージ1を体験
      setSelectedStageId(1)
      setIsModalOpen(true)
      return
    }
    
    // 現在進行中または承認待ちのステージを探す
    const currentStageEntry = Object.entries(userProgress).find(([_, status]) => 
      status === 'current' || status === 'pending_approval'
    )
    
    if (currentStageEntry) {
      setSelectedStageId(parseInt(currentStageEntry[0]))
      setIsModalOpen(true)
    } else if (Object.values(userProgress).every(s => s === 'completed') && Object.keys(userProgress).length >= 6) {
      // 全クリア済み
      alert('🎉 おめでとうございます！全ての冒険を達成しました！')
    } else {
      // 次のロックされたステージまたは進行中のステージを探す
      const firstAvailable = Object.entries(userProgress).find(([id, stat]) => 
        stat === 'locked' || stat === 'current'
      )
      if (firstAvailable) {
        setSelectedStageId(parseInt(firstAvailable[0]))
        setIsModalOpen(true)
      }
    }
  }, [userProgress, isAuthenticated])

  // メインクエストボタンのテキストを決定
  const getMainQuestButtonText = useCallback(() => {
    if (!isAuthenticated) {
      return '🌟 ステージ1を体験してみる'
    }
    
    const allCompleted = Object.values(userProgress).every(s => s === 'completed') && Object.keys(userProgress).length >= 6
    const currentStageExists = Object.values(userProgress).some(s => s === 'current' || s === 'pending_approval')
    
    if (allCompleted) {
      return '🎉 全ての冒険を達成！'
    } else if (!currentStageExists && !allCompleted && Object.keys(userProgress).length > 0) {
      return '❓ 次のステージへ'
    } else {
      return '🔥 次の冒険へ進む！'
    }
  }, [userProgress, isAuthenticated])

  // パスラインを表示するかどうかを決定
  const shouldShowPathLine = useCallback((stageId: number) => {
    // 最後のステージ（ステージ6）は常にパスラインなし
    if (stageId === 6) return false
    
    // デスクトップ: 3列目（3の倍数）はパスラインなし
    // モバイル: 2列目（2の倍数）はパスラインなし
    // これはCSS側で制御するため、ここでは常にtrueを返す
    return true
  }, [])

  if (isLoading && !isInitialized) {
    return (
      <div className="quest-map-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>冒険の準備中...</p>
        </div>
        
        <style jsx>{`
          .quest-map-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            text-align: center;
          }
          
          .loading-content {
            background: #F5F5DC;
            padding: 30px;
            border: 4px solid #8B4513;
            box-shadow: 0 0 0 2px #A0522D, 8px 8px 0 0 rgba(0,0,0,0.5);
          }
          
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4DB6F7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          .loading-content p {
            color: #654321;
            font-weight: bold;
            margin: 0;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // ステージ配列（1-15）
  const stages = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className={`quest-map ${className}`}>
      {showHeader && (
        <header className="map-header">
          <h1>🗺️ CLAFT クエストマップ</h1>
          <p>きみだけの冒険物語をつくろう！</p>
          {showAdventureLog && (
            <button 
              className="adventure-log-button" 
              onClick={showAdventureLogModal}
            >
              これまでの冒険を振り返る
            </button>
          )}
        </header>
      )}
      
      <div className="stages-container">
        <div className="stages-grid">
          {stages.map((stageId) => {
            const stage = stageDetails[stageId]
            if (!stage) return null

            return (
              <StageNode
                key={stageId}
                stage={{
                  ...stage,
                  status: userProgress[stageId] || 'locked'
                }}
                onClick={handleStageClick}
                showPathLine={shouldShowPathLine(stageId)}
                gridPosition={stageId}
              />
            )
          })}
        </div>
      </div>
      
      {showMainQuestButton && (
        <button 
          className="main-quest-button" 
          onClick={handleMainQuestClick}
          disabled={isLoading}
        >
          {getMainQuestButtonText()}
        </button>
      )}
      
      <DynamicStageModal
        stageId={selectedStageId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      
      <style jsx>{`
        .quest-map {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .map-header {
          text-align: center;
          margin-bottom: 40px;
          color: #654321;
        }
        
        .map-header h1 {
          font-size: 2.2rem;
          margin-bottom: 16px;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.1);
          color: #654321;
        }
        
        .map-header p {
          font-size: 1.2rem;
          margin-bottom: 24px;
          color: #8B4513;
        }
        
        .adventure-log-button {
          display: inline-block;
          margin: 20px auto 0;
          padding: 12px 32px;
          background: #FFD700;
          border: 3px solid #B8860B;
          color: #654321;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.1s ease;
          box-shadow: 0 0 0 1px #DAA520, 4px 4px 0 0 rgba(0,0,0,0.3);
          position: relative;
        }
        
        .adventure-log-button::before {
          content: '📖';
          margin-right: 8px;
        }
        
        .adventure-log-button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 0 0 0 1px #DAA520, 6px 6px 0 0 rgba(0,0,0,0.3);
        }
        
        .adventure-log-button:active {
          transform: translate(1px, 1px);
          box-shadow: 0 0 0 1px #DAA520, 2px 2px 0 0 rgba(0,0,0,0.3);
        }
        
        .stages-container {
          margin-bottom: 40px;
        }
        
        .stages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .main-quest-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: auto;
          min-width: 200px;
          margin: 0;
          padding: 16px 32px;
          background: #FF6B6B;
          border: 4px solid #DC143C;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 0 2px #FF8787, 6px 6px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
          animation: pulse-button 2s ease-in-out infinite;
          z-index: 900;
        }
        
        .main-quest-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          animation: none;
        }
        
        .main-quest-button:hover:not(:disabled) {
          transform: translate(-2px, -2px) scale(1.02);
          box-shadow: 0 0 0 2px #FF8787, 8px 8px 0 0 rgba(0,0,0,0.3);
          animation: none;
        }
        
        .main-quest-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 2px #FF8787, 2px 2px 0 0 rgba(0,0,0,0.3);
        }
        
        @keyframes pulse-button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        /* レスポンシブ対応 */
        @media (max-width: 767px) {
          .quest-map {
            padding: 10px;
          }
          
          .map-header h1 {
            font-size: 1.8rem;
          }
          
          .map-header p {
            font-size: 1rem;
          }
          
          .stages-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .main-quest-button {
            padding: 12px 24px;
            font-size: 1rem;
            bottom: 20px;
            right: 20px;
            min-width: 160px;
          }
          
          .adventure-log-button {
            padding: 10px 24px;
            font-size: 0.9rem;
          }
        }
        
        /* 超小さい画面での調整 */
        @media (max-width: 480px) {
          .quest-map {
            padding: 5px;
          }
          
          .map-header {
            margin-bottom: 20px;
          }
          
          .map-header h1 {
            font-size: 1.6rem;
          }
          
          .stages-grid {
            gap: 16px;
          }
          
          .main-quest-button {
            position: relative;
            width: 100%;
            margin: 20px 0;
            bottom: auto;
            right: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default QuestMap 