'use client'

import { createBrowserSupabaseClient, safeSupabaseQuery, SupabaseError } from '@/lib/supabase/client'
import type { QuestProgress, QuestProgressInsert, QuestProgressUpdate } from '@/types/database'
import type { StageStatus, UserQuestProgress } from '@/stores/questStore'
import type { QuestStatus } from '@/types/quest'

// =====================================================
// 型定義
// =====================================================

export interface FetchUserProgressResult {
  success: boolean
  data?: UserQuestProgress
  error?: string
}

export interface SaveUserProgressResult {
  success: boolean
  data?: QuestProgress
  error?: string
}

export interface UpdateQuestStatsResult {
  success: boolean
  data?: {
    questClearCount: number
    totalExp: number
  }
  error?: string
}

export interface QuestProgressData {
  userId: string
  stageId: number
  status: QuestStatus
  googleFormSubmitted?: boolean
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  additionalData?: Record<string, any>
}

// =====================================================
// 定数
// =====================================================

const TOTAL_STAGES = 6
const EXP_PER_QUEST = 100
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_BASE = 1000 // 1秒

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * SupabaseのQuestStatusをStageStatusに変換
 */
function mapSupabaseStatusToStageStatus(supabaseStatus: string): StageStatus {
  switch (supabaseStatus) {
    case 'not_started':
      return 'locked'
    case 'in_progress':
      return 'current'
    case 'submitted':
      return 'pending_approval'
    case 'completed':
    case 'approved':
      return 'completed'
    default:
      return 'locked'
  }
}

/**
 * StageStatusをSupabaseのQuestStatusに変換
 */
function mapStageStatusToSupabaseStatus(stageStatus: StageStatus): QuestStatus {
  switch (stageStatus) {
    case 'locked':
      return 'not_started' as QuestStatus
    case 'current':
      return 'in_progress' as QuestStatus
    case 'pending_approval':
      return 'submitted' as QuestStatus
    case 'completed':
      return 'completed' as QuestStatus
    default:
      return 'not_started' as QuestStatus
  }
}

/**
 * 指数バックオフでリトライする関数
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_BASE
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) {
      throw error
    }

    // 特定のエラーはリトライしない
    if (error instanceof SupabaseError) {
      const nonRetryableCodes = ['PGRST201', 'PGRST301', '23505']
      if (error.code && nonRetryableCodes.includes(error.code)) {
        throw error
      }
    }

    console.warn(`API call failed, retrying in ${delayMs}ms. Attempts left: ${attempts - 1}`, error)
    
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return retryWithBackoff(fn, attempts - 1, delayMs * 2) // 指数バックオフ
  }
}

/**
 * 進捗データの整合性をチェックし、次のステージを適切に設定
 */
function processProgressData(rawProgress: UserQuestProgress): UserQuestProgress {
  const progress: UserQuestProgress = {}
  
  // 初期状態：全ステージをlockedに設定
  for (let i = 1; i <= TOTAL_STAGES; i++) {
    progress[i] = 'locked'
  }
  
  // データベースの状態で上書き
  Object.entries(rawProgress).forEach(([stageIdStr, status]) => {
    const stageId = parseInt(stageIdStr)
    if (stageId >= 1 && stageId <= TOTAL_STAGES) {
      progress[stageId] = status
    }
  })
  
  // 次のステージを自動的にcurrentに設定
  let hasCurrentStage = false
  for (let i = 1; i <= TOTAL_STAGES; i++) {
    if (progress[i] === 'current' || progress[i] === 'pending_approval') {
      hasCurrentStage = true
      break
    }
  }
  
  if (!hasCurrentStage) {
    // 最後にcompletedになっているステージの次をcurrentに
    let lastCompletedStage = 0
    for (let i = 1; i <= TOTAL_STAGES; i++) {
      if (progress[i] === 'completed') {
        lastCompletedStage = i
      }
    }
    
    if (lastCompletedStage === 0) {
      // 何もcompletedがない場合はステージ1をcurrentに
      progress[1] = 'current'
    } else if (lastCompletedStage < TOTAL_STAGES) {
      // 次のステージをcurrentに
      progress[lastCompletedStage + 1] = 'current'
    }
  }
  
  return progress
}

// =====================================================
// メインAPI関数
// =====================================================

/**
 * ユーザーの進捗を取得
 * quest.htmlのfetchUserProgress関数を参考に実装
 */
export async function fetchUserProgress(userId: string): Promise<FetchUserProgressResult> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  try {
    const progress = await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      
      console.log(`📊 Fetching progress for userId: ${userId}`)
      
      const { data, error } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', userId)
        .order('stage_id', { ascending: true })
      
      if (error) {
        throw new SupabaseError(
          `進捗データの取得に失敗しました: ${error.message}`,
          error.code,
          error
        )
      }
      
      const rawProgress: UserQuestProgress = {}
      
      // データベースからの結果を変換
      if (data && data.length > 0) {
        data.forEach((record) => {
          const stageId = record.stage_id
          const status = mapSupabaseStatusToStageStatus(record.status)
          rawProgress[stageId] = status
        })
      }
      
      // 進捗データの整合性チェックと処理
      const processedProgress = processProgressData(rawProgress)
      
      console.log('✅ Progress fetched and processed:', processedProgress)
      return processedProgress
    })

    return {
      success: true,
      data: progress
    }

  } catch (error) {
    console.error('❌ Error fetching user progress:', error)
    
    // エラー時はデフォルトの進捗を返す
    const defaultProgress: UserQuestProgress = {
      1: 'current'
    }
    for (let i = 2; i <= TOTAL_STAGES; i++) {
      defaultProgress[i] = 'locked'
    }
    
    return {
      success: false,
      data: defaultProgress,
      error: error instanceof Error ? error.message : '進捗の取得中にエラーが発生しました'
    }
  }
}

/**
 * ユーザーの進捗を保存
 * quest.htmlのsaveUserProgress関数を参考に実装
 */
export async function saveUserProgress(
  userId: string,
  stageId: number,
  status: StageStatus,
  additionalData: Record<string, any> = {}
): Promise<SaveUserProgressResult> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  if (stageId < 1 || stageId > TOTAL_STAGES) {
    return {
      success: false,
      error: `無効なステージID: ${stageId}`
    }
  }

  try {
    const result = await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      const now = new Date().toISOString()
      const supabaseStatus = mapStageStatusToSupabaseStatus(status)
      
      console.log(`💾 Saving progress for userId: ${userId}, stageId: ${stageId}, status: ${status}`)
      
      // 更新データの構築
      const updateData: QuestProgressInsert = {
        user_id: userId,
        stage_id: stageId,
        status: supabaseStatus,
        updated_at: now,
        ...additionalData
      }
      
      // ステータスに応じて追加フィールドを設定
      if (status === 'completed') {
        updateData.approved_at = now
      } else if (status === 'pending_approval') {
        updateData.submitted_at = now
        if (additionalData.google_form_submitted) {
          updateData.google_form_submitted = true
        }
      }
      
      const { data, error } = await supabase
        .from('quest_progress')
        .upsert(updateData, {
          onConflict: 'user_id,stage_id'
        })
        .select()
        .single()
      
      if (error) {
        throw new SupabaseError(
          `進捗の保存に失敗しました: ${error.message}`,
          error.code,
          error
        )
      }
      
      console.log('✅ Progress saved:', data)
      return data
    })

    // 完了時は統計情報も更新
    if (status === 'completed') {
      console.log('🎯 Quest completed, updating stats...')
      const statsResult = await updateQuestStats(userId)
      if (!statsResult.success) {
        console.warn('⚠️ Stats update failed:', statsResult.error)
      }
    }

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('❌ Error saving user progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '進捗の保存中にエラーが発生しました'
    }
  }
}

/**
 * クエスト統計情報を更新
 * quest.htmlのupdateQuestStats関数を参考に実装
 */
export async function updateQuestStats(userId: string): Promise<UpdateQuestStatsResult> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  try {
    const result = await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      
      console.log(`📈 Updating quest stats for userId: ${userId}`)
      
      // 現在の統計を取得
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // データが存在しない場合は新規作成、存在する場合は更新
      let questClearCount = 1
      let totalExp = EXP_PER_QUEST
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116以外のエラーは処理する
        throw new SupabaseError(
          `統計データの取得に失敗しました: ${fetchError.message}`,
          fetchError.code,
          fetchError
        )
      }
      
      if (currentStats) {
        questClearCount = (currentStats.quest_clear_count || 0) + 1
        totalExp = (currentStats.total_exp || 0) + EXP_PER_QUEST
      }
      
      // 統計を更新
      const { data: updatedStats, error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          quest_clear_count: questClearCount,
          total_exp: totalExp,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()
      
      if (updateError) {
        throw new SupabaseError(
          `統計の更新に失敗しました: ${updateError.message}`,
          updateError.code,
          updateError
        )
      }
      
      console.log('✅ Quest stats updated:', updatedStats)
      return {
        questClearCount,
        totalExp
      }
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('❌ Error updating quest stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '統計の更新中にエラーが発生しました'
    }
  }
}

/**
 * 特定のステージの詳細情報を取得
 */
export async function fetchStageDetails(
  userId: string,
  stageId: number
): Promise<{ success: boolean; data?: QuestProgress; error?: string }> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  if (stageId < 1 || stageId > TOTAL_STAGES) {
    return {
      success: false,
      error: `無効なステージID: ${stageId}`
    }
  }

  try {
    const result = await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      
      const { data, error } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('stage_id', stageId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw new SupabaseError(
          `ステージ詳細の取得に失敗しました: ${error.message}`,
          error.code,
          error
        )
      }
      
      return data
    })

    return {
      success: true,
      data: result || undefined
    }

  } catch (error) {
    console.error('❌ Error fetching stage details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ステージ詳細の取得中にエラーが発生しました'
    }
  }
}

/**
 * 複数ステージの進捗を一括更新
 */
export async function bulkUpdateProgress(
  userId: string,
  updates: Array<{
    stageId: number
    status: StageStatus
    additionalData?: Record<string, any>
  }>
): Promise<SaveUserProgressResult> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  if (!updates || updates.length === 0) {
    return {
      success: false,
      error: '更新データが指定されていません'
    }
  }

  try {
    const result = await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      const now = new Date().toISOString()
      
      console.log(`📦 Bulk updating progress for userId: ${userId}, updates:`, updates)
      
      const bulkData: QuestProgressInsert[] = updates.map(update => {
        const supabaseStatus = mapStageStatusToSupabaseStatus(update.status)
        
        const updateData: QuestProgressInsert = {
          user_id: userId,
          stage_id: update.stageId,
          status: supabaseStatus,
          updated_at: now,
          ...(update.additionalData || {})
        }
        
        // ステータスに応じて追加フィールドを設定
        if (update.status === 'completed') {
          updateData.approved_at = now
        } else if (update.status === 'pending_approval') {
          updateData.submitted_at = now
        }
        
        return updateData
      })
      
      const { data, error } = await supabase
        .from('quest_progress')
        .upsert(bulkData, {
          onConflict: 'user_id,stage_id'
        })
        .select()
      
      if (error) {
        throw new SupabaseError(
          `一括更新に失敗しました: ${error.message}`,
          error.code,
          error
        )
      }
      
      console.log('✅ Bulk progress updated:', data)
      return data
    })

    // 完了したステージがある場合は統計情報も更新
    const completedCount = updates.filter(update => update.status === 'completed').length
    if (completedCount > 0) {
      console.log(`🎯 ${completedCount} quests completed, updating stats...`)
      const statsResult = await updateQuestStats(userId)
      if (!statsResult.success) {
        console.warn('⚠️ Stats update failed:', statsResult.error)
      }
    }

    return {
      success: true,
      data: Array.isArray(result) ? result[0] : result
    }

  } catch (error) {
    console.error('❌ Error bulk updating progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括更新中にエラーが発生しました'
    }
  }
}

/**
 * ユーザーの全進捗をリセット
 */
export async function resetUserProgress(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId?.trim()) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  try {
    await retryWithBackoff(async () => {
      const supabase = createBrowserSupabaseClient()
      
      console.log(`🔄 Resetting progress for userId: ${userId}`)
      
      const { error } = await supabase
        .from('quest_progress')
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        throw new SupabaseError(
          `進捗のリセットに失敗しました: ${error.message}`,
          error.code,
          error
        )
      }
      
      console.log('✅ Progress reset successfully')
    })

    return {
      success: true
    }

  } catch (error) {
    console.error('❌ Error resetting user progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '進捗のリセット中にエラーが発生しました'
    }
  }
}

// =====================================================
// エクスポート
// =====================================================

export {
  TOTAL_STAGES,
  EXP_PER_QUEST,
  mapSupabaseStatusToStageStatus,
  mapStageStatusToSupabaseStatus,
  processProgressData
} 