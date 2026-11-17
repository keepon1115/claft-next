/**
 * RFC4180準拠の最小CSVパーサ（自前実装・依存パッケージなし）。
 * ダブルクォート囲み・クォート内の改行/カンマ/""エスケープ・UTF-8 BOMに対応。
 * Googleスプレッドシートの「ダウンロード→CSV」がそのまま読める想定。
 */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = text.length

  while (i < len) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // 完全な空行（末尾の改行など）を除去
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

/**
 * ヘッダー行を元に、各データ行を { ヘッダー名: 値 } のオブジェクトへ変換する。
 */
export function csvRowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim()
    })
    return obj
  })
}

export function parseCsvToObjects(input: string): Record<string, string>[] {
  return csvRowsToObjects(parseCsv(input))
}
