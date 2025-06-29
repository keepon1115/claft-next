'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'

// =====================================================
// 型定義
// =====================================================

interface AppLayoutProps {
  children: React.ReactNode
}

interface LayoutState {
  userExp: number
  userLevel: number
  isLayoutReady: boolean
}

// =====================================================
// 背景コンポーネント
// =====================================================

const BackgroundWrapper: React.FC = () => {
  return (
    <div className="background-wrapper">
      {/* 空のレイヤー */}
      <div className="parallax-layer sky-layer"></div>
      
      {/* 雲のレイヤー */}
      <div className="parallax-layer clouds">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
      </div>
      
      {/* 街のシルエット */}
      <div className="city-silhouette"></div>
    </div>
  )
}

// =====================================================
// メインレイアウトコンポーネント
// =====================================================

/**
 * アプリケーション全体の共通レイアウト
 * Header、Sidebar、HamburgerMenuを統合し、背景アニメーションも含む
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  
  // レイアウト状態管理
  const [layoutState, setLayoutState] = useState<LayoutState>({
    userExp: 65,
    userLevel: 3,
    isLayoutReady: false
  })

  // クライアントサイドでのハイドレーション確認
  useEffect(() => {
    setLayoutState(prev => ({ ...prev, isLayoutReady: true }))
  }, [])

  // 経験値更新関数（デモ用）
  const addExperience = (amount: number) => {
    setLayoutState(prev => {
      const newExp = Math.min(100, prev.userExp + amount)
      let newLevel = prev.userLevel

      // レベルアップ判定
      if (newExp === 100 && prev.userExp < 100) {
        newLevel = prev.userLevel + 1
        return {
          ...prev,
          userExp: 0, // 次のレベルへリセット
          userLevel: newLevel
        }
      }

      return {
        ...prev,
        userExp: newExp,
        userLevel: newLevel
      }
    })
  }

  // サーバーサイドレンダリング時の一時的な表示
  if (!layoutState.isLayoutReady) {
    return (
      <div className="min-h-screen bg-cream-100">
        <div className="animate-pulse">
          <div className="h-20 bg-gradient-to-br from-blue-400 to-purple-600"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* 背景アニメーション */}
      <BackgroundWrapper />

      {/* ヘッダー */}
      <Header 
        experience={layoutState.userExp}
        level={layoutState.userLevel}
        showAchievements={true}
        className="relative z-90"
      />

      {/* サイドバー（ハンバーガーメニューを内包） */}
      <Sidebar 
        className="z-[100]"
      />

      {/* メインコンテンツエリア */}
      <main className="
        relative z-10 min-h-[calc(100vh-80px)]
      ">
        <div className="p-6 pt-4">
          {children}
        </div>
      </main>

      {/* 開発用の経験値テストボタン（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-[999] space-y-2">
          <button 
            onClick={() => addExperience(10)}
            className="
              block bg-blue-500 text-white px-3 py-2 rounded-lg text-sm
              hover:bg-blue-600 transition-colors shadow-lg
            "
            title="経験値 +10"
          >
            +10 EXP
          </button>
          <button 
            onClick={() => addExperience(25)}
            className="
              block bg-green-500 text-white px-3 py-2 rounded-lg text-sm
              hover:bg-green-600 transition-colors shadow-lg
            "
            title="経験値 +25"
          >
            +25 EXP
          </button>
          <button 
            onClick={() => setLayoutState(prev => ({ 
              ...prev, 
              userExp: 0, 
              userLevel: 1 
            }))}
            className="
              block bg-red-500 text-white px-3 py-2 rounded-lg text-sm
              hover:bg-red-600 transition-colors shadow-lg
            "
            title="リセット"
          >
            Reset
          </button>
        </div>
      )}

      {/* スクロールトップボタン */}
      <ScrollToTopButton />
    </div>
  )
}

// =====================================================
// スクロールトップボタンコンポーネント
// =====================================================

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-20 right-6 z-[999] p-3 rounded-full
        bg-blue-500 text-white shadow-lg hover:bg-blue-600
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      aria-label="ページトップへ戻る"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  )
}

// =====================================================
// ページ別レイアウトカスタマイズフック
// =====================================================

/**
 * ページ別にレイアウトをカスタマイズするためのフック
 * 特定のページでヘッダーやサイドバーの表示を制御可能
 */
export const usePageLayout = () => {
  const pathname = usePathname()

  // ページ別の設定
  const pageConfig = {
    hideHeader: pathname === '/login' || pathname === '/signup',
    hideSidebar: pathname === '/login' || pathname === '/signup' || pathname === '/onboarding',
    fullWidth: pathname === '/quest' || pathname === '/admin',
    customBackground: pathname === '/quest' || pathname === '/mirai'
  }

  return pageConfig
}

// =====================================================
// デフォルトエクスポート
// =====================================================

export default AppLayout

// =====================================================
// 型エクスポート
// =====================================================

export type { AppLayoutProps }
