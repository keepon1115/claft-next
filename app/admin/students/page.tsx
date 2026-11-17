'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Search,
  Plus,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Users,
  RefreshCw,
} from 'lucide-react'
import {
  type Student,
  type StudentFilter,
  GRADE_OPTIONS,
  COURSE_OPTIONS,
  SCHEDULE_OPTIONS,
} from '@/types/student'
import { getStudents, getCurrentMonthReportStatus, createStudent, deleteStudent } from './actions'
import StudentFormModal from '@/components/admin/students/StudentFormModal'

type SortKey = 'name' | 'grade' | 'course' | 'schedule'
type SortDir = 'asc' | 'desc'

export default function StudentsPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [students, setStudents] = useState<Student[]>([])
  const [reportStatus, setReportStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<StudentFilter>({
    search: '',
    grade: '',
    course: '',
    schedule: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStudents()
      if (result.error) throw new Error(result.error)

      setStudents(result.data)

      if (result.data.length > 0) {
        const ids = result.data.map((s) => s.id)
        const statusResult = await getCurrentMonthReportStatus(ids)
        if (!statusResult.error) {
          setReportStatus(statusResult.data)
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData()
    }
  }, [authLoading, isAuthenticated, loadData])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteStudent(id)
    if (result.success) {
      setStudents((prev) => prev.filter((s) => s.id !== id))
      setDeleteConfirm(null)
    } else {
      alert(result.error ?? '削除に失敗しました')
    }
  }

  const filtered = useMemo(() => {
    let list = [...students]

    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    if (filter.grade) list = list.filter((s) => s.grade === filter.grade)
    if (filter.course) list = list.filter((s) => s.course === filter.course)
    if (filter.schedule) list = list.filter((s) => s.schedule.includes(filter.schedule))

    list.sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      const cmp = va.localeCompare(vb, 'ja')
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [students, filter, sortKey, sortDir])

  const currentMonth = new Date().toISOString().slice(0, 7)
  const activeFilterCount = [filter.grade, filter.course, filter.schedule].filter(Boolean).length

  if (authLoading) {
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

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronUp size={14} className="text-gray-300" />
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={28} />
              スクール生管理
            </h1>
            <p className="text-gray-600 mt-1">
              生徒 {filtered.length} 名
              {students.length !== filtered.length && ` / ${students.length} 名中`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              更新
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              新規登録
            </button>
          </div>
        </div>

        {/* 検索 & フィルタ */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                placeholder="氏名で検索..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              フィルタ
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                <select
                  value={filter.grade}
                  onChange={(e) => setFilter((f) => ({ ...f, grade: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">コース</label>
                <select
                  value={filter.course}
                  onChange={(e) => setFilter((f) => ({ ...f, course: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {COURSE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">曜日</label>
                <select
                  value={filter.schedule}
                  onChange={(e) => setFilter((f) => ({ ...f, schedule: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {SCHEDULE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="sm:col-span-3">
                  <button
                    onClick={() => setFilter((f) => ({ ...f, grade: '', course: '', schedule: '' }))}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={14} /> フィルタをクリア
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* テーブル */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {students.length === 0 ? '生徒が登録されていません' : '条件に一致する生徒がいません'}
              </p>
              {students.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  最初の生徒を登録する
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {([
                      ['name', '氏名'],
                      ['grade', '学年'],
                      ['course', 'コース'],
                      ['schedule', '曜日'],
                    ] as const).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          <SortIcon column={key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {currentMonth} 状況
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((student) => {
                    const hasReport = reportStatus[student.id]
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{student.grade || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{student.course || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{student.schedule || '-'}</td>
                        <td className="px-6 py-4">
                          {hasReport ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              入力済み
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertCircle size={12} />
                              今月未入力
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deleteConfirm === student.id ? (
                            <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDelete(student.id)}
                                className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                確定
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(student.id)
                              }}
                              className="text-xs px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              削除
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 新規作成モーダル */}
      {showCreateModal && (
        <StudentFormModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(student) => {
            setStudents((prev) => [...prev, student])
            setReportStatus((prev) => ({ ...prev, [student.id]: false }))
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
