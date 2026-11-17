'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// member_avatars(フェーズ9a)の全件取得フック。
// 広場(/members)でuser_id→アバターを引くためMapで返す。RLSでreadは全員可。

export interface MemberAvatarRow {
  user_id: string
  sprite_id: string
  nickname: string
  message: string
}

interface UseMemberAvatarsResult {
  avatars: Map<string, MemberAvatarRow>
  loading: boolean
  refetch: () => Promise<void>
}

export function useMemberAvatars(): UseMemberAvatarsResult {
  const [avatars, setAvatars] = useState<Map<string, MemberAvatarRow>>(new Map())
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  const fetchAvatars = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('member_avatars')
        .select('user_id, sprite_id, nickname, message')

      if (error) throw error

      setAvatars(new Map((data ?? []).map((row) => [row.user_id, row as MemberAvatarRow])))
    } catch (error) {
      // アバターが引けなくても広場は既存プロフィール画像で動くので、エラーは握りつぶさずログのみ
      console.error('アバター一覧取得エラー:', error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchAvatars()
  }, [fetchAvatars])

  return { avatars, loading, refetch: fetchAvatars }
}
