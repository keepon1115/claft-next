'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getThemeWithQuestions,
  submitQuizAnswer,
  submitOpenAnswer,
  submitFeedback,
  markThemeCleared,
  getOpenAnswerWall,
} from '@/lib/api/robo'
import QuizStep from '@/components/robo/QuizStep'
import ModeTransition from '@/components/robo/ModeTransition'
import OpenQuestionStep from '@/components/robo/OpenQuestionStep'
import AnswerWall from '@/components/robo/AnswerWall'
import FeedbackStep from '@/components/robo/FeedbackStep'
import ClearStamp from '@/components/robo/ClearStamp'
import type { RoboThemeWithQuestions, RoboWallEntry } from '@/types/robo'

type FlowStep = 'quiz' | 'transition' | 'question' | 'wall' | 'feedback' | 'complete'

export default function RoboThemePage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.themeId as string
  const { isAuthenticated, user, isInitialized: authInitialized } = useAuth()

  const [theme, setTheme] = useState<RoboThemeWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState<FlowStep>('quiz')
  const [quizIndex, setQuizIndex] = useState(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [wallEntries, setWallEntries] = useState<RoboWallEntry[]>([])

  useEffect(() => {
    if (!authInitialized) return
    if (!isAuthenticated) {
      router.push('/robo')
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await getThemeWithQuestions(themeId)
        if (cancelled) return
        if (!data || !data.is_published || data.robo_questions.length === 0) {
          setNotFound(true)
        } else {
          setTheme(data)
        }
      } catch (e) {
        console.error('ロボクエスト テーマ読み込みエラー:', e instanceof Error ? e.message : e)
        setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authInitialized, isAuthenticated, themeId, router])

  const handleQuizAnswer = useCallback(
    async (selectedIndex: number, isCorrect: boolean) => {
      if (!theme || !user) return
      const question = theme.robo_questions[quizIndex]
      try {
        await submitQuizAnswer({
          userId: user.id,
          questionId: question.id,
          themeId: theme.id,
          selectedIndex,
          isCorrect,
        })
      } catch (e) {
        console.error('クイズ回答の送信に失敗しました:', e instanceof Error ? e.message : e)
      }

      setCorrectStreak((prev) => (isCorrect ? prev + 1 : 0))

      if (quizIndex + 1 < theme.robo_questions.length) {
        setQuizIndex((i) => i + 1)
      } else {
        setStep('transition')
      }
    },
    [theme, user, quizIndex]
  )

  const handleOpenAnswerSubmit = useCallback(
    async (body: string) => {
      if (!theme || !user) return
      setSubmitting(true)
      try {
        await submitOpenAnswer({ userId: user.id, themeId: theme.id, body })
        const wall = await getOpenAnswerWall(theme.id)
        setWallEntries(wall)
        setStep('wall')
      } catch (e) {
        console.error('問いへの回答送信に失敗しました:', e instanceof Error ? e.message : e)
        alert('回答の送信に失敗しました。もう一度お試しください。')
      } finally {
        setSubmitting(false)
      }
    },
    [theme, user]
  )

  const handleFeedbackSubmit = useCallback(
    async (body: string) => {
      if (!theme || !user) return
      setSubmitting(true)
      try {
        await submitFeedback({ userId: user.id, themeId: theme.id, body })
        await markThemeCleared(user.id, theme.id)
        setStep('complete')
      } catch (e) {
        console.error('感想の送信に失敗しました:', e instanceof Error ? e.message : e)
        alert('感想の送信に失敗しました。もう一度お試しください。')
      } finally {
        setSubmitting(false)
      }
    },
    [theme, user]
  )

  if (!authInitialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-bg,#fdf6e7)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--brand,#34c6be)] border-t-transparent" />
      </div>
    )
  }

  if (notFound || !theme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--cream-bg,#fdf6e7)] p-6 text-center">
        <p className="text-lg font-bold text-gray-700">このテーマはまだ挑戦できません</p>
        <button
          onClick={() => router.push('/robo')}
          className="rounded-full bg-[color:var(--brand,#34c6be)] px-6 py-2.5 font-bold text-white"
        >
          マップにもどる
        </button>
      </div>
    )
  }

  const isCalmMode = step === 'transition' || step === 'question' || step === 'wall' || step === 'feedback'
  const totalQuestions = theme.robo_questions.length
  const currentQuestion = theme.robo_questions[quizIndex]

  return (
    <main
      className="min-h-screen px-4 py-6 transition-colors duration-700"
      style={{ background: isCalmMode ? 'linear-gradient(180deg, #fffdf6 0%, #fdf6e7 100%)' : 'var(--cream-bg, #fdf6e7)' }}
    >
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push('/robo')}
          className="mb-4 flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={18} /> マップにもどる
        </button>

        {step === 'quiz' && (
          <>
            <div className="mb-2 text-center text-sm font-bold text-gray-500">
              Lv.{theme.level}-{theme.theme_number} {theme.title}
            </div>
            <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[color:var(--brand,#34c6be)]"
                animate={{ width: `${(quizIndex / totalQuestions) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="mb-4 text-center text-xs font-bold text-gray-400">
              問題 {quizIndex + 1} / {totalQuestions}
            </p>
            <AnimatePresence mode="wait">
              <QuizStep
                key={currentQuestion.id}
                question={currentQuestion}
                questionNumber={quizIndex + 1}
                bonusCombo={correctStreak >= 2}
                onNext={handleQuizAnswer}
              />
            </AnimatePresence>
          </>
        )}

        {step === 'transition' && <ModeTransition onDone={() => setStep('question')} />}

        {step === 'question' && (
          <OpenQuestionStep
            prompt={theme.question_prompt}
            imageUrl={theme.question_image_url}
            submitting={submitting}
            onSubmit={handleOpenAnswerSubmit}
          />
        )}

        {step === 'wall' && (
          <AnswerWall
            entries={wallEntries}
            caseStudyMd={theme.case_study_md}
            caseImageUrl={theme.case_image_url}
            onNext={() => setStep('feedback')}
          />
        )}

        {step === 'feedback' && <FeedbackStep submitting={submitting} onSubmit={handleFeedbackSubmit} />}

        {step === 'complete' && (
          <ClearStamp themeTitle={theme.title} onBackToMap={() => router.push('/robo')} />
        )}
      </div>
    </main>
  )
}
