'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { PAST_LINKS, FUTURE_LINKS, type PerspectiveLink } from '@/data/perspectives'

// 星空(box-shadow多重)。vw/vh指定でビューポート全体に散らす
const STARS_SMALL = [
  '5vw 12vh', '12vw 68vh', '18vw 32vh', '25vw 85vh', '31vw 8vh', '38vw 51vh',
  '44vw 22vh', '52vw 74vh', '58vw 15vh', '63vw 42vh', '70vw 88vh', '76vw 28vh',
  '83vw 60vh', '90vw 10vh', '95vw 45vh', '8vw 92vh', '21vw 55vh', '35vw 95vh',
  '48vw 38vh', '55vw 60vh', '67vw 5vh', '73vw 70vh', '86vw 82vh', '92vw 25vh',
  '15vw 18vh', '28vw 62vh', '41vw 78vh', '60vw 90vh', '79vw 48vh', '97vw 65vh',
]
  .map((pos) => `${pos} 0 0 rgba(232,236,248,0.55)`)
  .join(', ')

const STARS_TWINKLE = [
  '10vw 25vh', '23vw 40vh', '37vw 12vh', '50vw 55vh', '64vw 30vh', '78vw 8vh',
  '88vw 72vh', '45vw 90vh', '17vw 80vh', '94vw 38vh', '68vw 58vh', '30vw 70vh',
]
  .map((pos) => `${pos} 1px 1px rgba(232,236,248,0.9)`)
  .join(', ')

// 「過去=セピア寄りの暖色枠 / 未来=シアン〜紫の星雲枠」のトーン切り替え
const TONE = {
  past: {
    card: 'border-[#d9b98a]/40 bg-gradient-to-br from-[#3a2c18]/60 to-[#181630]/60',
    cardHover: 'hover:border-[#d9b98a] hover:shadow-[0_0_20px_rgba(217,185,138,0.25)]',
    badge: 'bg-[#d9b98a]/15 text-[#d9b98a] border-[#d9b98a]/40',
    subtitle: 'text-[#d9b98a]',
  },
  future: {
    card: 'border-[#2ee6ff]/30 bg-gradient-to-br from-[#14265e]/60 to-[#37175e]/60',
    cardHover: 'hover:border-[#8b7bff] hover:shadow-[0_0_20px_rgba(46,230,255,0.25)]',
    badge: 'bg-[#2ee6ff]/10 text-[#9be9ff] border-[#2ee6ff]/30',
    subtitle: 'text-[#9be9ff]',
  },
} as const

function LinkCard({ link, tone }: { link: PerspectiveLink; tone: keyof typeof TONE }) {
  const t = TONE[tone]
  const base = `block h-full rounded-2xl border-2 p-5 backdrop-blur-sm transition-all duration-300 ${t.card}`

  const inner = (
    <div className="flex items-start gap-4">
      <span className="w-12 h-12 shrink-0 grid place-items-center text-2xl rounded-full bg-[#0f1b3d]/60 border border-[#e8ecf8]/20">
        {link.icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-bold text-[#e8ecf8] text-lg leading-snug">{link.title}</h3>
        <p className="mt-1 text-sm text-[#e8ecf8]/60 leading-6">{link.description}</p>
      </div>
    </div>
  )

  // URL未設定の間は押せない「準備中🔒」(グレーアウト+微光)
  if (!link.url) {
    return (
      <div className={`${base} opacity-60 cursor-not-allowed select-none relative`}>
        {inner}
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#e8ecf8]/10 text-[#e8ecf8]/70 border-[#e8ecf8]/20 animate-pulse">
          準備中🔒
        </span>
      </div>
    )
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${t.cardHover} hover:-translate-y-1`}
    >
      {inner}
      <span className={`mt-3 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.badge}`}>
        のぞいてみる ↗
      </span>
    </a>
  )
}

export default function PerspectivesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen bg-gradient-to-b from-[#0f1b3d] via-[#0b1230] to-[#060a1e] text-[#e8ecf8]">
        {/* 星空(固定背景) */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[2px] h-[2px] rounded-full"
            style={{ boxShadow: STARS_SMALL }}
          />
          <div
            className="absolute w-[3px] h-[3px] rounded-full animate-pulse"
            style={{ boxShadow: STARS_TWINKLE }}
          />
        </div>

        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* ヒーロー(天文台) */}
            <div className="text-center mb-14">
              <div className="text-6xl mb-4">🔭</div>
              <div className="inline-flex items-center gap-2 bg-[#e8ecf8]/5 border border-[#e8ecf8]/20 rounded-full px-3 py-1 font-bold text-xs tracking-wide text-[#9be9ff]">
                ✦ プラネタリウム
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-wide">
                視点をふやす
              </h1>
              <p className="mt-3 text-[#e8ecf8]/70 leading-7">
                視点をふやすと、世界の見え方が変わる。
                <br className="hidden sm:block" />
                望遠鏡で、いろんな時代・いろんな場所をのぞいてみよう。
              </p>
            </div>

            {/* 過去をのぞく */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🕰</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#d9b98a]">過去をのぞく</h2>
                <span className="flex-1 h-px bg-gradient-to-r from-[#d9b98a]/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {PAST_LINKS.map((link) => (
                  <LinkCard key={link.title} link={link} tone="past" />
                ))}
              </div>
            </section>

            {/* 未来をのぞく */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🌌</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#9be9ff]">未来をのぞく</h2>
                <span className="flex-1 h-px bg-gradient-to-r from-[#2ee6ff]/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {FUTURE_LINKS.map((link) => (
                  <LinkCard key={link.title} link={link} tone="future" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
