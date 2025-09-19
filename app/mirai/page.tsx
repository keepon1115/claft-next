'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function MiraiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      {/* ナビゲーション */}
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* メインコンテンツ */}
      <main className="min-h-screen bg-slate-50 relative">

        {/* 中身：ヘッダー分の余白 */}
        <div className="pt-8 pb-16 px-4">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* 1) ミライクラフト（説明） */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              {/* アイブロウ（軽いアクセント） */}
              <div className="inline-flex items-center gap-2 text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 font-bold text-xs">
                🧭 実践ステージ
              </div>

              <h1 className="mt-3 text-2xl md:text-[26px] font-extrabold tracking-tight">
                ミライクラフト
              </h1>

              <p className="mt-2 text-[15px] md:text-base font-bold">
                身に付けた力を試し、仲間と協働！
              </p>

              <p className="mt-2 leading-7 text-slate-600">
                クエストやYononakaで考えたり学んだりした経験を活かし、自分の「好き」や「得意」を表現するステージです。
                発表会への参加、イベント企画、地域課題解決、商品制作などに挑戦しよう！
              </p>
            </section>

            {/* 2) 発表会 */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-center">
                <h2 className="text-[22px] md:text-2xl font-extrabold flex items-center justify-center gap-2">
                  <span className="w-10 h-10 rounded-xl grid place-items-center text-white bg-teal-500">🎭</span>
                  <span>発表会</span>
                </h2>
                <p className="mt-2 text-slate-600">
                  4ヶ月に1回の定期開催。飛び入り参加OK。
                </p>
              </div>

              {/* 現在のテーマ（シンプル・左ボーダー） */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500 rounded-l-xl" />
                <div className="pl-2">
                  <div className="text-xs font-extrabold tracking-wide text-slate-500">次回のテーマ</div>
                  <h3 className="mt-1 text-lg font-extrabold">準備中。決まったら連絡します。</h3>
                </div>
              </div>

              {/* CTA（統一） */}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-slate-300 text-white font-extrabold cursor-not-allowed select-none">
                  準備中
                </span>
                <a href="https://keepon1115.github.io/claft/futurecraft.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border-2 border-slate-500 text-slate-700 font-extrabold hover:bg-slate-50 transition">
                  今までの発表会をみる
                </a>
              </div>
            </section>

            {/* 3) プロジェクト */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-center">
                <h2 className="text-[22px] md:text-2xl font-extrabold flex items-center justify-center gap-2">
                  <span className="w-10 h-10 rounded-xl grid place-items-center text-white bg-slate-600">🛠️</span>
                  <span>プロジェクト</span>
                </h2>
                <p className="mt-2 text-slate-600">
                  仲間と協働しながら、商品開発・イベント企画・地域課題解決などに挑戦。
                </p>
              </div>

              {/* 現在のプロジェクト（シンプル・左ボーダー） */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-600 rounded-l-xl" />
                <div className="pl-2">
                  <div className="text-xs font-extrabold tracking-wide text-slate-500">現在のプロジェクト</div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <h3 className="mt-1 text-lg font-extrabold">PLAY CLAFT（11月のスクールフェスタ計画）</h3>
                  </div>
                  {/* 進行バー削除 */}
                </div>
              </div>

              {/* CTA（統一） */}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a href="https://keepon1115.github.io/claft/play-claft.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition">
                  詳細をみる
                </a>
                <a href="https://keepon1115.github.io/claft/futurecraft.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border-2 border-slate-500 text-slate-700 font-extrabold hover:bg-slate-50 transition">
                  今までのプロジェクトをみる
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  )
}
