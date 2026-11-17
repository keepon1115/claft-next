'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const REPORT_BUCKET = 'non-cognitive-reports'
const SIGNED_URL_EXPIRES_IN = 60 * 60 // 1時間

type ReportStatus = 'loading' | 'ready' | 'empty'

export default function MyselfReportPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading, user } = useAuth()
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<ReportStatus>('loading')

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    let cancelled = false
    setStatus('loading')

    const fetchSignedUrl = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data, error } = await supabase.storage
          .from(REPORT_BUCKET)
          .createSignedUrl(`${user.id}/report.pdf`, SIGNED_URL_EXPIRES_IN)

        if (cancelled) return

        if (error || !data?.signedUrl) {
          setStatus('empty')
          return
        }

        setReportUrl(data.signedUrl)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('empty')
      }
    }

    fetchSignedUrl()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isLoading, user])

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#2d5a3d] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#2d5a3d] text-xl font-semibold font-serif">認証確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center px-4">
        <div className="bg-[#fffdf8] border-2 border-dashed border-[#2d5a3d]/30 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="font-serif text-2xl font-bold text-[#2d5a3d] mb-2">
            🔒 ログインが必要です
          </h1>
          <p className="text-[#2d5a3d]/70 mb-6">
            能力図鑑は冒険者登録済みの方のみご覧いただけます。
          </p>
          <div className="space-y-4">
            <AuthButton
              variant="default"
              size="lg"
              redirectTo="/myself/report"
              defaultTab="login"
              className="w-full"
            />
            <button
              onClick={() => router.push('/myself')}
              className="w-full px-6 py-3 text-[#2d5a3d]/70 border border-[#2d5a3d]/30 rounded-lg hover:bg-[#2d5a3d]/5 transition-colors"
            >
              自分を理解するに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen relative bg-[#faf6ee] bg-[radial-gradient(#2d5a3d0d_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-[#2d5a3d] bg-[#c9a227]/10 border border-[#c9a227]/40 rounded-full px-3 py-1 font-bold text-xs tracking-wide">
                📊 能力図鑑
              </div>
              <h1 className="mt-3 font-serif text-3xl md:text-4xl font-black text-[#2d5a3d] tracking-wide">
                非認知能力レポート
              </h1>
              <p className="mt-2 text-[#2d5a3d]/70 font-serif">
                きみの「きみらしさ」を記録した観察レポート
              </p>
            </div>

            {status === 'loading' && (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-[#2d5a3d] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-[#2d5a3d]/70 font-serif">レポートを探しています...</p>
              </div>
            )}

            {status === 'empty' && (
              <div className="bg-[#fffdf8] border-2 border-dashed border-[#2d5a3d]/30 rounded-2xl p-10 text-center">
                <p className="text-4xl mb-4">📖</p>
                <p className="font-serif text-lg font-bold text-[#2d5a3d]">
                  レポート準備中です。楽しみに待っていてね
                </p>
              </div>
            )}

            {status === 'ready' && reportUrl && (
              <div>
                <div className="rounded-2xl overflow-hidden border-2 border-[#2d5a3d]/30 shadow-lg bg-white">
                  <iframe
                    src={reportUrl}
                    title="非認知能力レポート"
                    className="w-full"
                    style={{ height: '80vh', border: 'none' }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-[#2d5a3d] text-white font-bold hover:bg-[#254a32] transition-colors"
                  >
                    PDFを新しいタブで開く
                  </a>
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-[#2d5a3d]/60 font-serif">
              ※このレポートはおうちの人と一緒に見てね
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
