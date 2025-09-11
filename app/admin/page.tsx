'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthButton } from '@/components/auth/AuthButton'
import AdminDashboard from './AdminDashboard'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { grantAdminAccess } from './actions'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{email: string, nickname?: string} | null>(null)
  const [isGrantingAdmin, setIsGrantingAdmin] = useState(false)

  // 管理者権限チェック
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }

      try {
        const supabase = createBrowserSupabaseClient()
        
        // 管理者権限チェック
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_active, email')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (adminError || !adminData) {
          console.log('🔐 管理画面: 管理者権限なし')
          setIsAdmin(false)
        } else {
          console.log('✅ 管理画面: 管理者権限確認完了')
          setIsAdmin(true)
          
          // ユーザー情報取得
          const { data: profileData } = await supabase
            .from('users_profile')
            .select('nickname')
            .eq('id', user.id)
            .single()

          setUserInfo({
            email: adminData.email,
            nickname: profileData?.nickname
          })
        }
      } catch (error) {
        console.error('🔐 管理画面: 権限チェックエラー', error)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminStatus()
  }, [isAuthenticated, user])

  // 管理者権限付与処理
  const handleGrantAdminAccess = async () => {
    if (!user) return

    setIsGrantingAdmin(true)
    try {
      const result = await grantAdminAccess(user.id, user.email || '')
      
      if (result.success) {
        alert('管理者権限が付与されました！ページを再読み込みします。')
        window.location.reload()
      } else {
        alert(`エラー: ${result.error}`)
      }
    } catch (error) {
      alert('権限付与に失敗しました')
      console.error('権限付与エラー:', error)
    } finally {
      setIsGrantingAdmin(false)
    }
  }

  // ローディング中（認証チェック中）
  if (isLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">管理画面認証確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🛠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              管理画面へのログインが必要です
            </h1>
            <p className="text-gray-600">
              CLAFT管理画面は管理者権限を持つアカウントでのみアクセス可能です。
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
        </div>
      </div>
    )
  }

  // 認証済みだが管理者権限なしの場合
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              管理者権限が必要です
            </h1>
            <p className="text-gray-600 mb-4">
              現在のアカウントには管理者権限がありません。
            </p>
            
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">現在のアカウント:</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
                
                {/* デバッグ情報：ユーザーID表示 */}
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-xs text-blue-600 mb-1">管理者権限付与用ID:</p>
                  <code className="text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-800 break-all">
                    {user.id}
                  </code>
                  <p className="text-xs text-blue-600 mt-2">
                    このIDをSupabaseダッシュボードで admin_users テーブルに追加してください
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <AuthButton 
              variant="compact"
              size="md"
              redirectTo="/admin"
              defaultTab="login"
              className="w-full"
            />
            
            {/* 管理者権限自動付与ボタン（開発・セットアップ用） */}
            <button
              onClick={handleGrantAdminAccess}
              disabled={isGrantingAdmin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGrantingAdmin ? '権限付与中...' : '🔧 管理者権限を自動付与'}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 管理者権限確認済み - AdminDashboardを表示
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 管理画面専用ヘッダー */}
      <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-lg z-50">
        <h1 className="text-2xl font-semibold">🛠️ CLAFT管理画面</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-200">{userInfo?.nickname || userInfo?.email}</span>
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">管理者</span>
          <button
            onClick={async () => {
              const result = await logout()
              if (result.success) {
                router.push('/')
              } else {
                alert('ログアウトに失敗しました')
              }
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* 管理画面サイドバー */}
        <nav className="w-64 bg-slate-700 py-5 shadow-xl">
          <ul className="space-y-1">
            <li><Link href="/admin" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">📊 ダッシュボード</Link></li>
            <li><Link href="/admin/users" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">👥 ユーザー管理</Link></li>
            <li><Link href="/admin/quests" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">🗺️ クエスト管理</Link></li>
            <li><Link href="/admin/settings" className="block px-6 py-4 text-gray-200 hover:border-l-4 hover:border-blue-400 transition-all">⚙️ システム設定</Link></li>
          </ul>
        </nav>
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 bg-white m-4 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 min-h-full">
            <AdminDashboard />
          </div>
        </main>
      </div>
    </div>
  )
} 