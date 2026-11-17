'use client'

import RoboStageNode, { type RoboStageNodeData } from './RoboStageNode'
import type { RoboThemeStatus } from '@/types/robo'

interface RoboMapProps {
  themes: RoboStageNodeData[]
  statusOf: (themeId: string) => RoboThemeStatus
  onThemeClick: (themeId: string) => void
}

export default function RoboMap({ themes, statusOf, onThemeClick }: RoboMapProps) {
  if (themes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-10 text-center text-gray-500">
        まだテーマが登録されていません。管理者の準備をお待ちください。
      </div>
    )
  }

  const levels = Array.from(new Set(themes.map((t) => t.level))).sort((a, b) => a - b)

  return (
    <div className="space-y-8">
      <p className="rounded-xl bg-white/70 px-4 py-3 text-center text-sm font-bold text-gray-500">
        どのテーマからでも、好きな順番で挑戦できるよ！
      </p>
      {levels.map((level) => {
        const themesOfLevel = themes
          .filter((t) => t.level === level)
          .sort((a, b) => a.theme_number - b.theme_number)

        return (
          <div key={level} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand,#34c6be)] text-white">
                {level}
              </span>
              レベル {level}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {themesOfLevel.map((theme) => (
                <RoboStageNode
                  key={theme.id}
                  theme={theme}
                  status={statusOf(theme.id)}
                  onClick={() => onThemeClick(theme.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
