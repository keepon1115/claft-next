'use client'

import { createBrowserSupabaseClient, safeSupabaseQuery, SupabaseError } from './client'
import { useEffect, useState, useCallback } from 'react'
import type { UserProfile, Database } from '@/types/index'
import type { User as AuthUser } from '@supabase/supabase-js'

/**
 * Supabaseクライアントを取得するhook
 */
export function useSupabase() {
  const [client] = useState(() => createBrowserSupabaseClient())
  return client
}

/**
 * 認証状態を管理するhook
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('セッション取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await safeSupabaseQuery(async () => {
        return supabase
          .from('users_profile')
          .select('*')
          .eq('id', userId)
          .single()
      })
      setProfile(profileData)
    } catch (error) {
      if (error instanceof SupabaseError && error.code === 'PGRST116') {
        // プロフィールが存在しない場合は作成
        try {
          const newProfile = await safeSupabaseQuery(async () => {
            return supabase
              .from('users_profile')
              .insert({
                id: userId,
                email: user?.email || '',
                nickname: user?.user_metadata?.display_name || '冒険者'
              })
              .select()
              .single()
          })
          setProfile(newProfile)
        } catch (createError) {
          console.error('プロフィール作成エラー:', createError)
        }
      } else {
        console.error('プロフィール取得エラー:', error)
      }
    }
  }

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || '冒険者'
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [supabase])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const updatedProfile = await safeSupabaseQuery(async () => {
        return supabase
          .from('users_profile')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
      })
      
      setProfile(updatedProfile)
      return { data: updatedProfile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase, user])

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }
}

/**
 * データをリアルタイムで監視するhook
 */
export function useRealtimeData<
  TTable extends keyof Database['public']['Tables']
>(
  table: TTable,
  filter?: { column: string; value: any }
) {
  type RowType = Database['public']['Tables'][TTable]['Row']
  const [data, setData] = useState<RowType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select('*')
        
        if (filter) {
          query = query.eq(filter.column, filter.value)
        }

        const { data: fetchedData, error } = await query

        if (error) throw error
        setData((fetchedData as unknown as RowType[]) || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // リアルタイム購読
    let query = supabase.channel(`realtime-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table as string,
        filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
      }, () => {
        fetchData() // データ変更時に再取得
      })

    query.subscribe()

    return () => {
      supabase.removeChannel(query)
    }
  }, [table, filter?.column, filter?.value, supabase])

  return { data, loading, error }
}

/**
 * 管理者権限をチェックするhook
 */
export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = useSupabase()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        setIsAdmin(!error && data?.is_active === true)
      } catch (error) {
        console.error('管理者チェックエラー:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, supabase])

  return { isAdmin, loading }
}

/**
 * ユーザー統計情報を取得するhook
 */
export function useUserStats(userId?: string) {
  const [stats, setStats] = useState<Database['public']['Tables']['user_stats']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = useSupabase()

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const statsData = await safeSupabaseQuery(async () => {
          return supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', targetUserId)
            .single()
        })
        setStats(statsData)
      } catch (err) {
        if (err instanceof SupabaseError && err.code === 'PGRST116') {
          // 統計データが存在しない場合は作成
          try {
            const newStats = await safeSupabaseQuery(async () => {
              return supabase
                .from('user_stats')
                .insert({
                  user_id: targetUserId,
                  login_count: 1,
                  last_login_date: new Date().toISOString().split('T')[0]
                })
                .select()
                .single()
            })
            setStats(newStats)
          } catch (createError) {
            setError(createError as Error)
          }
        } else {
          setError(err as Error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [targetUserId, supabase])

  const updateStats = useCallback(async (updates: Partial<Database['public']['Tables']['user_stats']['Update']>) => {
    if (!targetUserId) return

    try {
      const updatedStats = await safeSupabaseQuery(async () => {
        return supabase
          .from('user_stats')
          .update(updates)
          .eq('user_id', targetUserId)
          .select()
          .single()
      })
      setStats(updatedStats)
      return { data: updatedStats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase, targetUserId])

  return { stats, loading, error, updateStats }
}

/**
 * クエスト進行状況を管理するhook
 */
export function useQuestProgress(userId?: string) {
  const [progress, setProgress] = useState<Database['public']['Tables']['quest_progress']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = useSupabase()

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const progressData = await safeSupabaseQuery(async () => {
          return supabase
            .from('quest_progress')
            .select('*')
            .eq('user_id', targetUserId)
            .order('stage_id', { ascending: true })
        })
        setProgress(progressData)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [targetUserId, supabase])

  const submitStage = useCallback(async (stageId: number) => {
    if (!targetUserId) throw new Error('ログインが必要です')

    try {
      const newProgress = await safeSupabaseQuery(async () => {
        return supabase
          .from('quest_progress')
          .upsert({
            user_id: targetUserId,
            stage_id: stageId,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single()
      })

      // 進行状況を更新 - null安全処理
      setProgress(prev => {
        // 安全な処理: null値を除外し、対象ステージを更新
        const filtered = prev.filter((p): p is NonNullable<typeof p> => p !== null && p.stage_id !== stageId)
        return [...filtered, newProgress]
      })

      return { data: newProgress, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase, targetUserId])

  return { progress, loading, error, submitStage }
} 