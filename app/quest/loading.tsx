export default function QuestLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">冒険の準備中...</p>
        <p className="text-white/80 text-sm mt-2">クエストマップを読み込んでいます</p>
      </div>
    </div>
  )
}
