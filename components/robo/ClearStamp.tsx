'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface ClearStampProps {
  themeTitle: string
  onBackToMap: () => void
}

export default function ClearStamp({ themeTitle, onBackToMap }: ClearStampProps) {
  useEffect(() => {
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6 rounded-3xl border-4 border-amber-300 bg-white p-10 text-center shadow-xl"
    >
      <motion.span
        initial={{ rotate: -20, scale: 0.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-7xl"
      >
        🏅
      </motion.span>
      <div>
        <p className="text-2xl font-bold text-gray-800">テーマクリア！</p>
        <p className="mt-1 text-gray-500">「{themeTitle}」のスタンプを獲得したよ</p>
      </div>
      <button
        type="button"
        onClick={onBackToMap}
        className="rounded-full bg-[color:var(--brand,#34c6be)] px-8 py-3 font-bold text-white shadow-md transition-transform hover:scale-105"
      >
        マップにもどる
      </button>
    </motion.div>
  )
}
