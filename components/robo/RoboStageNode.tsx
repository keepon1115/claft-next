'use client'

import { useState } from 'react'
import { Lock, CheckCircle2 } from 'lucide-react'
import type { RoboThemeStatus } from '@/types/robo'

export interface RoboStageNodeData {
  id: string
  level: number
  theme_number: number
  title: string
  is_published: boolean
  icon_url: string | null
  icon_emoji: string
}

interface RoboStageNodeProps {
  theme: RoboStageNodeData
  status: RoboThemeStatus
  onClick: () => void
}

export default function RoboStageNode({ theme, status, onClick }: RoboStageNodeProps) {
  const [imageError, setImageError] = useState(false)
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      aria-label={isLocked ? `${theme.title}（未公開）` : theme.title}
      className={`
        relative flex w-full flex-col items-center gap-1 rounded-2xl border-[3px] p-4
        text-center transition-transform
        ${isLocked
          ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-70'
          : isCompleted
            ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 hover:-translate-y-1 hover:shadow-lg'
            : 'border-[color:var(--brand,#34c6be)] bg-white hover:-translate-y-1 hover:shadow-lg'}
      `}
    >
      {isCompleted && (
        <span className="mb-1 self-end rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white shadow">
          クリア！
        </span>
      )}
      {!isLocked && theme.icon_url && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.icon_url}
          alt=""
          onError={() => setImageError(true)}
          className="h-12 w-12 rounded-lg object-cover"
        />
      ) : (
        <span className="text-4xl" aria-hidden="true">
          {isLocked ? '🔒' : isCompleted ? '🏅' : theme.icon_emoji}
        </span>
      )}
      <span className="text-xs font-bold text-gray-500">
        Lv.{theme.level}-{theme.theme_number}
      </span>
      <span className="text-sm font-bold leading-snug text-gray-800">
        {isLocked ? '公開準備中' : theme.title}
      </span>
      {isLocked ? (
        <Lock size={16} className="text-gray-400" />
      ) : isCompleted ? (
        <CheckCircle2 size={16} className="text-amber-500" />
      ) : null}
    </button>
  )
}
