'use client'

import { useState } from 'react'
import Link from 'next/link'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/hooks/useAuth'

interface MyselfCard {
  no: string
  icon: string
  title: string
  subtitle: string
  description: string
  href: string
  requiresAuth?: boolean
  comingSoon?: boolean
}

const CARDS: MyselfCard[] = [
  {
    no: '01',
    icon: '😊',
    title: '自分のデータ',
    subtitle: 'きみの観察記録',
    description: 'プロフィールや今までのあゆみを見てみよう',
    href: '/profile',
    requiresAuth: true,
  },
  {
    no: '02',
    icon: '📊',
    title: '非認知能力レポート',
    subtitle: 'きみの能力図鑑',
    description: '面談で計測した「きみらしさ」のレポート',
    href: '/myself/report',
    requiresAuth: true,
  },
  {
    no: '03',
    icon: '📖',
    title: 'であった人ずかん',
    subtitle: '出会いのコレクション',
    description: 'これまでに出会った冒険者たちの記録',
    href: '/myself/zukan',
    comingSoon: true,
  },
  {
    no: '04',
    icon: '📜',
    title: 'ストーリー',
    subtitle: 'きみの冒険の書',
    description: '目標とこれまでの歩みを書きとめよう',
    href: '/myself/story',
  },
  {
    no: '05',
    icon: '🕵️',
    title: 'PBL',
    subtitle: '探究の記録',
    description: '自分だけの問いを見つけて探究しよう',
    href: '/pbl',
  },
]

export default function MyselfPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen relative bg-[#faf6ee] bg-[radial-gradient(#2d5a3d0d_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[#2d5a3d] bg-[#c9a227]/10 border border-[#c9a227]/40 rounded-full px-3 py-1 font-bold text-xs tracking-wide">
                📖 フィールドノート
              </div>
              <h1 className="mt-3 font-serif text-3xl md:text-4xl font-black text-[#2d5a3d] tracking-wide">
                自分を理解する
              </h1>
              <p className="mt-2 text-[#2d5a3d]/70 font-serif">
                きみ自身についての観察記録集
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CARDS.map((card) => {
                const locked = !!card.requiresAuth && !isAuthenticated

                const cardInner = (
                  <>
                    <div className="flex items-start justify-between">
                      <span className="font-serif text-xs text-[#c9a227] tracking-widest">
                        標本No.{card.no}
                      </span>
                      {card.comingSoon && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2d5a3d]/10 text-[#2d5a3d]">
                          準備中
                        </span>
                      )}
                      {locked && !card.comingSoon && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c9a227]/15 text-[#8b6f13]">
                          🔒 ログインが必要
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="w-12 h-12 rounded-full grid place-items-center text-2xl bg-white border-2 border-dashed border-[#2d5a3d]/40">
                        {card.icon}
                      </span>
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#2d5a3d]">
                          {card.title}
                        </h2>
                        <p className="text-xs text-[#c9a227] font-bold">{card.subtitle}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-[#2d5a3d]/70 leading-6">
                      {card.description}
                    </p>
                  </>
                )

                const cardClass =
                  'block h-full rounded-lg border-2 border-dashed border-[#2d5a3d]/30 bg-[#fffdf8] p-5 shadow-[3px_3px_0_rgba(45,90,61,0.08)] transition-all duration-200'

                if (card.comingSoon) {
                  return (
                    <div key={card.no} className={`${cardClass} opacity-60 cursor-not-allowed select-none`}>
                      {cardInner}
                    </div>
                  )
                }

                if (locked) {
                  return (
                    <button
                      key={card.no}
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className={`${cardClass} text-left hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(45,90,61,0.15)]`}
                    >
                      {cardInner}
                    </button>
                  )
                }

                return (
                  <Link
                    key={card.no}
                    href={card.href}
                    className={`${cardClass} hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(45,90,61,0.15)]`}
                  >
                    {cardInner}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
        redirectTo="/myself"
      />
    </>
  )
}
