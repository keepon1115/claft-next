export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="/" className="block p-2 hover:bg-gray-700 rounded">
                ホーム
              </a>
            </li>
            <li>
              <a href="/quest" className="block p-2 hover:bg-gray-700 rounded">
                クエスト
              </a>
            </li>
            <li>
              <a href="/admin" className="block p-2 hover:bg-gray-700 rounded">
                管理画面
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
} 