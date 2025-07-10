# Supabaseクライアント使用例

このドキュメントでは、作成されたSupabaseクライアントの使用方法を説明します。

## 📁 ファイル構成

```
lib/supabase/
├── client.ts           # メインクライアント（このファイル）
├── examples.md         # 使用例（このファイル）
└── .gitkeep

types/
└── database.ts         # データベース型定義
```

## 🔧 環境変数設定

`.env.local`ファイルに以下を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 管理者機能が必要な場合（オプション）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📖 使用例

### 1. クライアントコンポーネントでの使用

```tsx
'use client'

import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/database'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await safeSupabaseQuery(async () => {
          return supabase
            .from('users_profile')
            .select('*')
            .eq('id', 'user-id')
            .single()
        })
        setUser(userData)
      } catch (error) {
        console.error('ユーザー取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return <div>読み込み中...</div>
  if (!user) return <div>ユーザーが見つかりません</div>

  return (
    <div>
      <h1>{user.nickname}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### 2. サーバーコンポーネントでの使用

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import type { User } from '@/types/database'

export default async function ServerUserProfile({ userId }: { userId: string }) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data: user, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return <div>ユーザーが見つかりません</div>
  }

  return (
    <div>
      <h1>{user.nickname}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### 3. API Routeでの使用

```tsx
// app/api/users/[id]/route.ts
import { createRouteHandlerSupabaseClient, handleSupabaseError } from '@/lib/supabase/client'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = new Response()
    const supabase = createRouteHandlerSupabaseClient(request, response)

    const { data: user, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return Response.json(user)
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### 4. 認証機能の実装

```tsx
'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AuthComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const handleSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: 'ユーザー名'
          }
        }
      })

      if (error) throw error
      alert('確認メールを送信しました')
    } catch (error) {
      alert(`エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      alert('ログインしました')
    } catch (error) {
      alert(`エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp} disabled={loading}>
        登録
      </button>
      <button onClick={handleSignIn} disabled={loading}>
        ログイン
      </button>
    </div>
  )
}
```

### 5. Middlewareでの使用

```tsx
// middleware.ts
import { createMiddlewareSupabaseClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabase = createMiddlewareSupabaseClient(request)
    const { data: { session } } = await supabase.auth.getSession()

    // 認証が必要なページの保護
    if (request.nextUrl.pathname.startsWith('/protected') && !session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/protected/:path*']
}
```

### 6. 型安全なデータ操作

```tsx
import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'
import type { UserInsert, UserUpdate, User } from '@/types/database'

const supabase = createBrowserSupabaseClient()

// ユーザー作成（型安全）
async function createUser(userData: UserInsert): Promise<User> {
  return safeSupabaseQuery(async () => {
    return supabase
      .from('users_profile')
      .insert(userData)
      .select()
      .single()
  })
}

// ユーザー更新（型安全）
async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  return safeSupabaseQuery(async () => {
    return supabase
      .from('users_profile')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  })
}

// ユーザー一覧取得（型安全）
async function getUsers(): Promise<User[]> {
  return safeSupabaseQuery(async () => {
    return supabase
      .from('users_profile')
      .select('*')
  })
}
```

## 🚨 エラーハンドリング

```tsx
import { SupabaseError, handleSupabaseError } from '@/lib/supabase/client'

try {
  // Supabase操作
  const { data, error } = await supabase
    .from('users_profile')
    .select('*')

  if (error) {
    handleSupabaseError(error) // 自動的にSupabaseErrorをthrow
  }
} catch (error) {
  if (error instanceof SupabaseError) {
    // カスタムエラーハンドリング
    console.error(`Supabaseエラー [${error.code}]:`, error.message)
  } else {
    // その他のエラー
    console.error('予期しないエラー:', error)
  }
}
```

## 🔐 セキュリティのベストプラクティス

### 1. RLS（Row Level Security）の設定

```sql
-- users_profileテーブルの例
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_profile
  FOR UPDATE USING (auth.uid() = id);
```

### 2. サービスロールキーの取り扱い

```tsx
// ❌ クライアントサイドでサービスロールキーは使用しない
// ✅ サーバーサイド（API Route）でのみ使用
// app/api/admin/route.ts
import { createServiceRoleSupabaseClient } from '@/lib/supabase/client'

export async function POST() {
  // 管理者認証チェック
  // const isAdmin = await checkAdminAuth()
  // if (!isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceRoleSupabaseClient()
  // RLSをバイパスした操作が可能
}
```

### 3. 環境変数の管理

```bash
# 本番環境
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-key

# 開発環境
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-key
```

## 🎯 パフォーマンス最適化

### 1. 必要なフィールドのみ選択

```tsx
// ❌ 全フィールド取得
const { data } = await supabase.from('users_profile').select('*')

// ✅ 必要なフィールドのみ
const { data } = await supabase
  .from('users_profile')
  .select('id, nickname, email')
```

### 2. ページネーション

```tsx
const { data } = await supabase
  .from('users_profile')
  .select('*')
  .range(0, 9) // 0-9番目のレコード（10件）
  .order('created_at', { ascending: false })
```

### 3. インデックスの活用

```sql
-- よく検索されるフィールドにインデックスを作成
CREATE INDEX idx_users_profile_email ON users_profile(email);
CREATE INDEX idx_quest_progress_user_id ON quest_progress(user_id);
``` 