import { Metadata } from 'next'

// ==========================================
// SEO設定の基本情報
// ==========================================

export const siteConfig = {
  name: 'CLAFT',
  title: 'CLAFT - あなたの創造性を解き放つクラフトプラットフォーム',
  description: 'CLAFTは、あなたの創造性を刺激し、新しいスキルを学び、仲間と一緒に成長できるクラフトプラットフォームです。DIY、ハンドメイド、創作活動を通じて自分だけのアドベンチャーを始めましょう。',
  url: 'https://claft.vercel.app',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterCreator: '@claft_official',
  keywords: [
    'クラフト',
    '創造性',
    'DIY',
    'ハンドメイド',
    'スキル学習',
    'コミュニティ',
    '創作活動',
    'アドベンチャー',
    '学習プラットフォーム',
    'ものづくり'
  ],
  author: 'CLAFT Team',
  language: 'ja',
  locale: 'ja_JP',
  themeColor: '#673AB7'
}

// ==========================================
// メタデータ生成ヘルパー関数
// ==========================================

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonical
}: SEOProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const pageDescription = description || siteConfig.description
  const pageImage = image || siteConfig.ogImage
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url
  const allKeywords = [...siteConfig.keywords, ...keywords, ...tags].join(', ')

  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    authors: [{ name: author || siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical || pageUrl,
      languages: {
        'ja-JP': pageUrl,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: `${title || siteConfig.name} - クラフトプラットフォーム`,
        },
      ],
      locale: siteConfig.locale,
      type: type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: siteConfig.twitterCard as 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.twitterCreator,
      site: siteConfig.twitterCreator,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      nocache: true,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: section || 'クラフト・DIY',
    ...(siteConfig.themeColor && {
      themeColor: siteConfig.themeColor,
    }),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteConfig.name,
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
  }

  return metadata
}

// ==========================================
// ページ別メタデータプリセット
// ==========================================

export const pageMetadata = {
  home: () => generateMetadata({
    title: 'ホーム',
    description: 'CLAFTで新しいクラフトスキルを学び、創造性を解き放ちましょう。DIY、ハンドメイド、創作活動のアドベンチャーが待っています。',
    keywords: ['ホーム', 'スタート', '始める', 'クラフト学習'],
    url: '/',
  }),

  quest: () => generateMetadata({
    title: 'クエストマップ',
    description: '段階的なクエストを通じてクラフトスキルを身につけましょう。動画学習からお題挑戦まで、あなたのペースで成長できます。',
    keywords: ['クエスト', 'ステージ', '学習', 'チャレンジ', 'スキルアップ'],
    url: '/quest',
    section: 'クエスト',
  }),

  profile: () => generateMetadata({
    title: 'プロフィール',
    description: 'あなたのクラフト冒険者プロフィールを管理しましょう。能力、特性、成長記録を確認できます。',
    keywords: ['プロフィール', 'アカウント', '設定', '冒険者', '成長記録'],
    url: '/profile',
    section: 'プロフィール',
    type: 'profile',
  }),

  admin: () => generateMetadata({
    title: '管理画面',
    description: 'CLAFT管理者専用ページ。ユーザー管理、クエスト承認、統計情報の確認ができます。',
    keywords: ['管理', '管理者', 'ダッシュボード', '統計', '承認'],
    url: '/admin',
    section: '管理',
    noindex: true,
    nofollow: true,
  }),

  unauthorized: () => generateMetadata({
    title: 'アクセス拒否',
    description: 'このページにアクセスする権限がありません。ログインが必要です。',
    keywords: ['アクセス拒否', 'ログイン', '認証'],
    url: '/unauthorized',
    noindex: true,
    nofollow: true,
  }),

  offline: () => generateMetadata({
    title: 'オフライン',
    description: 'インターネット接続が切断されています。接続を確認してからもう一度お試しください。',
    keywords: ['オフライン', '接続エラー', 'ネットワーク'],
    url: '/offline',
    noindex: true,
    nofollow: true,
  }),
}

// ==========================================
// 構造化データ生成
// ==========================================

export interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'Article' | 'Course' | 'LearningResource'
  name?: string
  description?: string
  url?: string
  image?: string
  author?: string
  datePublished?: string
  dateModified?: string
  category?: string
}

export function generateStructuredData({
  type,
  name,
  description,
  url,
  image,
  author,
  datePublished,
  dateModified,
  category
}: StructuredDataProps) {
  const baseUrl = siteConfig.url
  
  const commonData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: name || siteConfig.name,
    description: description || siteConfig.description,
    url: url ? `${baseUrl}${url}` : baseUrl,
    image: image ? `${baseUrl}${image}` : `${baseUrl}${siteConfig.ogImage}`,
  }

  switch (type) {
    case 'WebSite':
      return {
        ...commonData,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }

    case 'Organization':
      return {
        ...commonData,
        logo: `${baseUrl}/icon-512.png`,
        sameAs: [
          // ソーシャルメディアURLを追加
        ]
      }

    case 'Article':
      return {
        ...commonData,
        headline: name,
        author: {
          '@type': 'Person',
          name: author || siteConfig.author
        },
        datePublished,
        dateModified,
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/icon-512.png`
          }
        },
        articleSection: category
      }

    case 'Course':
    case 'LearningResource':
      return {
        ...commonData,
        educationalLevel: 'beginner',
        learningResourceType: 'クラフト・DIY',
        teaches: 'クラフトスキル',
        provider: {
          '@type': 'Organization',
          name: siteConfig.name
        }
      }

    default:
      return commonData
  }
}

// ==========================================
// SEOコンポーネント用プロップス
// ==========================================

export interface SEOComponentProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  structuredData?: StructuredDataProps
  noindex?: boolean
  nofollow?: boolean
}

// ==========================================
// パンくずリスト生成
// ==========================================

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`
    }))
  }
}

export default siteConfig 