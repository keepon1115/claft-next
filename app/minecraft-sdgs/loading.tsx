export default function Loading() {
  return (
    <div className="min-h-screen minecraft-page flex items-center justify-center">
      <div className="text-center">
        <div className="minecraft-loading-cube mb-4"></div>
        <p className="text-xl font-bold text-minecraft-brown">コースを読み込み中...</p>
        <p className="text-sm text-minecraft-brown-light mt-2">
          SDGsコンテンツをロードしています...
        </p>
      </div>
    </div>
  )
}