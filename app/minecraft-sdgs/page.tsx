'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMinecraftSdgsStore } from '@/stores/minecraftSdgsStore'
import MinecraftMap from '@/components/minecraft-sdgs/MinecraftMap'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'
import { Lock } from 'lucide-react'
import type { MinecraftStageProgress } from '@/stores/minecraftSdgsStore'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { ModalLoadingFallback } from '@/components/common/DynamicLoader'
import MinecraftAnimations from '@/components/minecraft-sdgs/MinecraftAnimations'

const DynamicLoginPromptModal = dynamic(
  () => import('@/components/minecraft-sdgs/LoginPromptModal'),
  { loading: () => <ModalLoadingFallback title="ログイン案内を読み込み中..." />, ssr: false }
)
const DynamicStageModal = dynamic(
  () => import('@/components/minecraft-sdgs/DynamicStageModal'),
  { loading: () => <ModalLoadingFallback title="SDGsワークを読み込み中..." />, ssr: false }
)

export default function MinecraftSdgsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isInitialized: authInitialized, isLoading: authLoading } = useAuth()
  const { stageDetails, statistics, isLoading, isInitialized: sdgsInitialized, initialize } = useMinecraftSdgsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [promptStageId, setPromptStageId] = useState<number>(1)

  const stages: MinecraftStageProgress[] = Object.values(stageDetails).sort((a, b) => a.stageId - b.stageId)

  const demoStatistics = { totalStages: 19, completedStages: 0, currentStage: 1, progressPercentage: 0, lastCompletedStage: null, sdgsGoalsCompleted: [] }
  const displayStatistics = isAuthenticated
    ? { currentStage: statistics.currentStage || 1, completedStages: statistics.completedStages, totalStages: statistics.totalStages, sdgsGoalsCompleted: statistics.sdgsGoalsCompleted }
    : demoStatistics

  // 認証完了後にデータロード
  useEffect(() => {
    // 認証が初期化済みの場合のみSDGsストアを初期化
    if (authInitialized) {
      initialize(user?.id)
    }
  }, [authInitialized, user?.id, initialize])

  // ── 復帰検知：pageshow + focus + visibilitychange ─────────────────────────────
  useEffect(() => {
    const reopenIfNeeded = () => {
      try {
        const raw = localStorage.getItem('sdgs:return')
        if (!raw) return
        const data = JSON.parse(raw)
        if (data?.stageId) {
          setSelectedStageId(data.stageId)
          setIsModalOpen(true)
          // クリアはモーダル側で行う（フォーカス補正と同時）
        }
      } catch {}
    }
    const onVisible = () => { if (document.visibilityState === 'visible') reopenIfNeeded() }

    window.addEventListener('pageshow', reopenIfNeeded)   // bfcache 復帰
    window.addEventListener('focus', reopenIfNeeded)      // タブ切り替え復帰
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.removeEventListener('pageshow', reopenIfNeeded)
      window.removeEventListener('focus', reopenIfNeeded)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  // ─────────────────────────────────────────────────────────────────────

  const handleStageClick = (stageId: number) => {
    if (!isAuthenticated) {
      setPromptStageId(stageId)
      setShowLoginPrompt(true)
      return
    }
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  const handleLoginFromPrompt = () => { setShowLoginPrompt(false); setShowAuthModal(true) }
  const handleCloseLoginPrompt = () => setShowLoginPrompt(false)

  const toggleSidebar = () => setSidebarOpen(v => !v)
  const closeSidebar = () => setSidebarOpen(false)

  // ローディング状態の改善（認証またはSDGs初期化中）
  if (authLoading || !authInitialized || (authInitialized && isLoading && !sdgsInitialized)) {
    return (
      <div className="min-h-screen minecraft-page flex items-center justify-center">
        <div className="text-center">
          <div className="minecraft-loading-cube mb-4"></div>
          <p className="text-xl font-bold text-minecraft-brown">コースを読み込み中...</p>
          <p className="text-minecraft-brown-light text-sm mt-2">
            {!authInitialized ? '認証情報を確認中...' : 'SDGsデータを読み込み中...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <MinecraftAnimations />
      <main className="min-h-screen minecraft-page">
        <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="minecraft-auth-section">
          <AuthButton variant="compact" size="md" redirectTo="/minecraft-sdgs" defaultTab="login" enableUserMenu={true} showAdminLink={true} />
        </div>

        <div className="container mx-auto max-w-7xl px-4">
          <header className="minecraft-header">
            <h1>🌍 マイクラSDGsコース</h1>
            <p>持続可能な世界をクラフトしよう</p>
            {!isAuthenticated && (
              <div className="guest-notice minecraft-notice">
                <div className="flex items-center justify-center gap-2 text-minecraft-brown mb-2">
                  <Lock size={16} />
                  <span className="font-bold">ゲスト見学モード</span>
                </div>
                <p className="text-sm text-minecraft-brown-light">SDGsワークに参加するには冒険者登録が必要です</p>
              </div>
            )}
          </header>

          <MinecraftMap stages={stages} statistics={displayStatistics} onStageClick={handleStageClick} />
        </div>

        {isModalOpen && selectedStageId && (
          <DynamicStageModal
            key={`${selectedStageId}:${isModalOpen}`} // クリーンマウント
            stageId={selectedStageId}
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setSelectedStageId(null) }}
          />
        )}

        {showLoginPrompt && (
          <DynamicLoginPromptModal
            isOpen={showLoginPrompt}
            onClose={handleCloseLoginPrompt}
            onLoginClick={handleLoginFromPrompt}
            stageId={promptStageId}
          />
        )}

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
