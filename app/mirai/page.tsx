'use client'

import { useState, useEffect } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function MiraiPage() {
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
          <div className="max-w-7xl mx-auto px-6 flex justify-center md:justify-between items-center">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-lg">🚀</span>
              </div>
              <span className="text-xl font-bold">
                ミライクラフト
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                Level 1
              </div>
              <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* 準備中メッセージ */}
        <div className="text-center px-6 pt-20 pb-20">
          <div className="mb-12">
            <div className="text-8xl mb-6 animate-bounce">
              🚀
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              新しい冒険の準備をしています！
            </h1>
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
              ミライクラフトでは、君の「やってみたい」を形にする、こんな企画を準備中です。
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <ul className="space-y-6 text-left">
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">🏆</span>
                <div>
                  <h3 className="font-bold text-gray-800">3ヶ月ごとの発表会･コンテスト</h3>
                  <p className="text-sm text-gray-600">
                    自分の成長や作品をみんなに披露しよう！
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">💡</span>
                <div>
                  <h3 className="font-bold text-gray-800">社会課題の解決アイデアを考える</h3>
                  <p className="text-sm text-gray-600">
                    君のひらめきで、世の中をもっと良くするチャンス。
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">🤝</span>
                <div>
                  <h3 className="font-bold text-gray-800">
                    地域と協力した実践的課題解決ワーク
                  </h3>
                  <p className="text-sm text-gray-600">
                    リアルな課題にチームで挑戦。学校では学べない体験を。
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">🎉</span>
                <div>
                  <h3 className="font-bold text-gray-800">スクール生による企画イベント</h3>
                  <p className="text-sm text-gray-600">
                    「こんなことやりたい！」を自分たちの手で実現する。
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