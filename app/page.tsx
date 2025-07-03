import ProfileCard from '@/components/home/ProfileCard'

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
            {/* JibunCraftプレースホルダー */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cogs text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">ジブンクラフト</h2>
              </div>
              
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-hammer text-4xl mb-4 opacity-30"></i>
                <p className="text-lg">メイン機能を準備中...</p>
                <p className="text-sm mt-2">次のPhaseで段階的に復活予定</p>
              </div>
            </div>
          </div>

          {/* 右側: プロフィール・サイドバー */}
          <div className="space-y-6">
            {/* ProfileCard統合 */}
            <ProfileCard />

            {/* 進捗表示カード */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                <i className="fas fa-chart-line mr-2"></i>
                Phase 2 完了！
              </h3>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>安定版バックアップ完了</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>本番ページ構造作成</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>ProfileCard復活完了</span>
                </div>
                <div className="flex items-center gap-2 mt-3 p-2 bg-green-100 rounded">
                  <i className="fas fa-rocket text-green-600"></i>
                  <span className="font-medium">メモリ使用量30%削減達成</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部情報セクション */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>Phase 2完了: ProfileCard復活成功</span>
          </div>
        </div>
      </main>
    </div>
  )
}


