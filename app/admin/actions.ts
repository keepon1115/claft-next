'use server'

import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * 管理者権限チェック
 */
async function checkAdminPermission() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)
  
  try {
    // セッション確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      throw new Error('認証が必要です')
    }
    
    // 管理者権限確認
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, email, is_active')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    if (adminError || !adminUser) {
      throw new Error('管理者権限がありません')
    }
    
    return {
      userId: session.user.id,
      email: adminUser.email,
      supabase
    }
  } catch (error) {
    console.error('権限チェックエラー:', error)
    redirect('/unauthorized')
  }
}

/**
 * ユーザー情報を複数のソースから取得するヘルパー関数
 */
async function getUserInfo(supabase: any, userId: string) {
  try {
    // まず users_profile から取得
    const { data: profile } = await supabase
      .from('users_profile')
      .select('id, nickname, email')
      .eq('id', userId)
      .single()
    
    if (profile?.email) {
      return profile
    }
    
    // users_profile にない場合、auth.users から取得を試行
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      if (!error && users) {
        const authUser = users.find(u => u.id === userId)
        if (authUser) {
          return {
            id: userId,
            nickname: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            email: authUser.email || `user-${userId.substring(0, 8)}@example.com`
          }
        }
      }
    } catch (authError) {
      console.warn('auth.admin.listUsers エラー:', authError)
    }
    
    // デフォルト値を返す
    return {
      id: userId,
      nickname: null,
      email: `user-${userId.substring(0, 8)}@example.com`
    }
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    return {
      id: userId,
      nickname: null,
      email: `user-${userId.substring(0, 8)}@example.com`
    }
  }
}

/**
 * 統計情報更新
 */
export async function updateUserStats(userId: string, action: 'quest_completed' | 'login') {
  try {
    const { supabase } = await checkAdminPermission()
    
    let updateData: any = {
      user_id: userId,
      updated_at: new Date().toISOString()
    }
    
    if (action === 'quest_completed') {
      // 現在の統計を取得
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('quest_clear_count, total_exp')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('統計取得エラー:', fetchError)
      }
      
      // 経験値は100ポイント/クエスト
      const experienceGain = 100
      updateData.quest_clear_count = (currentStats?.quest_clear_count || 0) + 1
      updateData.total_exp = (currentStats?.total_exp || 0) + experienceGain
      
    } else if (action === 'login') {
      // ログイン時の統計更新
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('login_count')
        .eq('user_id', userId)
        .maybeSingle()
      
      updateData.login_count = (currentStats?.login_count || 0) + 1
      updateData.last_login_date = new Date().toISOString().split('T')[0] // 日付のみ
    }
    
    const { error: updateError } = await supabase
      .from('user_stats')
      .upsert(updateData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
    
    if (updateError) {
      throw updateError
    }
    
    return { success: true, action, userId }
    
  } catch (error) {
    console.error('統計更新エラー:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '統計更新に失敗しました',
      action,
      userId 
    }
  }
}

/**
 * クエスト承認
 */
export async function approveQuest(userId: string, stageId: number) {
  try {
    const { userId: adminUserId, supabase } = await checkAdminPermission()
    
    // 入力値検証
    if (!userId || !stageId || stageId < 1 || stageId > 12) {
      throw new Error('無効なパラメータです')
    }
    
    // 現在のクエスト状態を確認
    const { data: currentQuest, error: questError } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .eq('status', 'pending_approval')
      .single()
    
    if (questError || !currentQuest) {
      throw new Error('承認待ちのクエストが見つかりません')
    }
    
    // トランザクション的な処理
    const updates = []
    
    // 1. 現在のステージを完了に更新
    const updateCurrentStage = supabase
      .from('quest_progress')
      .update({
        status: 'completed',
        approved_at: new Date().toISOString(),
        approved_by: adminUserId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('stage_id', stageId)
    
    updates.push(updateCurrentStage)
    
    // 2. 次のステージの処理
    if (stageId < 6) {
      // ステージ1-5の場合は通常の次ステージ解放
      const nextStageId = stageId + 1
      
      // 次のステージのレコードが存在するか確認
      const { data: existingNext, error: checkError } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('stage_id', nextStageId)
        .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      if (!existingNext) {
        // 存在しない場合は新規作成
        const insertNextStage = supabase
          .from('quest_progress')
          .insert({
            user_id: userId,
            stage_id: nextStageId,
            status: 'current',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        updates.push(insertNextStage)
      } else if (existingNext.status === 'locked') {
        // 存在するがロック状態の場合は解放
        const unlockNextStage = supabase
          .from('quest_progress')
          .update({ 
            status: 'current',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('stage_id', nextStageId)
        
        updates.push(unlockNextStage)
      }
    } else if (stageId === 6) {
      // ステージ6承認の場合は山エリア（ステージ7）を解放
      const { data: existingStage7, error: checkError } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('stage_id', 7)
        .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      if (!existingStage7) {
        // ステージ7が存在しない場合は新規作成
        const insertStage7 = supabase
          .from('quest_progress')
          .insert({
            user_id: userId,
            stage_id: 7,
            status: 'current',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        updates.push(insertStage7)
      } else if (existingStage7.status === 'locked') {
        // 存在するがロック状態の場合は解放
        const unlockStage7 = supabase
          .from('quest_progress')
          .update({ 
            status: 'current',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('stage_id', 7)
        
        updates.push(unlockStage7)
      }
    } else if (stageId >= 7 && stageId < 12) {
      // 7-11: 通常の次ステージ解放（7→8 ... 11→12）
      const nextStageId = stageId + 1
      const { data: existingNext, error: checkError } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('stage_id', nextStageId)
        .maybeSingle()
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      if (!existingNext) {
        const insertNextStage = supabase
          .from('quest_progress')
          .insert({
            user_id: userId,
            stage_id: nextStageId,
            status: 'current',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        updates.push(insertNextStage)
      } else if (existingNext.status === 'locked') {
        const unlockNextStage = supabase
          .from('quest_progress')
          .update({ status: 'current', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('stage_id', nextStageId)
        updates.push(unlockNextStage)
      }
    } else if (stageId === 12) {
      // 12承認：次の数値ステージはなし。ジブンクラフト解放はクライアントのcheckAreaUnlockで処理
      // ここでは特別なDB処理は不要（完了更新は既にupdatesに含まれている）
    }
    
    // 並列実行でパフォーマンス向上
    const results = await Promise.all(updates)
    
    // エラーチェック
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      throw new Error(`データベース更新エラー: ${errors.map(e => e.error?.message || '不明なエラー').join(', ')}`)
    }
    
    // 3. 統計情報の更新
    await updateUserStats(userId, 'quest_completed')
    
    // キャッシュを再検証（エラーが発生しても処理を継続）
    try {
      revalidatePath('/admin')
    } catch (revalidateError) {
      console.warn('キャッシュ再検証エラー:', revalidateError)
    }
    
    return {
      success: true,
      message: `ステージ${stageId}を承認しました`,
      nextStageUnlocked: stageId <= 11
    }
    
  } catch (error) {
    console.error('承認エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '承認処理に失敗しました'
    }
  }
}

/**
 * クエスト却下
 */
export async function rejectQuest(userId: string, stageId: number) {
  try {
    const { userId: adminUserId, supabase } = await checkAdminPermission()
    
    // 入力値検証
    if (!userId || !stageId || stageId < 1 || stageId > 6) {
      throw new Error('無効なパラメータです')
    }
    
    // 現在のクエスト状態を確認
    const { data: currentQuest, error: questError } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .eq('status', 'pending_approval')
      .single()
    
    if (questError || !currentQuest) {
      throw new Error('承認待ちのクエストが見つかりません')
    }
    
    // ステータスを「挑戦中」に戻す
    const { error } = await supabase
      .from('quest_progress')
      .update({
        status: 'current',
        rejected_at: new Date().toISOString(),
        rejected_by: adminUserId,
        updated_at: new Date().toISOString(),
        // 承認関連の情報をクリア（再提出の準備）
        approved_at: null,
        approved_by: null,
        google_form_submitted: false
      })
      .eq('user_id', userId)
      .eq('stage_id', stageId)
    
    if (error) {
      throw error
    }
    
    // キャッシュを再検証（エラーが発生しても処理を継続）
    try {
      revalidatePath('/admin')
    } catch (revalidateError) {
      console.warn('キャッシュ再検証エラー:', revalidateError)
    }
    
    return {
      success: true,
      message: `ステージ${stageId}を却下しました。ユーザーは再挑戦可能です。`
    }
    
  } catch (error) {
    console.error('却下エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '却下処理に失敗しました'
    }
  }
}

/**
 * 一括承認
 */
export async function bulkApprove(userStageIds: { userId: string; stageId: number }[]) {
  try {
    const { supabase } = await checkAdminPermission()
    
    // 入力値検証
    if (!Array.isArray(userStageIds) || userStageIds.length === 0) {
      throw new Error('承認対象が選択されていません')
    }
    
    if (userStageIds.length > 50) {
      throw new Error('一度に承認できるのは50件までです')
    }
    
    const results = []
    const errors = []
    
    // 各アイテムを順次処理（並列処理だとデッドロックの可能性があるため）
    for (const { userId, stageId } of userStageIds) {
      try {
        const result = await approveQuest(userId, stageId)
        results.push({ userId, stageId, result })
        
        if (!result.success) {
          errors.push(`ユーザー${userId}のステージ${stageId}: ${result.error}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '不明なエラー'
        errors.push(`ユーザー${userId}のステージ${stageId}: ${errorMessage}`)
        results.push({ 
          userId, 
          stageId, 
          result: { success: false, error: errorMessage } 
        })
      }
    }
    
    const successCount = results.filter(r => r.result.success).length
    const failureCount = results.length - successCount
    
    return {
      success: successCount > 0,
      successCount,
      failureCount,
      totalCount: results.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${successCount}件承認、${failureCount}件失敗`
    }
    
  } catch (error) {
    console.error('一括承認エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括承認処理に失敗しました'
    }
  }
}

/**
 * 管理者情報取得（権限確認済み）
 */
export async function getAdminInfo() {
  try {
    const { userId, email, supabase } = await checkAdminPermission()
    
    // 管理者の詳細情報を取得
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      success: true,
      admin: {
        userId,
        ...adminUser
      }
    }
  } catch (error) {
    console.error('管理者情報取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '管理者情報の取得に失敗しました'
    }
  }
}

/**
 * 一時的な管理者権限付与機能（開発・セットアップ用）
 * 注意: 本番環境では削除またはコメントアウトしてください
 */
export async function grantAdminAccess(userId: string, email: string) {
  try {
    console.log('🔧 開発モード: 管理者権限の自動付与を試行します')
    
    // 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }
    
    const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
    const supabase = createBrowserSupabaseClient()
    
    // admin_usersテーブルに挿入
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        email: email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (error) {
      console.error('管理者権限付与エラー:', error)
      return {
        success: false,
        error: error.message || '管理者権限の付与に失敗しました'
      }
    }
    
    console.log('✅ 管理者権限が正常に付与されました')
    return {
      success: true,
      message: '管理者権限が正常に付与されました'
    }
    
  } catch (error) {
    console.error('管理者権限付与エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '管理者権限の付与に失敗しました'
    }
  }
}

// =====================================================
// マイクラSDGs承認関連アクション
// =====================================================

/**
 * マイクラSDGsステージを承認
 */
export async function approveMinecraftSdgsStage(
  targetUserId: string,
  stageId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { userId: adminUserId, supabase } = await checkAdminPermission()
    
    // 承認待ちのステージを取得
    const { data: progress, error: fetchError } = await supabase
      .from('minecraft_sdgs_progress')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('stage_id', stageId)
      .eq('status', 'pending_approval')
      .single()
    
    if (fetchError || !progress) {
      return {
        success: false,
        error: '承認待ちのステージが見つかりません'
      }
    }
    
    // ステージを承認（completedに変更）
    const { error: updateError } = await supabase
      .from('minecraft_sdgs_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: adminUserId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .eq('stage_id', stageId)
    
    if (updateError) throw updateError
    
    // 次のステージを解放
    const nextStageId = stageId + 1
    if (nextStageId <= 19) {
      // 既存レコードがあるか確認
      const { data: nextProgress } = await supabase
        .from('minecraft_sdgs_progress')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('stage_id', nextStageId)
        .single()
      
      if (!nextProgress) {
        // 次のステージのレコードを作成
        await supabase
          .from('minecraft_sdgs_progress')
          .insert({
            user_id: targetUserId,
            stage_id: nextStageId,
            status: 'current',
            baseline_stage: progress.baseline_stage || 0
          })
      } else {
        // 既存レコードをcurrentに更新
        await supabase
          .from('minecraft_sdgs_progress')
          .update({
            status: 'current',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId)
          .eq('stage_id', nextStageId)
      }
    }
    
    // 通知を送信
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'minecraft_sdgs_approval',
        title: 'ステージが承認されました！',
        message: `ステージ${stageId}が承認されました。次のステージに挑戦できます！`,
        data: { stage_id: stageId, next_stage_id: nextStageId }
      })
    
    revalidatePath('/admin/minecraft-sdgs')
    revalidatePath('/minecraft-sdgs')
    
    return {
      success: true,
      message: `ステージ${stageId}を承認しました`
    }
    
  } catch (error) {
    console.error('マイクラSDGs承認エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ステージの承認に失敗しました'
    }
  }
}

/**
 * マイクラSDGsステージを却下
 */
export async function rejectMinecraftSdgsStage(
  targetUserId: string,
  stageId: number,
  reason: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { userId: adminUserId, supabase } = await checkAdminPermission()
    
    // 承認待ちのステージを取得
    const { data: progress, error: fetchError } = await supabase
      .from('minecraft_sdgs_progress')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('stage_id', stageId)
      .eq('status', 'pending_approval')
      .single()
    
    if (fetchError || !progress) {
      return {
        success: false,
        error: '承認待ちのステージが見つかりません'
      }
    }
    
    // ステージを却下（programming_work_completedに戻す）
    const { error: updateError } = await supabase
      .from('minecraft_sdgs_progress')
      .update({
        status: 'programming_work_completed',
        rejected_at: new Date().toISOString(),
        rejected_by: adminUserId,
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .eq('stage_id', stageId)
    
    if (updateError) throw updateError
    
    // 通知を送信
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'minecraft_sdgs_rejection',
        title: 'ステージが却下されました',
        message: `ステージ${stageId}が却下されました。理由: ${reason}`,
        data: { stage_id: stageId, reason }
      })
    
    revalidatePath('/admin/minecraft-sdgs')
    revalidatePath('/minecraft-sdgs')
    
    return {
      success: true,
      message: `ステージ${stageId}を却下しました`
    }
    
  } catch (error) {
    console.error('マイクラSDGs却下エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ステージの却下に失敗しました'
    }
  }
} 