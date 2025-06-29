import { Metadata } from 'next'
import { Share, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'シェア - CLAFT',
  description: 'CLAFTでの成果を共有',
}

export default function SharePage({
  searchParams,
}: {
  searchParams: { title?: string; text?: string; url?: string }
}) {
  const { title, text, url } = searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">成果を共有</h1>
        </div>

        {/* 共有コンテンツ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Share size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {title || 'CLAFTでの成果'}
              </h2>
              <p className="text-sm text-gray-600">
                あなたの学習成果を友達と共有しましょう！
              </p>
            </div>
          </div>

          {text && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">{text}</p>
            </div>
          )}

          {url && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-700 font-medium">共有URL:</p>
              <a 
                href={url} 
                className="text-purple-600 hover:text-purple-800 break-all"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {url}
              </a>
            </div>
          )}
        </div>

        {/* 共有完了メッセージ */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            共有ありがとうございます！
          </h3>
          <p className="text-green-700 mb-4">
            あなたの成果が正常に共有されました。<br />
            引き続きCLAFTでの学習を楽しんでください！
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            ホームに戻る
          </Link>
        </div>

        {/* 追加の共有オプション */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">他の方法でも共有できます：</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="text-blue-600 text-2xl mb-2">📧</div>
              <div className="text-sm font-medium text-gray-700">メール</div>
            </button>
            <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="text-green-600 text-2xl mb-2">📱</div>
              <div className="text-sm font-medium text-gray-700">SNS</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 