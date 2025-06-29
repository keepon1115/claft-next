import { Metadata } from 'next'
import QuestMap from '@/components/quest/QuestMap'
import { pageMetadata, generateStructuredData } from '@/lib/utils/seo'

// ==========================================
// メタデータ設定
// ==========================================

export const metadata: Metadata = pageMetadata.quest()

// ==========================================
// 構造化データ
// ==========================================

const structuredData = generateStructuredData({
  type: 'LearningResource',
  name: 'CLAFTクエストマップ',
  description: '段階的なクエストを通じてクラフトスキルを身につけましょう。動画学習からお題挑戦まで、あなたのペースで成長できます。',
  url: '/quest',
  category: 'クラフト・DIY',
})

// ==========================================
// クエストページコンポーネント
// ==========================================

export default function QuestPage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="quest-page">
        <QuestMap 
          showHeader={true}
          showAdventureLog={true}
          showMainQuestButton={true}
        />
      </div>

      <style jsx>{`
        .quest-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      `}</style>
    </>
  )
}

// SSG対応
export const revalidate = false // 完全な静的生成 