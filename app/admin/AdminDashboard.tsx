'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  UserCheck,
  Award,
  ChartBar,
  AlertCircle,
  Check,
  X,
  Filter,
  Search,
  Calendar,
  Activity
} from 'lucide-react'
import ApprovalTable from '@/components/admin/ApprovalTable'
import FilterSection from '@/components/admin/FilterSection'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getAdminInfo } from './actions'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { AuthButton } from '@/components/auth/AuthButton'

// ==========================================
// 型定義
// ==========================================

interface Stats {
  totalUsers: number
  pendingApprovals: number
  completedQuests: number
  activeUsers: number
  averageProgress: number
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
  created_at: string
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

interface FilterValues {
  userSearch: string
  stageFilter: number | null
  dateFilter: string
}

interface NotificationData {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  timestamp: Date
}

// ==========================================
// 統計カードコンポーネント
// ==========================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend,
  loading = false
}: {
  title: string
  value: number
  icon: any
  color?: 'primary' | 'warning' | 'success' | 'accent' | 'blue'
  trend?: { value: number; isPositive: boolean }
  loading?: boolean
}) {
  return (
    <div className={`stat-card ${color} text-white rounded-xl p-6 relative overflow-hidden shadow-lg`}>
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
        <div className="stat-value">
          {loading ? (
            <div className="loading-spinner w-8 h-8"></div>
          ) : (
            value.toLocaleString()
          )}
        </div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  )
}

// ==========================================
// ヘッダーコンポーネント
// ==========================================

function AdminHeader({ user, adminInfo }: { user: User; adminInfo?: AdminInfo }) {
  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-title">
          <Shield size={32} />
          CLAFT 管理画面
        </div>
        
        <div className="admin-user-info">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>管理者</div>
            <div style={{ fontWeight: 600 }}>{adminInfo?.email || user.email}</div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} style={{ marginRight: '8px' }} />
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}

// ==========================================
// 通知システムコンポーネント
// ==========================================

function NotificationSystem({ notifications }: { notifications: NotificationData[] }) {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && <Check size={20} />}
            {notification.type === 'error' && <X size={20} />}
            {notification.type === 'info' && <AlertCircle size={20} />}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            {notification.message && (
              <div className="notification-message">{notification.message}</div>
            )}
          </div>
          <div className={`notification-progress ${notification.type}`}></div>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// ユーザー管理テーブルコンポーネント
// ==========================================

function UserManagementTable({ userData, loading }: { userData: UserData[]; loading: boolean }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleDateString('ja-JP')
    } catch {
      return '無効な日付'
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>ユーザーデータを読み込んでいます...</p>
      </div>
    )
  }

  if (!userData || userData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-secondary)' }}>
        ユーザーが登録されていません
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="user-management-table">
        <thead>
          <tr>
            <th>ユーザー</th>
            <th>登録日</th>
            <th>最終ログイン</th>
            <th>クエスト進捗</th>
            <th>経験値</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user) => {
            const userName = user.nickname || user.email?.split('@')[0] || 'Unknown'
            const userEmail = user.email || 'unknown@example.com'
            const registerDate = formatDate(user.created_at)
            const lastLogin = user.last_login_date 
              ? formatDate(user.last_login_date)
              : '未ログイン'
            const questCount = user.quest_clear_count || 0
            const totalExp = user.total_exp || 0
            
            return (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{userName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)' }}>{userEmail}</div>
                    </div>
                  </div>
                </td>
                <td>{registerDate}</td>
                <td>{lastLogin}</td>
                <td>
                  <span className="stage-badge">{questCount}個クリア</span>
                </td>
                <td>{totalExp} EXP</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ==========================================
// 承認履歴テーブルコンポーネント
// ==========================================

function ApprovalHistoryTable({ approvalHistory, loading }: { approvalHistory: ApprovalHistory[]; loading: boolean }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '日時不明'
    try {
      return new Date(dateString).toLocaleString('ja-JP')
    } catch {
      return '無効な日付'
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>承認履歴を読み込んでいます...</p>
      </div>
    )
  }

  if (!approvalHistory || approvalHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-secondary)' }}>
        承認履歴がありません
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="history-table">
        <thead>
          <tr>
            <th>ユーザー</th>
            <th>ステージ</th>
            <th>アクション</th>
            <th>日時</th>
          </tr>
        </thead>
        <tbody>
          {approvalHistory.map((item) => {
            const userName = item.users_profile?.nickname || item.users_profile?.email?.split('@')[0] || 'Unknown'
            const action = item.approved_at ? '承認' : '却下'
            const actionDate = item.approved_at || item.rejected_at
            
            return (
              <tr key={item.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{userName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                        {item.users_profile?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="stage-badge">ステージ {item.stage_id}</span>
                </td>
                <td>
                  <span className={`action-history-badge ${item.approved_at ? 'approved' : 'rejected'}`}>
                    {action}
                  </span>
                </td>
                <td>{formatDate(actionDate)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ==========================================
// メインダッシュボードコンポーネント
// ==========================================

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user, isLoading } = useAuth()
  const { showToast } = useToast()

  // 状態管理
  const [filters, setFilters] = useState<FilterValues>({
    userSearch: '',
    stageFilter: null,
    dateFilter: ''
  })

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingApprovals: 0,
    completedQuests: 0,
    activeUsers: 0,
    averageProgress: 0
  })

  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)

  const supabase = createBrowserSupabaseClient()

  // 安定したloadAllData参照
  const loadAllDataRef = useRef<() => Promise<void>>()

  // 認証チェック
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!isAdmin) {
        // 管理者権限がない場合の処理は後でrender部分で行う
        return
      }
      setLoading(false)
      loadAllDataRef.current?.()
    } else if (!isLoading && !isAuthenticated) {
      // 未認証の場合の処理はrender部分で行う
      setLoading(false)
    }
  }, [isAuthenticated, isAdmin, isLoading])

  // 通知システム
  const showNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // 最大5件まで
    
    // 5秒後に自動削除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
    
    showToast(type, title, message)
  }, [showToast])

  // Realtimeフック
  const {
    isConnected: realtimeConnected,
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount
  } = useRealtimeUpdates({
    onNotification: showNotification,
    onDataUpdate: () => {
      if (isAuthenticated && isAdmin && !loading && loadAllDataRef.current) {
        loadAllDataRef.current()
      }
    },
    currentAdminId: user?.id || null
  })

  // ==========================================
  // データ読み込み関数
  // ==========================================

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const [
        { count: totalUsers },
        { count: pendingApprovals },
        { count: completedQuests },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('users_profile').select('*', { count: 'exact', head: true }),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('user_stats').select('*', { count: 'exact', head: true }).gte('last_login_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const averageProgress = ((completedQuests || 0) / Math.max((pendingApprovals || 0) + (completedQuests || 0), 1) * 100)

      setStats({
        totalUsers: totalUsers || 0,
        pendingApprovals: pendingApprovals || 0,
        completedQuests: completedQuests || 0,
        activeUsers: activeUsers || 0,
        averageProgress: parseFloat(averageProgress.toFixed(2))
      })
    } catch (error) {
      console.error('統計データ読み込みエラー:', error)
      showNotification('error', 'エラー', '統計データの取得に失敗しました')
    } finally {
      setStatsLoading(false)
    }
  }, [supabase, showNotification])

  const loadApprovalHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      
      // まず quest_progress だけを取得
      const { data: questData, error } = await supabase
        .from('quest_progress')
        .select(`
          id,
          user_id,
          stage_id,
          status,
          approved_at,
          rejected_at,
          approved_by,
          rejected_by,
          created_at
        `)
        .in('status', ['completed', 'rejected'])
        .order('approved_at', { ascending: false, nullsLast: true })
        .order('rejected_at', { ascending: false, nullsLast: true })
        .limit(20)

      if (error) throw error

      // 別途 users_profile を取得
      const userIds = questData?.map(q => q.user_id) || []
      let userProfiles: any[] = []
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        
        userProfiles = profileData || []
      }

      // データを結合
      const combinedData = questData?.map(quest => ({
        ...quest,
        users_profile: userProfiles.find(profile => profile.id === quest.user_id) || {
          nickname: null,
          email: 'unknown@example.com'
        }
      })) || []

      setApprovalHistory(combinedData as ApprovalHistory[])
    } catch (error) {
      console.error('承認履歴読み込みエラー:', error)
      showNotification('error', 'エラー', '承認履歴の取得に失敗しました')
      setApprovalHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [supabase, showNotification])

  const loadUserData = useCallback(async () => {
    try {
      setUsersLoading(true)
      const { data: users, error: usersError } = await supabase
        .from('users_profile')
        .select('id, email, nickname, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (usersError) throw usersError

      const userIds = users?.map(u => u.id) || []
      let userStats: any[] = []
      
      if (userIds.length > 0) {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('user_id, quest_clear_count, total_exp, last_login_date')
          .in('user_id', userIds)
        
        userStats = stats || []
      }

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
      showNotification('error', 'エラー', 'ユーザーデータの取得に失敗しました')
    } finally {
      setUsersLoading(false)
    }
  }, [supabase, showNotification])

  // 全データ読み込み
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadApprovalHistory(),
      loadUserData()
    ])
  }, [loadStats, loadApprovalHistory, loadUserData])

  // refを更新
  useEffect(() => {
    loadAllDataRef.current = loadAllData
  }, [loadAllData])

  // 全データリフレッシュ
  const handleRefreshAll = useCallback(async () => {
    try {
      await loadAllData()
      showNotification('success', 'データ更新完了', '全てのデータを最新に更新しました')
    } catch (error) {
      showNotification('error', '更新エラー', 'データの更新に失敗しました')
    }
  }, [loadAllData, showNotification])

  // ==========================================
  // レンダリング
  // ==========================================

  // ローディング中
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">管理画面を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔐 管理者ログインが必要です
            </h1>
            <p className="text-gray-600">
              CLAFT管理画面は管理者権限を持つユーザーのみアクセス可能です。
            </p>
          </div>
          
          <div className="space-y-4">
            <AuthButton 
              variant="default"
              size="lg"
              redirectTo="/admin"
              defaultTab="login"
              className="w-full"
            />
            
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            管理者アカウントでログインしてください
          </p>
        </div>
      </div>
    )
  }

  // 認証済みだが管理者権限がない場合
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ⚠️ アクセス権限がありません
            </h1>
            <p className="text-gray-600">
              申し訳ございませんが、あなたのアカウントには管理者権限がありません。
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>ログイン中のユーザー:</strong><br />
                {user?.email}
              </p>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ホームに戻る
            </button>
            
            <button
              onClick={async () => {
                const supabase = createBrowserSupabaseClient()
                await supabase.auth.signOut()
                window.location.href = '/admin'
              }}
              className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              別のアカウントでログイン
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            管理者権限が必要な場合は、システム管理者にお問い合わせください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard admin-body">
      {/* 通知システム */}
      <NotificationSystem notifications={notifications} />

      {/* ヘッダー */}
      <AdminHeader user={user} />

      {/* メインコンテンツ */}
      <main className="admin-container">
        {/* リアルタイム接続ステータス */}
        <div className="realtime-status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`status-indicator ${realtimeConnected ? 'connected' : 'disconnected'}`}></div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)' }}>
              {realtimeConnected ? 'リアルタイム接続中' : '接続を再試行中...'}
            </span>
          </div>
          {realtimeUnreadCount > 0 && (
            <div style={{ 
              background: 'var(--admin-danger)', 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: 700, 
              padding: '4px 8px', 
              borderRadius: '12px' 
            }}>
              {realtimeUnreadCount}
            </div>
          )}
        </div>

        {/* 統計情報 */}
        <section className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <BarChart3 size={20} />
              </div>
              統計情報
            </h2>
            <button onClick={handleRefreshAll} className="refresh-btn">
              <RefreshCw size={16} />
              更新
            </button>
          </div>
          
          <div className="stats-grid">
            <StatCard
              title="総ユーザー数"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              loading={statsLoading}
            />
            <StatCard
              title="承認待ちクエスト"
              value={stats.pendingApprovals}
              icon={Clock}
              color="warning"
              loading={statsLoading}
            />
            <StatCard
              title="完了クエスト総数"
              value={stats.completedQuests}
              icon={CheckCircle}
              color="success"
              loading={statsLoading}
            />
            <StatCard
              title="アクティブユーザー"
              value={stats.activeUsers}
              icon={Activity}
              color="accent"
              loading={statsLoading}
            />
            <StatCard
              title="平均進捗率"
              value={stats.averageProgress}
              icon={ChartBar}
              color="primary"
              loading={statsLoading}
            />
          </div>
        </section>

        {/* フィルターセクション */}
        <FilterSection
          initialFilters={filters}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          loading={statsLoading}
        />

        {/* 承認テーブル */}
        <ApprovalTable
          filters={filters}
          onApprovalChange={loadAllData}
          onNotification={showNotification}
        />

        {/* 承認履歴 */}
        <section className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon" style={{ 
                background: 'linear-gradient(135deg, var(--admin-accent) 0%, #AD1457 100%)' 
              }}>
                <History size={20} />
              </div>
              最近の承認履歴
            </h2>
            <button onClick={loadApprovalHistory} className="refresh-btn">
              <RefreshCw size={16} />
              更新
            </button>
          </div>
          
          <ApprovalHistoryTable 
            approvalHistory={approvalHistory} 
            loading={historyLoading} 
          />
        </section>

        {/* 全ユーザー管理 */}
        <section className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <Users size={20} />
              </div>
              ユーザー管理
            </h2>
            <button onClick={loadUserData} className="refresh-btn">
              <RefreshCw size={16} />
              更新
            </button>
          </div>
          
          <UserManagementTable 
            userData={userData} 
            loading={usersLoading} 
          />
        </section>
      </main>
    </div>
  )
}