'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function YononakaPage() {
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
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        {/* 背景アニメーション */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/10 via-transparent to-green-100/10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-pink-100/10 via-transparent to-blue-100/10 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 p-8">
          {/* タイトルバナー */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white border-4 border-amber-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <div className="relative z-10 text-center">
                <h1 className="text-5xl font-black text-amber-900 mb-4">
                  Yononaka
                </h1>
                <p className="text-xl text-amber-700 font-medium">
                 正解が一つでない問いに対して自分の意見を共有する時間
                </p>
              </div>
            </div>
          </div>

          {/* メインコンテンツグリッド */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ちょこっとYononaka */}
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <span className="text-2xl">☺</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">ちょこっとYononaka</h2>
              </div>
              <p className="text-amber-800 mb-6">
                かんたんなお題から、正解がひとつでない問いに向き合いましょう！
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <a
                  href="https://forms.gle/nEUMFroAn986QY37A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-xl p-4 font-bold text-amber-900 hover:translate-x-1 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  【Yo91】こんな遊びいいな、できたらいいな
                </a>
                <a
                  href="https://forms.gle/2YJtRWQr3KN6tXPY7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 rounded-xl p-4 font-bold text-amber-900 hover:translate-x-1 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  【Yo92】七夕の日にだけ会えるなら？
                </a>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl p-4 font-bold text-amber-900 hover:translate-x-1 hover:scale-105 transition-all duration-300 cursor-pointer">
                  【Yo93】まだ押せません
                </div>
                <a
                  href="https://forms.gle/3pBgXCR74Je6cqee6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-purple-200 to-pink-200 border-2 border-purple-300 rounded-xl p-4 font-bold text-amber-900 relative overflow-hidden cursor-pointer hover:translate-x-1 hover:scale-105 transition-all duration-300"
                >
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl opacity-50">⭐</span>
                  【マンスリー】街で見つけた面白い看板をさがせ！
                </a>
              </div>

              <a href="https://www.canva.com/design/DAGsulhyDNA/cmqZ6G-eGMVs7ABWtFKskg/edit?utm_content=DAGsulhyDNA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer" className="group block text-center w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-amber-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <span className="relative z-10">これまでのみんなの回答をチェック</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </a>
            </section>

            {/* Yononakaワーク */}
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                  <span className="text-2xl">🌍</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Yononakaワーク</h2>
              </div>
              <p className="text-amber-800 mb-6">
                オンラインで集まり、参加者同士がお題に対して話し合う、対話ワーク。
              </p>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">ありがとうって言ってますか？</h3>
                  <div className="text-amber-700 text-sm space-y-1 mb-4">
                    <p>📅 期間: 7月14日（月） 20時~21時</p>
                  </div>
                  <a href="https://forms.gle/T8c7ntFFySE4yKqKA" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    参加する
                  </a>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">アイデアづくり</h3>
                  <div className="text-amber-700 text-sm space-y-1 mb-4">
                    <p>📅 期間: 7月27日（日） 13時~14時</p>
                  </div>
                  <a href="https://forms.gle/T8c7ntFFySE4yKqKA" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    参加する
                  </a>
                </div>
              </div>
            </section>

            {/* 振り返り動画セクション */}
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1s'}}>
                  <span className="text-2xl">🎬</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">ワークの振り返り</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
              <a
                  href="https://youtube.com/playlist?list=PL0Mhi-8AZtqevy4FM32tAIvwgyDDVEi8r&feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-lg py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                 <span className="text-2xl">🎬</span>
                  アーカイブ動画
                </a>
                
                <a
                  href="https://youtube.com/playlist?list=PLg8PlJHz4ogvIGsyI8SDss91HpW_edbuc&feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-green-400 to-cyan-400 text-amber-900 font-bold text-lg py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                 <span className="text-2xl">🎬</span>
                  振り返り動画
                </a>
                
                <button className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-lg py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                  <span className="text-2xl">💭</span>
                  参加者の感想
                </button>
              </div>
            </section>

            {/* ストーリーボタン */}
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                  <span className="text-2xl">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Yononaka Story</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a href="https://youtu.be/j04B7zlQRQs" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center text-center min-h-20 relative overflow-hidden">
                  <span className="relative z-10">
                    🎬 笑顔を届ける舞台の立役者
                  </span>
                </a>
                
                <a href="https://youtu.be/UM_BFsKWTrs" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-400 to-cyan-400 text-amber-900 font-bold py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center text-center min-h-20">
                　🎬 癒しの魔法と薬剤師
                </a>
              </div>
            </section>
          </div>

          {/* 冒険者アバターセクション */}
          <section className="max-w-4xl mx-auto mt-12">
            <div className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-amber-900 text-center mb-8">🏃‍♀️ CLAFTの冒険者一覧</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="text-center hover:scale-110 transition-transform duration-300">
                    <div className="w-24 h-24 mx-auto mb-2 rounded-full border-4 border-purple-400 bg-gradient-to-br from-orange-100 to-white shadow-lg hover:border-pink-400 hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                      <span className="text-2xl">👨‍🎓</span>
                    </div>
                    <p className="text-sm font-medium text-amber-800">冒険者{index}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* カスタムアニメーション */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  )
} 