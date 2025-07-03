'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Shield,
  LogOut,
  History,
  UserCheck
} from 'lucide-react'
import ApprovalTable from '@/components/admin/ApprovalTable'
import FilterSection from '@/components/admin/FilterSection'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getAdminInfo } from './actions'

// ==========================================
// 型定義
// ==========================================

interface Stats {
  totalUsers: number
  pendingApprovals: number
  completedQuests: number
  activeUsers: number
}

interface AdminInfo {
  user_id: string
  email: string
  is_active: boolean | null
  created_at: string | null
}

interface ApprovalHistory {
  id: string
  user_id: string
  stage_id: number
  status: string
  approved_at: string | null
  rejected_at: string | null
  approved_by: string | null
  rejected_by: string | null
  users_profile: {
    nickname: string | null
    email: string
  } | null
}

interface UserData {
  id: string
  email: string
  nickname: string | null
  created_at: string | null
  quest_clear_count?: number
  total_exp?: number
  last_login_date?: string | null
}

interface AdminDashboardProps {
  user: User
  adminInfo: AdminInfo
  initialStats: Stats
}

// FilterSection Props型定義を追加
interface FilterSectionProps {
  filters: {
    userSearch: string
    stageFilter: number | null
    dateFilter: string
  }
  onFiltersChange: (filters: any) => void
}

// ==========================================
// 統計カードコンポーネント
// ==========================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'purple',
  trend 
}: {
  title: string
  value: number
  icon: any
  color?: 'purple' | 'orange' | 'green' | 'blue'
  trend?: { value: number; isPositive: boolean }
}) {
  const colorStyles = {
    purple: 'from-purple-500 to-purple-700',
    orange: 'from-orange-500 to-orange-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700'
  }

  return (
    <div className={`stat-card bg-gradient-to-br ${colorStyles[color]} text-white rounded-xl p-6 relative overflow-hidden shadow-lg`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon size={24} className="opacity-80" />
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              <TrendingUp size={16} className={trend.isPositive ? '' : 'rotate-180'} />
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
        <div className="text-sm opacity-90">{title}</div>
      </div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
    </div>
  )
}

// ==========================================
// ヘッダーコンポーネント
// ==========================================

function AdminHeader({ user, adminInfo }: { user: User; adminInfo: AdminInfo }) {
  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="admin-header bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <h1 className="text-2xl font-bold">CLAFT 管理画面</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm opacity-90">管理者</div>
            <div className="font-semibold">{adminInfo.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <LogOut size={16} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  )
}

// ==========================================
// メインダッシュボードコンポーネント
// ==========================================

export default function AdminDashboard({ user, adminInfo, initialStats }: AdminDashboardProps) {
  // ステート管理
  const [stats, setStats] = useState<Stats>(initialStats)
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userSearch: '',
    stageFilter: null as number | null,
    dateFilter: ''
  })

  const supabase = createBrowserSupabaseClient()

  // 通知システム
  const showNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    // ブラウザ通知APIを使用（オプション）
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${title}${message ? `: ${message}` : ''}`)
    }
    
    // コンソールログ（開発時用）
    console.log(`[${type}] ${title}${message ? `: ${message}` : ''}`)
  }, [])

  // Realtimeフック
  const {
    isConnected: realtimeConnected,
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount
  } = useRealtimeUpdates({
    onNotification: showNotification,
    onDataUpdate: () => {
      // リアルタイム更新時にデータを再読み込み
      loadStats()
      loadApprovalHistory()
    },
    currentAdminId: user.id
  })

  // ==========================================
  // データ読み込み関数
  // ==========================================

  const loadStats = useCallback(async () => {
    try {
      const [
        { count: totalUsers },
        { count: pendingApprovals },
        { count: completedQuests },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('users_profile').select('*', { count: 'exact', head: true }),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('quest_progress').select('user_id', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      setStats({
        totalUsers: totalUsers || 0,
        pendingApprovals: pendingApprovals || 0,
        completedQuests: completedQuests || 0,
        activeUsers: activeUsers || 0
      })
    } catch (error) {
      console.error('統計データ読み込みエラー:', error)
    }
  }, [supabase])

  const loadApprovalHistory = useCallback(async () => {
    try {
      // 一時的に無効化 - 型エラー回避のため
      console.log('承認履歴機能は一時的に無効化されています')
      setApprovalHistory([])
    } catch (error) {
      console.error('承認履歴読み込みエラー:', error)
      setApprovalHistory([])
    }
  }, [supabase])

  const loadUserData = useCallback(async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users_profile')
        .select('id, email, nickname, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (usersError) throw usersError

      // ユーザー統計を取得
      const userIds = users?.map(u => u.id) || []
      let userStats: any[] = []
      
      if (userIds.length > 0) {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('user_id, quest_clear_count, total_exp, last_login_date')
          .in('user_id', userIds)
        
        userStats = stats || []
      }

      // データを結合
      const combinedData = users?.map(user => {
        const stats = userStats.find(s => s.user_id === user.id)
        return {
          ...user,
          quest_clear_count: stats?.quest_clear_count || 0,
          total_exp: stats?.total_exp || 0,
          last_login_date: stats?.last_login_date
        }
      }) || []

      setUserData(combinedData)
    } catch (error) {
      console.error('ユーザーデータ読み込みエラー:', error)
    }
  }, [supabase])

  // 初期データ読み込み
  useEffect(() => {
    loadStats()
    loadApprovalHistory()
    loadUserData()
  }, [loadStats, loadApprovalHistory, loadUserData])

  // 全データリフレッシュ
  const handleRefreshAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadApprovalHistory(),
        loadUserData()
      ])
      showNotification('success', 'データ更新完了', '全てのデータを最新に更新しました')
    } catch (error) {
      showNotification('error', '更新エラー', 'データの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [loadStats, loadApprovalHistory, loadUserData, showNotification])

  // ==========================================
  // ヘルパー関数
  // ==========================================

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleString('ja-JP')
    } catch {
      return '無効な日付'
    }
  }

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return ''
    
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return `${Math.floor(diffDays / 7)}週間前`
  }

  // ==========================================
  // レンダリング
  // ==========================================

  return (
    <div className="admin-dashboard">
      {/* ヘッダー */}
      <AdminHeader user={user} adminInfo={adminInfo} />

      {/* メインコンテンツ */}
      <main className="main-content max-w-7xl mx-auto p-6 space-y-8">
        {/* リアルタイム接続ステータス */}
        <div className="realtime-status bg-gray-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-orange-500'} ${!realtimeConnected ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {realtimeConnected ? 'リアルタイム接続中' : '接続を再試行中...'}
              </span>
            </div>
            {realtimeUnreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {realtimeUnreadCount}
              </div>
            )}
          </div>
        </div>

        {/* 統計カード */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <BarChart3 size={28} />
              統計情報
            </h2>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              更新
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="総ユーザー数"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="承認待ちクエスト"
              value={stats.pendingApprovals}
              icon={Clock}
              color="orange"
            />
            <StatCard
              title="完了クエスト総数"
              value={stats.completedQuests}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="アクティブユーザー"
              value={stats.activeUsers}
              icon={UserCheck}
              color="purple"
            />
          </div>
        </section>

        {/* 承認待ちセクション */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Clock size={28} />
              クエスト承認待ち
            </h2>
          </div>

          {/* FilterSection - 一時的に無効化 */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">フィルター機能は準備中です...</p>
          </div>

          {/* ApprovalTable - 一時的に無効化 */}
          <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">承認テーブル機能は準備中です...</p>
            <p className="text-sm text-gray-500 mt-2">管理者機能の復旧作業中</p>
          </div>
        </section>

        {/* 承認履歴 */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <History size={28} />
              最近の承認履歴
            </h2>
            <button
              onClick={loadApprovalHistory}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ユーザー</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ステージ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">アクション</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">日時</th>
                </tr>
              </thead>
              <tbody>
                {approvalHistory.map((item) => {
                  const userName = item.users_profile?.nickname || item.users_profile?.email?.split('@')[0] || 'Unknown'
                  const action = item.approved_at ? '承認' : '却下'
                  const actionDate = item.approved_at || item.rejected_at
                  const actionColorClass = item.approved_at ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'

                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{userName}</div>
                            <div className="text-sm text-gray-500">{item.users_profile?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          ステージ {item.stage_id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${actionColorClass}`}>
                          {action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{formatDate(actionDate)}</div>
                        <div className="text-xs text-gray-500">{getRelativeTime(actionDate)}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {approvalHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              承認履歴はありません
            </div>
          )}
        </section>

        {/* ユーザー管理 */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users size={28} />
              ユーザー管理
            </h2>
            <button
              onClick={loadUserData}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ユーザー</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">クエスト完了</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">経験値</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">最終ログイン</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">登録日</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(user.nickname || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.nickname || user.email.split('@')[0]}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user.quest_clear_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-purple-600 font-semibold">
                        {user.total_exp?.toLocaleString() || 0} EXP
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{formatDate(user.last_login_date)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ユーザーデータがありません
            </div>
          )}
        </section>
      </main>
    </div>
  )
} 