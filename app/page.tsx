import ProfileCard from '@/components/home/ProfileCard'
import JibunCraft from '@/components/home/JibunCraft'

// app/page.tsx を一時的に最小構成に戻す
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome to 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> CLAFT</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            自分らしく、クリエイティブに成長するプラットフォーム
          </p>
        </div>

        {/* コンテンツグリッド */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* 左側: メイン機能エリア */}
          <div className="space-y-6">
            {/* JibunCraft本格復活！ */}
            <JibunCraft />
          </div>

          {/* 右側: プロフィール・サイドバー */}
          <div className="space-y-6">
            {/* ProfileCard統合（userStore拡張版連携） */}
            <ProfileCard />

            {/* 進捗表示カード */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                <i className="fas fa-trophy mr-2"></i>
                Phase 3完了！🎉
              </h3>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>userStore拡張版復活</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>JibunCraft完全復活</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>5つの力メーター実装</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>スキルタブシステム</span>
                </div>
                <div className="flex items-center gap-2 mt-3 p-2 bg-green-100 rounded">
                  <i className="fas fa-rocket text-green-600"></i>
                  <span className="font-medium">メモリ22%削減達成 (462MB)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部情報セクション */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
            <i className="fas fa-star text-yellow-500"></i>
            <span>Phase 3完了: 重要機能復活成功</span>
          </div>
        </div>
      </main>
    </div>
  )
}


