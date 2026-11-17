'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { listThemesForMap, listThemeClears } from '@/lib/api/robo'
import RoboMap from '@/components/robo/RoboMap'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'
import type { RoboThemeStatus } from '@/types/robo'
import type { RoboStageNodeData } from '@/components/robo/RoboStageNode'

export default function RoboPage() {
  const router = useRouter()
  const { isAuthenticated, user, isInitialized: authInitialized } = useAuth()

  const [themes, setThemes] = useState<RoboStageNodeData[]>([])
  const [clearedThemeIds, setClearedThemeIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const themeList = await listThemesForMap()
      setThemes(themeList)

      if (user?.id) {
        const clears = await listThemeClears(user.id)
        setClearedThemeIds(new Set(clears.map((c) => c.theme_id)))
      } else {
        setClearedThemeIds(new Set())
      }
    } catch (e) {
      console.error('ロボクエスト マップ読み込みエラー:', e instanceof Error ? e.message : e)
      setError('テーマ一覧の読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (authInitialized) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, user?.id])

  const statusOf = (themeId: string): RoboThemeStatus => {
    const theme = themes.find((t) => t.id === themeId)
    if (!theme?.is_published) return 'locked'
    if (clearedThemeIds.has(themeId)) return 'completed'
    return 'available'
  }

  const handleThemeClick = (themeId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    const status = statusOf(themeId)
    if (status === 'locked') return
    router.push(`/robo/${themeId}`)
  }

  const toggleSidebar = () => setSidebarOpen((v) => !v)
  const closeSidebar = () => setSidebarOpen(false)

  if (!authInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-bg,#fdf6e7)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--brand,#34c6be)] border-t-transparent" />
          <p className="text-lg font-bold text-gray-600">ロボクエストを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--cream-bg,#fdf6e7)]">
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="fixed right-4 top-4 z-50">
        <AuthButton variant="compact" size="md" redirectTo="/robo" defaultTab="login" enableUserMenu={true} showAdminLink={true} />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">🤖 ロボクエスト</h1>
          <p className="mt-2 text-gray-500">授業のふりかえりをゲームで挑戦しよう！</p>
          {!isAuthenticated && (
            <p className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-700">
              挑戦するにはログインが必要です
            </p>
          )}
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <RoboMap themes={themes} statusOf={statusOf} onThemeClick={handleThemeClick} />
      </div>

      {showAuthModal && (
        <DynamicAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          redirectTo="/robo"
          defaultTab="login"
        />
      )}
    </main>
  )
}
