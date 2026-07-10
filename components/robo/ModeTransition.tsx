'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface ModeTransitionProps {
  onDone: () => void
}

/**
 * クイズ（昼の声・にぎやか）から問いパート（夕方の声・静か）への
 * トーン切り替えを演出する橋渡し画面。
 */
export default function ModeTransition({ onDone }: ModeTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl p-10 text-center"
      style={{ background: 'linear-gradient(180deg, #fffdf6 0%, #fdf6e7 60%, #ffd66b22 100%)' }}
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-5xl"
      >
        🌇
      </motion.span>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-6 text-lg font-bold"
        style={{ color: '#0f2422' }}
      >
        クイズはここまで。
        <br />
        ここからは、じっくり考える時間だよ。
      </motion.p>
    </motion.div>
  )
}
