'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowLeft,
  Save,
  Edit3,
  X,
  Plus,
  Calendar,
  Trash2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  studentFormSchema,
  monthlyReportFormSchema,
  monthlyReportContentSchema,
  DEFAULT_REPORT_CONTENT,
  GRADE_OPTIONS,
  COURSE_OPTIONS,
  SCHEDULE_OPTIONS,
  type StudentFormValues,
  type MonthlyReportFormValues,
  type StudentWithReports,
  type MonthlyReport,
} from '@/types/student'
import {
  getStudentWithReports,
  updateStudent,
  createMonthlyReport,
  updateMonthlyReport,
  deleteMonthlyReport,
} from '../actions'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [student, setStudent] = useState<StudentWithReports | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 基本情報編集
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // 月別レポート
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [showNewReport, setShowNewReport] = useState(false)
  const [reportSaving, setReportSaving] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<string | null>(null)

  const profileForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
  })

  const reportForm = useForm<MonthlyReportFormValues>({
    resolver: zodResolver(monthlyReportFormSchema),
  })

  const loadStudent = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getStudentWithReports(studentId)
    if (result.error || !result.data) {
      setError(result.error ?? '生徒情報が見つかりません')
    } else {
      setStudent(result.data)
      profileForm.reset({
        name: result.data.name,
        grade: result.data.grade,
        course: result.data.course,
        schedule: result.data.schedule,
        interests: result.data.interests,
      })
      if (result.data.monthly_reports.length > 0 && !selectedReportId) {
        setSelectedReportId(result.data.monthly_reports[0].id)
      }
    }
    setLoading(false)
  }, [studentId, profileForm, selectedReportId])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadStudent()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, studentId])

  // 選択中のレポートが変わったらフォームを更新
  useEffect(() => {
    if (!student) return
    if (showNewReport) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      reportForm.reset({
        month: currentMonth,
        goal: '',
        content: { ...DEFAULT_REPORT_CONTENT },
      })
      return
    }
    const report = student.monthly_reports.find((r) => r.id === selectedReportId)
    if (report) {
      reportForm.reset({
        month: report.month,
        goal: report.goal,
        content: report.content,
      })
    }
  }, [selectedReportId, showNewReport, student, reportForm])

  // 基本情報の保存
  const handleProfileSave = async (values: StudentFormValues) => {
    setProfileSaving(true)
    setProfileSuccess(false)
    const result = await updateStudent(studentId, values)
    setProfileSaving(false)
    if (result.success) {
      setStudent((prev) => (prev ? { ...prev, ...values } : prev))
      setEditingProfile(false)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } else {
      alert(result.error ?? '更新に失敗しました')
    }
  }

  // レポートの保存
  const handleReportSave = async (values: MonthlyReportFormValues) => {
    setReportSaving(true)
    setReportSuccess(false)

    if (showNewReport) {
      const result = await createMonthlyReport(studentId, values)
      setReportSaving(false)
      if (result.error) {
        alert(result.error)
        return
      }
      if (result.data) {
        setStudent((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            monthly_reports: [result.data!, ...prev.monthly_reports],
          }
        })
        setSelectedReportId(result.data.id)
        setShowNewReport(false)
        setReportSuccess(true)
        setTimeout(() => setReportSuccess(false), 3000)
      }
    } else if (selectedReportId) {
      const result = await updateMonthlyReport(selectedReportId, studentId, {
        goal: values.goal,
        content: values.content,
      })
      setReportSaving(false)
      if (result.success) {
        setStudent((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            monthly_reports: prev.monthly_reports.map((r) =>
              r.id === selectedReportId
                ? { ...r, goal: values.goal, content: values.content }
                : r
            ),
          }
        })
        setReportSuccess(true)
        setTimeout(() => setReportSuccess(false), 3000)
      } else {
        alert(result.error ?? '更新に失敗しました')
      }
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    const result = await deleteMonthlyReport(reportId, studentId)
    if (result.success) {
      setStudent((prev) => {
        if (!prev) return prev
        const remaining = prev.monthly_reports.filter((r) => r.id !== reportId)
        return { ...prev, monthly_reports: remaining }
      })
      if (selectedReportId === reportId) {
        setSelectedReportId(
          student?.monthly_reports.find((r) => r.id !== reportId)?.id ?? null
        )
      }
      setDeleteReportConfirm(null)
    } else {
      alert(result.error ?? '削除に失敗しました')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">管理者権限が必要です</h1>
          <button onClick={() => router.push('/admin')} className="text-blue-600 underline">
            管理画面トップへ
          </button>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/admin/students')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} /> 一覧に戻る
          </button>
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error ?? '生徒情報が見つかりません'}</span>
          </div>
        </div>
      </div>
    )
  }

  const selectedReport = student.monthly_reports.find((r) => r.id === selectedReportId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るリンク */}
        <button
          onClick={() => router.push('/admin/students')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> 一覧に戻る
        </button>

        {/* ============================================ */}
        {/* 基本情報エリア */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
            <div className="flex items-center gap-2">
              {profileSuccess && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle size={16} /> 保存しました
                </span>
              )}
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit3 size={14} /> 編集
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingProfile(false)
                    profileForm.reset({
                      name: student.name,
                      grade: student.grade,
                      course: student.course,
                      schedule: student.schedule,
                      interests: student.interests,
                    })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={14} /> キャンセル
                </button>
              )}
            </div>
          </div>

          {editingProfile ? (
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                  <input
                    {...profileForm.register('name')}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                  <select
                    {...profileForm.register('grade')}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">コース</label>
                  <select
                    {...profileForm.register('course')}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">曜日</label>
                  <select
                    {...profileForm.register('schedule')}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {SCHEDULE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">興味・関心</label>
                <textarea
                  {...profileForm.register('interests')}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {profileSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="氏名" value={student.name} />
              <InfoField label="学年" value={student.grade} />
              <InfoField label="コース" value={student.course} />
              <InfoField label="曜日" value={student.schedule} />
              <InfoField label="興味・関心" value={student.interests} className="sm:col-span-2" />
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* 履歴管理エリア */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={22} /> 月別レポート
              </h2>

              <div className="flex items-center gap-3">
                {student.monthly_reports.length > 0 && (
                  <div className="relative">
                    <select
                      value={showNewReport ? '__new__' : selectedReportId ?? ''}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewReport(true)
                          setSelectedReportId(null)
                        } else {
                          setShowNewReport(false)
                          setSelectedReportId(e.target.value)
                        }
                      }}
                      className="appearance-none border rounded-lg px-4 py-2 pr-8 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {showNewReport && <option value="__new__">新規作成中...</option>}
                      {student.monthly_reports.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.month}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowNewReport(true)
                    setSelectedReportId(null)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
                >
                  <Plus size={16} /> 新しい月の記録
                </button>
              </div>
            </div>

            {reportSuccess && (
              <div className="mt-3 flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={16} /> 保存しました
              </div>
            )}
          </div>

          {/* レポートフォーム */}
          {(showNewReport || selectedReport) ? (
            <form onSubmit={reportForm.handleSubmit(handleReportSave)} className="p-6 space-y-6">
              {/* 月と目標 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">対象月</label>
                  <input
                    type="month"
                    {...reportForm.register('month')}
                    disabled={!showNewReport}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {reportForm.formState.errors.month && (
                    <p className="mt-1 text-sm text-red-600">{reportForm.formState.errors.month.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">今月の目標</label>
                  <input
                    {...reportForm.register('goal')}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="今月のゴールを入力..."
                  />
                </div>
              </div>

              {/* 1回目 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">今月1回目</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">日時</label>
                    <input
                      {...reportForm.register('content.session1.date')}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 4/5 15:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">やること</label>
                    <input
                      {...reportForm.register('content.session1.description')}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="授業内容を入力..."
                    />
                  </div>
                </div>
              </fieldset>

              {/* 2回目 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">今月2回目</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">日時</label>
                    <input
                      {...reportForm.register('content.session2.date')}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 4/19 15:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">やること</label>
                    <input
                      {...reportForm.register('content.session2.description')}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="授業内容を入力..."
                    />
                  </div>
                </div>
              </fieldset>

              {/* 習得度・その他 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">習得度</label>
                  <textarea
                    {...reportForm.register('content.proficiency')}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="理解度や進捗の評価..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">その他</label>
                  <textarea
                    {...reportForm.register('content.notes')}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="特記事項やメモ..."
                  />
                </div>
              </div>

              {/* アクション */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {!showNewReport && selectedReportId && (
                    <>
                      {deleteReportConfirm === selectedReportId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">本当に削除しますか？</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(selectedReportId)}
                            className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            削除する
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteReportConfirm(null)}
                            className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteReportConfirm(selectedReportId)}
                          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} /> このレポートを削除
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {showNewReport && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewReport(false)
                        if (student.monthly_reports.length > 0) {
                          setSelectedReportId(student.monthly_reports[0].id)
                        }
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={reportSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {reportSaving ? '保存中...' : showNewReport ? '作成する' : '更新する'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">月別レポートがありません</p>
              <p className="text-gray-400 text-sm mt-1">「新しい月の記録」ボタンから最初のレポートを作成してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoField({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-base text-gray-900">{value || '-'}</dd>
    </div>
  )
}
