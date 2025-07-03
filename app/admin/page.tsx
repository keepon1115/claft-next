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
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 text-gray-600">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        <p>管理画面を読み込み中...</p>
      </div>
    )
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
      .single()
    
    if (adminError || !adminUser || adminUser.is_active !== true) {
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
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<PageLoadingFallback title="管理画面を読み込み中..." />}>
        <DynamicAdminDashboard
          user={user}
          adminInfo={adminInfo}
          initialStats={initialStats}
        />
      </Suspense>
    </div>
  )
}

// ==========================================
// メタデータ
// ==========================================

export const revalidate = 300 // 5分間キャッシュ 