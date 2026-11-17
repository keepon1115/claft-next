'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Bot, Plus, Pencil, Trash2, Users, Eye, EyeOff, ChevronRight, FileSpreadsheet } from 'lucide-react'
import { getRoboThemes, createRoboTheme, deleteRoboTheme, updateRoboTheme } from './actions'
import type { RoboTheme } from '@/types/robo'

export default function AdminRoboPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [themes, setThemes] = useState<RoboTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getRoboThemes()
    if (result.error) setError(result.error)
    setThemes(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) load()
  }, [authLoading, isAuthenticated, isAdmin, load])

  const handleCreate = async () => {
    setCreating(true)
    const nextOrder = themes.length > 0 ? Math.max(...themes.map((t) => t.display_order)) + 1 : 1
    const result = await createRoboTheme({
      level: 1,
      theme_number: 1,
      title: '新しいテーマ',
      question_prompt: '',
      case_study_md: '',
      is_published: false,
      display_order: nextOrder,
      icon_url: null,
      icon_emoji: '🤖',
      question_image_url: null,
      case_image_url: null,
    })
    setCreating(false)
    if (result.error || !result.data) {
      alert(result.error ?? '作成に失敗しました')
      return
    }
    router.push(`/admin/robo/${result.data.id}`)
  }

  const handleTogglePublish = async (theme: RoboTheme) => {
    const result = await updateRoboTheme(theme.id, { is_published: !theme.is_published })
    if (!result.success) {
      alert(result.error ?? '更新に失敗しました')
      return
    }
    setThemes((prev) => prev.map((t) => (t.id === theme.id ? { ...t, is_published: !t.is_published } : t)))
  }

  const handleDelete = async (theme: RoboTheme) => {
    if (!confirm(`「${theme.title}」を削除しますか？関連する設問・回答もすべて削除されます。`)) return
    const result = await deleteRoboTheme(theme.id)
    if (!result.success) {
      alert(result.error ?? '削除に失敗しました')
      return
    }
    setThemes((prev) => prev.filter((t) => t.id !== theme.id))
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
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">管理者権限が必要です</h1>
          <button onClick={() => router.push('/admin')} className="text-blue-600 underline">
            管理画面トップへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Bot size={32} className="text-purple-600" />
            ロボクエスト管理
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/robo/import')}
              className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-purple-700 transition-colors hover:bg-purple-50"
            >
              <FileSpreadsheet size={16} /> CSVインポート
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus size={16} /> テーマを追加
            </button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">レベル-テーマ</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">タイトル</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">公開</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {themes.map((theme) => (
                <tr key={theme.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                    Lv.{theme.level}-{theme.theme_number}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{theme.title}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <button
                      onClick={() => handleTogglePublish(theme)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        theme.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {theme.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                      {theme.is_published ? '公開中' : '非公開'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => router.push(`/admin/robo/${theme.id}`)}
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-900"
                      >
                        <Pencil size={14} /> 編集
                      </button>
                      <button
                        onClick={() => router.push(`/admin/robo/${theme.id}/answers`)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <Users size={14} /> 回答
                      </button>
                      <button
                        onClick={() => handleDelete(theme)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={14} /> 削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {themes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    テーマがまだありません。「テーマを追加」から作成してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => router.push('/admin')}
          className="mt-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronRight size={14} className="rotate-180" /> 管理画面トップへ戻る
        </button>
      </div>
    </div>
  )
}
