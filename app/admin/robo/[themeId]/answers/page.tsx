'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Eye, EyeOff, Printer, CheckCircle2, XCircle } from 'lucide-react'
import { getRoboThemeAnswers, setRoboOpenAnswerVisibility, type RoboThemeAnswersRow } from '../../actions'

export default function AdminRoboAnswersPage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.themeId as string
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [rows, setRows] = useState<RoboThemeAnswersRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getRoboThemeAnswers(themeId)
    if (result.error) setError(result.error)
    setRows(result.data)
    setLoading(false)
  }, [themeId])

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) load()
  }, [authLoading, isAuthenticated, isAdmin, load])

  const handleToggleVisibility = async (row: RoboThemeAnswersRow) => {
    if (!row.openAnswer) return
    const nextVisible = !row.openAnswer.isVisible
    const result = await setRoboOpenAnswerVisibility(themeId, row.openAnswer.id, nextVisible)
    if (!result.success) {
      alert(result.error ?? '更新に失敗しました')
      return
    }
    setRows((prev) =>
      prev.map((r) => (r.userId === row.userId && r.openAnswer ? { ...r, openAnswer: { ...r.openAnswer, isVisible: nextVisible } } : r))
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">管理者権限が必要です</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => router.push('/admin/robo')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> テーマ一覧に戻る
        </button>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">回答一覧（{rows.length}名）</h1>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="space-y-4">
          {rows.map((row) => {
            const correctCount = row.quizResults.filter((r) => r.isCorrect).length
            return (
              <div key={row.userId} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{row.nickname}</p>
                    <p className="text-xs text-gray-400">{row.email}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/robo/${themeId}/print/${row.userId}`)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900"
                  >
                    <Printer size={14} /> 印刷ビュー
                  </button>
                </div>

                <div className="mb-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    クイズ結果（{correctCount}/{row.quizResults.length}問正解）
                  </p>
                  <ul className="space-y-1">
                    {row.quizResults.map((r, idx) => (
                      <li key={r.questionId + idx} className="flex items-center gap-2 text-sm text-gray-700">
                        {r.isCorrect ? (
                          <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                        ) : (
                          <XCircle size={14} className="shrink-0 text-red-400" />
                        )}
                        <span className="truncate">{r.body}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {row.openAnswer && (
                  <div className="mb-3 rounded-lg bg-amber-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-600">問いへの回答</p>
                      <button
                        onClick={() => handleToggleVisibility(row)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.openAnswer.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {row.openAnswer.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {row.openAnswer.isVisible ? 'ウォールに表示中' : '非表示'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">{row.openAnswer.body}</p>
                  </div>
                )}

                {row.feedback && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-600">感想</p>
                    <p className="text-sm text-gray-700">{row.feedback.body}</p>
                  </div>
                )}
              </div>
            )
          })}

          {rows.length === 0 && (
            <div className="rounded-xl border bg-white p-12 text-center text-gray-500">まだ回答がありません。</div>
          )}
        </div>
      </div>
    </div>
  )
}
