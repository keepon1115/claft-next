'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createBrowserSupabaseClient, safeSupabaseQuery, SupabaseError } from '@/lib/supabase/client'
import type { UserProfile, UserStats } from '@/types'
import type { User as AuthUser } from '@supabase/supabase-js'

// =====================================================
// 認証ストアの型定義
// =====================================================

interface AuthState {
  // 状態
  user: AuthUser | null
  profile: UserProfile | null
  stats: UserStats | null
  isLoading: boolean
  isAdmin: boolean
  error: string | null
  isInitialized: boolean

  // アクション
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  checkAdminStatus: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  handlePostLogin: (user: AuthUser) => Promise<void>
}

// =====================================================
// Zustand認証ストア
// =====================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // 初期状態
          user: null,
          profile: null,
          stats: null,
          isLoading: false,
          isAdmin: false,
          error: null,
          isInitialized: false,

          // =====================================================
          // 初期化
          // =====================================================
          initialize: async () => {
            const supabase = createBrowserSupabaseClient()
            
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              // 現在のセッションを取得
              const { data: { session }, error: sessionError } = await supabase.auth.getSession()
              
              if (sessionError) {
                throw new Error(`セッション取得エラー: ${sessionError.message}`)
              }

              if (session?.user) {
                set((state) => {
                  state.user = session.user
                })
                await get().handlePostLogin(session.user)
              }

              // 認証状態の変更を監視
              supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event, !!session?.user)
                
                try {
                  if (session?.user) {
                    set((state) => {
                      state.user = session.user
                    })
                    await get().handlePostLogin(session.user)
                  } else {
                    // ログアウト時の処理
                    set((state) => {
                      state.user = null
                      state.profile = null
                      state.stats = null
                      state.isAdmin = false
                      state.error = null
                    })
                  }
                } catch (error) {
                  console.error('認証状態変更エラー:', error)
                  set((state) => {
                    state.error = error instanceof Error ? error.message : '認証エラーが発生しました'
                  })
                }
              })

              set((state) => {
                state.isInitialized = true
              })

            } catch (error) {
              console.error('認証初期化エラー:', error)
              set((state) => {
                state.error = error instanceof Error ? error.message : '初期化に失敗しました'
              })
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // ログイン
          // =====================================================
          login: async (email: string, password: string) => {
            const supabase = createBrowserSupabaseClient()
            
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              // バリデーション
              if (!email.trim() || !password.trim()) {
                throw new Error('メールアドレスとパスワードを入力してください')
              }

              const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
              })

              if (error) {
                let errorMessage = 'ログインに失敗しました'
                
                if (error.message.includes('Invalid login credentials')) {
                  errorMessage = 'メールアドレスまたはパスワードが間違っています'
                } else if (error.message.includes('Email not confirmed')) {
                  errorMessage = 'メールアドレスの確認が完了していません'
                } else if (error.message.includes('Too many requests')) {
                  errorMessage = 'ログイン試行回数が上限に達しました'
                } else {
                  errorMessage = error.message
                }
                
                throw new Error(errorMessage)
              }

              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'ログインエラーが発生しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // サインアップ
          // =====================================================
          signup: async (email: string, password: string, nickname?: string) => {
            const supabase = createBrowserSupabaseClient()
            
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              // バリデーション
              if (!email.trim() || !password.trim()) {
                throw new Error('メールアドレスとパスワードを入力してください')
              }

              if (password.length < 6) {
                throw new Error('パスワードは6文字以上で入力してください')
              }

              const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                  data: {
                    display_name: nickname?.trim() || '冒険者'
                  }
                }
              })

              if (error) {
                let errorMessage = '登録に失敗しました'
                
                if (error.message.includes('already registered')) {
                  errorMessage = 'このメールアドレスは既に登録されています'
                } else if (error.message.includes('weak password')) {
                  errorMessage = 'パスワードが脆弱です'
                } else {
                  errorMessage = error.message
                }
                
                throw new Error(errorMessage)
              }

              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : '登録エラーが発生しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // ログアウト
          // =====================================================
          logout: async () => {
            const supabase = createBrowserSupabaseClient()
            
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const { error } = await supabase.auth.signOut()
              
              if (error) {
                throw new Error(`ログアウトエラー: ${error.message}`)
              }

              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'ログアウトに失敗しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // 管理者権限チェック
          // =====================================================
          checkAdminStatus: async () => {
            const { user } = get()
            
            if (!user) {
              set((state) => {
                state.isAdmin = false
              })
              return
            }

            const supabase = createBrowserSupabaseClient()

            try {
              const { data, error } = await supabase
                .from('admin_users')
                .select('is_active')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single()

              const isAdmin = !error && data?.is_active === true
              set((state) => {
                state.isAdmin = isAdmin
              })
              
              console.log('Admin status check:', { isAdmin, data, error })

            } catch (error) {
              console.error('管理者チェックエラー:', error)
              set((state) => {
                state.isAdmin = false
              })
            }
          },

          // =====================================================
          // プロフィール更新
          // =====================================================
          updateProfile: async (updates: Partial<UserProfile>) => {
            const { user } = get()
            
            if (!user) {
              const errorMessage = 'ログインが必要です'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            }

            const supabase = createBrowserSupabaseClient()
            
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const updatedProfile = await safeSupabaseQuery(async () => {
                return supabase
                  .from('users_profile')
                  .update(updates)
                  .eq('id', user.id)
                  .select()
                  .single()
              })

              set((state) => {
                state.profile = updatedProfile
              })
              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'プロフィール更新に失敗しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // エラークリア
          // =====================================================
          clearError: () => {
            set((state) => {
              state.error = null
            })
          },

          // =====================================================
          // ログイン後の処理
          // =====================================================
          handlePostLogin: async (user: AuthUser) => {
            const supabase = createBrowserSupabaseClient()

            try {
              // プロフィール処理
              const { data: existingProfile, error: profileError } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', user.id)
                .single()

              if (profileError && profileError.code === 'PGRST116') {
                // プロフィールが存在しない場合は作成
                const newProfile = await safeSupabaseQuery(async () => {
                  return supabase
                    .from('users_profile')
                    .insert({
                      id: user.id,
                      email: user.email!,
                      nickname: user.user_metadata?.display_name || '冒険者'
                    })
                    .select()
                    .single()
                })
                
                set((state) => {
                  state.profile = newProfile
                })
              } else if (existingProfile) {
                set((state) => {
                  state.profile = existingProfile
                })
              }

              // 統計処理
              const today = new Date().toISOString().split('T')[0]
              const { data: existingStats, error: statsError } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', user.id)
                .single()

              if (statsError && statsError.code === 'PGRST116') {
                // 統計が存在しない場合は作成
                const newStats = await safeSupabaseQuery(async () => {
                  return supabase
                    .from('user_stats')
                    .insert({
                      user_id: user.id,
                      login_count: 1,
                      last_login_date: today
                    })
                    .select()
                    .single()
                })
                
                set((state) => {
                  state.stats = newStats
                })
              } else if (existingStats && existingStats.last_login_date !== today) {
                // 今日初回ログインの場合は統計を更新
                const updatedStats = await safeSupabaseQuery(async () => {
                  return supabase
                    .from('user_stats')
                    .update({
                      login_count: (existingStats.login_count || 0) + 1,
                      last_login_date: today,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .select()
                    .single()
                })
                
                set((state) => {
                  state.stats = updatedStats
                })
              } else if (existingStats) {
                set((state) => {
                  state.stats = existingStats
                })
              }
              
              // 管理者権限チェック
              await get().checkAdminStatus()

            } catch (error) {
              console.error('ログイン後処理エラー:', error)
              set((state) => {
                state.error = 'ログイン後の処理でエラーが発生しました'
              })
            }
          }
        }),
        {
          name: 'claft-auth-store',
          partialize: (state) => ({
            // セキュリティのため、永続化するのは必要最小限のデータのみ
            isAdmin: state.isAdmin,
            isInitialized: state.isInitialized
          })
        }
      )
    ),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// =====================================================
// セレクター（便利関数）
// =====================================================

export const useAuth = () => {
  const store = useAuthStore()
  return {
    // 状態
    user: store.user,
    profile: store.profile,
    stats: store.stats,
    isLoading: store.isLoading,
    isAdmin: store.isAdmin,
    error: store.error,
    isInitialized: store.isInitialized,
    
    // 派生状態
    isAuthenticated: !!store.user,
    displayName: store.profile?.nickname || '冒険者',
    
    // アクション
    initialize: store.initialize,
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    updateProfile: store.updateProfile,
    clearError: store.clearError
  }
}

export const useAuthActions = () => {
  const { initialize, login, signup, logout, updateProfile, clearError } = useAuthStore()
  return { initialize, login, signup, logout, updateProfile, clearError }
}

export const useAuthState = () => {
  const { user, profile, stats, isLoading, isAdmin, error, isInitialized } = useAuthStore()
  return { 
    user, 
    profile, 
    stats, 
    isLoading, 
    isAdmin, 
    error, 
    isInitialized,
    isAuthenticated: !!user,
    displayName: profile?.nickname || '冒険者'
  }
} 