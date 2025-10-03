#!/usr/bin/env node
/**
 * 全ユーザーの user_stats を初期化/補完するユーティリティ
 * 仕様:
 * - users_profile に存在する全ユーザーを対象
 * - user_stats が未作成のユーザーに対して { login_count: 0, last_login_date: null, quest_clear_count: 0, total_exp: 0 } を作成
 * - 既存ユーザーは維持（更新しない）
 * - 進捗が存在する場合は quest_progress の completed/approved 件数を quest_clear_count に反映（--recount オプション）
 *
 * 実行例:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/init-user-stats.js
 *   node scripts/init-user-stats.js --recount
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 環境変数が不足しています。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const args = process.argv.slice(2)
const shouldRecount = args.includes('--recount')

async function fetchAllProfiles() {
  let all = []
  let from = 0
  const step = 1000
  for (;;) {
    const { data, error } = await supabase
      .from('users_profile')
      .select('id, email', { count: 'exact' })
      .range(from, from + step - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all = all.concat(data)
    if (data.length < step) break
    from += step
  }
  return all
}

async function ensureStatsForUser(userId) {
  // 既存チェック
  const { data: existing, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') throw error

  if (!existing) {
    const { error: insertError } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        login_count: 0,
        last_login_date: null,
        quest_clear_count: 0,
        total_exp: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    if (insertError) throw insertError
    return { created: true }
  }
  return { created: false }
}

async function recountQuestClears(userId) {
  const { count, error } = await supabase
    .from('quest_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['completed', 'approved'])
  if (error) throw error
  const cleared = count || 0
  const { error: updateError } = await supabase
    .from('user_stats')
    .update({ quest_clear_count: cleared, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (updateError) throw updateError
  return cleared
}

async function main() {
  console.log('🛠  user_stats 初期化ユーティリティ開始')
  const profiles = await fetchAllProfiles()
  console.log(`対象ユーザー数: ${profiles.length}`)

  let created = 0
  let updated = 0

  for (const p of profiles) {
    try {
      const res = await ensureStatsForUser(p.id)
      if (res.created) created++
      if (shouldRecount) {
        const cleared = await recountQuestClears(p.id)
        if (cleared >= 0) updated++
      }
    } catch (e) {
      console.error(`❌ ユーザー ${p.id} の処理でエラー:`, e.message)
    }
  }

  console.log(`✅ 完了: 作成 ${created} 件, 更新(再集計) ${updated} 件`)
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ 実行エラー:', e)
    process.exit(1)
  })
}

module.exports = { main }


