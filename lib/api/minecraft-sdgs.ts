'use client'

import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'

// =====================================================
// 型定義
// =====================================================

export interface MinecraftSdgsProgressRow {
  id: string
  user_id: string
  stage_id: number
  status: string
  sdgs_video_watched_at: string | null
  sdgs_form_submitted: boolean
  sdgs_form_submitted_at: string | null
  sdgs_form_response: string | null
  programming_video_watched_at: string | null
  programming_form_submitted: boolean
  programming_form_submitted_at: string | null
  programming_form_response: string | null
  completed_at: string | null
  feedback_message: string | null
  submitted_at: string | null
  approved_at: string | null
  approved_by: string | null
  rejected_at: string | null
  rejected_by: string | null
  rejection_reason: string | null
  baseline_stage: number
  created_at: string
  updated_at: string
}

export interface MinecraftSdgsStageRow {
  id: number
  title: string
  description: string
  message: string
  sdgs_goal: number | null
  sdgs_work_video_url: string | null
  sdgs_form_url: string | null
  sdgs_support_print_url?: string | null
  sdgs_stage_download_url?: string | null
  programming_work_video_url: string | null
  programming_form_url: string | null
  programming_support_print_url?: string | null
  programming_ap_dojo_url?: string | null
  icon_url: string | null
  fallback_icon: string
  is_published: boolean
  display_order: number
}

export interface MinecraftSdgsStatsRow {
  id: string
  user_id: string
  total_stages: number
  completed_stages: number
  current_stage: number | null
  progress_percentage: number
  sdgs_goals_completed: number[]
  sdgs_videos_watched: number
  sdgs_works_completed: number
  programming_videos_watched: number
  programming_works_completed: number
  total_time_spent_minutes: number
  baseline_stage: number
  first_stage_started_at: string | null
  last_stage_completed_at: string | null
  last_activity_at: string
  created_at: string
  updated_at: string
}

// =====================================================
// ステージ定義関連API
// =====================================================

/**
 * 全ステージ定義を取得
 */
export async function fetchMinecraftSdgsStages(): Promise<MinecraftSdgsStageRow[]> {
  const supabase = createBrowserSupabaseClient()
  
  return await safeSupabaseQuery(() => 
    supabase
      .from('minecraft_sdgs_stages')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
  )
}

/**
 * 特定のステージ定義を取得
 */
export async function fetchMinecraftSdgsStage(stageId: number): Promise<MinecraftSdgsStageRow | null> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    return await safeSupabaseQuery(() => 
      supabase
        .from('minecraft_sdgs_stages')
        .select('*')
        .eq('id', stageId)
        .eq('is_published', true)
        .single()
    )
  } catch (error) {
    console.warn(`ステージ${stageId}の定義取得に失敗:`, error)
    return null
  }
}

// =====================================================
// 進捗管理関連API
// =====================================================

/**
 * ユーザーの全進捗を取得
 */
export async function fetchUserMinecraftSdgsProgress(userId: string): Promise<MinecraftSdgsProgressRow[]> {
  const supabase = createBrowserSupabaseClient()
  
  return await safeSupabaseQuery(() => 
    supabase
      .from('minecraft_sdgs_progress')
      .select('*')
      .eq('user_id', userId)
      .order('stage_id', { ascending: true })
  )
}

/**
 * 特定ステージの進捗を取得
 */
export async function fetchStageProgress(userId: string, stageId: number): Promise<MinecraftSdgsProgressRow | null> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    return await safeSupabaseQuery(() => 
      supabase
        .from('minecraft_sdgs_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('stage_id', stageId)
        .single()
    )
  } catch (error) {
    // データが存在しない場合は正常
    if (error instanceof Error && error.message.includes('No data returned')) {
      return null
    }
    console.warn(`ステージ${stageId}の進捗取得に失敗:`, error)
    return null
  }
}

/**
 * 進捗を作成または更新
 */
export async function upsertStageProgress(
  userId: string, 
  stageId: number, 
  updates: Partial<MinecraftSdgsProgressRow>
): Promise<MinecraftSdgsProgressRow> {
  const supabase = createBrowserSupabaseClient()
  
  const data = {
    user_id: userId,
    stage_id: stageId,
    updated_at: new Date().toISOString(),
    ...updates
  }

  return await safeSupabaseQuery(() => 
    supabase
      .from('minecraft_sdgs_progress')
      .upsert(data, { onConflict: 'user_id,stage_id' })
      .select()
      .single()
  )
}

/**
 * SDGsワーク動画視聴完了
 */
export async function markSdgsVideoWatched(userId: string, stageId: number): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'sdgs_video_watched',
    sdgs_video_watched_at: new Date().toISOString()
  })
}

/**
 * SDGsワーク完了
 */
export async function markSdgsWorkCompleted(
  userId: string, 
  stageId: number, 
  formResponse?: string
): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'sdgs_work_completed',
    sdgs_form_submitted: true,
    sdgs_form_submitted_at: new Date().toISOString(),
    sdgs_form_response: formResponse
  })
}

/**
 * マイクラワーク動画視聴完了
 */
export async function markProgrammingVideoWatched(userId: string, stageId: number): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'programming_video_watched',
    programming_video_watched_at: new Date().toISOString()
  })
}

/**
 * マイクラワーク完了
 */
export async function markProgrammingWorkCompleted(
  userId: string, 
  stageId: number, 
  formResponse?: string
): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'programming_work_completed',
    programming_form_submitted: true,
    programming_form_submitted_at: new Date().toISOString(),
    programming_form_response: formResponse
  })
}

/**
 * ステージ完了申請（承認待ち）
 */
export async function submitStageForApproval(userId: string, stageId: number): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'pending_approval',
    submitted_at: new Date().toISOString()
  })
}

/**
 * ステージ完了（承認不要の場合）
 */
export async function markStageCompleted(userId: string, stageId: number): Promise<MinecraftSdgsProgressRow> {
  return upsertStageProgress(userId, stageId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    approved_by: null // システム自動承認
  })
}

// =====================================================
// 統計関連API
// =====================================================

/**
 * ユーザー統計を取得
 */
export async function fetchUserMinecraftSdgsStats(userId: string): Promise<MinecraftSdgsStatsRow | null> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    return await safeSupabaseQuery(() => 
      supabase
        .from('minecraft_sdgs_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
    )
  } catch (error) {
    // 統計データが存在しない場合は正常（初回ユーザー）
    if (error instanceof Error && error.message.includes('No data returned')) {
      return null
    }
    console.warn(`統計データの取得に失敗:`, error)
    return null
  }
}

/**
 * 統計の初期化（初回ユーザー用）
 */
export async function initializeUserStats(userId: string): Promise<MinecraftSdgsStatsRow> {
  const supabase = createBrowserSupabaseClient()
  
  return await safeSupabaseQuery(() => 
    supabase
      .from('minecraft_sdgs_stats')
      .insert({
        user_id: userId,
        first_stage_started_at: new Date().toISOString()
      })
      .select()
      .single()
  )
}

// =====================================================
// 次のステージの解放
// =====================================================

/**
 * 次のステージを解放
 */
export async function unlockNextStage(userId: string, currentStageId: number): Promise<void> {
  const nextStageId = currentStageId + 1
  
  if (nextStageId <= 19) {
    // 次のステージが存在する場合は解放
    await upsertStageProgress(userId, nextStageId, {
      status: 'current'
    })
  }
}

// =====================================================
// 承認フロー関連API
// =====================================================

/**
 * 承認待ちステージ一覧を取得（管理者用）
 */
export async function fetchPendingApprovals(): Promise<MinecraftSdgsProgressRow[]> {
  const supabase = createBrowserSupabaseClient()
  
  return await safeSupabaseQuery(() => 
    supabase
      .from('minecraft_sdgs_progress')
      .select('*')
      .eq('status', 'pending_approval')
      .order('submitted_at', { ascending: true })
  )
}

/**
 * ユーザーの基準ステージを取得
 */
export async function fetchUserBaselineStage(userId: string): Promise<number> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const stats = await safeSupabaseQuery(() => 
      supabase
        .from('minecraft_sdgs_stats')
        .select('baseline_stage')
        .eq('user_id', userId)
        .single()
    ) as { baseline_stage: number } | null
    return stats?.baseline_stage || 0
  } catch (error) {
    console.warn('基準ステージ取得エラー:', error)
    return 0
  }
}

/**
 * ステージが承認必要かどうかを判定
 */
export async function shouldRequireApproval(userId: string, stageId: number): Promise<boolean> {
  const baselineStage = await fetchUserBaselineStage(userId)
  return stageId > baselineStage
}

// =====================================================
// デモモード用データ生成
// =====================================================

/**
 * デモモード用の統計データを生成
 */
export function generateDemoStats(): MinecraftSdgsStatsRow {
  return {
    id: 'demo',
    user_id: 'demo',
    total_stages: 19,
    completed_stages: 0,
    current_stage: 1,
    progress_percentage: 0,
    sdgs_goals_completed: [],
    sdgs_videos_watched: 0,
    sdgs_works_completed: 0,
    programming_videos_watched: 0,
    programming_works_completed: 0,
    total_time_spent_minutes: 0,
    baseline_stage: 0,
    first_stage_started_at: null,
    last_stage_completed_at: null,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}