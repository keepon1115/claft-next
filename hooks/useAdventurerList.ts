'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// =====================================================
// 型定義
// =====================================================

export interface AdventurerData {
  id: string
  nickname: string
  character_type?: string
  avatar_url?: string
  profile_completion?: number
  quest_clear_count?: number
  total_exp?: number
  created_at?: string
}

interface UseAdventurerListResult {
  adventurers: AdventurerData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// =====================================================
// 冒険者一覧取得フック
// =====================================================

export function useAdventurerList(limit?: number): UseAdventurerListResult {
  const [adventurers, setAdventurers] = useState<AdventurerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()

  const fetchAdventurers = async () => {
    try {
      setLoading(true)
      setError(null)

      // プロフィールデータを取得（プロフィール完成度の高い順に並べ替え）
      let query = supabase
        .from('users_profile')
        .select('id, nickname, character_type, avatar_url, profile_completion, created_at')
        .not('nickname', 'is', null) // ニックネームがあるユーザーのみ
        .order('profile_completion', { ascending: false })
        .order('created_at', { ascending: false })

      if (typeof limit === 'number' && limit > 0) {
        query = query.limit(limit)
      }

      const { data: profileData, error: profileError } = await query

      if (profileError) {
        throw profileError
      }

      if (!profileData || profileData.length === 0) {
        setAdventurers([])
        return
      }

      // ユーザーIDのリストを作成
      const userIds = profileData.map(user => user.id)

      // 統計データを取得
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('user_id, quest_clear_count, total_exp')
        .in('user_id', userIds)

      if (statsError) {
        console.warn('統計データ取得エラー:', statsError)
      }

      // データを結合
      const combinedData: AdventurerData[] = profileData.map(profile => {
        const stats = statsData?.find(stat => stat.user_id === profile.id)
        return {
          id: profile.id,
          nickname: profile.nickname || '冒険者',
          character_type: profile.character_type || '',
          avatar_url: profile.avatar_url || '',
          profile_completion: profile.profile_completion || 0,
          quest_clear_count: stats?.quest_clear_count || 0,
          total_exp: stats?.total_exp || 0,
          created_at: profile.created_at
        }
      })

      setAdventurers(combinedData)

    } catch (error) {
      console.error('冒険者一覧取得エラー:', error)
      setError('冒険者一覧の取得に失敗しました')
      setAdventurers([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchAdventurers()
  }

  useEffect(() => {
    fetchAdventurers()
  }, [limit])

  return {
    adventurers,
    loading,
    error,
    refetch
  }
}
