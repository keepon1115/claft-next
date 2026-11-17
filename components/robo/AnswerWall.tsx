'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RoboWallEntry } from '@/types/robo'

interface AnswerWallProps {
  entries: RoboWallEntry[]
  caseStudyMd: string
  caseImageUrl?: string | null
  onNext: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AnswerWall({ entries, caseStudyMd, caseImageUrl, onNext }: AnswerWallProps) {
  const [imageError, setImageError] = useState(false)
  const hasCaseContent = Boolean(caseStudyMd) || Boolean(caseImageUrl && !imageError)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
      data-voice="yononaka"
    >
      <div
        className="rounded-3xl p-6 shadow-md sm:p-8"
        style={{ background: '#fffdf6', border: '2px solid #f5a62333', color: '#0f2422' }}
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#f5a623' }}>
          みんなの意見
        </p>
        {entries.length === 0 ? (
          <p className="text-sm" style={{ color: '#0f242299' }}>
            まだ他のみんなの回答はありません。あなたが最初のひとりだよ。
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl p-4"
                style={{ background: '#fdf6e7', border: '1px solid #f5a62322' }}
              >
                <div className="mb-1 flex items-center justify-between text-xs" style={{ color: '#0f242299' }}>
                  <span className="font-bold">{entry.nickname}</span>
                  <span>{formatDate(entry.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed">{entry.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasCaseContent && (
        <div
          className="rounded-3xl p-6 shadow-md sm:p-8"
          style={{ background: '#fdf6e7', border: '2px solid #34c6be44', color: '#0f2422' }}
        >
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brand,#34c6be)' }}>
            正解じゃないけど、こんな見方もあるよ
          </p>
          {caseImageUrl && !imageError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={caseImageUrl}
              alt="事例解説の画像"
              onError={() => setImageError(true)}
              className="mb-3 w-full rounded-2xl border border-[#34c6be33] object-contain"
            />
          )}
          {caseStudyMd && <p className="whitespace-pre-wrap text-sm leading-relaxed">{caseStudyMd}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full px-8 py-3 font-bold text-white shadow-md transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #ffd66b, #f5a623)' }}
        >
          感想を書く
        </button>
      </div>
    </motion.div>
  )
}
