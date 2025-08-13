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
import { ModalLoadingFallback } from '@/components/common/DynamicLoader';

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [promptStageId, setPromptStageId] = useState<number>(1)

  // ステージ詳細を配列に変換
  const stages: StageProgress[] = Object.values(stageDetails).sort((a, b) => a.stageId - b.stageId)

  // 未ログインユーザー用のデモ統計
  const demoStatistics = {
    totalStages: 6,
    completedStages: 0,
    currentStage: null,
    progressPercentage: 0,
    lastCompletedStage: null
  }

  // 表示用の統計（ログイン状態に応じて切り替え）
  const displayStatistics = isAuthenticated ? statistics : demoStatistics

  // 認証確認とデータロード
  useEffect(() => {
    // 常にクエストストアを初期化（未ログインの場合はデモモード）
    initialize(user?.id)
  }, [initialize, user?.id])

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

  // ローディング状態（認証済みユーザーのみ表示）
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">冒険の準備中...</p>
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
          />
        </div>

        {/* 次の冒険ボタン（認証済みユーザーのみ） */}
        {isAuthenticated && (
          <button className="quest-button">
            🔥 次の冒険へ進む！
          </button>
        )}

        {/* 未認証ユーザー向けの登録促進ボタン */}
        {!isAuthenticated && (
          <button 
            className="quest-register-button"
            onClick={() => setShowAuthModal(true)}
          >
            ✨ 冒険者登録して挑戦する！
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