#!/usr/bin/env node
/**
 * スクール生一括インポートスクリプト
 *
 * CSVファイルから生徒情報と月別レポートを一括登録します。
 * RLSをバイパスするためサービスロールキーを使用します。
 *
 * ■ CSV ヘッダー（1行目）
 *   name,grade,course,schedule,interests,month,goal,
 *   session1_date,session1_description,session2_date,session2_description,
 *   proficiency,notes
 *
 * ■ ルール
 *   - name は必須。同名の生徒は 1 レコードにまとめられます
 *   - month が空の行は「生徒の基本情報のみ」として登録されます
 *   - 同じ生徒が複数行ある場合（月が異なる）、月ごとのレポートが作成されます
 *
 * ■ 実行例
 *   node scripts/import-students.js data/import/students.csv
 *   node scripts/import-students.js data/import/students.csv --dry-run
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// ─── 環境変数 ────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    '❌ 環境変数が不足しています。\n' +
    '   NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。\n' +
    '   例: SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/import-students.js data/import/students.csv'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── 引数解析 ────────────────────────────────────────────
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const csvPath = args.find((a) => !a.startsWith('--'))

if (!csvPath) {
  console.error('❌ CSVファイルのパスを指定してください。')
  console.error('   例: node scripts/import-students.js data/import/students.csv')
  process.exit(1)
}

const resolvedPath = path.resolve(csvPath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ ファイルが見つかりません: ${resolvedPath}`)
  process.exit(1)
}

// ─── CSVパーサー（外部依存なし） ─────────────────────────

/**
 * ヘッダー文字列を正規化する。
 * - 前後の空白を除去
 * - 「name (氏名)」のように括弧が含まれる場合、括弧以降を除去して「name」にする
 */
function normalizeHeader(h) {
  return h.trim().replace(/\s*[（(].*/u, '').trim()
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = parseLine(lines[0]).map(normalizeHeader)
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim()
    })
    rows.push(row)
  }
  return rows
}

function parseLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

// ─── メイン処理 ──────────────────────────────────────────
async function main() {
  console.log('🎓 スクール生インポート開始')
  console.log(`   ファイル: ${resolvedPath}`)
  if (dryRun) console.log('   ⚠️  ドライランモード（DBには書き込みません）')

  // BOM付きUTF-8に対応するため、バイナリで読み込んでからデコード・BOM除去する
  const buffer = fs.readFileSync(resolvedPath)
  let raw = buffer.toString('utf-8')
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1)
  }
  const rows = parseCSV(raw)
  console.log(`   読み込み行数: ${rows.length}`)

  if (rows.length === 0) {
    console.log('⚠️  データ行がありません。終了します。')
    return
  }

  // ヘッダー検証
  const requiredHeaders = ['name']
  const firstRow = rows[0]
  for (const h of requiredHeaders) {
    if (!(h in firstRow)) {
      console.error(`❌ 必須ヘッダー "${h}" が見つかりません。`)
      process.exit(1)
    }
  }

  // 生徒ごとにグルーピング（同名 = 同一生徒）
  const studentMap = new Map()
  for (const row of rows) {
    const name = row.name
    if (!name) {
      console.warn('⚠️  name が空の行をスキップしました')
      continue
    }
    if (!studentMap.has(name)) {
      studentMap.set(name, {
        info: {
          name,
          grade: row.grade || '',
          course: row.course || '',
          schedule: row.schedule || '',
          interests: row.interests || '',
        },
        reports: [],
      })
    }
    // 月データがある場合はレポートとして追加
    if (row.month) {
      studentMap.get(name).reports.push({
        month: row.month,
        goal: row.goal || '',
        content: {
          session1: {
            date: row.session1_date || '',
            description: row.session1_description || '',
          },
          session2: {
            date: row.session2_date || '',
            description: row.session2_description || '',
          },
          proficiency: row.proficiency || '',
          notes: row.notes || '',
        },
      })
    }
  }

  console.log(`   ユニーク生徒数: ${studentMap.size}`)
  const totalReports = Array.from(studentMap.values()).reduce(
    (sum, s) => sum + s.reports.length,
    0
  )
  console.log(`   レポート件数:   ${totalReports}`)
  console.log('')

  if (dryRun) {
    console.log('── ドライラン結果 ──')
    for (const [name, data] of studentMap) {
      console.log(`  📌 ${name}  (${data.info.grade} / ${data.info.course} / ${data.info.schedule})`)
      for (const r of data.reports) {
        console.log(`     └ ${r.month}: 目標「${r.goal}」`)
        console.log(`       1回目: ${r.content.session1.date || '(未設定)'} - ${r.content.session1.description || '(未設定)'}`)
        console.log(`       2回目: ${r.content.session2.date || '(未設定)'} - ${r.content.session2.description || '(未設定)'}`)
      }
    }
    console.log('\n✅ ドライラン完了。問題なければ --dry-run を外して再実行してください。')
    return
  }

  // ─── DB書き込み ──────────────────────────────────────
  let studentCreated = 0
  let studentSkipped = 0
  let reportCreated = 0
  let reportSkipped = 0
  let errors = 0

  for (const [name, data] of studentMap) {
    try {
      // 1) 生徒を登録（同名が既にDBにあればスキップ）
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('name', name)
        .maybeSingle()

      let studentId
      if (existing) {
        studentId = existing.id
        studentSkipped++
        console.log(`  ⏭️  ${name} … 既に存在 (${studentId.slice(0, 8)}…)`)
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('students')
          .insert(data.info)
          .select('id')
          .single()
        if (insertErr) throw insertErr
        studentId = inserted.id
        studentCreated++
        console.log(`  ✅ ${name} … 登録完了 (${studentId.slice(0, 8)}…)`)
      }

      // 2) レポートを登録
      for (const report of data.reports) {
        const { data: existingReport } = await supabase
          .from('monthly_reports')
          .select('id')
          .eq('student_id', studentId)
          .eq('month', report.month)
          .maybeSingle()

        if (existingReport) {
          reportSkipped++
          console.log(`     ⏭️  ${report.month} … 既に存在`)
          continue
        }

        const { error: rErr } = await supabase
          .from('monthly_reports')
          .insert({
            student_id: studentId,
            month: report.month,
            goal: report.goal,
            content: report.content,
          })
        if (rErr) throw rErr
        reportCreated++
        console.log(`     ✅ ${report.month} … レポート登録完了`)
      }
    } catch (e) {
      errors++
      console.error(`  ❌ ${name} の処理でエラー: ${e.message}`)
    }
  }

  // ─── サマリー ────────────────────────────────────────
  console.log('\n════════════════════════════════════════')
  console.log('  インポート結果')
  console.log('════════════════════════════════════════')
  console.log(`  生徒 - 新規登録: ${studentCreated} 件`)
  console.log(`  生徒 - スキップ: ${studentSkipped} 件（既存）`)
  console.log(`  レポート - 新規: ${reportCreated} 件`)
  console.log(`  レポート - スキップ: ${reportSkipped} 件（既存）`)
  if (errors > 0) {
    console.log(`  ❌ エラー: ${errors} 件`)
  }
  console.log('════════════════════════════════════════')
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ 実行エラー:', e)
    process.exit(1)
  })
}

module.exports = { main }
