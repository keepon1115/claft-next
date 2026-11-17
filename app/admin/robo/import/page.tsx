'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { previewRoboCsvImport, applyRoboCsvImport } from '../actions'
import type { RoboThemeCsvRow, RoboQuestionCsvRow, CsvImportPreview } from '@/types/robo'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, 'utf-8')
  })
}

export default function RoboCsvImportPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const themeFileRef = useRef<HTMLInputElement>(null)
  const questionFileRef = useRef<HTMLInputElement>(null)

  const [themeFileName, setThemeFileName] = useState<string | null>(null)
  const [questionFileName, setQuestionFileName] = useState<string | null>(null)
  const [themeCsvText, setThemeCsvText] = useState<string | null>(null)
  const [questionCsvText, setQuestionCsvText] = useState<string | null>(null)

  const [themePreview, setThemePreview] = useState<CsvImportPreview<RoboThemeCsvRow> | null>(null)
  const [questionPreview, setQuestionPreview] = useState<CsvImportPreview<RoboQuestionCsvRow> | null>(null)

  const [previewing, setPreviewing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handlePickTheme = async (file: File | null) => {
    setSuccessMessage(null)
    if (!file) {
      setThemeFileName(null)
      setThemeCsvText(null)
      return
    }
    setThemeFileName(file.name)
    setThemeCsvText(await readFileAsText(file))
    setThemePreview(null)
  }

  const handlePickQuestion = async (file: File | null) => {
    setSuccessMessage(null)
    if (!file) {
      setQuestionFileName(null)
      setQuestionCsvText(null)
      return
    }
    setQuestionFileName(file.name)
    setQuestionCsvText(await readFileAsText(file))
    setQuestionPreview(null)
  }

  const handlePreview = async () => {
    if (!themeCsvText && !questionCsvText) {
      setError('テーマCSVまたは設問CSVのどちらかを選択してください')
      return
    }
    setPreviewing(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await previewRoboCsvImport(themeCsvText, questionCsvText)
      if (result.error) {
        setError(result.error)
        return
      }
      setThemePreview(result.themePreview)
      setQuestionPreview(result.questionPreview)
    } finally {
      setPreviewing(false)
    }
  }

  const hasErrors =
    (themePreview?.hasErrors ?? false) || (questionPreview?.hasErrors ?? false)
  const hasPreview = themePreview !== null || questionPreview !== null

  const handleApply = async () => {
    if (!hasPreview || hasErrors) return
    setApplying(true)
    setError(null)
    try {
      const result = await applyRoboCsvImport(
        themePreview ? themePreview.rows.map((r) => r.data) : [],
        questionPreview ? questionPreview.rows.map((r) => r.data) : []
      )
      if (!result.success) {
        setError(result.error ?? '反映に失敗しました')
        return
      }
      const themeNew = themePreview?.rows.filter((r) => r.action === 'insert').length ?? 0
      const themeUpdate = themePreview?.rows.filter((r) => r.action === 'update').length ?? 0
      const qNew = questionPreview?.rows.filter((r) => r.action === 'insert').length ?? 0
      const qUpdate = questionPreview?.rows.filter((r) => r.action === 'update').length ?? 0
      setSuccessMessage(
        `反映しました。テーマ: 新規${themeNew}件・更新${themeUpdate}件／設問: 新規${qNew}件・更新${qUpdate}件`
      )
      setThemePreview(null)
      setQuestionPreview(null)
      setThemeCsvText(null)
      setQuestionCsvText(null)
      setThemeFileName(null)
      setQuestionFileName(null)
      if (themeFileRef.current) themeFileRef.current.value = ''
      if (questionFileRef.current) questionFileRef.current.value = ''
    } finally {
      setApplying(false)
    }
  }

  if (authLoading) {
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={() => router.push('/admin/robo')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> テーマ一覧に戻る
        </button>

        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FileSpreadsheet size={30} className="text-purple-600" />
          CSVインポート
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Googleスプレッドシートで編集したテーマ・設問をCSVでアップロードします。反映前に必ず内容を確認してください。CSVに含まれないテーマ・設問は削除されません。
        </p>

        <div className="mb-6 grid gap-4 rounded-xl border bg-white p-6 shadow-sm sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">テーマCSV</label>
            <input
              ref={themeFileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handlePickTheme(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-100"
            />
            {themeFileName && <p className="mt-1 text-xs text-gray-400">選択中: {themeFileName}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">設問CSV</label>
            <input
              ref={questionFileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handlePickQuestion(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-100"
            />
            {questionFileName && <p className="mt-1 text-xs text-gray-400">選択中: {questionFileName}</p>}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        <div className="mb-8 flex justify-end">
          <button
            onClick={handlePreview}
            disabled={previewing || (!themeCsvText && !questionCsvText)}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-5 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            <Upload size={16} /> {previewing ? '確認中...' : 'プレビュー'}
          </button>
        </div>

        {themePreview && (
          <PreviewTable
            title={`テーマ（${themePreview.rows.length}行）`}
            rows={themePreview.rows}
            renderSummary={(r) => `Lv.${r.data.level}-${r.data.theme_number} ${r.data.title}`}
          />
        )}

        {questionPreview && (
          <PreviewTable
            title={`設問（${questionPreview.rows.length}行）`}
            rows={questionPreview.rows}
            renderSummary={(r) => `${r.data.themeKey} #${r.data.display_order} ${r.data.body.slice(0, 30)}`}
          />
        )}

        {hasPreview && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleApply}
              disabled={applying || hasErrors}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <CheckCircle2 size={18} /> {applying ? '反映中...' : 'この内容で反映する'}
            </button>
          </div>
        )}
        {hasPreview && hasErrors && (
          <p className="mt-2 text-right text-sm text-red-600">
            エラーが解消されるまで反映できません。CSVを修正して再度アップロードしてください。
          </p>
        )}
      </div>
    </div>
  )
}

function PreviewTable<T>({
  title,
  rows,
  renderSummary,
}: {
  title: string
  rows: { rowNumber: number; action: 'insert' | 'update'; data: T; errors: string[] }[]
  renderSummary: (row: { data: T }) => string
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-5 py-3">
        <h2 className="font-bold text-gray-800">{title}</h2>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">行</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">状態</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">内容</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.rowNumber} className={r.errors.length > 0 ? 'bg-red-50' : ''}>
                <td className="px-4 py-2 align-top text-gray-500">{r.rowNumber}</td>
                <td className="px-4 py-2 align-top">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.action === 'insert' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {r.action === 'insert' ? '新規' : '更新'}
                  </span>
                </td>
                <td className="px-4 py-2 align-top">
                  <p className="text-gray-800">{renderSummary(r)}</p>
                  {r.errors.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-xs text-red-600">
                      {r.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  データ行がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
