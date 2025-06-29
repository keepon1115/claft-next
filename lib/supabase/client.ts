import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types'
import { type NextRequest, type NextResponse } from 'next/server'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// 環境変数の型安全な取得
function getEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    throw new Error(
      'Supabase環境変数が設定されていません。.env.localファイルを確認してください。\n' +
      '必要な環境変数:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  
  return { url, anonKey }
}

/**
 * ブラウザ（クライアントサイド）用Supabaseクライアント
 * クライアントコンポーネントで使用
 */
export function createBrowserSupabaseClient() {
  try {
    const { url, anonKey } = getEnvVars()
    
    return createBrowserClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'claft-auth'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  } catch (error) {
    console.error('❌ ブラウザSupabaseクライアントの初期化に失敗:', error)
    throw error
  }
}

/**
 * サーバーコンポーネント用Supabaseクライアント
 * Server Components、Route Handlers、Middlewareで使用
 */
export function createServerSupabaseClient(
  cookieStore: ReadonlyRequestCookies
) {
  try {
    const { url, anonKey } = getEnvVars()
    
    return createServerClient<Database>(
      url,
      anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Server Componentsではクッキーの設定はできない
            // Route HandlersやMiddlewareでのみ有効
          },
          remove(name: string, options: any) {
            // Server Componentsではクッキーの削除はできない
            // Route HandlersやMiddlewareでのみ有効
          }
        }
      }
    )
  } catch (error) {
    console.error('❌ サーバーSupabaseクライアントの初期化に失敗:', error)
    throw error
  }
}

/**
 * Route Handler用Supabaseクライアント
 * API Routes（app/api/*）で使用
 */
export function createRouteHandlerSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  try {
    const { url, anonKey } = getEnvVars()
    
    return createServerClient<Database>(
      url,
      anonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options
            })
            response.cookies.set({
              name,
              value,
              ...options
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options
            })
            response.cookies.set({
              name,
              value: '',
              ...options
            })
          }
        }
      }
    )
  } catch (error) {
    console.error('❌ Route HandlerSupabaseクライアントの初期化に失敗:', error)
    throw error
  }
}

/**
 * Middleware用Supabaseクライアント
 * middleware.tsで使用
 */
export function createMiddlewareSupabaseClient(request: NextRequest) {
  try {
    const { url, anonKey } = getEnvVars()
    
    return createServerClient<Database>(
      url,
      anonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options
            })
          }
        }
      }
    )
  } catch (error) {
    console.error('❌ MiddlewareSupabaseクライアントの初期化に失敗:', error)
    throw error
  }
}

/**
 * サービスロール用Supabaseクライアント（管理用）
 * サーバーサイドでのみ使用。RLSをバイパス可能
 * 
 * 注意: このクライアントはRLSを無視するため、
 * セキュリティに十分注意して使用してください
 */
export function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceKey) {
    throw new Error(
      'サービスロール用のSupabase環境変数が設定されていません。\n' +
      '必要な環境変数:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  
  try {
    return createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('❌ サービスロールSupabaseクライアントの初期化に失敗:', error)
    throw error
  }
}

/**
 * Supabaseエラーハンドリングユーティリティ
 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

/**
 * Supabaseレスポンスのエラーハンドリング
 */
export function handleSupabaseError(error: any): never {
  if (error?.code) {
    const errorMessages: Record<string, string> = {
      'PGRST116': 'データが見つかりません',
      'PGRST201': '認証が必要です',
      'PGRST301': 'アクセス権限がありません',
      '23505': 'このデータは既に存在します',
      '23503': '関連するデータが存在しないため処理できません',
      'auth/invalid-email': '無効なメールアドレスです',
      'auth/weak-password': 'パスワードが弱すぎます',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/user-not-found': 'ユーザーが見つかりません',
      'auth/wrong-password': 'パスワードが間違っています'
    }
    
    const message = errorMessages[error.code] || error.message || 'データベースエラーが発生しました'
    throw new SupabaseError(message, error.code, error.details)
  }
  
  throw new SupabaseError(
    error?.message || 'Supabaseエラーが発生しました',
    undefined,
    error
  )
}

/**
 * 型安全なSupabaseクエリヘルパー
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await queryFn()
    
    if (error) {
      handleSupabaseError(error)
    }
    
    if (data === null) {
      throw new SupabaseError('データが見つかりません', 'PGRST116')
    }
    
    return data
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    throw new SupabaseError('予期しないエラーが発生しました', undefined, error)
  }
}

// デフォルトエクスポート（互換性のため）
export default createBrowserSupabaseClient 