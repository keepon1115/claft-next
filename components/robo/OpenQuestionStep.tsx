'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface OpenQuestionStepProps {
  prompt: string
  imageUrl?: string | null
  submitting: boolean
  onSubmit: (body: string) => void
}

export default function OpenQuestionStep({ prompt, imageUrl, submitting, onSubmit }: OpenQuestionStepProps) {
  const [body, setBody] = useState('')
  const [imageError, setImageError] = useState(false)

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
      <p className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: '#f5a623' }}>
        正解がひとつじゃない問い
      </p>
      <h2 className="mb-4 text-xl font-bold leading-relaxed sm:text-2xl">{prompt}</h2>

      {imageUrl && !imageError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="問いの参考画像"
          onError={() => setImageError(true)}
          className="mx-auto mb-6 max-h-64 rounded-2xl border-2 border-[#f5a62333] object-contain"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="思ったことを、自由に書いてみよう"
          className="w-full rounded-2xl border-2 p-4 text-base leading-relaxed focus:outline-none"
          style={{ borderColor: '#f5a62355', background: '#fffdf6', color: '#0f2422' }}
        />
        <p className="text-xs" style={{ color: '#0f242299' }}>
          送信すると、他のみんなの回答も見られるようになるよ。
        </p>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="rounded-full px-8 py-3 font-bold text-white shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ffd66b, #f5a623)' }}
          >
            {submitting ? '送信中...' : 'この気持ちを送る'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
