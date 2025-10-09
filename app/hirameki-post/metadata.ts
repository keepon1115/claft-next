import { Metadata } from 'next'
import { generateMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'ひらめきポスト/Q＆A',
  description: 'アイデア・気づき・学びたいこと・アプリ改善の提案を気軽に共有するページ。あなたの声が、次のCLAFTをつくる。',
  keywords: ['ひらめき', 'アイデア', '提案', 'リアクション', 'CLAFT'],
  url: '/hirameki-post',
  section: 'コミュニティ',
  image: '/og-image.png',
})


