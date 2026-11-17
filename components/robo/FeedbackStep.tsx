'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FeedbackStepProps {
  submitting: boolean
  onSubmit: (body: string) => void
}

export default function FeedbackStep({ submitting, onSubmit }: FeedbackStepProps) {
  const [body, setBody] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || submitting) return
    onSubmit(body.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-6 shadow-md sm:p-8"
      style={{ background: '#fffdf6', border: '2px solid #f5a62333', color: '#0f2422' }}
      data-voice="yononaka"
    >
      <h2 className="mb-6 text-xl font-bold sm:text-2xl">今日の授業、どうだった？</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="感想を書いてね"
          className="w-full rounded-2xl border-2 p-4 text-base leading-relaxed focus:outline-none"
          style={{ borderColor: '#f5a62355', background: '#fffdf6', color: '#0f2422' }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="rounded-full px-8 py-3 font-bold text-white shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ffd66b, #f5a623)' }}
          >
            {submitting ? '送信中...' : 'おくって、クリアする！'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
