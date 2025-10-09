'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'

// ひらめき投稿の簡易型（デモ用表示）
interface HiramekiItem {
  id: string
  title: string
  content: string
  date: string // YYYY/MM/DD
  reactions: Record<'like' | 'fun' | 'try' | 'first', number>
}

export default function HiramekiPostPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const formRef = useRef<HTMLDivElement | null>(null)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const { isAuthenticated, user } = useAuth()

  type PostRow = {
    id: string
    post_date: string
    content: string
    implemented: boolean
  }
  const [posts, setPosts] = useState<PostRow[]>([])
  const [reactionCounts, setReactionCounts] = useState<Record<string, { heart: number; good: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const toggleSidebar = () => setSidebarOpen(v => !v)
  const closeSidebar = () => setSidebarOpen(false)

  // 投稿一覧とリアクション集計を取得
  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: postData, error: postError } = await supabase
        .from('hirameki_posts')
        .select('id, post_date, content, implemented')
        .order('post_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (postError) throw postError
      const list = (postData || []) as PostRow[]
      setPosts(list)

      if (list.length === 0) {
        setReactionCounts({})
        return
      }

      const ids = list.map(p => p.id)
      const { data: reactData, error: reactError } = await supabase
        .from('hirameki_reactions')
        .select('post_id, type')
        .in('post_id', ids)

      if (reactError) throw reactError
      const counts: Record<string, { heart: number; good: number }> = {}
      for (const id of ids) counts[id] = { heart: 0, good: 0 }
      for (const r of (reactData || []) as { post_id: string; type: 'heart' | 'good' }[]) {
        counts[r.post_id][r.type] += 1
      }
      setReactionCounts(counts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const channel = supabase.channel('realtime-hirameki')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hirameki_posts' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hirameki_reactions' }, () => fetchAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 反応ボタン（1人1回/種類ごと）
  const sendReaction = async (postId: string, type: 'heart' | 'good') => {
    if (!isAuthenticated || !user?.id) {
      setShowAuthModal(true)
      return
    }
    const { error } = await supabase
      .from('hirameki_reactions')
      .insert({ post_id: postId, user_id: user.id, type })
    if (error) {
      // 一意制約違反は無視（多重投票防止）
      if ((error as any).code !== '23505') {
        console.error(error)
        alert('リアクションの送信に失敗しました')
      }
    }
  }

  // 背景の紙・手描き風演出用のクラスをbodyに付与（このページ限定）
  useEffect(() => {
    document.body.classList.add('paper-texture')
    return () => { document.body.classList.remove('paper-texture') }
  }, [])

  return (
    <>
      {/* ナビゲーション */}
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* メイン */}
      <main className="min-h-screen relative">
        {/* ① ヘッダーエリア */}
        <section className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 pt-24 pb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5D6] border-2 border-[#FFD66B] text-[#7A5B00] font-extrabold text-xs">
              💡 ひらめきポスト/Q＆A
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-[#2b2b2b]">
              あなたの声が、次のCLAFTをつくる！
            </h1>
            <p className="mt-4 leading-7 text-slate-700">
              「こんなイベントをやってみたい！」<br/>
              「次はこんなテーマで学びたい！」<br/>
              「アプリのここを変えてほしい！」<br/>
              そんな“ひらめき”をここに届けよう📮<br/>
              みんなの声が、CLAFTを一緒に育てていきます🌱
            </p>
          </div>

          {/* 背景の手描き風アニメーション（控えめ） */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-10 -right-10 w-[220px] h-[220px] bg-[#FFECA6] rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-6 -left-6 w-[260px] h-[260px] bg-[#B9F5F1] rounded-full blur-3xl opacity-60" />
          </div>
        </section>

        {/* ② 中央の大ボタン（Googleフォームへ） */}
        <section ref={formRef} className="px-6 pb-16">
          <div className="mx-auto max-w-3xl bg-white/90 backdrop-blur-sm border border-cream-200 rounded-2xl shadow-sm p-10 text-center">
            <a
              href="https://forms.gle/GC2h3jTdsfozo8jQA"
              target="_blank"
              rel="noopener noreferrer"
              className="envelope-btn"
              aria-label="ひらめきをポストに送る（新しいタブで開きます）"
              style={{ minWidth: 280 }}
            >
              <div className="flap" />
              <div className="letter">✉️</div>
              <span>ひらめきをポストに送る</span>
            </a>
          </div>
        </section>

        {/* ③ みんなのひらめき（テーブル表示） */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl grid place-items-center bg-[#FFF0B3]">💡</span>
                <span>みんなのひらめき</span>
              </h2>
              <p className="mt-2 text-slate-600 text-sm">みんなのひらめきが形になっています。</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">日付</th>
                    <th className="px-4 py-3 text-left font-bold">内容</th>
                    <th className="px-4 py-3 text-left font-bold">実装</th>
                    <th className="px-4 py-3 text-left font-bold">リアクション</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">読み込み中...</td>
                    </tr>
                  )}
                  {!loading && posts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">まだひらめきがありません</td>
                    </tr>
                  )}
                  {posts.map(p => {
                    const counts = reactionCounts[p.id] || { heart: 0, good: 0 }
                    const d = formatYmd(p.post_date)
                    return (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-bold">{d}</td>
                        <td className="px-4 py-3 text-slate-800">{p.content}</td>
                        <td className="px-4 py-3">{p.implemented ? '✅ 実装済' : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => sendReaction(p.id, 'heart')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-bold ${isAuthenticated ? 'bg-white hover:bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                              aria-disabled={!isAuthenticated}
                              title={isAuthenticated ? 'いいね！' : 'ログインが必要です（クリックでログイン）'}
                            >
                              <span>❤️</span>
                              <span>{counts.heart}</span>
                            </button>
                            <button
                              onClick={() => sendReaction(p.id, 'good')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-bold ${isAuthenticated ? 'bg-white hover:bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                              aria-disabled={!isAuthenticated}
                              title={isAuthenticated ? 'グッド！' : 'ログインが必要です（クリックでログイン）'}
                            >
                              <span>👍</span>
                              <span>{counts.good}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* ④ Q&A セクション（見出しは枠外に配置） */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl grid place-items-center bg-slate-100">❓</span>
                <span>Q&A</span>
              </h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="divide-y divide-slate-200 text-[15px] leading-7 text-slate-700">
                <div className="p-6">
                  <div className="font-extrabold text-slate-800">Q. 「読み込み中」で固まることがあります</div>
                  <p className="mt-1">
                    A. 通信状況やデータの読み込みに時間がかかっている場合があります。<br/>
                    その際は、<strong>F5キー（または画面右上の再読み込みボタン）</strong>を押してページを更新してみてください。
                  </p>
                </div>
                <div className="p-6">
                  <div className="font-extrabold text-slate-800">Q. クエストの進捗がリセットされたように見えます</div>
                  <p className="mt-1">
                    A. 一時的な表示バグの可能性がありますが、実際の回答データは消えていません。<br/>
                    「クエストに挑む」ボタンからGoogleフォームにアクセスし、送信履歴が確認できれば、回答は正常に保存されています。<br/>
                    その場合は、<strong>「クエストの完了を報告」ボタン</strong>を再度押してみてください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ⑤ 余白（フッター固定ボタンは無し） */}
        <div className="pb-10" />
      </main>

      {/* スタイル（紙の質感・軽いクラフト感） */}
      <style jsx global>{`
        .paper-texture {
          --cream-bg: #FFFBF2;
          background: var(--cream-bg);
        }
        .border-cream-200 { border-color: #F2E8CA; }

        /* 封筒アニメーションボタン */
        .envelope-btn {
          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          background: #FFD66B;
          color: #333;
          font-weight: 800;
          text-align: center;
          padding: 18px 40px;
          border-radius: 14px;
          box-shadow: 0 5px 10px rgba(0,0,0,0.15);
          text-decoration: none;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid #F7C948;
        }
        .envelope-btn .flap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 45%;
          background: #F6C244;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top center;
          transition: transform 0.4s ease;
        }
        .envelope-btn .letter {
          position: absolute;
          font-size: 22px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease;
        }
        .envelope-btn:hover .flap {
          transform: rotateX(180deg);
        }
        .envelope-btn:hover .letter {
          opacity: 1;
          transform: translateY(-5px);
        }
        .envelope-btn:active .letter {
          animation: flyAway 0.6s ease forwards;
        }
        @keyframes flyAway {
          0% { transform: translateY(-5px) scale(1); opacity: 1; }
          60% { transform: translateY(-50px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
        }
        .envelope-btn:hover {
          background: #FFDF80;
          transform: translateY(-2px);
        }
      `}</style>

      {/* 認証モーダル（未ログインでリアクション時に表示） */}
      <DynamicAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
        redirectTo="/hirameki-post"
      />
    </>
  )
}

function formatYmd(dateLike: string) {
  // 既にYYYY-MM-DD/YYY-MM-DDZ形式の想定
  const d = new Date(dateLike)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return `${y}/${m}/${dd}`
}


