import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/index'
import { type NextRequest, type NextResponse } from 'next/server'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// グローバル変数の型定義
declare global {
  var supabaseDevWarningShown: boolean | undefined
}

/**
 * 開発モード用のモッククライアント
 * 環境変数が設定されていない場合に使用
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      eq: function() { return this },
      order: function() { return this },
      limit: function() { return this }
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: File, options?: any) => {
          console.warn('🔧 開発モック: ストレージアップロードをシミュレーション')
          return Promise.resolve({
            data: { path, fullPath: `${bucket}/${path}` },
            error: null
          })
        },
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: (path: string) => {
          const mockUrl = `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}`
          console.warn('🔧 開発モック: モックURLを生成:', mockUrl)
          return { data: { publicUrl: mockUrl } }
        }
      })
    }
  } as any
}

// 環境変数の型安全な取得
function getEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!url || !anonKey) {
    if (isDev) {
      // 開発モードでは警告のみを表示（初回のみ）
      if (!global.supabaseDevWarningShown) {
        console.warn(
          '🔧 開発モード: Supabase環境変数が未設定です。\n' +
          '本格的な開発を行う場合は .env.local を設定してください。\n' +
          '必要な環境変数:\n' +
          '- NEXT_PUBLIC_SUPABASE_URL\n' +
          '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
        )
        global.supabaseDevWarningShown = true
      }
      return null
    } else {
      throw new Error(
        'Supabase環境変数が設定されていません。.env.localファイルを確認してください。\n' +
        '必要な環境変数:\n' +
        '- NEXT_PUBLIC_SUPABASE_URL\n' +
        '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
      )
    }
  }
  
  return { url, anonKey }
}

/**
 * ブラウザ（クライアントサイド）用Supabaseクライアント
 * クライアントコンポーネントで使用
 */
export function createBrowserSupabaseClient() {
  try {
    const envVars = getEnvVars()
    
    // 開発モードで環境変数が設定されていない場合はモッククライアントを返す
    if (!envVars) {
      return createMockSupabaseClient()
    }
    
    const { url, anonKey } = envVars
    
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
    // 開発モードではエラーをキャッチしてモッククライアントを返す
    if (process.env.NODE_ENV === 'development') {
      return createMockSupabaseClient()
    }
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
 * PostgRESTエラーの詳細情報を保持
 */
export class SupabaseError extends Error {
  public hint?: string
  public status?: number
  public originalError?: any

  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }

  /**
   * エラーの詳細情報を文字列として取得
   */
  getDetailedMessage(): string {
    const parts = [this.message]
    
    if (this.code) {
      parts.push(`Code: ${this.code}`)
    }
    
    if (this.details) {
      parts.push(`Details: ${JSON.stringify(this.details)}`)
    }
    
    if (this.hint) {
      parts.push(`Hint: ${this.hint}`)
    }
    
    if (this.status) {
      parts.push(`Status: ${this.status}`)
    }
    
    return parts.join(' | ')
  }
}

/**
 * Supabaseレスポンスのエラーハンドリング
 * 元のエラー情報を保持し、詳細なデバッグ情報を提供
 */
export function handleSupabaseError(error: any): never {
  // 空のオブジェクトや falsy な値をチェック
  if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    throw new SupabaseError('Unknown error occurred', undefined, error)
  }
  
  // 元のエラー情報をログ出力（デバッグ用）
  console.error('[Supabase] Original error:', error)
  
  if (error?.code) {
    // PostgRESTエラーコードに対する日本語メッセージ（可読性向上のため）
    const friendlyMessages: Record<string, string> = {
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
    
    // 元のメッセージを優先し、日本語メッセージは補足として使用
    const originalMessage = error.message || friendlyMessages[error.code] || 'データベースエラーが発生しました'
    
    // 元のエラー情報を全て保持
    const supabaseError = new SupabaseError(originalMessage, error.code, error.details)
    // エラーオブジェクトに追加情報を付与
    Object.assign(supabaseError, {
      hint: error.hint,
      status: error.status,
      originalError: error
    })
    
    throw supabaseError
  }
  
  // PostgRESTエラーではない場合も元のメッセージを保持
  throw new SupabaseError(
    error?.message || 'Supabaseエラーが発生しました',
    undefined,
    error
  )
}

/**
 * 型安全なSupabaseクエリヘルパー
 * 元のエラー情報を保持し、包み直しを最小限に抑制
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await queryFn()
    
    // 実際のエラーが存在する場合のみエラーハンドリング
    const hasRealError = error && 
      !(typeof error === 'object' && Object.keys(error).length === 0) &&
      error.message !== undefined
    
    if (hasRealError) {
      // 元のエラーをそのまま保持して投げる
      handleSupabaseError(error)
    }
    
    // データが null で、実際のエラーもない場合は「データなし」エラー
    if (data === null && !hasRealError) {
      throw new SupabaseError('No data returned', 'PGRST116')
    }
    
    return data
  } catch (error) {
    // SupabaseErrorは既に適切に処理されているのでそのまま再投げ
    if (error instanceof SupabaseError) {
      throw error
    }
    
    // ネットワークエラーやその他の予期しないエラー
    console.error('[Supabase] Unexpected error:', error)
    
    // 元のエラーメッセージを保持（包み直しを避ける）
    const originalMessage = error instanceof Error ? error.message : 'Unexpected error'
    throw new SupabaseError(originalMessage, undefined, error)
  }
}

// デフォルトエクスポート（互換性のため）
export default createBrowserSupabaseClient 