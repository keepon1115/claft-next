'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Map, Trophy, Clock, CheckCircle, XCircle, ChevronLeft, RefreshCw, Users, TrendingUp, Filter } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface QuestProgress {
  id: string
  user_id: string
  stage_id: number
  status: string
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  google_form_submitted: boolean | null
  users_profile: {
    nickname: string | null
    email: string
  } | null
}

interface QuestStats {
  totalQuests: number
  pendingApprovals: number
  completedQuests: number
  rejectedQuests: number
  averageCompletionTime: number
  stageStats: { [key: number]: { pending: number; completed: number; rejected: number } }
}

// =====================================================
// クエスト管理ページ
// =====================================================

export default function QuestsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  
  // 状態管理
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([])
  const [stats, setStats] = useState<QuestStats>({
    totalQuests: 0,
    pendingApprovals: 0,
    completedQuests: 0,
    rejectedQuests: 0,
    averageCompletionTime: 0,
    stageStats: {}
  })
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createBrowserSupabaseClient()

  // 管理者権限チェック
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }

      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        setIsAdmin(!adminError && adminData?.is_active === true)
      } catch (error) {
        console.error('管理者チェックエラー:', error)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminStatus()
  }, [isAuthenticated, user, supabase])

  // クエストデータ読み込み
  const loadQuestData = async () => {
    try {
      setLoading(true)
      setError(null)

      // クエスト進捗データを取得
      let progressQuery = supabase
        .from('quest_progress')
        .select(`
          id,
          user_id,
          stage_id,
          status,
          submitted_at,
          approved_at,
          rejected_at,
          google_form_submitted
        `)
        .order('submitted_at', { ascending: false })
        .limit(100)

      // フィルター適用
      if (selectedStage) {
        progressQuery = progressQuery.eq('stage_id', selectedStage)
      }

      if (selectedStatus !== 'all') {
        progressQuery = progressQuery.eq('status', selectedStatus)
      }

      const { data: progressData, error: progressError } = await progressQuery

      if (progressError) throw progressError

      // ユーザー情報を取得
      const userIds = progressData?.map(p => p.user_id) || []
      let userProfiles: any[] = []
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        
        userProfiles = profileData || []
      }

      // データを結合
      const combinedProgress = progressData?.map(progress => ({
        ...progress,
        users_profile: userProfiles.find(profile => profile.id === progress.user_id) || {
          nickname: null,
          email: 'unknown@example.com'
        }
      })) || []

      setQuestProgress(combinedProgress)

      // 統計データを計算
      await calculateStats()

    } catch (error) {
      console.error('クエストデータ取得エラー:', error)
      setError('クエストデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 統計データ計算
  const calculateStats = async () => {
    try {
      // 全体統計を取得
      const [
        { count: totalQuests },
        { count: pendingApprovals },
        { count: completedQuests },
        { count: rejectedQuests }
      ] = await Promise.all([
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
      ])

      // ステージ別統計を取得
      const { data: stageData } = await supabase
        .from('quest_progress')
        .select('stage_id, status')

      const stageStats: { [key: number]: { pending: number; completed: number; rejected: number } } = {}
      
      for (let stage = 1; stage <= 6; stage++) {
        stageStats[stage] = { pending: 0, completed: 0, rejected: 0 }
      }

      stageData?.forEach(item => {
        if (stageStats[item.stage_id]) {
          if (item.status === 'pending_approval') stageStats[item.stage_id].pending++
          else if (item.status === 'completed') stageStats[item.stage_id].completed++
          else if (item.status === 'rejected') stageStats[item.stage_id].rejected++
        }
      })

      setStats({
        totalQuests: totalQuests || 0,
        pendingApprovals: pendingApprovals || 0,
        completedQuests: completedQuests || 0,
        rejectedQuests: rejectedQuests || 0,
        averageCompletionTime: 0, // TODO: 実装
        stageStats
      })

    } catch (error) {
      console.error('統計計算エラー:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadQuestData()
    }
  }, [isAdmin, selectedStage, selectedStatus])

  // 日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    const badges = {
      'pending_approval': { color: 'bg-yellow-100 text-yellow-800', text: '承認待ち', icon: Clock },
      'completed': { color: 'bg-green-100 text-green-800', text: '完了', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', text: '却下', icon: XCircle },
      'current': { color: 'bg-blue-100 text-blue-800', text: '進行中', icon: TrendingUp }
    }
    
    const badge = badges[status as keyof typeof badges] || badges['current']
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={14} className="mr-1" />
        {badge.text}
      </span>
    )
  }

  // 管理者権限確認中
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

  // 管理者権限なし
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
                  <Map size={32} className="text-purple-600" />
                  クエスト管理
                </h1>
                <p className="text-gray-600 mt-1">クエスト進捗と承認状況の管理</p>
              </div>
            </div>
            <button
              onClick={loadQuestData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総クエスト数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">承認済み</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedQuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">却下済み</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejectedQuests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ステージ別統計 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ステージ別進捗状況</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.stageStats).map(([stage, data]) => (
              <div key={stage} className="border rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">ステージ {stage}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-yellow-600">承認待ち:</span>
                      <span className="font-medium">{data.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">完了:</span>
                      <span className="font-medium">{data.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">却下:</span>
                      <span className="font-medium">{data.rejected}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">フィルター:</span>
            </div>
            
            <select
              value={selectedStage || ''}
              onChange={(e) => setSelectedStage(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全ステージ</option>
              {[1, 2, 3, 4, 5, 6].map(stage => (
                <option key={stage} value={stage}>ステージ {stage}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全ステータス</option>
              <option value="pending_approval">承認待ち</option>
              <option value="completed">承認済み</option>
              <option value="rejected">却下済み</option>
              <option value="current">進行中</option>
            </select>

            <button
              onClick={() => {
                setSelectedStage(null)
                setSelectedStatus('all')
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              クリア
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* クエスト進捗テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              クエスト進捗一覧 ({questProgress.length}件)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステージ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提出日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    承認/却下日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フォーム提出
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-3"></div>
                        読み込み中...
                      </div>
                    </td>
                  </tr>
                ) : questProgress.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      クエスト進捗が見つかりません
                    </td>
                  </tr>
                ) : (
                  questProgress.map((progress) => (
                    <tr key={progress.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {progress.users_profile?.nickname?.[0] || progress.users_profile?.email[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {progress.users_profile?.nickname || '名前未設定'}
                            </div>
                            <div className="text-sm text-gray-500">{progress.users_profile?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ステージ {progress.stage_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(progress.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(progress.submitted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(progress.approved_at || progress.rejected_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          progress.google_form_submitted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {progress.google_form_submitted ? '提出済み' : '未提出'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 