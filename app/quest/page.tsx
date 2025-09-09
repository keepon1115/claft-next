'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'
import QuestMap from '@/components/quest/QuestMap'
import { DynamicStageModal } from '@/components/quest/DynamicStageModal'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'
import { Lock } from 'lucide-react'
import type { StageProgress } from '@/stores/questStore'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { ModalLoadingFallback } from '@/components/common/DynamicLoader'
import UnlockAnimation from '@/components/quest/UnlockAnimation'

// ==========================================
// 動的インポートコンポーネント
// ==========================================
const DynamicLoginPromptModal = dynamic(
  () => import('@/components/quest/LoginPromptModal'),
  { loading: () => <ModalLoadingFallback title="ログイン案内を読み込み中..." />, ssr: false }
);

// ==========================================
// クエストページメインコンポーネント
// ==========================================

export default function QuestPage() {
  const router = useRouter()
  const { isAuthenticated, user, isInitialized: authInitialized, isLoading: authLoading } = useAuth()
  const { 
    stageDetails, 
    statistics, 
    isLoading, 
    isInitialized: questInitialized,
    currentArea,
    areas,
    showUnlockAnimation,
    initialize,
    switchArea,
    checkAreaUnlock,
    dismissUnlockAnimation
  } = useQuestStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [promptStageId, setPromptStageId] = useState<number>(1)

  // 現在のエリアのステージのみを表示
  const currentAreaStages = areas[currentArea].stages
  const stages: StageProgress[] = Object.values(stageDetails)
    .filter(stage => currentAreaStages.includes(stage.stageId))
    .sort((a, b) => a.stageId - b.stageId)
  
  // 現在のテーマを取得
  const currentTheme = areas[currentArea].theme

  // 未ログインユーザー用のデモ統計（現在のエリアに応じて調整）
  const demoStatistics = {
    totalStages: currentAreaStages.length,
    completedStages: 0,
    currentStage: null,
    progressPercentage: 0,
    lastCompletedStage: null
  }

  // 表示用の統計（ログイン状態とエリアに応じて調整）
  const displayStatistics = isAuthenticated ? {
    ...statistics,
    totalStages: currentAreaStages.length,
    completedStages: currentAreaStages.filter(stageId => {
      const stage = Object.values(stageDetails).find(s => s.stageId === stageId)
      return stage?.status === 'completed'
    }).length
  } : demoStatistics

  // 認証完了後にデータロード
  useEffect(() => {
    // 認証が初期化済みの場合のみクエストストアを初期化
    if (authInitialized) {
      initialize(user?.id)
    }
  }, [authInitialized, user?.id, initialize])

  // エリア解放チェック
  useEffect(() => {
    if (questInitialized) {
      checkAreaUnlock()
    }
  }, [questInitialized, checkAreaUnlock])

  // ステージクリック処理
  const handleStageClick = (stageId: number) => {
    // 未認証の場合はログイン促進モーダルを表示
    if (!isAuthenticated) {
      setPromptStageId(stageId)
      setShowLoginPrompt(true)
      return
    }
    
    // 認証済みの場合は通常通りステージモーダルを開く
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  // ログイン促進モーダルからの登録ボタンクリック
  const handleLoginFromPrompt = () => {
    setShowLoginPrompt(false)
    setShowAuthModal(true)
  }

  // ログイン促進モーダルクローズ
  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false)
  }

  // 認証モーダルクローズ
  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
  }

  // ステージモーダルクローズ処理
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedStageId(null)
    }, 300)
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // ローディング状態の改善（認証またはクエスト初期化中）
  if (authLoading || !authInitialized || (authInitialized && isLoading && !questInitialized)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">冒険の準備中...</p>
          <p className="text-white/80 text-sm mt-2">
            {!authInitialized ? '認証情報を確認中...' : 'クエストデータを読み込み中...'}
          </p>
        </div>
      </div>
    )
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
            <h1>🗺️ クエストマップ</h1>
            
            {/* エリア切り替えタブ */}
            <div className="area-tabs">
              {Object.entries(areas).map(([areaKey, areaInfo]) => (
                <button
                  key={areaKey}
                  onClick={() => switchArea(areaKey as any)}
                  className={`area-tab ${currentArea === areaKey ? 'active' : ''} ${
                    !areaInfo.isUnlocked ? 'locked' : ''
                  }`}
                  disabled={!areaInfo.isUnlocked}
                >
                  <span className="area-icon">
                    {areaInfo.theme === 'sky' ? '🌤️' : '🌇'}
                  </span>
                  <span className="area-name">{areaInfo.name}</span>
                  <span className="area-range">({areaKey})</span>
                  {!areaInfo.isUnlocked && <Lock size={14} className="lock-icon" />}
                </button>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="guest-notice">
                <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
                  <Lock size={16} />
                  <span className="font-bold">ゲスト閲覧モード</span>
                </div>
                <p className="text-sm text-yellow-700">
                  クエストに挑戦するには冒険者登録が必要です
                </p>
              </div>
            )}

          </header>

          {/* クエストマップ表示 */}
          <QuestMap
            stages={stages}
            statistics={displayStatistics}
            onStageClick={handleStageClick}
            theme={currentTheme}
            area={currentArea as any}
          />
        </div>

        {/* 次の冒険ボタン（認証済みユーザーのみ） */}
        {isAuthenticated && (
          <button className="quest-button">
            {currentTheme === 'sky' ? '🔥 次の冒険へ進む！' : '🌇 次の冒険へ進む！'}
          </button>
        )}

        {/* 未認証ユーザー向けの登録促進ボタン */}
        {!isAuthenticated && (
          <button 
            className="quest-register-button"
            onClick={() => setShowAuthModal(true)}
          >
            {currentTheme === 'sky' ? '✨ 冒険者登録して挑戦する！' : '🌇 くれなずむ空に挑戦する！'}
          </button>
        )}
      </main>

      {/* ログイン促進モーダル */}
      <DynamicLoginPromptModal
        isOpen={showLoginPrompt}
        onClose={handleCloseLoginPrompt}
        onLoginClick={handleLoginFromPrompt}
        stageId={promptStageId}
      />

      {/* 認証モーダル */}
      {showAuthModal && (
        <DynamicAuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
          defaultTab="signup"
          redirectTo="/quest"
        />
      )}

      {/* ステージ詳細モーダル（認証済みユーザーのみ） */}
      {isModalOpen && selectedStageId && isAuthenticated && (
        <DynamicStageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          stageId={selectedStageId}
        />
      )}

      {/* エリア解放アニメーション */}
      <UnlockAnimation
        isOpen={showUnlockAnimation}
        onClose={() => {
          dismissUnlockAnimation()
          switchArea('7-12')
        }}
      />

      {/* ピクセルアート風スタイル */}
      <style jsx>{`
        .quest-page {
          font-family: var(--font-dot-gothic), var(--font-m-plus-rounded), sans-serif;
          ${currentTheme === 'sky' 
            ? 'background: radial-gradient(circle at 15% 12%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 8%, rgba(255,255,255,0) 20%), linear-gradient(to bottom, #aee8ff 0%, #c8f0ff 40%, #eaf9ff 70%, #ffffff 100%);' 
            : 'background: radial-gradient(circle at 85% 18%, rgba(255,180,80,0.9) 0%, rgba(255,180,80,0.5) 10%, rgba(255,180,80,0) 22%), linear-gradient(to bottom, #ffb36b 0%, #ff8e6b 35%, #c065b8 65%, #1f2a44 100%);'
          }
          min-height: 100vh;
          position: relative;
          padding-bottom: 100px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          transition: background 0.8s ease-in-out;
        }

        .quest-auth-section {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
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

        .area-tabs {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin: 20px 0;
        }

        .area-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .area-tab:hover:not(.locked) {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .area-tab.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        .area-tab.locked {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(128, 128, 128, 0.3);
        }

        .area-icon {
          font-size: 20px;
        }

        .area-name {
          font-size: 16px;
        }

        .area-range {
          font-size: 12px;
          opacity: 0.8;
        }

        .lock-icon {
          margin-left: 4px;
        }

        .guest-notice {
          background: rgba(255, 235, 59, 0.9);
          border: 3px solid #F57F17;
          padding: 12px 20px;
          margin: 20px auto 0;
          max-width: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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

        .quest-register-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 32px;
          background: #9C27B0;
          border: 4px solid #6A1B9A;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 0 2px #BA68C8, 6px 6px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
          animation: pulse_button 2s ease-in-out infinite;
          z-index: 900;
        }

        @keyframes pulse_button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes pulse_button_centered {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.02); }
        }

        .quest-button:hover,
        .quest-register-button:hover {
          transform: translate(-2px, -2px) scale(1.02);
          box-shadow: 0 0 0 2px #FF8787, 8px 8px 0 0 rgba(0,0,0,0.3);
          animation: none;
        }

        .quest-register-button:hover {
          box-shadow: 0 0 0 2px #BA68C8, 8px 8px 0 0 rgba(0,0,0,0.3);
        }

        .quest-button:active,
        .quest-register-button:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 2px #FF8787, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .quest-register-button:active {
          box-shadow: 0 0 0 2px #BA68C8, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        @media (max-width: 767px) {

          .quest-button,
          .quest-register-button {
            padding: 12px 24px;
            font-size: 1rem;
            bottom: 20px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
            animation-name: pulse_button_centered;
          }

          .quest-button:hover,
          .quest-register-button:hover {
            transform: translateX(-50%) translate(-2px, -2px) scale(1.02);
          }

          .quest-button:active,
          .quest-register-button:active {
            transform: translateX(-50%) translate(2px, 2px);
          }
        }
      `}</style>
    </>
  )
} 