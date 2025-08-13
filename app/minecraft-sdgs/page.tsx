'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMinecraftSdgsStore } from '@/stores/minecraftSdgsStore'
import MinecraftMap from '@/components/minecraft-sdgs/MinecraftMap'
// import DynamicStageModal from '../../components/minecraft-sdgs/DynamicStageModal'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'
import { Lock } from 'lucide-react'
import type { MinecraftStageProgress } from '@/stores/minecraftSdgsStore'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { ModalLoadingFallback } from '@/components/common/DynamicLoader'
import MinecraftAnimations from '@/components/minecraft-sdgs/MinecraftAnimations'

// ==========================================
// 動的インポートコンポーネント
// ==========================================
const DynamicLoginPromptModal = dynamic(
  () => import('@/components/minecraft-sdgs/LoginPromptModal'),
  { loading: () => <ModalLoadingFallback title="ログイン案内を読み込み中..." />, ssr: false }
);

const DynamicStageModal = dynamic(
  () => import('@/components/minecraft-sdgs/DynamicStageModal'),
  { loading: () => <ModalLoadingFallback title="SDGsワークを読み込み中..." />, ssr: false }
);

// ==========================================
// マイクラSDGsページメインコンポーネント
// ==========================================

export default function MinecraftSdgsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { 
    stageDetails, 
    statistics, 
    isLoading, 
    initialize
  } = useMinecraftSdgsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [promptStageId, setPromptStageId] = useState<number>(1)

  // ステージ詳細を配列に変換
  const stages: MinecraftStageProgress[] = Object.values(stageDetails).sort((a, b) => a.stageId - b.stageId)

  // 未ログインユーザー用のデモ統計
  const demoStatistics = {
    totalStages: 19,
    completedStages: 0,
    currentStage: 1, // number型に変更（nullではなく）
    progressPercentage: 0,
    lastCompletedStage: null,
    sdgsGoalsCompleted: [] // 必須プロパティを追加
  }

  // 表示用の統計（ログイン状態に応じて切り替え）
  const displayStatistics = isAuthenticated ? {
    currentStage: statistics.currentStage || 1,
    completedStages: statistics.completedStages,
    totalStages: statistics.totalStages,
    sdgsGoalsCompleted: statistics.sdgsGoalsCompleted
  } : demoStatistics

  // 認証確認とデータロード
  useEffect(() => {
    // 常にSDGsストアを初期化（未ログインの場合はデモモード）
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

  // サイドバー制御
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen minecraft-page flex items-center justify-center">
        <div className="text-center">
          <div className="minecraft-loading-cube mb-4"></div>
          <p className="text-xl font-bold text-minecraft-brown">ワールドを生成中...</p>
        </div>
      </div>
    )
  }

  // メインレンダリング
  return (
    <>
      {/* マイクラ風背景アニメーション */}
      <MinecraftAnimations />
      
      <main className="min-h-screen minecraft-page">
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
        <div className="minecraft-auth-section">
          <AuthButton 
            variant="compact"
            size="md"
            redirectTo="/minecraft-sdgs"
            defaultTab="login"
            enableUserMenu={true}
            showAdminLink={true}
          />
        </div>

        <div className="container">
          <header className="minecraft-header">
            <h1>🌍 マイクラSDGsワールド</h1>
            <p>持続可能な世界をクラフトしよう</p>
            {!isAuthenticated && (
              <div className="guest-notice minecraft-notice">
                <div className="flex items-center justify-center gap-2 text-minecraft-brown mb-2">
                  <Lock size={16} />
                  <span className="font-bold">ゲスト見学モード</span>
                </div>
                <p className="text-sm text-minecraft-brown-light">
                  SDGsワークに参加するには冒険者登録が必要です
                </p>
              </div>
            )}
          </header>

          {/* マイクラSDGsマップ表示 */}
          <MinecraftMap
            stages={stages}
            statistics={displayStatistics}
            onStageClick={handleStageClick}
          />
        </div>

        {/* 次のワークボタン（認証済みユーザーのみ） */}
        {isAuthenticated && (
          <button className="minecraft-next-button">
            次のSDGsワークへ
          </button>
        )}

        {/* ステージモーダル */}
        {isModalOpen && selectedStageId && (
          <DynamicStageModal
            stageId={selectedStageId}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedStageId(null)
            }}
          />
        )}

        {/* ログイン促進モーダル */}
        {showLoginPrompt && (
          <DynamicLoginPromptModal
            isOpen={showLoginPrompt}
            onClose={handleCloseLoginPrompt}
            onLoginClick={handleLoginFromPrompt}
            stageId={promptStageId}
          />
        )}

        {/* 認証モーダル */}
        {showAuthModal && (
          <DynamicAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            redirectTo="/minecraft-sdgs"
            defaultTab="login"
          />
        )}
      </main>
    </>
  )
}