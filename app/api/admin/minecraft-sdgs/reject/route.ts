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
    const { userId, stageId, reason } = body as { userId: string; stageId: number; reason: string }

    if (!userId || !stageId || !reason) {
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
        if (authedUserId) {
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

    // 対象確認
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

    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('minecraft_sdgs_progress')
      .update({
        status: 'programming_work_completed',
        rejected_at: now,
        rejected_by: authedUserId,
        rejection_reason: reason,
        updated_at: now
      })
      .eq('user_id', userId)
      .eq('stage_id', stageId)

    if (updateError) {
      console.error('却下更新エラー:', updateError)
      return NextResponse.json({ 
        error: 'update_failed', 
        details: updateError.message 
      }, { status: 500 })
    }

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'minecraft_sdgs_rejection',
        title: 'ステージが却下されました',
        message: `ステージ${stageId}が却下されました。理由: ${reason}`,
        data: { stage_id: stageId, reason },
      })

    if (notificationError) {
      console.error('通知作成エラー:', notificationError)
      // 通知の失敗は致命的ではないので、却下は成功として扱う
    }

    console.log(`❌ ステージ${stageId}却下完了 (userId: ${userId}, reason: ${reason})`)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal_error' }, { status: 500 })
  }
}


