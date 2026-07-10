'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { RoboQuestion } from '@/types/robo'
import YouTubeEmbed from './YouTubeEmbed'
import { extractYouTubeId } from '@/lib/utils/youtube'

interface QuizStepProps {
  question: RoboQuestion
  questionNumber: number
  bonusCombo: boolean
  onNext: (selectedIndex: number, isCorrect: boolean) => void
}

export default function QuizStep({ question, questionNumber, bonusCombo, onNext }: QuizStepProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [imageError, setImageError] = useState(false)

  const choices = [question.choice_1, question.choice_2, question.choice_3]
  const revealed = selected !== null
  const isCorrect = selected === question.correct_index

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelected(idx)
    if (idx === question.correct_index) {
      confetti({
        particleCount: bonusCombo ? 160 : 70,
        spread: bonusCombo ? 100 : 65,
        origin: { y: 0.6 },
      })
    }
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border-4 border-[color:var(--brand,#34c6be)] bg-white p-6 shadow-xl sm:p-8"
    >
      {question.video_url && extractYouTubeId(question.video_url) ? (
        <YouTubeEmbed url={question.video_url} className="mb-4" />
      ) : (
        question.image_url &&
        !imageError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.image_url}
            alt="設問の参考画像"
            onError={() => setImageError(true)}
            className="mx-auto mb-4 max-h-56 rounded-xl border-2 border-gray-200 object-contain"
          />
        )
      )}

      <div className="mb-6 text-center">
        <span className="mb-2 inline-block rounded-full bg-[color:var(--brand,#34c6be)] px-3 py-1 text-xs font-extrabold text-white">
          Q{questionNumber}
        </span>
        <p className="text-xl font-extrabold leading-relaxed text-gray-900 sm:text-2xl">{question.body}</p>
      </div>

      <div className="grid gap-3">
        {choices.map((choice, idx) => {
          const isSelected = selected === idx
          const isTheCorrectOne = idx === question.correct_index
          let stateClass = 'border-gray-200 bg-gray-50 hover:border-[color:var(--brand,#34c6be)] hover:bg-teal-50'
          if (revealed) {
            if (isTheCorrectOne) {
              stateClass = 'border-green-500 bg-green-50'
            } else if (isSelected) {
              stateClass = 'border-red-400 bg-red-50'
            } else {
              stateClass = 'border-gray-200 bg-gray-50 opacity-60'
            }
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(idx)}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-base font-bold text-gray-800 transition-colors sm:text-lg ${stateClass}`}
            >
              <span>{choice}</span>
              {revealed && isTheCorrectOne && <CheckCircle2 className="text-green-500" size={22} />}
              {revealed && isSelected && !isTheCorrectOne && <XCircle className="text-red-400" size={22} />}
            </button>
          )
        })}
      </div>

      {question.reference_note && (
        <p className="mt-4 text-center text-xs text-gray-400">参照: {question.reference_note}</p>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-2xl p-4 text-center font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
          >
            <p className="text-lg">{isCorrect ? '🎉 せいかい！' : 'おしい！つぎでチャレンジしよう'}</p>
            {question.explanation && (
              <p className="mt-2 text-sm font-medium leading-relaxed">{question.explanation}</p>
            )}
            <button
              type="button"
              onClick={() => onNext(selected!, isCorrect)}
              className="mt-4 rounded-full bg-[color:var(--brand,#34c6be)] px-8 py-2.5 text-white shadow-md transition-transform hover:scale-105"
            >
              つぎへ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
