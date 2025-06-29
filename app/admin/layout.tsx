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
    <div className="admin-layout">
      {/* 管理画面専用ヘッダー */}
      <div className="admin-header">
        <h1>🛠️ CLAFT管理画面</h1>
        <div className="admin-user-info">
          <span className="admin-user-name">{adminUser.nickname || adminUser.email}</span>
          <span className="admin-badge">管理者</span>
        </div>
      </div>
      
      <div className="admin-main">
        {/* 管理画面サイドバー */}
        <nav className="admin-nav">
          <ul>
            <li><a href="/admin" className="nav-link">📊 ダッシュボード</a></li>
            <li><a href="/admin/users" className="nav-link">👥 ユーザー管理</a></li>
            <li><a href="/admin/quests" className="nav-link">🗺️ クエスト管理</a></li>
            <li><a href="/admin/settings" className="nav-link">⚙️ システム設定</a></li>
          </ul>
        </nav>
        
        {/* メインコンテンツエリア */}
        <main className="admin-content">
          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .admin-header {
          background: #2c3e50;
          color: white;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }
        
        .admin-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }
        
        .admin-user-name {
          color: #ecf0f1;
        }
        
        .admin-badge {
          background: #e74c3c;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .admin-main {
          flex: 1;
          display: flex;
          min-height: calc(100vh - 64px);
        }
        
        .admin-nav {
          width: 250px;
          background: #34495e;
          padding: 20px 0;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        }
        
        .admin-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .admin-nav li {
          margin: 0;
        }
        
        .nav-link {
          display: block;
          padding: 16px 24px;
          color: #ecf0f1;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }
        
        .nav-link:hover {
          background-color: #2c3e50;
          border-left-color: #3498db;
          color: white;
        }
        
        .admin-content {
          flex: 1;
          background: #ffffff;
          margin: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .admin-content-inner {
          padding: 32px;
          min-height: 100%;
        }
        
        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .admin-header {
            padding: 12px 16px;
          }
          
          .admin-header h1 {
            font-size: 1.25rem;
          }
          
          .admin-user-info {
            gap: 8px;
            font-size: 0.8rem;
          }
          
          .admin-main {
            flex-direction: column;
            min-height: calc(100vh - 56px);
          }
          
          .admin-nav {
            width: 100%;
            padding: 12px 0;
            order: 2;
          }
          
          .admin-nav ul {
            display: flex;
            overflow-x: auto;
            padding: 0 16px;
          }
          
          .admin-nav li {
            flex-shrink: 0;
          }
          
          .nav-link {
            padding: 12px 16px;
            white-space: nowrap;
            border-left: none;
            border-bottom: 3px solid transparent;
          }
          
          .nav-link:hover {
            border-left-color: transparent;
            border-bottom-color: #3498db;
          }
          
          .admin-content {
            margin: 8px;
            border-radius: 4px;
            order: 1;
          }
          
          .admin-content-inner {
            padding: 20px;
          }
        }
        
        /* ダークモード対応（将来の拡張用） */
        @media (prefers-color-scheme: dark) {
          .admin-layout {
            background: #1a1a1a;
          }
          
          .admin-content {
            background: #2d2d2d;
            color: #ecf0f1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  )
} 