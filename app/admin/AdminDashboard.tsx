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
  Activity,
  Settings,
  BookOpen,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import ApprovalTable from '@/components/admin/ApprovalTable'
import FilterSection from '@/components/admin/FilterSection'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getAdminInfo } from './actions'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

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

interface TabData {
  id: string
  label: string
  icon: any
  badge?: number
}

// ==========================================
// 統計カードコンポーネント
// ==========================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  loading = false,
  suffix = '',
  onClick 
}: {
  title: string
  value: number
  icon: any
  color?: 'primary' | 'success' | 'warning' | 'accent'
  loading?: boolean
  suffix?: string
  onClick?: () => void
}) {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600 shadow-blue-200',
    success: 'from-green-500 to-green-600 shadow-green-200',
    warning: 'from-orange-500 to-orange-600 shadow-orange-200',
    accent: 'from-purple-500 to-purple-600 shadow-purple-200'
  }

  return (
    <div 
      className={`
        bg-gradient-to-r ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg 
        ${onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-300' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          {loading ? (
            <div className="w-16 h-8 bg-white/20 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {value.toLocaleString()}{suffix}
            </p>
          )}
        </div>
        <div className="text-white/60">
          <Icon size={32} />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// クイックアクションボタン
// ==========================================

function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'primary',
  badge,
  disabled = false
}: {
  icon: any
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
  badge?: number
  disabled?: boolean
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

// ==========================================
// タブコンポーネント
// ==========================================

function TabButton({ tab, isActive, onClick }: {
  tab: TabData
  isActive: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all relative
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      <Icon size={20} />
      <span>{tab.label}</span>
      {tab.badge && tab.badge > 0 && (
        <span className={`
          text-xs rounded-full w-5 h-5 flex items-center justify-center
          ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}
        `}>
          {tab.badge > 99 ? '99+' : tab.badge}
        </span>
      )}
    </button>
  )
}

// ==========================================
// 使い方ガイドモーダル
// ==========================================

function UserGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">📖 管理画面使い方ガイド</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* ダッシュボード概要 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-600" />
              ダッシュボード概要
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-3">
                管理画面では、CLAFT システムの全体状況を一目で確認し、効率的にユーザー管理を行えます。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 📊 統計情報でシステム全体の状況を把握</li>
                <li>• ⚡ クイックアクションで頻繁な操作を効率化</li>
                <li>• 📋 タブ切り替えで各機能にスムーズにアクセス</li>
              </ul>
            </div>
          </section>

          {/* クエスト承認作業 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              クエスト承認作業
            </h3>
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">1. 承認待ちクエストの確認</h4>
                <p className="text-sm text-gray-600">「クエスト承認」タブで承認待ちのクエストを一覧表示します。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">2. 個別承認・却下</h4>
                <p className="text-sm text-gray-600">各クエストの「承認」または「却下」ボタンでアクションを実行します。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">3. 一括処理</h4>
                <p className="text-sm text-gray-600">チェックボックスで複数選択後、「一括承認」で効率的に処理できます。</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>重要:</strong> ステージ6の承認後、ユーザーは自動的に山エリア（ステージ7-12）に進めるようになります。
                </p>
              </div>
            </div>
          </section>

          {/* フィルター機能 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="text-purple-600" />
              フィルター機能
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-3">効率的な検索とフィルタリングで目的のデータをすぐに見つけられます。</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 🔍 ユーザー名・メールアドレスで検索</li>
                <li>• 📊 ステージ別でフィルタリング</li>
                <li>• 📅 日付範囲で絞り込み</li>
                <li>• 🔄 リアルタイム更新で最新情報を常に表示</li>
              </ul>
            </div>
          </section>

          {/* ショートカットキー */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="text-orange-600" />
              効率化のコツ
            </h3>
            <div className="bg-orange-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 📈 統計カードをクリックして関連データにジャンプ</li>
                <li>• ⚡ クイックアクションでよく使う機能にすぐアクセス</li>
                <li>• 🔔 通知システムで処理結果を即座に確認</li>
                <li>• 📋 承認履歴で過去の操作を追跡</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-6 text-center border-t">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// メインダッシュボードコンポーネント
// ==========================================

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const { showToast } = useToast()

  // 状態管理
  const [activeTab, setActiveTab] = useState('overview')
  const [showGuide, setShowGuide] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  
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

  const supabase = createBrowserSupabaseClient()

  // タブ定義
  const tabs: TabData[] = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'approvals', label: 'クエスト承認', icon: CheckCircle, badge: stats.pendingApprovals },
    { id: 'users', label: 'ユーザー管理', icon: Users },
    { id: 'history', label: '承認履歴', icon: History },
    { id: 'settings', label: 'システム設定', icon: Settings }
  ]

  // データ読み込み
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      
      // 基本統計の取得
      const [usersResult, approvalsResult, questsResult] = await Promise.all([
        supabase.from('users_profile').select('id', { count: 'exact' }),
        supabase.from('quest_progress').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
        supabase.from('quest_progress').select('id', { count: 'exact' }).eq('status', 'completed')
      ])

      // アクティブユーザー数（過去30日以内にログインしたユーザー）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: activeUsersData } = await supabase
        .from('users_profile')
        .select('id')
        .gte('last_login_date', thirtyDaysAgo.toISOString())

      // 平均進捗率の計算
      const { data: progressData } = await supabase
        .from('quest_progress')
        .select('user_id, stage_id')
        .eq('status', 'completed')

      const userProgressMap = new Map()
      progressData?.forEach(item => {
        const userId = item.user_id
        if (!userProgressMap.has(userId)) {
          userProgressMap.set(userId, 0)
        }
        userProgressMap.set(userId, userProgressMap.get(userId) + 1)
      })

      const totalUsers = usersResult.count || 0
      const averageProgress = totalUsers > 0 
        ? Array.from(userProgressMap.values()).reduce((sum, progress) => sum + progress, 0) / totalUsers 
        : 0

      setStats({
        totalUsers,
        pendingApprovals: approvalsResult.count || 0,
        completedQuests: questsResult.count || 0,
        activeUsers: activeUsersData?.length || 0,
        averageProgress: Math.round((averageProgress / 12) * 100)
      })

    } catch (error) {
      console.error('統計データ取得エラー:', error)
      showToast('統計データの取得に失敗しました', 'error')
    } finally {
      setStatsLoading(false)
    }
  }, [supabase, showToast])

  const loadApprovalHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quest_progress')
        .select(`
          id, user_id, stage_id, status, approved_at, rejected_at, 
          approved_by, rejected_by, created_at,
          users_profile:user_id (nickname, email)
        `)
        .in('status', ['completed', 'current'])
        .not('approved_at', 'is', null)
        .order('approved_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setApprovalHistory(data || [])
    } catch (error) {
      console.error('承認履歴取得エラー:', error)
    }
  }, [supabase])

  const loadUserData = useCallback(async () => {
    try {
      // users_profileとuser_statsを別々に取得
      const [usersResponse, statsResponse] = await Promise.all([
        supabase
          .from('users_profile')
          .select('id, email, nickname, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_stats')
          .select('user_id, quest_clear_count, total_exp, last_login_date')
      ])

      if (usersResponse.error) throw usersResponse.error
      if (statsResponse.error) throw statsResponse.error
      
      // データを結合
      const users = usersResponse.data || []
      const stats = statsResponse.data || []
      
      const formattedData = users.map(user => {
        const userStats = stats.find(stat => stat.user_id === user.id)
        return {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          created_at: user.created_at,
          quest_clear_count: userStats?.quest_clear_count || 0,
          total_exp: userStats?.total_exp || 0,
          last_login_date: userStats?.last_login_date || null
        }
      })
      
      setUserData(formattedData)
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
      // エラーの詳細をログ出力
      if (error && typeof error === 'object') {
        console.error('エラー詳細:', JSON.stringify(error, null, 2))
      }
      // エラーが発生してもアプリケーションが止まらないようにデフォルトデータを設定
      setUserData([])
    }
  }, [supabase])

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadApprovalHistory(),
      loadUserData()
    ])
  }, [loadStats, loadApprovalHistory, loadUserData])

  // 通知システム
  const showNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString()
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      timestamp: new Date()
    }
    
    setNotifications(prev => [notification, ...prev].slice(0, 5))
    showToast(title, type)
    
    // 5秒後に自動削除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [showToast])

  // 初期化
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLoading(false)
      loadAllData()
    } else if (!isLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [isAuthenticated, isLoading, loadAllData])

  // リアルタイム更新
  useRealtimeUpdates({
    table: 'quest_progress',
    event: '*',
    callback: () => {
      loadStats()
      if (activeTab === 'approvals') {
        // ApprovalTableコンポーネントが自動更新するため、ここでは統計のみ更新
      }
      if (activeTab === 'history') {
        loadApprovalHistory()
      }
    }
  })

  // クイックアクション
  const quickActions = [
    {
      icon: CheckCircle,
      label: '承認待ちクエスト',
      onClick: () => setActiveTab('approvals'),
      variant: 'success' as const,
      badge: stats.pendingApprovals
    },
    {
      icon: Users,
      label: 'ユーザー管理',
      onClick: () => setActiveTab('users'),
      variant: 'primary' as const
    },
    {
      icon: History,
      label: '承認履歴',
      onClick: () => setActiveTab('history'),
      variant: 'secondary' as const
    },
    {
      icon: HelpCircle,
      label: '使い方ガイド',
      onClick: () => setShowGuide(true),
      variant: 'warning' as const
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">管理画面を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">認証が必要です</h1>
          <p className="text-gray-600 mb-6">管理画面にアクセスするにはログインしてください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">🛠️ CLAFT 管理画面</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Admin Dashboard v2.0
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle size={16} />
                ヘルプ
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{user?.email}</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  管理者
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総ユーザー数"
            value={stats.totalUsers}
            icon={Users}
            color="primary"
            loading={statsLoading}
            onClick={() => setActiveTab('users')}
          />
          <StatCard
            title="承認待ちクエスト"
            value={stats.pendingApprovals}
            icon={Clock}
            color="warning"
            loading={statsLoading}
            onClick={() => setActiveTab('approvals')}
          />
          <StatCard
            title="完了クエスト"
            value={stats.completedQuests}
            icon={CheckCircle}
            color="success"
            loading={statsLoading}
            onClick={() => setActiveTab('history')}
          />
          <StatCard
            title="平均進捗率"
            value={stats.averageProgress}
            suffix="%"
            icon={ChartBar}
            color="accent"
            loading={statsLoading}
          />
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">⚡ クイックアクション</h2>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
          
          {!collapsed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionButton key={index} {...action} />
              ))}
            </div>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-xl shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 システム概要</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">最近のアクティビティ</h3>
                  {approvalHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">アクティビティはありません</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {approvalHistory.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-shrink-0">
                            <CheckCircle className="text-green-600" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.users_profile?.nickname || 'ユーザー'} - ステージ{item.stage_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.approved_at || item.created_at).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              承認済み
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">システム状況</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">データベース</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">認証システム</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">リアルタイム更新</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        正常
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">✅ クエスト承認管理</h2>
                <p className="text-gray-600">ユーザーから提出されたクエストの承認・却下を行います。</p>
              </div>
              
              <FilterSection
                initialFilters={filters}
                onFilterChange={setFilters}
                loading={statsLoading}
              />
              
              <ApprovalTable
                filters={filters}
                onApprovalChange={loadAllData}
                onNotification={showNotification}
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">👥 ユーザー管理</h2>
                <p className="text-gray-600">登録ユーザーの情報と進捗状況を確認できます。</p>
              </div>
              
              {userData.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">ユーザーデータなし</h3>
                  <p className="mt-1 text-sm text-gray-500">ユーザーデータが見つかりませんでした。</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={loadUserData}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                      再読み込み
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ユーザー
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          クリア数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          経験値
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最終ログイン
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.nickname || 'ユーザー名なし'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.quest_clear_count || 0} クリア
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.total_exp || 0} EXP
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.last_login_date 
                              ? new Date(user.last_login_date).toLocaleDateString('ja-JP')
                              : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  未ログイン
                                </span>
                              )
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">📋 承認履歴</h2>
                <p className="text-gray-600">過去の承認・却下履歴を確認できます。</p>
              </div>
              
              {approvalHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">承認履歴なし</h3>
                  <p className="mt-1 text-sm text-gray-500">まだ承認履歴がありません。</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={loadApprovalHistory}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                      再読み込み
                    </button>
                  </div>
                </div>
              ) : (
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
                          状態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          承認日時
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvalHistory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.users_profile?.nickname || 'ユーザー名なし'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.users_profile?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ステージ {item.stage_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              承認済み
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.approved_at 
                              ? new Date(item.approved_at).toLocaleString('ja-JP')
                              : (
                                <span className="text-gray-500">未設定</span>
                              )
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">⚙️ システム設定</h2>
                <p className="text-gray-600">システムの各種設定を管理します。</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">データベース統計</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">総ユーザー数:</span>
                      <span className="ml-2 font-medium">{stats.totalUsers}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">総クエスト数:</span>
                      <span className="ml-2 font-medium">{stats.completedQuests}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">システム情報</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>バージョン: CLAFT Admin v2.0</div>
                    <div>最終更新: {new Date().toLocaleDateString('ja-JP')}</div>
                    <div>環境: {process.env.NODE_ENV}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 使い方ガイドモーダル */}
      <UserGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  )
}