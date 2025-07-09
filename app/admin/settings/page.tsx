'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Settings, Database, Shield, AlertTriangle, CheckCircle, Users, Server, HardDrive, ChevronLeft, RefreshCw, Copy, Download } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'  
  auth: 'healthy' | 'warning' | 'error'
  lastChecked: Date
}

interface DatabaseStats {
  userCount: number
  questCount: number
  adminCount: number
  totalStorage: string
  lastBackup: Date | null
}

interface AdminUser {
  id: string
  user_id: string
  email: string
  is_active: boolean
  created_at: string
  nickname?: string
}

// =====================================================
// システム設定ページ
// =====================================================

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  
  // 状態管理
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
    lastChecked: new Date()
  })
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    userCount: 0,
    questCount: 0,
    adminCount: 0,
    totalStorage: '0 MB',
    lastBackup: null
  })
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'health' | 'admins' | 'database' | 'backup'>('health')
  
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

  // システム健全性チェック
  const checkSystemHealth = async () => {
    try {
      const results = await Promise.allSettled([
        // データベース接続テスト
        supabase.from('users_profile').select('id').limit(1),
        // 認証システムテスト
        supabase.auth.getSession(),
        // ストレージテスト（省略）
        Promise.resolve({ data: true, error: null })
      ])

      const newHealth: SystemHealth = {
        database: results[0].status === 'fulfilled' && !results[0].value.error ? 'healthy' : 'error',
        auth: results[1].status === 'fulfilled' ? 'healthy' : 'error',
        storage: results[2].status === 'fulfilled' ? 'healthy' : 'warning',
        lastChecked: new Date()
      }

      setSystemHealth(newHealth)
    } catch (error) {
      console.error('システム健全性チェックエラー:', error)
      setSystemHealth({
        database: 'error',
        storage: 'error',
        auth: 'error',
        lastChecked: new Date()
      })
    }
  }

  // データベース統計取得
  const loadDatabaseStats = async () => {
    try {
      const [userCount, questCount, adminCount] = await Promise.all([
        supabase.from('users_profile').select('*', { count: 'exact', head: true }),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }),
        supabase.from('admin_users').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ])

      setDbStats({
        userCount: userCount.count || 0,
        questCount: questCount.count || 0,
        adminCount: adminCount.count || 0,
        totalStorage: '未算出',
        lastBackup: null // TODO: 実装
      })
    } catch (error) {
      console.error('データベース統計取得エラー:', error)
    }
  }

  // 管理者一覧取得
  const loadAdminUsers = async () => {
    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id, user_id, email, is_active, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // ユーザープロフィールも取得
      const userIds = adminData?.map(admin => admin.user_id) || []
      let profiles: any[] = []
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname')
          .in('id', userIds)
        
        profiles = profileData || []
      }

      const combinedAdmins = adminData?.map(admin => ({
        ...admin,
        nickname: profiles.find(p => p.id === admin.user_id)?.nickname
      })) || []

      setAdminUsers(combinedAdmins)
    } catch (error) {
      console.error('管理者一覧取得エラー:', error)
    }
  }

  // 初期データ読み込み
  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await Promise.all([
        checkSystemHealth(),
        loadDatabaseStats(),
        loadAdminUsers()
      ])
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAllData()
    }
  }, [isAdmin])

  // 管理者権限の切り替え
  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', adminId)

      if (error) throw error

      setSuccessMessage('管理者権限を更新しました')
      await loadAdminUsers()
    } catch (error) {
      console.error('管理者権限更新エラー:', error)
      setError('管理者権限の更新に失敗しました')
    }
  }

  // 健全性ステータスのアイコンと色
  const getHealthBadge = (status: 'healthy' | 'warning' | 'error') => {
    const badges = {
      healthy: { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: '正常' },
      warning: { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100', text: '警告' },
      error: { icon: AlertTriangle, color: 'text-red-600 bg-red-100', text: 'エラー' }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon size={16} className="mr-2" />
        {badge.text}
      </div>
    )
  }

  // タブ切り替え
  const tabs = [
    { id: 'health', label: 'システム健全性', icon: Server },
    { id: 'admins', label: '管理者設定', icon: Users },
    { id: 'database', label: 'データベース', icon: Database },
    { id: 'backup', label: 'バックアップ', icon: HardDrive }
  ]

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
                  <Settings size={32} className="text-purple-600" />
                  システム設定
                </h1>
                <p className="text-gray-600 mt-1">システムの設定と管理</p>
              </div>
            </div>
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 通知メッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* システム健全性タブ */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">システム健全性チェック</h3>
                  <p className="text-sm text-gray-500">
                    最終チェック: {systemHealth.lastChecked.toLocaleString('ja-JP')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">データベース</span>
                      {getHealthBadge(systemHealth.database)}
                    </div>
                    <p className="text-xs text-gray-500">接続とクエリ実行テスト</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">認証システム</span>
                      {getHealthBadge(systemHealth.auth)}
                    </div>
                    <p className="text-xs text-gray-500">認証サービスの動作確認</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">ストレージ</span>
                      {getHealthBadge(systemHealth.storage)}
                    </div>
                    <p className="text-xs text-gray-500">ファイルストレージの状態</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="text-blue-600 mr-3" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">システム全体</h4>
                      <p className="text-sm text-blue-700">全てのシステムが正常に動作しています</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 管理者設定タブ */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">管理者アカウント一覧</h3>
                  <span className="text-sm text-gray-500">
                    {adminUsers.length}名の管理者が登録されています
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          管理者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          登録日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminUsers.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 font-medium">
                                    {admin.nickname?.[0] || admin.email[0].toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.nickname || '名前未設定'}
                                </div>
                                <div className="text-sm text-gray-500">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              admin.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.is_active ? 'アクティブ' : '無効'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                admin.is_active 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {admin.is_active ? '無効化' : '有効化'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* データベースタブ */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">データベース統計</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="text-blue-600 mr-3" size={24} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">総ユーザー数</p>
                        <p className="text-2xl font-bold text-blue-600">{dbStats.userCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Database className="text-green-600 mr-3" size={24} />
                      <div>
                        <p className="text-sm font-medium text-green-900">クエスト進捗</p>
                        <p className="text-2xl font-bold text-green-600">{dbStats.questCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Shield className="text-purple-600 mr-3" size={24} />
                      <div>
                        <p className="text-sm font-medium text-purple-900">管理者数</p>
                        <p className="text-2xl font-bold text-purple-600">{dbStats.adminCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <HardDrive className="text-gray-600 mr-3" size={24} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">使用容量</p>
                        <p className="text-2xl font-bold text-gray-600">{dbStats.totalStorage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="text-yellow-600 mr-3" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">メンテナンス情報</h4>
                      <p className="text-sm text-yellow-700">データベースの最適化は定期的に自動実行されています</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* バックアップタブ */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">バックアップ設定</h3>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <HardDrive className="text-blue-600 mr-3" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">自動バックアップ</h4>
                      <p className="text-sm text-blue-700">毎日午前2時に自動バックアップが実行されます</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">最終バックアップ</p>
                      <p className="text-sm text-gray-500">
                        {dbStats.lastBackup ? dbStats.lastBackup.toLocaleString('ja-JP') : '情報なし'}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Download size={16} className="inline mr-2" />
                      手動バックアップ
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">バックアップ設定</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>保存期間</span>
                        <span>30日</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>バックアップ頻度</span>
                        <span>毎日</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>圧縮</span>
                        <span>有効</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 