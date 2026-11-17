'use client'

import { createBrowserSupabaseClient, handleSupabaseError } from '@/lib/supabase/client'
import type {
  RoboTheme,
  RoboThemeWithQuestions,
  RoboThemeClear,
  RoboWallEntry,
} from '@/types/robo'

// =====================================================
// ステージマップ用
// =====================================================

/**
 * マップ描画用のテーマ一覧を取得（表示順）。
 * 未公開テーマも行としては返る（ロック表示用）。詳細本文は含めない。
 */
export async function listThemesForMap(): Promise<
  Pick<
    RoboTheme,
    'id' | 'level' | 'theme_number' | 'title' | 'display_order' | 'is_published' | 'icon_url' | 'icon_emoji'
  >[]
> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('robo_themes')
    .select('id, level, theme_number, title, display_order, is_published, icon_url, icon_emoji')
    .order('display_order', { ascending: true })

  if (error) handleSupabaseError(error)
  return data || []
}

/**
 * ログインユーザーのクリア済みテーマ一覧
 */
export async function listThemeClears(userId: string): Promise<RoboThemeClear[]> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('robo_theme_clears')
    .select('*')
    .eq('user_id', userId)

  if (error) handleSupabaseError(error)
  return data || []
}

// =====================================================
// クイズ・問い・感想フロー用
// =====================================================

/**
 * テーマ本体＋設問一覧を取得（公開テーマのみ、RLSでも保護される）
 */
export async function getThemeWithQuestions(themeId: string): Promise<RoboThemeWithQuestions | null> {
  const supabase = createBrowserSupabaseClient()
  const { data: theme, error: themeError } = await supabase
    .from('robo_themes')
    .select('*')
    .eq('id', themeId)
    .single()

  if (themeError || !theme) return null

  const { data: questions, error: questionsError } = await supabase
    .from('robo_questions')
    .select('*')
    .eq('theme_id', themeId)
    .order('display_order', { ascending: true })

  if (questionsError) handleSupabaseError(questionsError)

  return { ...theme, robo_questions: questions || [] }
}

export async function submitQuizAnswer(params: {
  userId: string
  questionId: string
  themeId: string
  selectedIndex: number
  isCorrect: boolean
}): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.from('robo_quiz_answers').insert({
    user_id: params.userId,
    question_id: params.questionId,
    theme_id: params.themeId,
    selected_index: params.selectedIndex,
    is_correct: params.isCorrect,
  })
  if (error) handleSupabaseError(error)
}

export async function submitOpenAnswer(params: {
  userId: string
  themeId: string
  body: string
}): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.from('robo_open_answers').insert({
    user_id: params.userId,
    theme_id: params.themeId,
    body: params.body,
  })
  if (error) handleSupabaseError(error)
}

export async function submitFeedback(params: {
  userId: string
  themeId: string
  body: string
}): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.from('robo_feedbacks').insert({
    user_id: params.userId,
    theme_id: params.themeId,
    body: params.body,
  })
  if (error) handleSupabaseError(error)
}

export async function markThemeCleared(userId: string, themeId: string): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase
    .from('robo_theme_clears')
    .upsert(
      { user_id: userId, theme_id: themeId, cleared_at: new Date().toISOString() },
      { onConflict: 'user_id,theme_id' }
    )
  if (error) handleSupabaseError(error)
}

/**
 * 同テーマの他生徒の「問い」への回答ウォール。
 * 表示フラグONのものに限り、ユーザーごとに最新1件だけを新しい順で返す。
 */
export async function getOpenAnswerWall(themeId: string): Promise<RoboWallEntry[]> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('robo_open_answers')
    .select('id, user_id, body, created_at')
    .eq('theme_id', themeId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  if (error) handleSupabaseError(error)
  const rows = data || []

  const latestByUser = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row)
  }
  const latest = Array.from(latestByUser.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const userIds = latest.map((r) => r.user_id)
  const nicknameMap = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('users_profile')
      .select('id, nickname')
      .in('id', userIds)
    if (profilesError) handleSupabaseError(profilesError)
    ;(profiles || []).forEach((p) => nicknameMap.set(p.id, p.nickname || '冒険者'))
  }

  return latest.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    body: r.body,
    created_at: r.created_at,
    nickname: nicknameMap.get(r.user_id) || '冒険者',
  }))
}
