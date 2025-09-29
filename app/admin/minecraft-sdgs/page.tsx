'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Map, RefreshCw, ChevronLeft, Filter, Users, Layers } from 'lucide-react'

interface SdgsProgressRow {
  id: string
  user_id: string
  stage_id: number
  status: string
  sdgs_form_submitted_at: string | null
  programming_form_submitted_at: string | null
  completed_at: string | null
  updated_at: string
}

interface UserProfile {
  id: string
  nickname: string | null
  email: string | null
}

interface StageDef {
  id: number
  title: string
}

export default function MinecraftSdgsAdminPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  const [rows, setRows] = useState<(SdgsProgressRow & { user: UserProfile; stageTitle: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [userQuery, setUserQuery] = useState('')

  const supabase = createBrowserSupabaseClient()

  // 管理者権限チェック
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        setIsAdmin(!error && data?.is_active === true)
      } catch (e) {
        console.error(e)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }
    if (!isLoading) checkAdmin()
  }, [isAuthenticated, isLoading, supabase, user])

  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString('ja-JP') : '-')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('minecraft_sdgs_progress')
        .select('id,user_id,stage_id,status,sdgs_form_submitted_at,programming_form_submitted_at,completed_at,updated_at')
        .order('completed_at', { ascending: false })
        .limit(300)

      if (stageFilter) query = query.eq('stage_id', stageFilter)
      if (statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data: progress, error: progressError } = await query
      if (progressError) throw progressError

      const userIds = Array.from(new Set((progress || []).map(p => p.user_id)))
      const stageIds = Array.from(new Set((progress || []).map(p => p.stage_id)))

      let profiles: UserProfile[] = []
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        profiles = profileData || []
      }

      let stages: StageDef[] = []
      if (stageIds.length > 0) {
        const { data: stageData } = await supabase
          .from('minecraft_sdgs_stages')
          .select('id, title')
          .in('id', stageIds)
        stages = stageData || []
      }

      const combined = (progress || []).map(row => ({
        ...row,
        user: profiles.find(p => p.id === row.user_id) || { id: row.user_id, nickname: null, email: null },
        stageTitle: stages.find(s => s.id === row.stage_id)?.title || `ステージ ${row.stage_id}`,
      }))

      setRows(combined)
    } catch (e) {
      console.error('minecraft sdgs 管理データの取得失敗:', e)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin, stageFilter, statusFilter])

  const filteredRows = useMemo(() => {
    if (!userQuery.trim()) return rows
    const q = userQuery.trim().toLowerCase()
    return rows.filter(r => (r.user.nickname || '').toLowerCase().includes(q) || (r.user.email || '').toLowerCase().includes(q))
  }, [rows, userQuery])

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl font-semibold">管理者権限確認中...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-6">このページは管理者のみアクセス可能です。</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            管理画面に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Layers size={32} className="text-purple-600" />
                  マイクラSDGs管理
                </h1>
                <p className="text-gray-600 mt-1">ユーザー × ステージの進行状況を一覧</p>
              </div>
            </div>
            <button
              onClick={() => loadData()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">フィルター:</span>
            </div>
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="ユーザー名/メール検索"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-60"
            />
            <select
              value={stageFilter || ''}
              onChange={(e) => setStageFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全ステージ</option>
              {Array.from({ length: 19 }, (_, i) => i + 1).map(s => (
                <option key={s} value={s}>ステージ {s}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全ステータス</option>
              <option value="current">進行中</option>
              <option value="sdgs_video_watched">SDGs動画視聴</option>
              <option value="sdgs_work_completed">SDGsワーク完了</option>
              <option value="programming_video_watched">マイクラ動画視聴</option>
              <option value="programming_work_completed">マイクラワーク完了</option>
              <option value="completed">完了</option>
            </select>
            <button
              onClick={() => { setUserQuery(''); setStageFilter(null); setStatusFilter('all') }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              クリア
            </button>
          </div>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 一覧テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">進行状況一覧 ({filteredRows.length}件)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステージ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提出日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完了日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終更新</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.user.nickname || 'ユーザー名なし'}</div>
                        <div className="text-sm text-gray-500">{r.user.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ステージ {r.stage_id} — {r.stageTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(r.sdgs_form_submitted_at || r.programming_form_submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.completed_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRows.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
                <p className="text-gray-500">選択した条件に該当するデータが見つかりませんでした。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


