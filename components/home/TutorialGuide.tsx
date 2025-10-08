'use client'

import React, { useEffect, useRef } from 'react'
import { useTutorialStore, ONBOARDING_VERSION } from '@/stores/tutorialStore'
import { useAuth } from '@/hooks/useAuth'

interface TutorialGuideProps {
  // 右上ボタン群の要素参照（歩き方/カレンダー/冒険者）
  howToRef?: React.RefObject<HTMLDivElement>
  calendarRef?: React.RefObject<HTMLAnchorElement>
  adventurersRef?: React.RefObject<HTMLAnchorElement>
  // サイドメニュー制御
  openSidebar?: () => void
  closeSidebar?: () => void
}

export default function TutorialGuide({ howToRef, calendarRef, adventurersRef, openSidebar, closeSidebar }: TutorialGuideProps) {
  const { user, profile } = useAuth()
  const { active, step, start, next, goTo, skipAndComplete, complete, stop, completedAt, version, completedByUserId } = useTutorialStore()

  // 新規登録/初回ログイン時に自動起動（完了済み・バージョン違いでなければ）
  useEffect(() => {
    if (!user) return
    // 別ユーザーであれば再起動、同ユーザーで完了済みなら起動しない
    if (!completedAt || completedByUserId !== user.id || version !== ONBOARDING_VERSION) {
      start(user.id)
    }
  }, [user?.id, completedAt, completedByUserId, version])

  // プロフィール完了（デフォルトの「冒険者」以外）で即終了
  useEffect(() => {
    if (!profile) return
    const nickname = profile.nickname
    if (nickname && nickname !== '冒険者') {
      if (active) complete(user?.id)
    }
  }, [profile?.nickname, active])

  // オーバーレイのスクロール固定
  useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [active])

  if (!active) return null

  // ハイライト対象取得
  const getTargetRect = () => {
    let el: HTMLElement | null = null
    if (step === 2 && howToRef?.current) el = howToRef.current
    if (step === 3 && calendarRef?.current) el = calendarRef.current
    if (step === 4 && adventurersRef?.current) el = adventurersRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height }
  }

  const rect = getTargetRect()

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <Panel title="ようこそ！" body="1〜2分で終わるチュートリアル。いつでもスキップできるよ✌️">
            <CTA onPrimary={() => goTo(1)} primary="はじめる" onSecondary={() => skipAndComplete(user?.id)} secondary="あとで" />
          </Panel>
        )
      case 1:
        return (
          <Panel title="プロフィールを整えよう 😊" body="表示名やアイコンを設定すると、体験がもっと良くなるよ！">
            <CTA onPrimary={() => skipAndComplete(user?.id)} primary="あとで" onSecondary={() => skipAndComplete(user?.id)} secondary="スキップ" />
          </Panel>
        )
      case 2:
        return (
          <Panel title="歩き方（学び方）📖" body="学びの進め方はここから確認できるよ">
            <CTA onPrimary={() => { (howToRef?.current as any)?.click?.(); next() }} primary="開く" onSecondary={next} secondary="スキップ" />
          </Panel>
        )
      case 3:
        return (
          <Panel title="カレンダー 📅" body="イベントの予定はここでチェック！">
            <CTA onPrimary={() => { calendarRef?.current?.click(); next() }} primary="開く" onSecondary={next} secondary="スキップ" />
          </Panel>
        )
      case 4:
        return (
          <Panel title="冒険者 🧑‍🤝‍🧑" body="仲間のプロフィールや活動を見てインスピレーションを得よう">
            <CTA onPrimary={() => { adventurersRef?.current?.click(); next() }} primary="開く" onSecondary={next} secondary="スキップ" />
          </Panel>
        )
      case 5:
        return (
          <Panel title="サイドメニュー" body="いろんなページに行けるよ。今は軽く場所だけ覚えよう！">
            <CTA onPrimary={() => { openSidebar?.(); complete(user?.id) }} primary="はじめる" onSecondary={() => skipAndComplete(user?.id)} secondary="スキップ" />
          </Panel>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* 背景マスク */}
      <div className="absolute inset-0 bg-black/50" onClick={skipAndComplete} />

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


