'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import UserProfileModal from '@/components/yononaka/UserProfileModal'
import { useAdventurerList } from '@/hooks/useAdventurerList'

export default function YononakaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  
  // 冒険者一覧データを取得（制限なしで全件）
  const { adventurers, loading: adventurersLoading, error: adventurersError } = useAdventurerList()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // 冒険者プロフィールを開く
  const openUserProfile = (userId: string) => {
    setSelectedUserId(userId)
    setIsProfileModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsProfileModalOpen(false)
    setSelectedUserId(null)
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
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[360px] flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <span className="text-2xl">☺</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">ちょこっとYononaka</h2>
              </div>
              <p className="text-amber-800 mb-6">
                かんたんなお題から、正解がひとつでない問いに向き合いましょう！
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <a
                  href="https://forms.gle/6qdR81fLCeRekV5eA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-xl p-4 font-bold text-amber-900 hover:translate-x-1 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                Yo102 自分が作ったものを他者に伝えることって・・・？
                </a>
                <a
                  href="https://forms.gle/mT9NFMhZuKgHmszx8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-xl p-4 font-bold text-amber-900 hover:translate-x-1 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                Yo103 秋といえば？
                </a>
              </div>

              <a href="https://www.canva.com/design/DAGsulhyDNA/cmqZ6G-eGMVs7ABWtFKskg/edit?utm_content=DAGsulhyDNA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer" className="group block text-center w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-amber-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <span className="relative z-10">これまでのみんなの回答をチェック</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </a>
            </section>

            {/* Yononakaワーク */}
            <section className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[360px]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                  <span className="text-2xl">🌍</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Yononakaワーク</h2>
              </div>
              <p className="text-amber-800 mb-6">
                オンラインで集まり、参加者同士がお題に対して話し合う、対話ワーク。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch flex-grow">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">知ってる？宇宙の謎</h3>
                  <div className="text-amber-700 text-sm space-y-1 mb-4">
                    <p>📅 11月11日(火) 20時~21時</p>
                  </div>
                  <a href="https://us02web.zoom.us/j/88570050998?pwd=tj4q3N4JcGnLRalN0d4wjJonGeD5Wb.1" target="_blank" rel="noopener noreferrer" className="mt-auto bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    ZOOMに入る
                  </a>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">プレイクラフトミーティング</h3>
                  <div className="text-amber-700 text-sm space-y-1 mb-4">
                    <p>📅 11月中旬</p>
                  </div>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="mt-auto bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300">
                    日時未定
                  </a>
                </div>
              </div>

              <a href="https://forms.gle/qMtiFWPD39aKH83D9" target="_blank" rel="noopener noreferrer" className="mt-4 group block text-center w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-amber-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <span className="relative z-10">11月の参加申し込みはこちら</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </a>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="https://youtu.be/j04B7zlQRQs" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center text-center min-h-20 relative overflow-hidden">
                  <span className="relative z-10">
                    🎬 笑顔を届ける舞台の立役者
                  </span>
                </a>
                
                <a href="https://youtu.be/UM_BFsKWTrs" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-400 to-cyan-400 text-amber-900 font-bold py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center text-center min-h-20">
                　🎬 癒しの魔法と薬剤師
                </a>
                
                <a href="https://youtu.be/pMceoLYo24k" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white font-bold py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center text-center min-h-20">
                  🎬 永遠のおりがみ小僧
                </a>
              </div>
            </section>
          </div>

          {/* 冒険者アバターセクション */}
          <section id="adventurers" className="max-w-4xl mx-auto mt-12">
            <div className="bg-white/90 backdrop-blur-sm border-3 border-amber-600 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-amber-900 text-center mb-8">🏃‍♀️ CLAFTの冒険者一覧</h2>
              
              {adventurersLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-amber-700">冒険者たちを探しています...</p>
                </div>
              )}

              {adventurersError && (
                <div className="text-center py-12">
                  <div className="text-amber-700 text-4xl mb-4">😅</div>
                  <p className="text-amber-700">{adventurersError}</p>
                </div>
              )}

              {!adventurersLoading && !adventurersError && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8">
                  {adventurers.length > 0 ? (
                    adventurers.map((adventurer) => {
                      const level = Math.floor((adventurer.total_exp || 0) / 100) + 1
                      return (
                        <div 
                          key={adventurer.id} 
                          className="text-center hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => openUserProfile(adventurer.id)}
                        >
                          <div className="w-24 h-24 mx-auto mb-2 rounded-full border-4 border-purple-400 bg-gradient-to-br from-orange-100 to-white shadow-lg hover:border-pink-400 hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden relative">
                            {adventurer.avatar_url ? (
                              <img 
                                src={adventurer.avatar_url}
                                alt={`${adventurer.nickname}のアバター`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full flex items-center justify-center text-2xl"
                              style={{ display: adventurer.avatar_url ? 'none' : 'flex' }}
                            >
                              👨‍🎓
                            </div>
                            {/* レベルバッジ */}
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {level}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-amber-800 truncate px-1">
                            {adventurer.nickname}
                          </p>
                          {adventurer.character_type && (
                            <p className="text-xs text-amber-600 truncate px-1">
                              {adventurer.character_type}
                            </p>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-amber-700 text-lg">まだ冒険者がいません</p>
                      <p className="text-amber-600 text-sm mt-2">プロフィールを作成した冒険者が表示されます</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ユーザープロフィールモーダル */}
      <UserProfileModal 
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={closeModal}
      />

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