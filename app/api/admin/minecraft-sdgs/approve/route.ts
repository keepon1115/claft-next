import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const response = new NextResponse()
  let supabase = createRouteHandlerSupabaseClient(request, response)
  
  // Service Role用クライアント（RLSバイパス）
  let serviceRoleSupabase: any = null

  try {
    const body = await request.json()
    const { userId, stageId } = body as { userId: string; stageId: number }

    if (!userId || !stageId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
    }

    // 1) Cookieセッションを試す
    const { data: { session } } = await supabase.auth.getSession()
    let authedUserId = session?.user?.id as string | undefined

    // 2) Cookieが無い場合はAuthorizationヘッダーのトークンで検証
    let token = ''
    if (!authedUserId) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
      token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
      if (token) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !anon) {
          return NextResponse.json({ error: 'env_missing' }, { status: 500 })
        }
        const tokenClient = createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${token}` } }
        })
        const { data: userRes } = await tokenClient.auth.getUser()
        authedUserId = userRes?.user?.id
        // DB操作はこのクライアントを使う
        if (authedUserId) {
          // admin判定・DB更新時に使うクライアントを上書き
          supabase = tokenClient as any
        }
      }
    }

    if (!authedUserId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('user_id, is_active')
      .eq('user_id', authedUserId)
      .eq('is_active', true)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // 管理者確認後、Service Role Clientを作成（RLSバイパス）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && serviceRoleKey) {
      console.log('🔑 Service Role Keyを使用してRLSをバイパス')
      serviceRoleSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      // 以降のDB操作はService Role Clientを使用
      supabase = serviceRoleSupabase
    } else {
      console.warn('⚠️ Service Role Keyが設定されていません。RLSポリシーに依存します。')
    }

    // 対象進捗取得（pending_approval確認）
    const { data: progress, error: fetchError } = await supabase
      .from('minecraft_sdgs_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .eq('status', 'pending_approval')
      .single()

    if (fetchError) {
      console.error('進捗取得エラー:', fetchError)
      return NextResponse.json({ 
        error: 'fetch_failed', 
        details: fetchError.message 
      }, { status: 500 })
    }

    if (!progress) {
      return NextResponse.json({ error: 'not_pending' }, { status: 404 })
    }

    // 承認に更新
    const now = new Date().toISOString()
    
    console.log('📝 承認更新開始:', { userId, stageId, authedUserId })
    console.log('📝 取得した進捗データ:', progress)
    
    const { error: updateError } = await supabase
      .from('minecraft_sdgs_progress')
      .update({
        status: 'completed',
        completed_at: now,
        approved_at: now,
        approved_by: authedUserId,
        updated_at: now
      })
      .eq('user_id', userId)
      .eq('stage_id', stageId)

    if (updateError) {
      console.error('❌ 承認更新エラー詳細:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        userId,
        stageId,
        progressId: progress.id,
        progressCreatedAt: progress.created_at
      })
      return NextResponse.json({ 
        error: 'update_failed', 
        details: updateError.message,
        hint: updateError.hint,
        code: updateError.code
      }, { status: 500 })
    }
    
    console.log('✅ 承認更新成功')

    // 次のステージ解放
    const nextStageId = stageId + 1
    if (nextStageId <= 19) {
      const { data: next, error: nextFetchError } = await supabase
        .from('minecraft_sdgs_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('stage_id', nextStageId)
        .single()

      if (nextFetchError && nextFetchError.code !== 'PGRST116') {
        // PGRST116 = レコードが見つからない（正常ケース）
        console.error('次ステージ取得エラー:', nextFetchError)
      }

      if (!next) {
        // baseline_stageを継承して次のステージを作成
        const { error: insertError } = await supabase
          .from('minecraft_sdgs_progress')
          .insert({ 
            user_id: userId, 
            stage_id: nextStageId, 
            status: 'current',
            baseline_stage: progress.baseline_stage || 0
          })
        
        if (insertError) {
          console.error('次ステージ作成エラー:', insertError)
          // 次のステージ作成に失敗しても、承認自体は成功しているので続行
        }
      } else {
        const { error: nextUpdateError } = await supabase
          .from('minecraft_sdgs_progress')
          .update({ status: 'current', updated_at: now })
          .eq('user_id', userId)
          .eq('stage_id', nextStageId)
        
        if (nextUpdateError) {
          console.error('次ステージ更新エラー:', nextUpdateError)
          // 次のステージ更新に失敗しても、承認自体は成功しているので続行
        }
      }
    }

    // 通知
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'minecraft_sdgs_approval',
        title: 'ステージが承認されました！',
        message: `ステージ${stageId}が承認されました。次のステージに挑戦できます！`,
        data: { stage_id: stageId, next_stage_id: nextStageId },
      })

    if (notificationError) {
      console.error('通知作成エラー:', notificationError)
      // 通知の失敗は致命的ではないので、承認は成功として扱う
    }

    console.log(`✅ ステージ${stageId}承認完了 (userId: ${userId})`)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal_error' }, { status: 500 })
  }
}


