# Next.js 15 Middleware による認証・ルート保護

Next.js 15のApp Router用のミドルウェア実装です。Supabaseセッションを利用したサーバーサイド認証とルート保護を提供します。

## 📖 概要

このミドルウェアは以下の機能を提供します：

- **サーバーサイド認証**: Supabaseセッションの確認
- **ルート保護**: 認証が必要なページの保護
- **管理者権限チェック**: 管理者専用ページの保護
- **自動リダイレクト**: 未認証時の適切なリダイレクト
- **パフォーマンス最適化**: 静的ファイルのスキップ
- **開発者体験**: 詳細なログとデバッグ機能

## 🎯 保護されるルート

### 現在の設定

```typescript
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
```

### アクセス制御の動作

| ルート | 未認証ユーザー | 一般ユーザー | 管理者 |
|--------|----------------|-------------|--------|
| `/` | ✅ アクセス可能 | ✅ アクセス可能 | ✅ アクセス可能 |
| `/login` | ✅ アクセス可能 | ✅ アクセス可能 | ✅ アクセス可能 |
| `/profile/*` | ❌ `/login`にリダイレクト | ✅ アクセス可能 | ✅ アクセス可能 |
| `/admin/*` | ❌ `/login`にリダイレクト | ❌ `/unauthorized`にリダイレクト | ✅ アクセス可能 |
| `/quest/*` | ❌ `/login`にリダイレクト | ✅ アクセス可能 | ✅ アクセス可能 |

## 🚀 セットアップガイド

### 1. ファイル構成

```
project-root/
├── middleware.ts           # ← ミドルウェア本体
├── app/
│   ├── unauthorized/
│   │   └── page.tsx       # ← 権限エラーページ
│   └── login/
│       └── page.tsx       # ← ログインページ（既存）
├── lib/supabase/
│   └── client.ts          # ← Supabaseクライアント（既存）
└── ...
```

### 2. 必要な環境変数

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベーステーブル

管理者権限チェックに使用するテーブル：

```sql
-- admin_users テーブル（既存）
CREATE TABLE admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  is_active boolean DEFAULT true,
  granted_at timestamp with time zone DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS ポリシー
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理者ユーザーは自分の情報を読み取り可能" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);
```

## ⚙️ カスタマイズ

### 1. 新しいルートの追加

新しい保護されたルートを追加するには、`PROTECTED_ROUTES` 配列に追加します：

```typescript
// middleware.ts
const PROTECTED_ROUTES: ProtectedRoute[] = [
  // 既存のルート...
  
  // 新しいルートを追加
  {
    pattern: /^\/settings(\/.*)?$/,
    requireAuth: true,
    requireAdmin: false,
    redirectTo: '/login'
  },
  {
    pattern: /^\/super-admin(\/.*)?$/,
    requireAuth: true,
    requireAdmin: true,
    redirectTo: '/unauthorized'
  }
]
```

### 2. パブリックルートの設定

特定のパスをミドルウェアの対象外にするには、`shouldSkipMiddleware` 関数を修正します：

```typescript
function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = [
    // 既存のパターン...
    /^\/about$/,            // aboutページ
    /^\/contact$/,          // contactページ
    /^\/public\//,          // publicディレクトリ
    /^\/docs\//,           // ドキュメント
  ]

  return skipPatterns.some(pattern => pattern.test(pathname))
}
```

## 🔧 高度な設定

### 1. カスタム権限チェック

管理者以外の権限チェックを追加する場合：

```typescript
// より複雑な権限システムの例
async function checkUserPermission(
  supabase: any, 
  userId: string, 
  permission: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userId)
      .eq('permission', permission)
      .eq('is_active', true)
      .single()

    return !error && data
  } catch {
    return false
  }
}

// ルート設定で使用
{
  pattern: /^\/editor(\/.*)?$/,
  requireAuth: true,
  requireAdmin: false,
  customCheck: (supabase, userId) => checkUserPermission(supabase, userId, 'editor'),
  redirectTo: '/unauthorized'
}
```

### 2. 条件付きリダイレクト

リダイレクト先を動的に決定する場合：

```typescript
function getRedirectPath(pathname: string, isAuthenticated: boolean): string {
  if (!isAuthenticated) {
    // 未認証の場合、元のパスを保存してログインへ
    return `/login?redirect=${encodeURIComponent(pathname)}`
  }
  
  // 権限不足の場合
  if (pathname.startsWith('/admin')) {
    return '/unauthorized'
  }
  
  return '/login'
}
```

## 🚨 トラブルシューティング

### 1. よくある問題

#### ログが表示されない
```bash
# 開発サーバーのコンソールを確認
npm run dev

# ブラウザでアクセスしてターミナルを確認
# ミドルウェアのログが表示されるはず
```

#### 無限リダイレクト
リダイレクト先がスキップパターンに含まれているか確認：

```typescript
// これらのパスは必ずスキップパターンに含める
/^\/login$/,        // ログインページ
/^\/unauthorized$/,  // 権限エラーページ
/^\/$/              // ホームページ
```

#### セッション取得エラー
```typescript
// デバッグ用コードを追加
const { data: { session }, error: sessionError } = await supabase.auth.getSession()

if (sessionError) {
  console.error('セッションエラー詳細:', {
    error: sessionError,
    pathname,
    cookies: request.cookies.toString()
  })
}
```

### 2. デバッグ方法

#### 開発環境でのログ
```typescript
// middleware.ts の最下部で確認
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 ミドルウェア設定確認:', {
    protectedRoutes: PROTECTED_ROUTES.length,
    skipPatterns: skipPatterns.length
  })
}
```

#### レスポンスヘッダーの確認
```typescript
// ブラウザの開発者ツールで確認可能
response.headers.set('X-User-ID', session.user.id)
response.headers.set('X-User-Email', session.user.email || '')
response.headers.set('X-Middleware-Time', `${Date.now() - startTime}ms`)
```

## 📊 パフォーマンス最適化

### 1. matcher設定の調整

必要なパスのみに限定してパフォーマンス向上：

```typescript
export const config = {
  matcher: [
    // 具体的なパスを指定してパフォーマンス向上
    '/admin/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/quest/:path*'
  ]
}
```

### 2. セッションキャッシュ

頻繁なデータベースアクセスを避ける：

```typescript
// 簡単なインメモリキャッシュの例
const sessionCache = new Map()
const CACHE_DURATION = 30000 // 30秒

async function getCachedAdminStatus(userId: string): Promise<boolean | null> {
  const cacheKey = `admin:${userId}`
  const cached = sessionCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value
  }
  
  return null
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  sessionCache.set(`admin:${userId}`, {
    value: isAdmin,
    timestamp: Date.now()
  })
}
```

## 🔐 セキュリティ考慮事項

### 1. 重要なセキュリティ設定

```typescript
// CSRF保護（必要に応じて）
function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('X-CSRF-Token')
  const sessionToken = request.cookies.get('csrf-token')?.value
  return token === sessionToken
}

// レート制限（必要に応じて）
const rateLimiter = new Map()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowStart = Math.floor(now / 60000) * 60000 // 1分ウィンドウ
  const key = `${identifier}:${windowStart}`
  
  const count = rateLimiter.get(key) || 0
  if (count >= 60) { // 1分間に60回まで
    return false
  }
  
  rateLimiter.set(key, count + 1)
  return true
}
```

### 2. 本番環境での設定

```typescript
// 本番環境では詳細なエラー情報を隠す
catch (error) {
  if (process.env.NODE_ENV === 'production') {
    console.error('ミドルウェア認証エラー') // 詳細は非表示
  } else {
    console.error('ミドルウェア認証エラー詳細:', error)
  }
  
  return redirectToAuth(request, '/login')
}
```

## 🧪 テスト

### 1. 手動テスト手順

```bash
# 1. 未認証状態でのテスト
# ブラウザのシークレットモードで以下にアクセス:
# /profile → /login にリダイレクトされることを確認
# /admin → /login にリダイレクトされることを確認

# 2. 一般ユーザーでのテスト
# 一般ユーザーでログイン後:
# /profile → アクセス可能
# /admin → /unauthorized にリダイレクト

# 3. 管理者でのテスト
# 管理者ユーザーでログイン後:
# /profile → アクセス可能
# /admin → アクセス可能
```

### 2. 自動テスト例

```typescript
// __tests__/middleware.test.ts
import { middleware } from '../middleware'
import { NextRequest } from 'next/server'

describe('Middleware', () => {
  test('未認証ユーザーは保護されたルートからリダイレクトされる', async () => {
    const request = new NextRequest('http://localhost:3000/profile')
    // セッションなしでリクエスト
    
    const response = await middleware(request)
    
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/login')
  })
  
  test('管理者でないユーザーは管理者ページからリダイレクトされる', async () => {
    const request = new NextRequest('http://localhost:3000/admin')
    // 一般ユーザーのセッションでリクエスト
    
    const response = await middleware(request)
    
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/unauthorized')
  })
})
```

## 📈 監視とログ

### 1. 本番環境でのログ

```typescript
// 構造化ログの例
function logMiddlewareEvent(event: string, data: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    environment: process.env.NODE_ENV,
    ...data
  }
  
  // 本番環境では外部ログサービスへ送信
  console.log(JSON.stringify(logEntry))
}

// 使用例
logMiddlewareEvent('auth_check', {
  pathname,
  userId: session?.user?.id,
  isAdmin,
  duration: Date.now() - startTime
})
```

### 2. メトリクス収集

```typescript
// パフォーマンスと使用状況の追跡
const metrics = {
  requests: 0,
  authChecks: 0,
  adminChecks: 0,
  redirects: 0,
  errors: 0
}

// 定期的にメトリクスをレポート
setInterval(() => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Middleware Metrics:', metrics)
    // メトリクスをリセット
    Object.keys(metrics).forEach(key => metrics[key] = 0)
  }
}, 60000) // 1分ごと
```

## 🔄 アップグレードガイド

### 既存のauth.jsからの移行

1. **古いミドルウェアの削除**: 既存の認証ミドルウェアを削除
2. **新しいミドルウェアの配置**: `middleware.ts` をプロジェクトルートに配置
3. **保護ルートの確認**: `PROTECTED_ROUTES` 設定を既存の要件に合わせて調整
4. **権限エラーページの追加**: `/unauthorized` ページを作成
5. **テスト実行**: 全ての保護されたルートが正しく動作することを確認

### 段階的な移行

```typescript
// 段階的移行のための設定例
const LEGACY_MODE = process.env.LEGACY_AUTH_MODE === 'true'

if (LEGACY_MODE) {
  // 古い認証システムと並行動作
  console.log('レガシーモードで動作中')
  return NextResponse.next()
}

// 新しい認証システム
// ... 通常の処理
```

---

このミドルウェアにより、Next.js 15 App Routerで堅牢なサーバーサイド認証とルート保護が実現できます。セキュリティ、パフォーマンス、開発者体験のバランスを考慮した実装となっています。 