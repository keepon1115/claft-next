// ==========================================
// プロフィールページコンポーネント（Server Component）
// ==========================================

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 pt-20 pb-10 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
          🧙‍♀️ 冒険者プロフィール
        </h1>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          あなたのクラフト冒険者としての成長を確認しましょう
        </p>
        
        {/* プロフィールコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 基本情報カード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-white mb-2">基本情報</h3>
              <p className="text-white/80 text-sm">
                アカウント情報と<br />
                プロフィール設定
              </p>
            </div>

            {/* ステータスカード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">ステータス</h3>
              <p className="text-white/80 text-sm">
                レベルと経験値<br />
                スキルポイント
              </p>
            </div>

            {/* 実績カード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">実績</h3>
              <p className="text-white/80 text-sm">
                達成したクエスト<br />
                獲得バッジ
              </p>
            </div>

            {/* 装備カード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-white mb-2">装備</h3>
              <p className="text-white/80 text-sm">
                現在の装備<br />
                アイテムインベントリ
              </p>
            </div>

            {/* フレンドカード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">フレンド</h3>
              <p className="text-white/80 text-sm">
                冒険者仲間<br />
                ギルド情報
              </p>
            </div>

            {/* 設定カード */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-2">設定</h3>
              <p className="text-white/80 text-sm">
                通知設定<br />
                プライバシー設定
              </p>
            </div>

          </div>

          {/* 開発中メッセージ */}
          <div className="mt-12 p-6 bg-yellow-500/20 rounded-2xl border border-yellow-500/30">
            <div className="text-3xl mb-3">🚧</div>
            <h3 className="text-lg font-bold text-white mb-2">プロフィール機能開発中</h3>
            <p className="text-white/80 text-sm">
              詳細なプロフィール機能は現在開発中です。<br />
              しばらくお待ちください。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              プロフィール編集
            </button>
            <button className="bg-transparent text-white px-8 py-3 rounded-full font-semibold border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300">
              設定変更
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 