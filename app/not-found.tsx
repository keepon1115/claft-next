export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">ページが見つかりません</h2>
        <p className="text-gray-600 mb-8">
          申し訳ございません。お探しのページは存在しないか、削除された可能性があります。
        </p>
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  )
} 