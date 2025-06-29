import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/utils/seo'

// ==========================================
// 静的ページ定義
// ==========================================

interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

const staticPages: SitemapEntry[] = [
  {
    url: '',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: '/quest',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: '/profile',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: '/share',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  // 認証が必要なページや管理者ページは除外
  // /admin, /unauthorized は noindex なので含めない
]

// ==========================================
// 動的ページ生成
// ==========================================

async function getDynamicPages(): Promise<SitemapEntry[]> {
  const dynamicPages: SitemapEntry[] = []

  try {
    // ここで動的なページ（ユーザープロフィール、クエスト詳細など）を取得
    // 例: ユーザー公開プロフィール
    /*
    const publicProfiles = await getPublicProfiles()
    publicProfiles.forEach(profile => {
      dynamicPages.push({
        url: `/user/${profile.id}`,
        lastModified: profile.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })
    */

    // 例: 公開クエスト詳細
    /*
    const publicQuests = await getPublicQuests()
    publicQuests.forEach(quest => {
      dynamicPages.push({
        url: `/quest/${quest.id}`,
        lastModified: quest.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    })
    */

    // 例: ブログ記事やチュートリアル
    /*
    const articles = await getArticles()
    articles.forEach(article => {
      dynamicPages.push({
        url: `/article/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    })
    */

  } catch (error) {
    console.warn('Error fetching dynamic pages for sitemap:', error)
  }

  return dynamicPages
}

// ==========================================
// メインsitemap生成関数
// ==========================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // 静的ページ
  const staticEntries: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 動的ページ
  const dynamicPages = await getDynamicPages()
  const dynamicEntries: MetadataRoute.Sitemap = dynamicPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 全エントリを結合
  const allEntries = [...staticEntries, ...dynamicEntries]

  // 重複削除とソート
  const uniqueEntries = allEntries.reduce((acc, current) => {
    const existing = acc.find(item => item.url === current.url)
    if (!existing) {
      acc.push(current)
    } else {
      // より新しい lastModified を使用
      if (current.lastModified && (!existing.lastModified || 
          new Date(current.lastModified) > new Date(existing.lastModified))) {
        existing.lastModified = current.lastModified
      }
    }
    return acc
  }, [] as MetadataRoute.Sitemap)

  // 優先度でソート
  uniqueEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return uniqueEntries
}

// ==========================================
// サイトマップ用ヘルパー関数
// ==========================================

export function generateSitemapEntry({
  path,
  lastModified = new Date(),
  changeFrequency = 'monthly',
  priority = 0.5
}: {
  path: string
  lastModified?: Date | string
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}): SitemapEntry {
  return {
    url: path,
    lastModified: typeof lastModified === 'string' ? lastModified : lastModified.toISOString(),
    changeFrequency,
    priority,
  }
}

// ==========================================
// カテゴリ別サイトマップ生成
// ==========================================

export async function generateCategorySitemap(category: string): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const entries: MetadataRoute.Sitemap = []

  switch (category) {
    case 'quest':
      // クエスト関連のページ
      entries.push({
        url: `${baseUrl}/quest`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
      // 個別ステージページがあれば追加
      for (let i = 1; i <= 15; i++) {
        entries.push({
          url: `${baseUrl}/quest/stage/${i}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
      break

    case 'user':
      // 公開ユーザープロフィール
      // 実際の実装では、データベースから公開プロフィールを取得
      break

    case 'content':
      // コンテンツページ（チュートリアル、記事など）
      break

    default:
      break
  }

  return entries
}

// ==========================================
// XML サイトマップ手動生成（必要時）
// ==========================================

export function generateXMLSitemap(entries: MetadataRoute.Sitemap): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  const urlsetClose = '</urlset>'

  const urls = entries.map(entry => {
    const loc = `<loc>${entry.url}</loc>`
    const lastmod = entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : ''
    const changefreq = entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''
    const priority = entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''

    return `  <url>
    ${loc}
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`
  }).join('\n')

  return `${xmlHeader}
${urlsetOpen}
${urls}
${urlsetClose}`
}

// ==========================================
// サイトマップ検証
// ==========================================

export function validateSitemap(entries: MetadataRoute.Sitemap): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // URL数チェック（50,000件制限）
  if (entries.length > 50000) {
    errors.push(`サイトマップのURL数が制限を超えています: ${entries.length}/50000`)
  }

  // URL検証
  entries.forEach((entry, index) => {
    // URL形式チェック
    try {
      new URL(entry.url)
    } catch {
      errors.push(`無効なURL (${index}): ${entry.url}`)
    }

    // 優先度チェック
    if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
      errors.push(`無効な優先度 (${index}): ${entry.priority}`)
    }

    // 日付形式チェック
    if (entry.lastModified) {
      const date = new Date(entry.lastModified)
      if (isNaN(date.getTime())) {
        warnings.push(`無効な日付形式 (${index}): ${entry.lastModified}`)
      }
    }
  })

  // 重複URLチェック
  const urls = new Set<string>()
  entries.forEach((entry, index) => {
    if (urls.has(entry.url)) {
      warnings.push(`重複URL (${index}): ${entry.url}`)
    }
    urls.add(entry.url)
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
} 