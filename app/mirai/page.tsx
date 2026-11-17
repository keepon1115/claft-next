'use client'

import { useState } from 'react'
import Link from 'next/link'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

// 青焼き図面の方眼(細かい目+大きい目の2層グリッド)
const BLUEPRINT_GRID = {
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
    'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
} as const

// 図面カードの共通枠
const CARD = 'rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-[2px] p-6'

export default function MiraiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      {/* ナビゲーション */}
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* メインコンテンツ(秘密基地・工房トーン) */}
      <main className="min-h-screen bg-[#1a3a5c] text-[#eaf2fb]" style={BLUEPRINT_GRID}>
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* ヒーロー(図面の表題欄風) */}
            <section className="rounded-2xl border-2 border-white/50 p-6 relative">
              <div className="absolute -top-3 left-6 bg-[#1a3a5c] px-2 text-xs font-bold tracking-[0.3em] text-white/60">
                DRAWING No. CLAFT-08
              </div>
              <div className="inline-flex items-center gap-2 border border-white/40 rounded-full px-3 py-1 font-bold text-xs text-white/80">
                📐 秘密基地・工房
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-wide">
                ミライクラフト
              </h1>
              <p className="mt-2 text-lg font-bold text-[#9fd0ff]">
                つくって、ためして、とどける
              </p>
              <p className="mt-3 leading-7 text-[#eaf2fb]/70">
                クエストやYononakaで学んだ経験を活かして、自分の「好き」や「得意」をかたちにする工房。
                発表会への参加、イベント企画、地域課題解決、商品制作などに挑戦しよう！
              </p>
            </section>

            {/* 柱1: PLAY CLAFT */}
            <section className={CARD}>
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center border-2 border-white/40 bg-white/10">🔧</span>
                <span>PLAY CLAFT</span>
              </h2>
              <p className="mt-3 leading-7 text-[#eaf2fb]/70">
                仲間と協働しながら、商品開発・イベント企画・地域課題解決などに挑戦するプロジェクト。
              </p>

              {/* 現在のプロジェクト(付箋風) */}
              <div className="mt-5 max-w-md rotate-[-1deg] rounded-sm bg-[#ffe289] text-[#4a3b0a] p-4 shadow-[4px_5px_0_rgba(0,0,0,0.25)]">
                <div className="text-[10px] font-extrabold tracking-wide text-[#4a3b0a]/60">現在のプロジェクト</div>
                <p className="mt-1 font-extrabold leading-snug">PLAY CLAFT（11月のスクールフェスタ計画）</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://keepon1115.github.io/claft/play-claft.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-[#9fd0ff] text-[#12283f] font-extrabold hover:bg-white transition"
                >
                  詳細をみる ↗
                </a>
                <a
                  href="https://keepon1115.github.io/claft/futurecraft.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border-2 border-white/50 font-extrabold hover:bg-white/10 transition"
                >
                  今までのプロジェクトをみる ↗
                </a>
              </div>
            </section>

            {/* 柱2: アプリ開発 */}
            <section className={CARD}>
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center border-2 border-white/40 bg-white/10">🛠️</span>
                <span>アプリ開発</span>
              </h2>
              <p className="mt-3 leading-7 text-[#eaf2fb]/70">
                いま見ているこのCLAFTアプリも、メンバーと一緒に育てている作品のひとつ。
                「こんな機能がほしい」「ここが使いにくい」— そのひらめきが、次のアップデートになる。
              </p>
              <p className="mt-3 font-bold text-[#9fd0ff]">
                このアプリも作品のひとつ。次の機能をきみが考えよう。
              </p>
              <div className="mt-5">
                <Link
                  href="/hirameki-post"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border-2 border-white/50 font-extrabold hover:bg-white/10 transition"
                >
                  💡 アイデアをひらめきポストへ
                </Link>
              </div>
            </section>

            {/* 柱3: ひらめきポスト(大きい入口カード) */}
            <Link
              href="/hirameki-post"
              className="group block rounded-2xl border-2 border-[#ffe289]/60 bg-gradient-to-br from-[#ffe289]/15 to-white/5 p-6 transition-all duration-300 hover:border-[#ffe289] hover:shadow-[0_0_24px_rgba(255,226,137,0.25)] hover:-translate-y-1"
            >
              <div className="flex items-center gap-5">
                <span className="text-5xl group-hover:scale-110 transition-transform">💡</span>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#ffe289]">ひらめきポスト</h2>
                  <p className="mt-1 leading-6 text-[#eaf2fb]/70">
                    思いついたアイデア・気になるギモンを投函しよう。工房はいつでも開いてる。
                  </p>
                  <span className="mt-2 inline-block text-xs font-extrabold tracking-widest text-[#ffe289]/90">
                    ▶ ポストをのぞく
                  </span>
                </div>
              </div>
            </Link>

            {/* 発表会 */}
            <section className={CARD}>
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center border-2 border-white/40 bg-white/10">🎭</span>
                <span>発表会</span>
              </h2>
              <p className="mt-3 leading-7 text-[#eaf2fb]/70">
                4ヶ月に1回の定期開催。飛び入り参加OK。
              </p>

              {/* 次回テーマ(図面の注記欄風) */}
              <div className="mt-5 rounded-xl border border-dashed border-white/40 bg-[#12283f]/60 p-4">
                <div className="text-xs font-extrabold tracking-wide text-white/50">次回のテーマ</div>
                <h3 className="mt-1 text-lg font-extrabold">準備中。決まったら連絡します。</h3>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-white/15 text-white/50 font-extrabold cursor-not-allowed select-none">
                  準備中
                </span>
                <a
                  href="https://keepon1115.github.io/claft/futurecraft.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border-2 border-white/50 font-extrabold hover:bg-white/10 transition"
                >
                  今までの発表会をみる ↗
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  )
}
