import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PageLoadingFallback } from '@/components/common/DynamicLoader'
import { pageMetadata } from '@/lib/utils/seo'

// ==========================================
// メタデータ設定（管理者専用・noindex）
// ==========================================

export const metadata = pageMetadata.admin()

// ==========================================
// 動的インポートされた管理画面コンポーネント
// ==========================================

const DynamicAdminDashboard = dynamic(
  () => import('./AdminDashboard'),
  {
    loading: () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>管理画面を読み込み中...</p>
      </div>
    ),
    ssr: false
  }
)

// ==========================================
// サーバーサイド権限チェック
// ==========================================

async function checkAdminPermission() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)
    
    // セッション確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      redirect('/unauthorized')
    }
    
    // 管理者権限確認
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, email, is_active, created_at')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    if (adminError || !adminUser) {
      redirect('/unauthorized')
    }
    
    return {
      user: session.user,
      adminInfo: adminUser
    }
  } catch (error) {
    console.error('権限チェックエラー:', error)
    redirect('/unauthorized')
  }
}

// ==========================================
// 初期統計データ取得
// ==========================================

async function getInitialStats() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)
    
    // 並列でデータを取得
    const [
      { count: totalUsers },
      { count: pendingApprovals },
      { count: completedQuests },
      { count: activeUsers }
    ] = await Promise.all([
      // 総ユーザー数
      supabase
        .from('users_profile')
        .select('*', { count: 'exact', head: true }),
      
      // 承認待ちクエスト数
      supabase
        .from('quest_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval'),
      
      // 完了クエスト総数
      supabase
        .from('quest_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      
      // アクティブユーザー数（過去30日間にクエスト活動があったユーザー）
      supabase
        .from('quest_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])
    
    return {
      totalUsers: totalUsers || 0,
      pendingApprovals: pendingApprovals || 0,
      completedQuests: completedQuests || 0,
      activeUsers: activeUsers || 0
    }
  } catch (error) {
    console.error('統計データ取得エラー:', error)
    return {
      totalUsers: 0,
      pendingApprovals: 0,
      completedQuests: 0,
      activeUsers: 0
    }
  }
}

// ==========================================
// メインページコンポーネント
// ==========================================

export default async function AdminPage() {
  // 権限チェック
  const { user, adminInfo } = await checkAdminPermission()
  
  // 初期統計データ取得
  const initialStats = await getInitialStats()
  
  return (
    <div className="admin-page">
      <Suspense fallback={<PageLoadingFallback title="管理画面を読み込み中..." />}>
        <DynamicAdminDashboard
          user={user}
          adminInfo={adminInfo}
          initialStats={initialStats}
        />
      </Suspense>
      
      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 20px;
          color: #666;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #673AB7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ==========================================
// メタデータ
// ==========================================

export const revalidate = 300 // 5分間キャッシュ 