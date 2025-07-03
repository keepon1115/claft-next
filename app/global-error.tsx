'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('CLAFT グローバルエラー:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💥</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                重大なエラーが発生しました
              </h1>
              <p className="text-gray-600">
                申し訳ございません。アプリケーションで重大な問題が発生しました。
              </p>
            </div>

            {/* エラー詳細（開発環境でのみ表示） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-700 mb-2">エラー詳細:</h3>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                🔄 アプリケーションを再起動
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                🏠 ホームページに移動
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              この問題が継続する場合は、ページを完全に再読み込みしてください。
            </p>
          </div>
        </div>
      </body>
    </html>
  )
} 