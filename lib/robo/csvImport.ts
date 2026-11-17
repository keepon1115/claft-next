import { parseCsvToObjects } from '@/lib/csv/parseCsv'
import type { RoboThemeCsvRow, RoboQuestionCsvRow, CsvImportPreview, CsvImportPreviewRow } from '@/types/robo'

// =====================================================
// テーマキー（"level-theme_number"）ユーティリティ
// =====================================================

export function buildThemeKey(level: number, themeNumber: number): string {
  return `${level}-${themeNumber}`
}

export function parseThemeIdentifier(raw: string): { level: number; themeNumber: number } | null {
  const m = raw.trim().match(/^(\d+)\s*-\s*(\d+)$/)
  if (!m) return null
  return { level: parseInt(m[1], 10), themeNumber: parseInt(m[2], 10) }
}

function toInt(v: string | undefined): number | null {
  if (v === undefined || v.trim() === '') return null
  const n = Number(v.trim())
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null
  return n
}

function emptyToNull(v: string | undefined): string | null {
  if (v === undefined) return null
  const trimmed = v.trim()
  return trimmed === '' ? null : trimmed
}

// =====================================================
// テーマCSV
// ヘッダー: level,theme_number,title,問い,問い画像URL,事例解説,事例解説画像URL,アイコン画像URL,アイコン絵文字,公開,表示順
// =====================================================

export function validateRoboThemeCsv(
  csvText: string,
  existingKeys: Set<string>
): CsvImportPreview<RoboThemeCsvRow> {
  const objects = parseCsvToObjects(csvText)
  const rows: CsvImportPreviewRow<RoboThemeCsvRow>[] = []
  const seenKeys = new Set<string>()

  objects.forEach((obj, idx) => {
    const rowNumber = idx + 1
    const errors: string[] = []

    const level = toInt(obj['level'])
    const themeNumber = toInt(obj['theme_number'])
    const title = obj['title'] ?? ''
    const questionPrompt = obj['問い'] ?? ''
    const questionImageUrl = emptyToNull(obj['問い画像URL'])
    const caseStudyMd = obj['事例解説'] ?? ''
    const caseImageUrl = emptyToNull(obj['事例解説画像URL'])
    const iconUrl = emptyToNull(obj['アイコン画像URL'])
    const iconEmoji = obj['アイコン絵文字']?.trim() || '🤖'
    const publishedRaw = (obj['公開'] ?? '').trim()
    const displayOrder = toInt(obj['表示順'])

    if (level === null) errors.push('level は整数で入力してください')
    if (themeNumber === null) errors.push('theme_number は整数で入力してください')
    if (!title.trim()) errors.push('title は必須です')
    if (!questionPrompt.trim()) errors.push('問い は必須です')
    if (displayOrder === null) errors.push('表示順 は整数で入力してください')
    if (publishedRaw !== '1' && publishedRaw !== '0') errors.push('公開 は 1 か 0 で入力してください')

    const key = level !== null && themeNumber !== null ? buildThemeKey(level, themeNumber) : null
    if (key) {
      if (seenKeys.has(key)) errors.push(`CSV内で level-theme_number (${key}) が重複しています`)
      seenKeys.add(key)
    }

    rows.push({
      rowNumber,
      action: key && existingKeys.has(key) ? 'update' : 'insert',
      data: {
        level: level ?? 0,
        theme_number: themeNumber ?? 0,
        title,
        question_prompt: questionPrompt,
        question_image_url: questionImageUrl,
        case_study_md: caseStudyMd,
        case_image_url: caseImageUrl,
        icon_url: iconUrl,
        icon_emoji: iconEmoji,
        is_published: publishedRaw === '1',
        display_order: displayOrder ?? 0,
      },
      errors,
    })
  })

  return { rows, hasErrors: rows.some((r) => r.errors.length > 0) }
}

// =====================================================
// 設問CSV
// ヘッダー: テーマ,設問番号,問題文,選択肢1,選択肢2,選択肢3,正解,解説,画像URL,動画URL,参照ページ
// =====================================================

export function validateRoboQuestionCsv(
  csvText: string,
  existingKeys: Set<string>, // "themeKey|displayOrder"
  validThemeKeys: Set<string>
): CsvImportPreview<RoboQuestionCsvRow> {
  const objects = parseCsvToObjects(csvText)
  const rows: CsvImportPreviewRow<RoboQuestionCsvRow>[] = []
  const seenKeys = new Set<string>()

  objects.forEach((obj, idx) => {
    const rowNumber = idx + 1
    const errors: string[] = []

    const themeKeyRaw = obj['テーマ'] ?? ''
    const parsedTheme = parseThemeIdentifier(themeKeyRaw)
    const themeKey = parsedTheme ? buildThemeKey(parsedTheme.level, parsedTheme.themeNumber) : null
    const displayOrder = toInt(obj['設問番号'])
    const body = obj['問題文'] ?? ''
    const choice1 = obj['選択肢1'] ?? ''
    const choice2 = obj['選択肢2'] ?? ''
    const choice3 = obj['選択肢3'] ?? ''
    const correctRaw = (obj['正解'] ?? '').trim()
    const correct = toInt(correctRaw)
    const explanation = emptyToNull(obj['解説'])
    const imageUrl = emptyToNull(obj['画像URL'])
    const videoUrl = emptyToNull(obj['動画URL'])
    const referenceNote = emptyToNull(obj['参照ページ'])

    if (!themeKeyRaw.trim()) {
      errors.push('テーマ は必須です（例: 1-1）')
    } else if (!parsedTheme) {
      errors.push(`テーマ の書式が不正です。"1-1"のように入力してください（入力値: "${themeKeyRaw}"）`)
    } else if (!validThemeKeys.has(themeKey!)) {
      errors.push(`テーマ "${themeKeyRaw}" に該当するテーマが見つかりません（テーマCSVを先に反映するか、値を見直してください）`)
    }

    if (displayOrder === null) errors.push('設問番号 は整数で入力してください')
    if (!body.trim()) errors.push('問題文 は必須です')
    if (!choice1.trim()) errors.push('選択肢1 は必須です')
    if (!choice2.trim()) errors.push('選択肢2 は必須です')
    if (!choice3.trim()) errors.push('選択肢3 は必須です')
    if (correct === null || correct < 1 || correct > 3) errors.push('正解 は1〜3で入力してください')

    const rowKey = themeKey && displayOrder !== null ? `${themeKey}|${displayOrder}` : null
    if (rowKey) {
      if (seenKeys.has(rowKey)) errors.push(`CSV内で テーマ${themeKeyRaw}の設問番号${displayOrder} が重複しています`)
      seenKeys.add(rowKey)
    }

    rows.push({
      rowNumber,
      action: rowKey && existingKeys.has(rowKey) ? 'update' : 'insert',
      data: {
        themeKey: themeKey ?? themeKeyRaw,
        display_order: displayOrder ?? 0,
        body,
        choice_1: choice1,
        choice_2: choice2,
        choice_3: choice3,
        correct_index: correct !== null ? correct - 1 : 0,
        explanation,
        image_url: imageUrl,
        video_url: videoUrl,
        reference_note: referenceNote,
      },
      errors,
    })
  })

  return { rows, hasErrors: rows.some((r) => r.errors.length > 0) }
}
