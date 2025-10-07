'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdminOnly } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

type PostRow = {
  id: string
  post_date: string
  content: string
  implemented: boolean
}

export default function AdminHiramekiPostsPage() {
  const { isLoading } = useAdminOnly({ redirectTo: '/unauthorized' })
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState<{ post_date: string; content: string; implemented: boolean }>({
    post_date: new Date().toISOString().split('T')[0],
    content: '',
    implemented: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState<PostRow[]>([])

  const fetchRows = async () => {
    const { data } = await supabase
      .from('hirameki_posts')
      .select('id, post_date, content, implemented')
      .order('post_date', { ascending: false })
      .order('created_at', { ascending: false })
    setRows((data as PostRow[]) || [])
  }

  useEffect(() => {
    fetchRows()
    const ch = supabase.channel('realtime-hirameki-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hirameki_posts' }, () => fetchRows())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('hirameki_posts')
        .insert({
          post_date: form.post_date,
          content: form.content.trim(),
          implemented: form.implemented,
        })
      if (error) throw error
      setForm({ post_date: new Date().toISOString().split('T')[0], content: '', implemented: false })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleImplement = async (id: string, implemented: boolean) => {
    await supabase.from('hirameki_posts').update({ implemented }).eq('id', id)
  }

  const removeRow = async (id: string) => {
    if (!confirm('削除してよろしいですか？')) return
    await supabase.from('hirameki_posts').delete().eq('id', id)
  }

  if (isLoading) return null

  const toggleSidebar = () => setSidebarOpen(v => !v)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen bg-slate-50 relative">
        <div className="pt-8 pb-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h1 className="text-[22px] md:text-2xl font-extrabold flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-white bg-slate-600">💡</span>
                <span>ひらめき管理</span>
              </h1>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-600">日付</label>
                  <input type="date" value={form.post_date} onChange={(e) => setForm(f => ({ ...f, post_date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600">内容</label>
                  <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" rows={3} placeholder="例：イベントや学びのアイデア、アプリ改善など" required />
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={form.implemented} onChange={(e) => setForm(f => ({ ...f, implemented: e.target.checked }))} />
                  実装済にする
                </label>
                <div>
                  <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition disabled:opacity-60">
                    {submitting ? '追加中...' : '追加'}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">日付</th>
                    <th className="px-4 py-3 text-left font-bold">内容</th>
                    <th className="px-4 py-3 text-left font-bold">実装</th>
                    <th className="px-4 py-3 text-left font-bold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 whitespace-nowrap font-bold">{formatYmd(r.post_date)}</td>
                      <td className="px-4 py-3">{r.content}</td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={r.implemented} onChange={(e) => toggleImplement(r.id, e.target.checked)} />
                          {r.implemented ? '✅ 実装済' : '—'}
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeRow(r.id)} className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 border border-slate-300 hover:bg-slate-50">削除</button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">まだ登録がありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

function formatYmd(dateLike: string) {
  const d = new Date(dateLike)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return `${y}/${m}/${dd}`
}


