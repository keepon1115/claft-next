import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
// import { AdminHeader } from '@/components/admin/AdminHeader'
// import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// =====================================================
// メタデータ
// =====================================================

export const metadata: Metadata = {
  title: {
    template: '%s | CLAFT管理画面',
    default: 'CLAFT管理画面'
  },
  description: 'CLAFT管理画面 - システム管理とユーザー管理',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
}

// =====================================================
// 型定義
// =====================================================

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminUser {
  id: string
  email: string
  nickname: string | null
  isActive: boolean
  createdAt: string
}

// =====================================================
// サーバーサイド管理者権限チェック
// =====================================================

async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    // 現在のセッション取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('🔐 管理画面レイアウト: セッション取得エラー', sessionError)
      return null
    }

    if (!session) {
      console.log('🔐 管理画面レイアウト: セッションが存在しません')
      return null
    }

    // 管理者権限チェック
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('is_active, email, created_at')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      console.log('🔐 管理画面レイアウト: 管理者権限なし', adminError?.message)
      return null
    }

    // ユーザープロフィール取得
    const { data: profileData, error: profileError } = await supabase
      .from('users_profile')
      .select('nickname')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.warn('🔐 管理画面レイアウト: プロフィール取得エラー', profileError)
    }

    return {
      id: session.user.id,
      email: adminData.email,
      nickname: profileData?.nickname || null,
      isActive: adminData.is_active ?? false,
      createdAt: adminData.created_at || new Date().toISOString()
    }

  } catch (error) {
    console.error('🔐 管理画面レイアウト: 予期しないエラー', error)
    return null
  }
}

// =====================================================
// レイアウトコンポーネント
// =====================================================

export default async function AdminLayout({ children }: AdminLayoutProps) {
  console.log('🔐 管理画面レイアウト: 権限チェック開始')
  
  // サーバーサイドで管理者権限確認
  const adminUser = await getAdminUser()

  // 管理者でない場合はリダイレクト
  if (!adminUser) {
    console.log('🚫 管理画面レイアウト: 管理者権限なし - リダイレクト')
    redirect('/unauthorized')
  }

  console.log('✅ 管理画面レイアウト: 管理者権限確認完了', {
    email: adminUser.email,
    nickname: adminUser.nickname
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 管理画面専用ヘッダー */}
      <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-lg z-50">
        <h1 className="text-2xl font-semibold">🛠️ CLAFT管理画面</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-200">{adminUser.nickname || adminUser.email}</span>
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">管理者</span>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* 管理画面サイドバー */}
        <nav className="w-64 bg-slate-700 py-5 shadow-xl">
          <ul className="space-y-1">
            <li><a href="/admin" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">📊 ダッシュボード</a></li>
            <li><a href="/admin/users" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">👥 ユーザー管理</a></li>
            <li><a href="/admin/quests" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">🗺️ クエスト管理</a></li>
            <li><a href="/admin/settings" className="block px-6 py-4 text-gray-200 hover:bg-slate-600 hover:border-l-4 hover:border-blue-400 transition-all">⚙️ システム設定</a></li>
          </ul>
        </nav>
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 bg-white m-4 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 