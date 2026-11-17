'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Printer, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { getRoboPrintReport, type RoboPrintReport } from '../../../actions'

export default function RoboPrintPage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.themeId as string
  const userId = params.userId as string
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const [report, setReport] = useState<RoboPrintReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return
    ;(async () => {
      setLoading(true)
      const result = await getRoboPrintReport(themeId, userId)
      if (result.error || !result.data) {
        setError(result.error ?? 'データの取得に失敗しました')
      } else {
        setReport(result.data)
      }
      setLoading(false)
    })()
  }, [authLoading, isAuthenticated, isAdmin, themeId, userId])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">管理者権限が必要です</h1>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> 戻る
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          <Printer size={16} /> 印刷する
        </button>
      </div>

      <div className="robo-print-sheet mx-auto bg-white p-[12mm] text-[11pt] text-gray-900 shadow-lg print:shadow-none">
        <header className="mb-4 border-b-2 border-gray-800 pb-2">
          <p className="text-xs text-gray-500">ロボクエスト ふりかえりシート</p>
          <h1 className="text-xl font-bold">
            Lv.{report.level}-{report.themeNumber} {report.themeTitle}
          </h1>
          <p className="mt-1 text-sm">氏名（ニックネーム）: {report.nickname}</p>
        </header>

        <section className="mb-4">
          <h2 className="mb-1 text-sm font-bold">① クイズ結果</h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              {report.quizResults.map((q, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="w-6 py-1 align-top font-bold">{idx + 1}</td>
                  <td className="py-1 align-top">
                    <p>{q.body}</p>
                    <p className="text-gray-500">
                      選んだ答え: {q.selectedIndex >= 0 ? q.choices[q.selectedIndex] : '（未回答）'}
                    </p>
                  </td>
                  <td className="w-16 py-1 text-right align-top">
                    {q.isCorrect ? (
                      <span className="inline-flex items-center gap-0.5 font-bold text-green-700">
                        <CheckCircle2 size={12} /> 正解
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 font-bold text-red-500">
                        <XCircle size={12} /> 不正解
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-4">
          <h2 className="mb-1 text-sm font-bold">② 問いへの回答（本人）</h2>
          <p className="whitespace-pre-wrap rounded border border-gray-200 p-2 text-xs leading-relaxed">
            {report.myOpenAnswer || '（未回答）'}
          </p>
        </section>

        <section className="mb-4">
          <h2 className="mb-1 text-sm font-bold">③ クラスの回答（抜粋）</h2>
          {report.classExcerpts.length === 0 ? (
            <p className="text-xs text-gray-400">表示できる回答がありません。</p>
          ) : (
            <ul className="space-y-1">
              {report.classExcerpts.map((c, idx) => (
                <li key={idx} className="rounded border border-gray-200 p-2 text-xs leading-relaxed">
                  <span className="font-bold">{c.nickname}: </span>
                  {c.body}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-sm font-bold">④ 正解じゃないけど、こんな見方もあるよ</h2>
          {report.caseImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.caseImageUrl}
              alt="事例解説の画像"
              className="mb-2 w-full rounded border border-gray-200 object-contain"
              style={{ maxHeight: '80mm' }}
            />
          )}
          {report.caseStudyMd && (
            <p className="whitespace-pre-wrap rounded border border-gray-200 p-2 text-xs leading-relaxed">
              {report.caseStudyMd}
            </p>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
        .robo-print-sheet {
          width: 210mm;
          min-height: 297mm;
        }
      `}</style>
    </div>
  )
}
