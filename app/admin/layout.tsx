'use client'

import { useState, useCallback, useEffect } from 'react'
import { HamburgerMenu } from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

/**
 * 管理配下レイアウト
 * - モバイル/タブレット: ハンバーガーでサイドメニューを開閉（オーバーレイ）
 * - PC: サイドメニュー常時表示。ハンバーガーは非表示
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 初期状態: PC(>=1024px)では開いた状態にする
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSidebarOpen(true)
      }
    } catch {}
  }, [])

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ハンバーガー（全画面で表示） */}
      <div className="fixed top-4 left-4 z-[10000]">
        <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* 共通サイドバー（他ページと同一のメニュー構成） */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* コンテンツ（PC時はサイドバー幅ぶん押し出し） */}
      <main className={`${sidebarOpen ? 'lg:ml-[260px]' : 'ml-0'} transition-all duration-300`}>
        {children}
      </main>
    </div>
  )
}


