// components/common/Header.tsx - 最小構成

export interface HeaderProps {
  experience?: number
  level?: number
  showAchievements?: boolean
  className?: string
}

export function Header({ experience, level, showAchievements, className = '' }: HeaderProps = {}) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 py-3">
        <h1 className="text-xl font-semibold">CLAFT</h1>
      </div>
    </header>
  )
}