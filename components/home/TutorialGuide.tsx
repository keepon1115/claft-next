'use client'

import React, { useEffect, useRef } from 'react'
import { useTutorialStore, ONBOARDING_VERSION } from '@/stores/tutorialStore'
import { useAuth } from '@/hooks/useAuth'

interface TutorialGuideProps {
  // 右上ボタン群の要素参照（歩き方/カレンダー/冒険者）
  howToRef?: React.RefObject<HTMLButtonElement>
  calendarRef?: React.RefObject<HTMLAnchorElement>
  adventurersRef?: React.RefObject<HTMLAnchorElement>
  onComplete?: () => void
}

export default function TutorialGuide({ howToRef, calendarRef, adventurersRef, onComplete }: TutorialGuideProps) {
  const { user, profile, isInitialized } = useAuth()
  const {
    active,
    step,
    start,
    next,
    goTo,
    skipAndComplete,
    complete,
    stop,
    completedAt,
    version,
    completedByUserId,
    welcomeSeenByUserId,
    markWelcomeSeen
  } = useTutorialStore()

  // 自動起動（初回ログイン時のみ）。以降は自動起動しない
  useEffect(() => {
    if (!user || !isInitialized) return
    const seenWelcome = !!welcomeSeenByUserId && welcomeSeenByUserId === user.id
    const isCompletedForUser = !!completedAt && completedByUserId === user.id
    if (isCompletedForUser) return
    if (!active && !seenWelcome) {
      start(user.id)
      goTo(0)
    }
  }, [user?.id, isInitialized, active, welcomeSeenByUserId, completedAt, completedByUserId])

  // オーバーレイのスクロール固定
  useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [active])

  if (!active) return null

  // ハイライト対象取得（0:ウェルカム, 1:歩き方, 2:カレンダー, 3:冒険者, 4:終了）
  const getTargetRect = () => {
    let el: HTMLElement | null = null
    if (step === 1 && howToRef?.current) el = howToRef.current
    if (step === 2 && calendarRef?.current) el = calendarRef.current
    if (step === 3 && adventurersRef?.current) el = adventurersRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height }
  }

  const rect = getTargetRect()

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <Panel title="ようこそ！" body="1〜2分で終わるチュートリアル。">
            <CTA onPrimary={() => { markWelcomeSeen(user?.id); goTo(1) }} primary="はじめる" />
          </Panel>
        )
      case 1:
        return (
          <Panel title="歩き方（学び方）📖" body="学びの進め方はここから確認できるよ">
            <CTA onPrimary={() => { howToRef?.current?.click() }} primary="開く" />
          </Panel>
        )
      case 2:
        return (
          <Panel title="カレンダー 📅" body="イベントの予定はここでチェック！">
            <CTA onPrimary={() => { calendarRef?.current?.click() }} primary="開く" />
          </Panel>
        )
      case 3:
        return (
          <Panel title="冒険者 🧑‍🤝‍🧑" body="仲間のプロフィールや活動を見てインスピレーションを得よう">
            <CTA onPrimary={() => { adventurersRef?.current?.click() }} primary="開く" />
          </Panel>
        )
      case 4:
        return (
          <Panel title="準備OK！" body="それでは冒険をはじめよう！">
            <CTA onPrimary={() => { complete(user?.id); onComplete?.() }} primary="はじめる" />
          </Panel>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* 背景マスク（クリックでは閉じない） */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ハイライト枠 */}
      {rect && (
        <div
          className="absolute ring-4 ring-blue-400/70 rounded-xl transition-all duration-200"
          style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }}
        />
      )}

      {/* ポップ */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[min(560px,94vw)]">
        <StepContent />
        {/* 矢印ナビゲーション */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => goTo(Math.max(0, step - 1))}
            disabled={step <= 0}
            className="px-3 py-2 rounded-lg bg-white/80 hover:bg-white text-slate-700 disabled:opacity-40"
            aria-label="prev"
          >
            ←
          </button>
          <button
            onClick={() => goTo(Math.min(4, step + 1))}
            disabled={step >= 4}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
            aria-label="next"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-5">
      <div className="text-lg font-bold mb-1">{title}</div>
      <div className="text-sm opacity-80 mb-4">{body}</div>
      <div className="flex gap-3">{children}</div>
    </div>
  )
}

function CTA({ onPrimary, primary, onSecondary, secondary }: { onPrimary: () => void; primary: string; onSecondary?: () => void; secondary?: string }) {
  return (
    <div className="flex gap-3 justify-end">
      {secondary && (
        <button onClick={onSecondary} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm">
          {secondary}
        </button>
      )}
      <button onClick={onPrimary} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
        {primary}
      </button>
    </div>
  )
}


