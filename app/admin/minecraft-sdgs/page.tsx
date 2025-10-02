'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, AlertCircle, List, ShieldCheck } from 'lucide-react'

interface PendingApproval {
  id: string
  user_id: string
  stage_id: number
  submitted_at: string
  sdgs_form_submitted_at: string | null
  programming_form_submitted_at: string | null
  user_nickname: string
  user_email: string
}

export default function MinecraftSdgsAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending'>('pending')
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [allProgress, setAllProgress] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // 承認待ちデータを取得
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserSupabaseClient()
      
      const { data, error } = await supabase
        .from('minecraft_sdgs_progress')
        .select(`
          id,
          user_id,
          stage_id,
          submitted_at,
          sdgs_form_submitted_at,
          programming_form_submitted_at
        `)
        .eq('status', 'pending_approval')
        .order('submitted_at', { ascending: true })
      
      if (error) throw error
      
      // ユーザー情報を取得
      const userIds = [...new Set(data?.map(d => d.user_id) || [])]
      const { data: users, error: usersError } = await supabase
        .from('users_profile')
        .select('id, nickname, email')
        .in('id', userIds)
      
      if (usersError) throw usersError
      
      // データをマージ
      const merged = data?.map(approval => {
        const user = users?.find(u => u.id === approval.user_id)
        return {
          ...approval,
          user_nickname: user?.nickname || '名無し',
          user_email: user?.email || ''
        }
      }) || []
      
      setPendingApprovals(merged)
    } catch (error) {
      console.error('承認待ちデータ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  // 進捗一覧取得
  const fetchAllProgress = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserSupabaseClient()

      const { data, error } = await supabase
        .from('minecraft_sdgs_progress')
        .select(`
          id,
          user_id,
          stage_id,
          status,
          submitted_at,
          sdgs_form_submitted_at,
          programming_form_submitted_at
        `)
        .order('user_id', { ascending: true })
        .order('stage_id', { ascending: true })

      if (error) throw error

      const userIds = [...new Set(data?.map(d => d.user_id) || [])]
      const { data: users } = await supabase
        .from('users_profile')
        .select('id, nickname, email')
        .in('id', userIds)

      const merged = (data || []).map(row => {
        const user = users?.find(u => u.id === row.user_id)
        return {
          ...row,
          user_nickname: user?.nickname || '名無し',
          user_email: user?.email || ''
        }
      }) as PendingApproval[]

      setAllProgress(merged)
    } catch (e) {
      console.error('進捗一覧取得エラー:', e)
      setAllProgress([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'overview') fetchAllProgress()
  }, [activeTab])

  // 承認処理
  const callApproveApi = async (userId: string, stageId: number) => {
    const supabase = createBrowserSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/minecraft-sdgs/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ userId, stageId })
    })
    const json = await res.json()
    if (!res.ok || !json?.success) throw new Error(json?.error || 'approve_failed')
    return json
  }

  const callRejectApi = async (userId: string, stageId: number, reason: string) => {
    const supabase = createBrowserSupabaseClient()
    const { data: { session} } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/minecraft-sdgs/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ userId, stageId, reason })
    })
    const json = await res.json()
    if (!res.ok || !json?.success) throw new Error(json?.error || 'reject_failed')
    return json
  }

  const handleApprove = async (approval: PendingApproval) => {
    if (processingId) return
    
    if (!confirm(`${approval.user_nickname}さんのステージ${approval.stage_id}を承認しますか？`)) {
      return
    }
    
    setProcessingId(approval.id)
    
    try {
      await callApproveApi(approval.user_id, approval.stage_id)
      alert('承認しました')
      await Promise.all([
        fetchPendingApprovals(),
        activeTab === 'overview' ? fetchAllProgress() : Promise.resolve()
      ])
    } catch (error) {
      console.error('承認エラー:', error)
      alert('承認処理に失敗しました')
    } finally {
      setProcessingId(null)
    }
  }

  // 却下モーダルを開く
  const openRejectModal = (approval: PendingApproval) => {
    setSelectedApproval(approval)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  // 却下処理
  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      alert('却下理由を入力してください')
      return
    }
    
    if (processingId) return
    
    setProcessingId(selectedApproval.id)
    
    try {
      await callRejectApi(selectedApproval.user_id, selectedApproval.stage_id, rejectionReason)
      alert('却下しました')
      setRejectModalOpen(false)
      setSelectedApproval(null)
      setRejectionReason('')
      await Promise.all([
        fetchPendingApprovals(),
        activeTab === 'overview' ? fetchAllProgress() : Promise.resolve()
      ])
    } catch (error) {
      console.error('却下エラー:', error)
      alert('却下処理に失敗しました')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">マイクラSDGs 管理</h1>
          <p className="text-gray-600">全ユーザーの進捗確認と承認作業を行います</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <ShieldCheck className="inline w-4 h-4 mr-1" /> 承認待ち
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <List className="inline w-4 h-4 mr-1" /> 進捗一覧
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : activeTab === 'pending' ? (
          pendingApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">承認待ちのステージはありません</p>
          </div>
          ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ステージ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    申請日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    回答状況
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {approval.user_nickname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {approval.user_email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-blue-600">
                        ステージ {approval.stage_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(approval.submitted_at).toLocaleString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {approval.sdgs_form_submitted_at ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span className="text-gray-600">SDGsワーク</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {approval.programming_form_submitted_at ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span className="text-gray-600">マイクラワーク</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(approval)}
                        disabled={processingId === approval.id}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {processingId === approval.id ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            処理中
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            承認
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openRejectModal(approval)}
                        disabled={processingId === approval.id}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <XCircle className="w-4 h-4" />
                        却下
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ステージ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">状態</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allProgress.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{row.user_nickname}</div>
                      <div className="text-sm text-gray-500">{row.user_email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-semibold text-blue-600">ステージ {row.stage_id}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : row.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      {row.status === 'pending_approval' ? (
                        <>
                          <button
                            onClick={() => handleApprove(row)}
                            disabled={processingId === row.id}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <CheckCircle className="w-4 h-4" /> 承認
                          </button>
                          <button
                            onClick={() => openRejectModal(row)}
                            disabled={processingId === row.id}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <XCircle className="w-4 h-4" /> 却下
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">承認操作対象外</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 却下モーダル */}
      {rejectModalOpen && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ステージ{selectedApproval.stage_id}を却下
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedApproval.user_nickname}さんのステージを却下します。<br />
              却下理由を入力してください（ユーザーに通知されます）
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="却下理由を入力..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedApproval(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedApproval.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processingId === selectedApproval.id ? '処理中...' : '却下する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
