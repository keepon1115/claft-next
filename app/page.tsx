'use client'

import { useState } from 'react'
import ProfileCard from '@/components/home/ProfileCard'
import CraftStory from '@/components/home/CraftStory'
import JibunCraft from '@/components/home/JibunCraft'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import BackgroundAnimations from '@/components/common/BackgroundAnimations'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import { LockedContent } from '@/components/common/LockedContent'

// app/page.tsx を一時的に最小構成に戻す
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAdmin, isAuthenticated, profile } = useAuth()

  // TODO: 本来はuseUserStatsフックなどから取得する
  const [questsCompleted, setQuestsCompleted] = useState(5)

  // プロフィール完成度を判定するロジック
  // ニックネームがデフォルトの「冒険者」から変更されていれば参加とみなす
  const isProfileCompleted =
    isAuthenticated &&
    profile &&
    profile.nickname !== '冒険者'

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

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
                <h1>こんにちは、クラフター！</h1>
                <p>今日も一緒に未来をつくっていこう 🚀</p>
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
              {/* ログインしている時だけ表示する */}
              {isAuthenticated && (
                <div className="achievement-badge gold">
                  🏆
                  <div className="tooltip">初回ログイン達成</div>
                </div>
              )}
              {/* プロフィール参加している時だけ表示する */}
              {isProfileCompleted && (
                <div className="achievement-badge silver">
                  ⭐
                  <div className="tooltip">プロフィール参加</div>
                </div>
              )}
              {/* クエストに1回以上参加している時だけ表示する */}
              {questsCompleted > 0 && (
                <div className="achievement-badge bronze">
                  🎯
                  <div className="tooltip">クエスト参加</div>
                </div>
              )}
            </div>
          </div>
          
          {/* 経験値バー */}
          <div className="exp-bar-container">
            <div className="exp-bar"></div>
          </div>
        </header>
        
        {/* メインコンテンツ */}
        <div className="main-content">
          {/* 左側: プロフィールカード（50%） */}
          <ProfileCard />
          
          {/* 右側: クラフトストーリー & JibunCraft */}
          <div className="content-area">
            <LockedContent
              isLocked={!isAdmin && questsCompleted < 6}
              unlockConditionText={
                <>
                  このエリアは
                  <span className="text-purple-600 font-black">クエスト6</span>
                  をクリアすると開放されます
                </>
              }
            >
              <CraftStory />
            </LockedContent>
            <LockedContent
              isLocked={!isAdmin && questsCompleted < 20}
              unlockConditionText={
                <>
                  このエリアは
                  <span className="text-purple-600 font-black">クエスト20</span>
                  をクリアすると開放されます
                </>
              }
            >
              <JibunCraft />
            </LockedContent>
          </div>
        </div>
      </main>
    </>
  )
}
