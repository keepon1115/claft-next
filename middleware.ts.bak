import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/client'

// =====================================================
// 型定義
// =====================================================

interface ProtectedRoute {
  pattern: RegExp
  requireAuth: boolean
  requireAdmin: boolean
  redirectTo?: string
}

// =====================================================
// 保護されたルートの設定
// =====================================================

const PROTECTED_ROUTES: ProtectedRoute[] = [
  // 管理者専用ルート
  {
    pattern: /^\/admin(\/.*)?$/,
    requireAuth: true,
    requireAdmin: true,
    redirectTo: '/unauthorized'
  },
  // ログインユーザー専用ルート
  {
    pattern: /^\/profile(\/.*)?$/,
    requireAuth: true,
    requireAdmin: false,
    redirectTo: '/login'
  },
  // その他の認証が必要なルート
  {
    pattern: /^\/dashboard(\/.*)?$/,
    requireAuth: true,
    requireAdmin: false,
    redirectTo: '/login'
  },
  {
    pattern: /^\/quest(\/.*)?$/,
    requireAuth: true,
    requireAdmin: false,
    redirectTo: '/login'
  }
]

// =====================================================
// ミドルウェア関数
// =====================================================

/**
 * Next.js Middleware
 * ルート保護とSupabaseセッション管理を行う
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const startTime = Date.now()
  
  try {
    console.log(`🔍 ミドルウェア: ${pathname} へのアクセスチェック開始`)
    
    // 静的ファイルや特定のパスはスキップ
    if (shouldSkipMiddleware(pathname)) {
      console.log(`⏭️ ミドルウェア: ${pathname} をスキップ`)
      return NextResponse.next()
    }

    // 保護されたルートかチェック
    const protectedRoute = findProtectedRoute(pathname)
    if (!protectedRoute) {
      console.log(`✅ ミドルウェア: ${pathname} は保護されていないルート`)
      return NextResponse.next()
    }

    console.log(`🔒 ミドルウェア: ${pathname} は保護されたルート (requireAuth: ${protectedRoute.requireAuth}, requireAdmin: ${protectedRoute.requireAdmin})`)

    // Supabaseクライアントを作成
    const supabase = createMiddlewareSupabaseClient(request)
    
    // セッション確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error(`❌ ミドルウェア: セッション取得エラー`, sessionError)
      return redirectToAuth(request, protectedRoute.redirectTo || '/login')
    }

    // 認証が必要だがセッションがない場合
    if (protectedRoute.requireAuth && !session) {
      console.log(`🚫 ミドルウェア: ${pathname} は認証が必要ですが、セッションがありません`)
      return redirectToAuth(request, protectedRoute.redirectTo || '/login')
    }

    // 管理者権限が必要な場合
    if (protectedRoute.requireAdmin && session) {
      const isAdmin = await checkAdminStatus(supabase, session.user.id)
      
      if (!isAdmin) {
        console.log(`🚫 ミドルウェア: ${pathname} は管理者権限が必要ですが、ユーザーは管理者ではありません`)
        return redirectToAuth(request, '/unauthorized')
      }
      
      console.log(`👑 ミドルウェア: 管理者権限を確認しました`)
    }

    console.log(`✅ ミドルウェア: ${pathname} へのアクセスを許可 (${Date.now() - startTime}ms)`)
    
    // セッション情報をレスポンスヘッダーに追加（デバッグ用）
    const response = NextResponse.next()
    if (session) {
      response.headers.set('X-User-ID', session.user.id)
      response.headers.set('X-User-Email', session.user.email || '')
    }
    
    return response

  } catch (error) {
    console.error(`❌ ミドルウェア: 予期しないエラー`, error)
    
    // エラー時は安全側に倒してリダイレクト
    return redirectToAuth(request, '/login')
  }
}

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * ミドルウェアをスキップすべきパスかチェック
 */
function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = [
    /^\/_next\//,           // Next.jsの内部ファイル
    /^\/api\//,             // API Routes
    /^\/favicon\.ico$/,     // ファビコン
    /^\/sitemap\.xml$/,     // サイトマップ
    /^\/robots\.txt$/,      // robots.txt
    /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i, // 画像ファイル
    /\.(css|js|json)$/i,    // 静的アセット
    /^\/login$/,            // ログインページ
    /^\/signup$/,           // サインアップページ
    /^\/unauthorized$/,     // 権限エラーページ
    /^\/$/                  // ホームページ
  ]

  return skipPatterns.some(pattern => pattern.test(pathname))
}

/**
 * 保護されたルートを見つける
 */
function findProtectedRoute(pathname: string): ProtectedRoute | null {
  return PROTECTED_ROUTES.find(route => route.pattern.test(pathname)) || null
}

/**
 * 管理者権限をチェック
 */
async function checkAdminStatus(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.log(`ℹ️ ミドルウェア: 管理者チェックエラー (ユーザーは一般ユーザー)`, error.message)
      return false
    }

    const isAdmin = data?.is_active === true
    console.log(`👑 ミドルウェア: 管理者チェック結果: ${isAdmin}`)
    return isAdmin

  } catch (error) {
    console.error(`❌ ミドルウェア: 管理者権限チェック中にエラー`, error)
    return false
  }
}

/**
 * 認証ページにリダイレクト
 */
function redirectToAuth(request: NextRequest, redirectPath: string = '/login'): NextResponse {
  const url = request.nextUrl.clone()
  
  // 現在のパスをクエリパラメータとして保存（ログイン後のリダイレクト用）
  const currentPath = encodeURIComponent(url.pathname + url.search)
  
  url.pathname = redirectPath
  
  // ログインページの場合は、ログイン後のリダイレクト先を設定
  if (redirectPath === '/login') {
    url.search = `?redirect=${currentPath}`
  } else {
    url.search = ''
  }
  
  console.log(`🔄 ミドルウェア: ${request.nextUrl.pathname} から ${url.pathname} にリダイレクト`)
  
  return NextResponse.redirect(url)
}

// =====================================================
// ミドルウェア設定
// =====================================================

/**
 * ミドルウェアを実行するパスのマッチャー
 * 
 * 注意: この設定により、ミドルウェアが実行される対象を絞り込めます
 * パフォーマンスのため、必要なパスのみに限定することを推奨
 */
export const config = {
  matcher: [
    /*
     * すべてのリクエストパスにマッチし、以下を除外:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - 静的ファイル拡張子 (.png, .jpg, .jpeg, .gif, .svg, .ico, .webp, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)$).*)',
  ],
}

// =====================================================
// 開発用ヘルパー
// =====================================================

/**
 * 開発環境でのミドルウェアデバッグ情報
 * 本番環境では自動的に無効化される
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 ミドルウェア: 開発モードで動作中')
  console.log('🔒 保護されたルート:', PROTECTED_ROUTES.map(r => ({
    pattern: r.pattern.source,
    requireAuth: r.requireAuth,
    requireAdmin: r.requireAdmin,
    redirectTo: r.redirectTo
  })))
}

export default middleware 