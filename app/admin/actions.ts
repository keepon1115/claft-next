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
    
    // キャッシュを再検証
    revalidatePath('/admin')
    
    return {
      success: true,
      message: `ステージ${stageId}を承認しました`,
      nextStageUnlocked: stageId < 6
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
    
    // キャッシュを再検証
    revalidatePath('/admin')
    
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