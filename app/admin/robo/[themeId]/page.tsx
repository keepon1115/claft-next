'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Plus, Trash2, Save, CheckCircle } from 'lucide-react'
import {
  getRoboThemeWithQuestions,
  updateRoboTheme,
  createRoboQuestion,
  updateRoboQuestion,
  deleteRoboQuestion,
} from '../actions'
import {
  roboThemeFormSchema,
  roboQuestionFormSchema,
  type RoboThemeFormValues,
  type RoboQuestionFormValues,
  type RoboThemeWithQuestions,
  type RoboQuestion,
} from '@/types/robo'

export default function AdminRoboThemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.themeId as string
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [theme, setTheme] = useState<RoboThemeWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingTheme, setSavingTheme] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)

  const themeForm = useForm<RoboThemeFormValues>({ resolver: zodResolver(roboThemeFormSchema) })

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getRoboThemeWithQuestions(themeId)
    if (result.error || !result.data) {
      setError(result.error ?? 'テーマが見つかりません')
    } else {
      setTheme(result.data)
      themeForm.reset({
        level: result.data.level,
        theme_number: result.data.theme_number,
        title: result.data.title,
        question_prompt: result.data.question_prompt,
        case_study_md: result.data.case_study_md,
        is_published: result.data.is_published,
        display_order: result.data.display_order,
        icon_url: result.data.icon_url,
        icon_emoji: result.data.icon_emoji,
        question_image_url: result.data.question_image_url,
        case_image_url: result.data.case_image_url,
      })
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId])

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) load()
  }, [authLoading, isAuthenticated, isAdmin, load])

  const handleThemeSave = async (values: RoboThemeFormValues) => {
    setSavingTheme(true)
    setThemeSaved(false)
    const result = await updateRoboTheme(themeId, values)
    setSavingTheme(false)
    if (!result.success) {
      alert(result.error ?? '保存に失敗しました')
      return
    }
    setTheme((prev) => (prev ? { ...prev, ...values } : prev))
    setThemeSaved(true)
    setTimeout(() => setThemeSaved(false), 2500)
  }

  const handleAddQuestion = async () => {
    const nextOrder = theme && theme.robo_questions.length > 0
      ? Math.max(...theme.robo_questions.map((q) => q.display_order)) + 1
      : 1
    const result = await createRoboQuestion(themeId, {
      body: '新しい設問',
      choice_1: '選択肢1',
      choice_2: '選択肢2',
      choice_3: '選択肢3',
      correct_index: 0,
      explanation: null,
      image_url: null,
      video_url: null,
      reference_note: null,
      display_order: nextOrder,
    })
    if (result.error || !result.data) {
      alert(result.error ?? '設問の作成に失敗しました')
      return
    }
    setTheme((prev) => (prev ? { ...prev, robo_questions: [...prev.robo_questions, result.data!] } : prev))
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('この設問を削除しますか？')) return
    const result = await deleteRoboQuestion(themeId, questionId)
    if (!result.success) {
      alert(result.error ?? '削除に失敗しました')
      return
    }
    setTheme((prev) =>
      prev ? { ...prev, robo_questions: prev.robo_questions.filter((q) => q.id !== questionId) } : prev
    )
  }

  const handleQuestionUpdated = (updated: RoboQuestion) => {
    setTheme((prev) =>
      prev ? { ...prev, robo_questions: prev.robo_questions.map((q) => (q.id === updated.id ? updated : q)) } : prev
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

  if (error || !theme) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => router.push('/admin/robo')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> テーマ一覧に戻る
        </button>

        {/* テーマ基本情報 */}
        <form
          onSubmit={themeForm.handleSubmit(handleThemeSave)}
          className="mb-8 space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">テーマ情報</h2>
            {themeSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={16} /> 保存しました
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">レベル</label>
              <input type="number" {...themeForm.register('level')} className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">テーマ番号</label>
              <input type="number" {...themeForm.register('theme_number')} className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">表示順</label>
              <input type="number" {...themeForm.register('display_order')} className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" {...themeForm.register('is_published')} className="h-4 w-4" />
                公開する
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">タイトル</label>
            <input {...themeForm.register('title')} className="w-full rounded-lg border px-3 py-2" />
            {themeForm.formState.errors.title && (
              <p className="mt-1 text-sm text-red-600">{themeForm.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">問い（正解が一つでない問い）</label>
            <textarea {...themeForm.register('question_prompt')} rows={2} className="w-full rounded-lg border px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">問い画像URL（任意）</label>
            <input {...themeForm.register('question_image_url')} placeholder="microCMSの画像URL" className="w-full rounded-lg border px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              事例解説（「正解じゃないけど、こんな見方もあるよ」の文章）
            </label>
            <textarea {...themeForm.register('case_study_md')} rows={4} className="w-full rounded-lg border px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">事例解説画像URL（任意・推奨）</label>
            <input {...themeForm.register('case_image_url')} placeholder="microCMSの画像URL" className="w-full rounded-lg border px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">マップアイコン画像URL（任意）</label>
              <input {...themeForm.register('icon_url')} placeholder="microCMSの画像URL" className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">アイコン絵文字（画像が無いときの代わり）</label>
              <input {...themeForm.register('icon_emoji')} placeholder="🚦" className="w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingTheme}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Save size={16} /> {savingTheme ? '保存中...' : '保存'}
            </button>
          </div>
        </form>

        {/* 設問一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">設問（{theme.robo_questions.length}問）</h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Plus size={14} /> 設問を追加
            </button>
          </div>

          {theme.robo_questions.map((question, idx) => (
            <QuestionEditor
              key={question.id}
              index={idx}
              themeId={themeId}
              question={question}
              onUpdated={handleQuestionUpdated}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function QuestionEditor({
  index,
  themeId,
  question,
  onUpdated,
  onDelete,
}: {
  index: number
  themeId: string
  question: RoboQuestion
  onUpdated: (q: RoboQuestion) => void
  onDelete: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const form = useForm<RoboQuestionFormValues>({
    resolver: zodResolver(roboQuestionFormSchema),
    defaultValues: {
      body: question.body,
      choice_1: question.choice_1,
      choice_2: question.choice_2,
      choice_3: question.choice_3,
      correct_index: question.correct_index,
      explanation: question.explanation,
      image_url: question.image_url,
      video_url: question.video_url,
      reference_note: question.reference_note,
      display_order: question.display_order,
    },
  })

  const handleSave = async (values: RoboQuestionFormValues) => {
    setSaving(true)
    setSaved(false)
    const result = await updateRoboQuestion(themeId, question.id, values)
    setSaving(false)
    if (!result.success) {
      alert(result.error ?? '保存に失敗しました')
      return
    }
    onUpdated({ ...question, ...values })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">設問 {index + 1}</h3>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600">保存しました</span>}
          <button type="button" onClick={onDelete} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
            <Trash2 size={14} /> 削除
          </button>
        </div>
      </div>

      <textarea {...form.register('body')} rows={2} placeholder="設問本文" className="w-full rounded-lg border px-3 py-2 text-sm" />

      <div className="grid gap-2 sm:grid-cols-3">
        {(['choice_1', 'choice_2', 'choice_3'] as const).map((field, choiceIdx) => (
          <div key={field} className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.watch('correct_index') === choiceIdx}
              onChange={() => form.setValue('correct_index', choiceIdx)}
              className="h-4 w-4"
              title="正解にする"
            />
            <input {...form.register(field)} placeholder={`選択肢${choiceIdx + 1}`} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">ラジオボタンで正解を選択してください</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <input {...form.register('image_url')} placeholder="画像URL（任意）" className="rounded-lg border px-3 py-2 text-sm" />
        <input {...form.register('video_url')} placeholder="動画URL（YouTube・任意。画像より優先表示）" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input {...form.register('reference_note')} placeholder="参照ページ（任意・例: P.13）" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" {...form.register('display_order')} placeholder="表示順" className="rounded-lg border px-3 py-2 text-sm" />
      </div>

      <textarea {...form.register('explanation')} rows={2} placeholder="解説文（回答後に表示、任意）" className="w-full rounded-lg border px-3 py-2 text-sm" />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
