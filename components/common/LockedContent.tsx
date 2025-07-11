'use client'

import { Lock } from 'lucide-react'

interface LockedContentProps {
  isLocked: boolean
  unlockConditionText: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function LockedContent({
  isLocked,
  unlockConditionText,
  children,
  className = '',
}: LockedContentProps) {
  if (isLocked) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-center text-gray-500 p-4 z-10">
          <Lock className="w-10 h-10 text-gray-400 mb-4" />
          <p className="font-bold text-sm">{unlockConditionText}</p>
        </div>
        <div className="opacity-20 pointer-events-none blur-sm">{children}</div>
      </div>
    )
  }

  return <>{children}</>
}