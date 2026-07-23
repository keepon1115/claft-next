'use client'

import { useState } from 'react'
import Link from 'next/link'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import GameCabinet from '@/components/asobiba/GameCabinet'
import GamePlayerModal from '@/components/asobiba/GamePlayerModal'
import { MEMBER_GAMES, type MemberGame } from '@/data/games'

// ネオン看板用の多重グロー
const NEON_PINK = '0 0 7px #ff2e88, 0 0 20px rgba(255,46,136,0.8), 0 0 44px rgba(255,46,136,0.5)'
const NEON_CYAN = '0 0 7px #2ee6ff, 0 0 20px rgba(46,230,255,0.8), 0 0 44px rgba(46,230,255,0.5)'

export default function AsobibaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [playingGame, setPlayingGame] = useState<MemberGame | null>(null)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const handlePlay = (game: MemberGame) => {
    if (game.playMode === 'external') {
      window.open(game.url, '_blank', 'noopener,noreferrer')
    } else {
      setPlayingGame(game)
    }
  }

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen bg-[#0a0a12] text-[#e8ecf8]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            {/* ネオン看板ヒーロー */}
            <div className="text-center mb-14">
              <p
                className="text-sm font-bold tracking-[0.5em] text-[#2ee6ff]"
                style={{ textShadow: NEON_CYAN }}
              >
                GAME CENTER
              </p>
              <h1
                className="mt-3 text-4xl md:text-5xl font-black tracking-widest text-[#ff8ab8]"
                style={{ textShadow: NEON_PINK }}
              >
                🕹 あそびば
              </h1>
              <p className="mt-4 text-[#e8ecf8]/60 leading-7">
                メンバーがつくったゲームで、ちょっとひと息。
              </p>
            </div>

            {/* 筐体グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {MEMBER_GAMES.map((game) => (
                <GameCabinet key={game.id} game={game} onPlay={handlePlay} />
              ))}
            </div>

            {/* 特別筐体: 黄昏の対話室 */}
            <Link
              href="/twilight"
              className="group block max-w-2xl mx-auto rounded-3xl border-2 border-[#a855f7]/50 bg-gradient-to-b from-[#1a1030] to-[#12121f] p-5 sm:p-7 transition-all duration-300 hover:border-[#a855f7] hover:shadow-[0_0_32px_rgba(168,85,247,0.4)] hover:-translate-y-1"
            >
              <div className="rounded-lg bg-[#0a0a12] border border-[#a855f7]/40 px-4 py-2 text-center">
                <span
                  className="font-bold tracking-widest text-[#c99aff]"
                  style={{ textShadow: '0 0 8px rgba(168,85,247,0.7), 0 0 20px rgba(168,85,247,0.4)' }}
                >
                  🌙 黄昏の対話室
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-5xl group-hover:scale-110 transition-transform">🌆</span>
                <div>
                  <p className="text-[#e8ecf8]/80 font-bold">夜のすみっこで、キャラクターと話そう</p>
                  <p className="mt-1 text-xs text-[#a855f7]/80 font-bold tracking-widest">
                    ▶ ENTER ROOM
                  </p>
                </div>
              </div>
            </Link>

            {/* フッター */}
            <p className="mt-14 text-center text-xs text-[#e8ecf8]/35">
              きみの作ったゲームもここに並べよう → 先生に声をかけてね
            </p>
          </div>
        </div>
      </main>

      {/* iframeはモーダルを開いた時だけマウント(重いゲーム対策) */}
      {playingGame && (
        <GamePlayerModal game={playingGame} onClose={() => setPlayingGame(null)} />
      )}
    </>
  )
}
