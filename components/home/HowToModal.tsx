'use client'

import React, { useEffect, useMemo, useState } from 'react'

type StepKey = 'morning' | 'evening' | 'night' | 'dawn'

type Step = {
  key: StepKey
  title: string
  emoji: string
  description: React.ReactNode
  actions: Array<{ label: string; href: string; external?: boolean }>
}

export default function HowToModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [active, setActive] = useState<StepKey>('morning')

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) setActive('morning')
  }, [isOpen])

  const steps: Step[] = useMemo(() => ([
    {
      key: 'morning',
      title: '朝',
      emoji: '🌅',
      description: (
        <>
          <p className="mb-2">まずはクエストで動画を視聴し、お題に自分の意見を入力します。1から6まで、ステージをひとつずつ進めましょう。</p>
          <p>合間に「お金」「AI」「発表」の動画も視聴して、意見共有を繰り返します。</p>
        </>
      ),
      actions: [
        { label: 'クエストをはじめる', href: '/quest' },
      ]
    },
    {
      key: 'evening',
      title: '夕方',
      emoji: '🌇',
      description: (
        <>
          <p className="mb-2">6まで終われば次は7〜12へ。同じく「正解がひとつでない問い」に意見共有し、クリアしていきます。</p>
          <p>9のつく日に3本ずつ更新。4のつく日はライブ対話のYononakaワークがあります。</p>
        </>
      ),
      // 指定順序: Yononaka → カレンダー → クエスト7〜12
      actions: [
        { label: 'Yononakaワークを見る', href: '/yononaka' },
        { label: '更新スケジュールを見る', href: 'https://keepon.work/claft-', external: true },
        { label: 'クエスト7〜12へ', href: '/quest' },
      ]
    },
    {
      key: 'night',
      title: '夜',
      emoji: '🌙',
      description: (
        <>
          <p className="mb-2">意見を持ち共有する習慣が身についたら、自己プレゼンへ。</p>
          <p>好き・得意と好きな表現方法で自分を動画で表現。スタッフ面談で今後の活動を設計します。</p>
        </>
      ),
      actions: [
        { label: '自己プレゼンを作る', href: '/profile' },
        // 面談予約URLがあれば差し替え
      ]
    },
    {
      key: 'dawn',
      title: '夜明け',
      emoji: '🌄',
      description: (
        <>
          <p className="mb-2">PBL（課題解決型学習）へ。問いを立てて学び、定期発表とフィードバックを繰り返します。</p>
          <p>4ヶ月ごとの発表会、仲間とのイベント企画、地域課題解決へと広がります。</p>
        </>
      ),
      actions: [
        { label: 'ミライクラフトに挑戦', href: '/mirai' },
      ]
    },
  ]), [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white border-4 border-gray-800 rounded-2xl w-[min(1100px,100%)] max-h-[90vh] overflow-hidden relative">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3 border-b-4 border-gray-800 bg-gradient-to-r from-sky-100 to-purple-100">
          <div className="flex items-center gap-2 font-black text-lg text-gray-800">
            <span>🗺️</span>
            <span>歩き方（CLAFT 地図）</span>
          </div>
          <button aria-label="閉じる" className="w-8 h-8 bg-red-600 text-white border-2 border-red-900 rounded hover:bg-red-700" onClick={onClose}>×</button>
        </div>

        {/* コンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* 左: 地図（SVG） */}
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#E6F6FF] via-[#F1ECFF] to-[#FFF3D6] border-r-4 border-gray-800 overflow-hidden">
            {/* 背景のワクワク演出（放射光） */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0)_70%)]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_70%)]" />

            <svg viewBox="0 0 400 400" className="w-full h-[300px] md:h-[400px]">
              {/* 背景の山（後ろ側） */}
              <defs>
                <linearGradient id="mountGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BEE3F8" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
              </defs>
              <polygon points="-20,320 120,180 240,320" fill="url(#mountGrad)" opacity="0.35" />
              <polygon points="160,320 280,180 420,320" fill="url(#mountGrad)" opacity="0.35" />

              {/* 円形の道 */}
              <defs>
                <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="50%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="200" r="130" fill="none" stroke="url(#pathGrad)" strokeDasharray="6 10" strokeWidth="5" />

              {[
                { k: 'morning', x: 200, y: 70, label: '朝', emoji: '🌅' },
                { k: 'evening', x: 330, y: 200, label: '夕方', emoji: '🌇' },
                { k: 'night', x: 200, y: 330, label: '夜', emoji: '🌙' },
                { k: 'dawn', x: 70, y: 200, label: '夜明け', emoji: '🌄' },
              ].map((n) => (
                <g key={n.k} onClick={() => setActive(n.k as StepKey)} className="cursor-pointer">
                  <circle cx={n.x} cy={n.y} r={36} fill={active === n.k ? '#FDE68A' : 'white'} stroke="#111827" strokeWidth="4" />
                  <text x={n.x} y={n.y+10} textAnchor="middle" fontSize="28">{n.emoji}</text>
                </g>
              ))}

              {/* 足跡 */}
              <circle cx={{
                morning: 200,
                evening: 300,
                night: 200,
                dawn: 100,
              }[active]} cy={{
                morning: 120,
                evening: 200,
                night: 280,
                dawn: 200,
              }[active]} r="6" fill="#111827" />
            </svg>

            <p className="text-xs text-gray-600 text-center">地図上の拠点をタップして詳細を表示</p>
          </div>

          {/* 右: 説明パネル */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[calc(90vh-64px)]">
            {steps.map((s) => (
              <section key={s.key} aria-hidden={active !== s.key} className={active === s.key ? 'block' : 'hidden'}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl" aria-hidden>{s.emoji}</div>
                  <h3 className="sr-only">{s.title}</h3>
                </div>
                <div className="text-gray-800 leading-relaxed mb-4">
                  {s.description}
                </div>
                <div className="flex flex-wrap gap-3">
                  {s.actions.map((a) => (
                    <a
                      key={a.label}
                      href={a.href}
                      target={a.external ? '_blank' : undefined}
                      rel={a.external ? 'noopener noreferrer' : undefined}
                      className="px-4 py-2 rounded-lg border-2 border-gray-800 bg-white hover:bg-gray-50 font-bold text-sm shadow-[0_2px_0_#111] transition-colors"
                    >
                      {a.label}
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
