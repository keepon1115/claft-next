'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Users, Search, Calendar, Mail, User, Award, Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface UserData {
  id: string
  email: string
  nickname: string | null
  created_at: string
  last_login_date?: string | null
  quest_clear_count?: number
  total_exp?: number
  login_count?: number
  // プロフィール情報を追加
  character_type?: string | null
  skills?: string[] | null
  weakness?: string | null
  favorite_place?: string | null
  energy_charge?: string | null
  companion?: string | null
  catchphrase?: string | null
  message?: string | null
  profile_completion?: number | null
}

interface AdminInfo {
  user_id: string
  email: string
  is_active: boolean
  created_at: string
}

// =====================================================
// ユーザー管理ページ
// =====================================================

export default function UsersPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  
  // 状態管理
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [admins, setAdmins] = useState<AdminInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  const pageSize = 20
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

  // ユーザーデータ読み込み
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // ユーザープロフィール取得（プロフィール情報も含む）
      let userQuery = supabase
        .from('users_profile')
        .select('id, email, nickname, created_at, character_type, skills, weakness, favorite_place, energy_charge, companion, catchphrase, message, profile_completion', { count: 'exact' })
        .order('created_at', { ascending: false })

      // 検索フィルター適用
      if (searchTerm) {
        userQuery = userQuery.or(
          `email.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%`
        )
      }

      // ページネーション
      const startIndex = (currentPage - 1) * pageSize
      userQuery = userQuery.range(startIndex, startIndex + pageSize - 1)

      const { data: usersData, error: usersError, count } = await userQuery

      if (usersError) throw usersError

      setTotalUsers(count || 0)

      // ユーザー統計情報を取得
      const userIds = usersData?.map(u => u.id) || []
      let userStats: any[] = []
      
      if (userIds.length > 0) {
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('user_id, quest_clear_count, total_exp, last_login_date, login_count')
          .in('user_id', userIds)
        
        userStats = statsData || []
      }

      // データを結合
      const combinedUsers = usersData?.map(user => {
        const stats = userStats.find(s => s.user_id === user.id)
        return {
          ...user,
          quest_clear_count: stats?.quest_clear_count || 0,
          total_exp: stats?.total_exp || 0,
          last_login_date: stats?.last_login_date,
          login_count: stats?.login_count || 0
        }
      }) || []

      setUsers(combinedUsers)

      // 管理者情報も取得
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id, email, is_active, created_at')
        .eq('is_active', true)

      setAdmins(adminData || [])

    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
      setError('ユーザーデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin, currentPage, searchTerm])

  // 日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未ログイン'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // プロフィール詳細を表示
  const openProfileModal = (user: UserData) => {
    setSelectedUser(user)
    setShowProfileModal(true)
  }

  // プロフィールモーダルを閉じる
  const closeProfileModal = () => {
    setSelectedUser(null)
    setShowProfileModal(false)
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

  const totalPages = Math.ceil(totalUsers / pageSize)

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
                  <Users size={32} className="text-purple-600" />
                  ユーザー管理
                </h1>
                <p className="text-gray-600 mt-1">登録済みユーザーの一覧と統計情報</p>
              </div>
            </div>
            <button
              onClick={loadUsers}
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
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">管理者数</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.last_login_date).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均クエスト完了</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.quest_clear_count || 0), 0) / users.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ユーザー名またはメールアドレスで検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* ユーザーテーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ユーザー一覧 ({totalUsers}件)
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
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終ログイン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クエスト完了
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    経験値
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロフィール
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-3"></div>
                        読み込み中...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  users.map((userData) => {
                    const isAdminUser = admins.some(admin => admin.user_id === userData.id)
                    return (
                      <tr key={userData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-medium">
                                  {userData.nickname?.[0] || userData.email[0].toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userData.nickname || '名前未設定'}
                              </div>
                              <div className="text-sm text-gray-500">{userData.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isAdminUser ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              管理者
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              一般ユーザー
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userData.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userData.last_login_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userData.quest_clear_count || 0} 件
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userData.total_exp || 0} XP
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => openProfileModal(userData)}
                            className="inline-flex items-center px-3 py-1 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                          >
                            <User size={16} className="mr-1" />
                            詳細
                          </button>
                          <div className="mt-1 text-xs text-gray-500">
                            完成度: {userData.profile_completion || 0}%
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                      {' - '}
                      <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span>
                      {' / '}
                      <span className="font-medium">{totalUsers}</span>
                      {' 件'}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* プロフィール詳細モーダル */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUser.nickname || '名前未設定'} のプロフィール
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={closeProfileModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* プロフィール内容 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本情報 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    基本情報
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ニックネーム</label>
                    <p className="text-gray-900">{selectedUser.nickname || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">キャラクタータイプ</label>
                    <p className="text-gray-900">{selectedUser.character_type || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">口ぐせ</label>
                    <p className="text-gray-900">{selectedUser.catchphrase || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">プロフィール完成度</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${selectedUser.profile_completion || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{selectedUser.profile_completion || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* スキル・特性 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    スキル・特性
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">得意なこと（スキル）</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser.skills && selectedUser.skills.length > 0 ? (
                        selectedUser.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">未設定</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">ちょっと苦手なこと</label>
                    <p className="text-gray-900">{selectedUser.weakness || '未設定'}</p>
                  </div>
                </div>

                {/* パーソナル情報 */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    パーソナル情報
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">好きな場所・時間</label>
                      <p className="text-gray-900">{selectedUser.favorite_place || '未設定'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">エネルギーチャージ方法</label>
                      <p className="text-gray-900">{selectedUser.energy_charge || '未設定'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">一緒に冒険したい人</label>
                      <p className="text-gray-900">{selectedUser.companion || '未設定'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">ひとこと</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedUser.message || '未設定'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeProfileModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 