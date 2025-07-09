'use client'

import { useState, useEffect } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function MiraiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, delay: number}>>([])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // パーティクル生成
  useEffect(() => {
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10
    }))
    setParticles(particleArray)
  }, [])

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
      <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
        {/* 背景アニメーション */}
        <div className="fixed inset-0 z-0">
          {/* ジオメトリック背景 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-cyan-400 to-orange-400 animate-spin-slow"></div>
          </div>
          
          {/* パーティクル */}
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 bg-white/80 rounded-full animate-float-up"
                style={{
                  left: `${particle.x}%`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: '10s'
                }}
              />
            ))}
          </div>
        </div>

        {/* ヘッダー */}
        <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20 py-5">
          <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
            <div className="flex items-center gap-4 text-white group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <span className="text-xl">🚀</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                CLAFT ミライクラフト
              </span>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-yellow-400/30 animate-pulse flex items-center gap-2">
                <span>⭐</span>
                <span>Level 8</span>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg shadow-lg shadow-purple-500/30 hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテナ */}
        <div className="relative z-10 max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-screen">
          
          {/* 左側：ミライビジョン */}
          <section className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-yellow-400/10 to-transparent overflow-hidden">
              <div className="absolute w-24 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spotlight"></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-15 h-15 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/30 animate-bounce">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-800">未来発表会</h2>
                </div>
                <p className="text-gray-600">自分の未来を創造し、発表する場所</p>
              </div>

              {/* 今月のテーマ */}
              <div className="bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-lg shadow-emerald-400/30 hover:scale-102 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent animate-rotate-slow"></div>
                
                <div className="relative z-10">
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">今月のテーマ</div>
                  <h3 className="text-2xl font-black mb-4 text-shadow">🤖 AI と共創する未来社会</h3>
                  
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-lg">📅</span>
                    <span className="font-medium">2025年1月15日 - 2月15日</span>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                      残り 18日
                    </div>
                  </div>

                  {/* 参加者アバター */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-sm hover:scale-125 hover:-translate-y-1 transition-all duration-300 z-10"
                        >
                          👤
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/30 px-2 py-1 rounded-full text-sm font-bold">
                      +42名参加中
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-4">
                    <button className="flex-1 bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>🎤</span>
                        発表エントリー
                      </span>
                    </button>
                    <button className="flex-1 bg-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-300">
                      詳細を見る
                    </button>
                  </div>
                </div>
              </div>

              {/* ミライワーク */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🛠️ ミライワーク</h3>
                
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-gray-800 mb-2">🎨 未来デザインチャレンジ</h4>
                  <p className="text-gray-600 text-sm mb-3">理想の未来社会をデザインし、プレゼンテーションを作成</p>
                  <button className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-sm font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    参加する
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-gray-800 mb-2">🚀 テクノロジー探究</h4>
                  <p className="text-gray-600 text-sm mb-3">最新技術を学び、自分なりの活用方法を考案</p>
                  <button className="bg-gradient-to-r from-blue-400 to-purple-400 text-white text-sm font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    探究開始
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 中央：タイムライン */}
          <section className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-15 h-15 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <span className="text-3xl">⏰</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800">ミライタイムライン</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative pl-8 border-l-4 border-emerald-400">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-400 rounded-full"></div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="text-sm text-emerald-600 font-bold">🎯 現在進行中</div>
                  <h4 className="font-bold text-gray-800">AIアイデアソン開催中</h4>
                  <p className="text-sm text-gray-600">参加者47名でAI活用アイデアを競い合い</p>
                </div>
              </div>

              <div className="relative pl-8 border-l-4 border-blue-300">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-400 rounded-full"></div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-600 font-bold">📅 1月25日</div>
                  <h4 className="font-bold text-gray-800">中間発表会</h4>
                  <p className="text-sm text-gray-600">進捗共有とフィードバック会</p>
                </div>
              </div>

              <div className="relative pl-8 border-l-4 border-purple-300">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-400 rounded-full"></div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-600 font-bold">📅 2月15日</div>
                  <h4 className="font-bold text-gray-800">最終発表会 & 表彰式</h4>
                  <p className="text-sm text-gray-600">最優秀賞・特別賞の発表</p>
                </div>
              </div>

              <div className="relative pl-8 border-l-4 border-gray-300">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 font-bold">📅 3月1日</div>
                  <h4 className="font-bold text-gray-800">次回テーマ発表</h4>
                  <p className="text-sm text-gray-600">新しいミライクラフトテーマの発表</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                🗓️ 全スケジュールを見る
              </button>
            </div>
          </section>

          {/* 右側：コミュニティ */}
          <section className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-15 h-15 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 animate-bounce" style={{animationDelay: '1s'}}>
                  <span className="text-3xl">👥</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800">ミライ仲間</h2>
              </div>
            </div>

            {/* 最新投稿 */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-800">💬 最新の投稿</h3>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm">
                    🚀
                  </div>
                  <span className="font-bold text-gray-800">未来探究者A</span>
                  <span className="text-xs text-gray-500">5分前</span>
                </div>
                <p className="text-sm text-gray-700">
                  AIと人間の協働について新しいアイデアを思いつきました！みんなの意見も聞かせてください 🤖✨
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-400">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm">
                    🌱
                  </div>
                  <span className="font-bold text-gray-800">創造クリエイター</span>
                  <span className="text-xs text-gray-500">15分前</span>
                </div>
                <p className="text-sm text-gray-700">
                  プレゼン資料ができました！フィードバックお願いします 📊
                </p>
              </div>
            </div>

            {/* アクティブメンバー */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ 今月のアクティブメンバー</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="text-center hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl">
                      👤
                    </div>
                    <p className="text-xs font-medium text-gray-600">メンバー{i}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* チャット参加 */}
            <div className="text-center">
              <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                💬 チャットに参加
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* カスタムアニメーション */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }
        
        @keyframes spotlight {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(500px); }
        }
        
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-float-up {
          animation: float-up 10s infinite;
        }
        
        .animate-spotlight {
          animation: spotlight 3s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  )
} 