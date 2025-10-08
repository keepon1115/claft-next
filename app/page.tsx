'use client'

import { useState, useEffect, useRef } from 'react'
import ProfileCard from '@/components/home/ProfileCard'
import CraftStory from '@/components/home/CraftStory'
import JibunCraft from '@/components/home/JibunCraft'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import BackgroundAnimations from '@/components/common/BackgroundAnimations'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import { LockedContent } from '@/components/common/LockedContent'
import { useQuestStore } from '@/stores/questStore'
import HowToModal from '@/components/home/HowToModal'
import TutorialGuide from '@/components/home/TutorialGuide'

// app/page.tsx を一時的に最小構成に戻す
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAdmin, isAuthenticated, profile, user, stats } = useAuth()
  const { statistics, initialize } = useQuestStore()

  useEffect(() => {
    // ユーザーIDに基づいてクエスト情報を初期化（未ログイン時はデモモード）
    initialize(user?.id)
  }, [user?.id, initialize])

  // プロフィール完成度を判定するロジック
  // ニックネームがデフォルトの「冒険者」から変更されていれば参加とみなす
  const isProfileCompleted =
    isAuthenticated &&
    profile &&
    profile.nickname !== '冒険者'

  // クエスト参加実績（ステージ1をクリアしているか）
  const hasParticipatedInQuest =
    isAuthenticated && statistics.completedStages >= 1

  // バッジ選定（カテゴリごとに最大1つ）
  const loginCount = stats?.login_count || 0
  const profileCompletion = (profile as any)?.profile_completion || 0
  const completedStages = statistics.completedStages || 0

  const loginBadge = (() => {
    if (!isAuthenticated) return null as null | { tier: 'bronze' | 'silver' | 'gold'; title: string }
    if (loginCount >= 50) return { tier: 'gold', title: 'ログイン50回達成' }
    if (loginCount >= 10) return { tier: 'silver', title: 'ログイン10回達成' }
    return { tier: 'bronze', title: '初回ログイン達成' }
  })()

  const profileBadge = (() => {
    if (profileCompletion >= 100) return { tier: 'gold', title: 'プロフィール完成度100%' }
    if (isAuthenticated && isProfileCompleted) return { tier: 'silver', title: 'プロフィール参加' }
    return null as null | { tier: 'silver' | 'gold'; title: string }
  })()

  const questBadge = (() => {
    if (completedStages >= 12) return { tier: 'gold', title: 'くれなずむ空クリア' }
    if (completedStages >= 6) return { tier: 'silver', title: 'はじまりの空クリア' }
    if (completedStages >= 1) return { tier: 'bronze', title: 'クエスト参加' }
    return null as null | { tier: 'bronze' | 'silver' | 'gold'; title: string }
  })()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const displayName = profile?.nickname || (user as any)?.user_metadata?.name || user?.email || 'クラフター'
  const [howToOpen, setHowToOpen] = useState(false)
  // 右上クイックアクション参照
  const howToRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLAnchorElement>(null)
  const adventurersRef = useRef<HTMLAnchorElement>(null)

  return (
    <>
      {/* 背景アニメーション */}
      <BackgroundAnimations />
      
      <main className="min-h-screen relative">
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
        
        {/* ヘッダー */}
        <header className="header">
          <div className="header-content">
            <div className="player-info">
              <div className="greeting-section">
                <h1>こんにちは、{displayName}</h1>
                <p>よっしゃ今日もキャリアをつくっていこう🚀</p>
              </div>
            </div>
            
            {/* ログインボタン（右上） */}
            <div className="auth-section">
              <AuthButton 
                variant="compact"
                size="md"
                redirectTo="/"
                defaultTab="login"
                enableUserMenu={true}
                showAdminLink={true}
              />
            </div>
            
            <div className="achievements">
              {/* 🏆 ログイン系（最大1つ） */}
              {loginBadge && (
                <div className={`achievement-badge ${loginBadge.tier}`} title={loginBadge.title}>🏆</div>
              )}

              {/* ⭐ プロフィール系（最大1つ） */}
              {profileBadge && (
                <div className={`achievement-badge ${profileBadge.tier}`} title={profileBadge.title}>⭐</div>
              )}

              {/* 🎯 クエスト系（最大1つ） */}
              {questBadge && (
                <div className={`achievement-badge ${questBadge.tier}`} title={questBadge.title}>🎯</div>
              )}
            {/* 追加: クイックリンク */}
            <div className="quick-actions">
              <div ref={howToRef} className="inline-block">
                <button className="quick-btn" onClick={() => setHowToOpen(true)}>歩き方</button>
              </div>
              <a ref={calendarRef} className="quick-btn" href="https://keepon.work/claft-" target="_blank" rel="noopener noreferrer">カレンダー</a>
              <a ref={adventurersRef} className="quick-btn" href="/yononaka#adventurers">冒険者</a>
            </div>
            </div>
          </div>
          
          {/* 経験値バー（非表示化） */}
          {/* 削除: デザイン要件により経験値バーは使用しない */}
        </header>
        
        {/* メインコンテンツ */}
        <div className="main-content">
          {/* 左側: プロフィールカード（50%） */}
          <ProfileCard />
          
          {/* 右側: クラフトストーリー & JibunCraft */}
          <div className="content-area">
            <LockedContent
              isLocked={!isAdmin && statistics.completedStages < 12}
              unlockConditionText={
                <>このエリアはクエスト12をクリアすると開放されます</>
              }
            >
              <CraftStory />
            </LockedContent>
            <LockedContent
              isLocked={!isAdmin && statistics.completedStages < 12}
              unlockConditionText={
                <>このエリアはクエスト12をクリアすると開放されます</>
              }
            >
              <JibunCraft />
            </LockedContent>
          </div>
        </div>
      </main>

      {/* 歩き方モーダル */}
      <HowToModal isOpen={howToOpen} onClose={() => setHowToOpen(false)} />

      {/* チュートリアルガイド */}
      <TutorialGuide 
        howToRef={howToRef}
        calendarRef={calendarRef}
        adventurersRef={adventurersRef}
        openSidebar={() => setSidebarOpen(true)}
        closeSidebar={() => setSidebarOpen(false)}
      />
    </>
  )
}
