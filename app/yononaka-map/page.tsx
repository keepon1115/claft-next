'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { YONONAKA_MAP_URL } from '@/data/yononakaMap'

const PIXEL_FONT = '[font-family:var(--font-dot-gothic),monospace]'

type MapStatus = 'checking' | 'ready' | 'preparing'

// マップ(Godot)からの map-event に対するトースト文言(11-0)
const MAP_EVENT_TOASTS: Record<string, string> = {
  'letter-sent': 'ポストに入れたよ! へんじを待とう📮',
  'npc-met': 'ずかんに記録した!📖',
}

export default function YononakaMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapStatus, setMapStatus] = useState<MapStatus>('checking')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 11-0(認証ブリッジ)でaccess_tokenのpostMessage送信に使う
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(text)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  // 11-0: iframe内のGodotへaccess_token/userIdを渡す(同一オリジンのみ)。
  // 未ログイン時は空文字を送る=ゲストモード(探索は全て可能)
  const sendAuth = useCallback(async () => {
    const target = iframeRef.current?.contentWindow
    if (!target) return
    try {
      const supabase = createBrowserSupabaseClient()
      const { data } = (await supabase.auth.getSession?.()) ?? {
        data: { session: null },
      }
      const session = data?.session
      target.postMessage(
        {
          type: 'claft-auth',
          accessToken: session?.access_token ?? '',
          userId: session?.user?.id ?? '',
        },
        window.location.origin
      )
    } catch {
      // 認証情報が取れなくてもゲストモードで遊べるので何もしない
    }
  }, [])

  // トークン更新(約1時間ごと)やログイン/ログアウトのたびに再送
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const { data } = supabase.auth.onAuthStateChange(() => {
      void sendAuth()
    })
    return () => data?.subscription?.unsubscribe?.()
  }, [sendAuth])

  // マップ(Godot)からのイベント受信。bridge-readyはGodot起動完了の合図なので認証を再送
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { type?: string; event?: string } | null
      if (!d || d.type !== 'map-event' || typeof d.event !== 'string') return
      if (d.event === 'bridge-ready') {
        void sendAuth()
        return
      }
      const text = MAP_EVENT_TOASTS[d.event]
      if (text) showToast(text)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [sendAuth, showToast])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // 書き出しファイルが配置済みかをHEADで確認(未生成の間は準備中表示)
  useEffect(() => {
    let cancelled = false
    fetch(YONONAKA_MAP_URL, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setMapStatus(res.ok ? 'ready' : 'preparing')
      })
      .catch(() => {
        if (!cancelled) setMapStatus('preparing')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const enterFullscreen = () => {
    iframeRef.current?.requestFullscreen?.()
  }

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen bg-[#f4e8d0] bg-[radial-gradient(#8b5e3c14_1px,transparent_1px)] [background-size:16px_16px] text-[#5a3d26]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* ヒーロー */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-2 bg-[#8b5e3c] text-[#f4e8d0] rounded px-3 py-1 text-xs tracking-widest ${PIXEL_FONT}`}>
                🗺 ぼうけんのちず
              </div>
              <h1 className={`mt-3 text-3xl md:text-4xl text-[#5a3d26] tracking-wider ${PIXEL_FONT}`}>
                Yononakaマップ
              </h1>
              <p className="mt-3 text-[#5a3d26]/80 leading-7">
                マップを歩いて、大人に話しかけよう。
                <br className="sm:hidden" />
                その人の生き方に触れられる。
              </p>
            </div>

            {/* プレイエリア */}
            <div className="rounded-lg border-4 border-[#8b5e3c] bg-[#e8d9ba] shadow-[6px_6px_0_rgba(139,94,60,0.35)] overflow-hidden">
              {mapStatus === 'ready' ? (
                <>
                  <iframe
                    ref={iframeRef}
                    src={YONONAKA_MAP_URL}
                    title="Yononakaマップ"
                    allow="fullscreen"
                    onLoad={() => void sendAuth()}
                    className="block w-full aspect-video max-h-[80dvh] border-none bg-black"
                  />
                  <div className="flex justify-end px-3 py-2 bg-[#8b5e3c]">
                    <button
                      type="button"
                      onClick={enterFullscreen}
                      className={`text-[#f4e8d0] text-sm px-3 py-1 rounded border-2 border-[#f4e8d0]/60 hover:bg-[#f4e8d0]/15 transition-colors ${PIXEL_FONT}`}
                    >
                      ⛶ ぜんがめん
                    </button>
                  </div>
                </>
              ) : (
                <div className="aspect-video max-h-[80dvh] grid place-items-center p-6">
                  {mapStatus === 'checking' ? (
                    <p className={`text-[#8b5e3c] text-sm ${PIXEL_FONT}`}>ちずをひらいています…</p>
                  ) : (
                    /* 準備中の立て看板 */
                    <div className="text-center">
                      <div className="inline-block bg-[#fffaf0] border-4 border-[#8b5e3c] rounded px-6 py-5 shadow-[4px_4px_0_rgba(139,94,60,0.3)]">
                        <p className="text-3xl mb-2">🚧</p>
                        <p className={`text-lg text-[#5a3d26] ${PIXEL_FONT}`}>じゅんびちゅう</p>
                        <p className="mt-2 text-sm text-[#5a3d26]/70 leading-6">
                          もうすぐ冒険に出られます。
                          <br />
                          たのしみに待っていてね。
                        </p>
                      </div>
                      <div className="mx-auto w-1.5 h-8 bg-[#8b5e3c]" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 遊び方看板 */}
            <div className="mt-8 bg-[#fffaf0] border-4 border-[#8b5e3c] rounded-lg p-5 shadow-[4px_4px_0_rgba(139,94,60,0.3)]">
              <h2 className={`text-lg text-[#5a3d26] mb-3 ${PIXEL_FONT}`}>🪧 あそびかた</h2>
              <ul className="space-y-2 text-sm leading-6 text-[#5a3d26]/90">
                <li className="flex gap-2">
                  <span className="shrink-0">🚶</span>
                  <span>
                    <b>うごく</b>: WASDキー / 矢印キー(スマホは画面のDパッド or タップ)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">💬</span>
                  <span>
                    <b>はなす</b>: 大人に近づいて Enter / Space
                  </span>
                </li>
              </ul>
            </div>

            {/* クエストへの誘導 */}
            <Link
              href="/quest"
              className="mt-6 block bg-[#e8d9ba] border-4 border-dashed border-[#8b5e3c]/60 rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(139,94,60,0.3)] transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🏋️</span>
                <div className="flex-1">
                  <p className={`text-base text-[#5a3d26] ${PIXEL_FONT}`}>クエストに出かける</p>
                  <p className="text-sm text-[#5a3d26]/70 mt-1">学びの道はこちら →</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* マップからのイベント通知トースト(11-0) */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#fffaf0] border-4 border-[#8b5e3c] rounded px-5 py-3 shadow-[4px_4px_0_rgba(139,94,60,0.35)] text-[#5a3d26] text-sm ${PIXEL_FONT} animate-[fadeIn_0.2s_ease-out]`}
          >
            {toast}
          </div>
        )}
      </main>
    </>
  )
}
