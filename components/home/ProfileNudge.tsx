'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProfileNudgeProps {
  className?: string
}

export default function ProfileNudge({ className = '' }: ProfileNudgeProps) {
  const { profile, isInitialized } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const completion = (profile as any)?.profile_completion || 0

  if (!isInitialized) return null
  if (dismissed) return null
  if (completion >= 50) return null

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[min(720px,94vw)] ${className}`}>
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-800 text-sm">
            <div className="font-bold mb-1">プロフィールを設定しよう</div>
            <div>CLAFTで学ぶ仲間への自己紹介のつもりで充実させてみよう</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.location.href = '/profile' }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              プロフィールを開く
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
            >
              あとで
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


