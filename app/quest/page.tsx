'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'
import QuestMap from '@/components/quest/QuestMap'
import { DynamicStageModal } from '@/components/dynamic/DynamicStageModal'
import { Map, Compass, Star, Trophy, Zap } from 'lucide-react'
import type { StageProgress } from '@/stores/questStore'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'

// ==========================================
// クエストページメインコンポーネント
// ==========================================

export default function QuestPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { 
    stageDetails, 
    statistics, 
    isLoading, 
    initialize
  } = useQuestStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ステージ詳細を配列に変換
  const stages: StageProgress[] = Object.values(stageDetails).sort((a, b) => a.stageId - b.stageId)

  // 開発環境での認証チェック緩和
  const isDevMode = process.env.NODE_ENV === 'development'
  const shouldAllowAccess = isDevMode || isAuthenticated

  // 認証確認とデータロード
  useEffect(() => {
    // 本番環境でのみ厳密な認証チェック
    if (!isDevMode && !isAuthenticated) {
      router.push('/')
      return
    }

    // ユーザーIDがある場合のみ初期化（開発環境ではダミーID使用）
    const userId = user?.id || (isDevMode ? 'dev-user' : null)
    if (userId) {
      initialize(userId)
    }
  }, [isAuthenticated, user?.id, router, initialize, isDevMode])

  // ステージクリック処理
  const handleStageClick = (stageId: number) => {
    // 未認証でステージ1以外をクリックした場合の処理
    if (!isAuthenticated && stageId > 1) {
      alert('ステージ2以降は冒険者登録が必要です！まずはログインしてください。')
      return
    }
    
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  // モーダルクローズ処理
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedStageId(null)
    }, 300)
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">冒険の準備中...</p>
        </div>
      </div>
    )
  }

  // 本番環境で認証されていない場合
  if (!shouldAllowAccess) {
    return null
  }

  // メインレンダリング
  return (
    <>
      <main className="min-h-screen quest-page">
        {/* ハンバーガーメニュー */}
        <HamburgerMenu 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
        />
        
        {/* サイドバー */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />

        {/* 認証ボタン（右上固定） */}
        <div className="quest-auth-section">
          <AuthButton 
            variant="compact"
            size="md"
            redirectTo="/quest"
            defaultTab="login"
            enableUserMenu={true}
            showAdminLink={true}
          />
        </div>

        <div className="container">
          <header className="map-header">
            <h1>🗺️ CLAFT クエストマップ</h1>
            <p>試練のダンジョン</p>
            <button className="adventure-log-button">
              これまでの冒険
            </button>
          </header>

          {/* クエストマップ表示 */}
          <QuestMap
            stages={stages}
            statistics={statistics}
            onStageClick={handleStageClick}
          />
        </div>

        {/* 次の冒険ボタン */}
        <button className="quest-button">
          🔥 次の冒険へ進む！
        </button>
      </main>

      {/* ステージ詳細モーダル */}
      {isModalOpen && selectedStageId && (
        <DynamicStageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          stageId={selectedStageId}
        />
      )}

      {/* ピクセルアート風スタイル */}
      <style jsx>{`
        .quest-page {
          font-family: var(--font-dot-gothic), var(--font-m-plus-rounded), sans-serif;
          background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%);
          min-height: 100vh;
          position: relative;
          padding-bottom: 100px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 16px 40px;
          position: relative;
          z-index: 10;
        }

        .map-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .map-header h1 {
          font-size: 2.5rem;
          color: #FFF;
          margin-bottom: 16px;
          text-shadow: 2px 2px 0 #4DB6F7, 4px 4px 0 #3A8BC4, 6px 6px 8px rgba(0,0,0,0.3);
          letter-spacing: 2px;
          animation: float_title 3s ease-in-out infinite;
        }

        @keyframes float_title {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .map-header p {
          font-size: 1.1rem;
          color: #FFF;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          background: rgba(0,0,0,0.2);
          display: inline-block;
          padding: 4px 16px;
          border: 2px solid rgba(255,255,255,0.3);
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
          box-shadow: 0 0 0 1px #DAA520, 4px 4px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
        }

        .adventure-log-button::before {
          content: '📖';
          margin-right: 8px;
        }

        .adventure-log-button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 0 0 0 1px #DAA520, 6px 6px 0 0 rgba(0,0,0,0.3);
        }

        .quest-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 32px;
          background: #FF6B6B;
          border: 4px solid #DC143C;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 0 2px #FF8787, 6px 6px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
          animation: pulse_button 2s ease-in-out infinite;
          z-index: 900;
        }

        @keyframes pulse_button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .quest-button:hover {
          transform: translate(-2px, -2px) scale(1.02);
          box-shadow: 0 0 0 2px #FF8787, 8px 8px 0 0 rgba(0,0,0,0.3);
          animation: none;
        }

        .quest-button:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 2px #FF8787, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        @media (max-width: 767px) {
          .quest-button {
            padding: 12px 24px;
            font-size: 1rem;
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  )
} 