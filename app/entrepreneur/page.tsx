'use client'

import { useState, useEffect } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function EntrepreneurPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <>
      {/* ナビゲーション */}
      <HamburgerMenu 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
      />

      {/* メインコンテンツ */}
      <main className="min-h-screen bg-gray-100 flex items-center justify-center relative">
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-lg">🤝</span>
              </div>
              <span className="text-xl font-bold">
                CLAFT アントレプレナー
              </span>
            </div>
          </div>
        </header>

        {/* 準備中メッセージ */}
        <div className="text-center px-6 pt-20 pb-20">
          <div className="mb-12">
            <div className="text-8xl mb-6 animate-bounce">
              🤝
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              新しい冒険の準備をしています！
            </h1>
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
            アントレプレナーシップとは世の中の課題やチャンスに気づき、自ら動いて解決や創造をしていく力のことです。
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <ul className="space-y-6 text-left">
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">🏆</span>
                <div>
                  <h3 className="font-bold text-gray-800">スクール生が考えた商品・サービス・会社名の紹介</h3>
                  <p className="text-sm text-gray-600">
                    好きや得意を商品・サービスに進化させよう！
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">💡</span>
                <div>
                  <h3 className="font-bold text-gray-800">Yononakaで関わったアントレプレナーの活動紹介</h3>
                  <p className="text-sm text-gray-600">
                    実際に社会で活躍している人の行動を知ろう！
                  </p>
                </div>
            　</li>
            </ul>
          </div>

          <div className="mt-12">
            <p className="text-lg font-semibold text-gray-700">お楽しみに！</p>
          </div>
        </div>
      </main>
    </>
  )
}