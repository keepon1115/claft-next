#!/usr/bin/env node
/**
 * 管理画面健全性チェックスクリプト
 * 定期実行で問題の早期発見を行う
 */

const { createClient } = require('@supabase/supabase-js')

// 設定
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://laqvpxecqvlufboquffe.supabase.co',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  localUrl: 'http://localhost:3000',
  timeout: 10000
}

// 健全性チェック結果
const healthCheck = {
  timestamp: new Date().toISOString(),
  status: 'unknown',
  checks: {}
}

/**
 * 1. Supabase接続チェック
 */
async function checkSupabase() {
  console.log('🔧 Supabase接続チェック...')
  
  try {
    if (!config.supabaseKey) {
      throw new Error('SUPABASE_ANON_KEY not configured')
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)
    
    // セッション取得テスト
    const { error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    
    // DB接続テスト
    const { error: dbError } = await supabase
      .from('users_profile')
      .select('id')
      .limit(1)
    if (dbError) throw dbError
    
    healthCheck.checks.supabase = { status: '✅ OK', details: 'Connection successful' }
    return true
    
  } catch (error) {
    healthCheck.checks.supabase = { 
      status: '❌ ERROR', 
      details: error.message 
    }
    return false
  }
}

/**
 * 2. 開発サーバーチェック
 */
async function checkLocalServer() {
  console.log('🔧 ローカルサーバーチェック...')
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    const response = await fetch(config.localUrl, {
      signal: controller.signal,
      timeout: config.timeout
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    healthCheck.checks.localServer = { 
      status: '✅ OK', 
      details: `HTTP ${response.status}` 
    }
    return true
    
  } catch (error) {
    healthCheck.checks.localServer = { 
      status: '❌ ERROR', 
      details: error.message 
    }
    return false
  }
}

/**
 * 3. 管理画面エンドポイントチェック
 */
async function checkAdminEndpoint() {
  console.log('🔧 管理画面エンドポイントチェック...')
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    const response = await fetch(`${config.localUrl}/admin`, {
      signal: controller.signal,
      timeout: config.timeout
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    healthCheck.checks.adminEndpoint = { 
      status: '✅ OK', 
      details: `HTTP ${response.status}` 
    }
    return true
    
  } catch (error) {
    healthCheck.checks.adminEndpoint = { 
      status: '❌ ERROR', 
      details: error.message 
    }
    return false
  }
}

/**
 * 4. 環境変数チェック
 */
async function checkEnvironment() {
  console.log('🔧 環境変数チェック...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    healthCheck.checks.environment = { 
      status: '❌ ERROR', 
      details: `Missing variables: ${missing.join(', ')}` 
    }
    return false
  }
  
  healthCheck.checks.environment = { 
    status: '✅ OK', 
    details: 'All required variables present' 
  }
  return true
}

/**
 * メイン実行
 */
async function main() {
  console.log('🏥 管理画面健全性チェック開始')
  console.log('=' + '='.repeat(50))
  
  const checks = [
    checkEnvironment,
    checkSupabase,
    checkLocalServer,
    checkAdminEndpoint
  ]
  
  let allPassed = true
  
  for (const check of checks) {
    const result = await check()
    allPassed = allPassed && result
  }
  
  // 総合判定
  healthCheck.status = allPassed ? 'HEALTHY' : 'UNHEALTHY'
  
  console.log('\n📊 チェック結果:')
  console.log('=' + '='.repeat(50))
  
  Object.entries(healthCheck.checks).forEach(([name, result]) => {
    console.log(`${result.status} ${name}: ${result.details}`)
  })
  
  console.log('\n🎯 総合ステータス:', healthCheck.status === 'HEALTHY' ? '✅ HEALTHY' : '❌ UNHEALTHY')
  
  // 結果をファイルに保存
  const fs = require('fs')
  fs.writeFileSync('health-check-result.json', JSON.stringify(healthCheck, null, 2))
  console.log('\n💾 結果を health-check-result.json に保存しました')
  
  // 異常時は終了コード1で終了
  process.exit(allPassed ? 0 : 1)
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 健全性チェック実行エラー:', error)
    process.exit(1)
  })
}

module.exports = { main, healthCheck } 