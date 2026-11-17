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
    if (!res.ok || !json?.success) {
      // 詳細なエラー情報をログ出力
      console.error('承認APIエラー詳細:', {
        status: res.status,
        error: json?.error,
        details: json?.details,
        hint: json?.hint,
        code: json?.code
      })
      // エラーメッセージに詳細情報を含める
      const errorMsg = json?.details ? `${json.error}: ${json.details}` : (json?.error || 'approve_failed')
      throw new Error(errorMsg)
    }
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
      alert('✅ 承認しました')
      await Promise.all([
        fetchPendingApprovals(),
        activeTab === 'overview' ? fetchAllProgress() : Promise.resolve()
      ])
    } catch (error) {
      console.error('承認エラー:', error)
      const errorMessage = error instanceof Error ? error.message : '承認処理に失敗しました'
      alert(`❌ 承認処理に失敗しました\n\nエラー: ${errorMessage}\n\n詳細はブラウザのコンソールを確認してください。`)
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
      alert('✅ 却下しました')
      setRejectModalOpen(false)
      setSelectedApproval(null)
      setRejectionReason('')
      await Promise.all([
        fetchPendingApprovals(),
        activeTab === 'overview' ? fetchAllProgress() : Promise.resolve()
      ])
    } catch (error) {
      console.error('却下エラー:', error)
      const errorMessage = error instanceof Error ? error.message : '却下処理に失敗しました'
      alert(`❌ 却下処理に失敗しました\n\nエラー: ${errorMessage}\n\n詳細はブラウザのコンソールを確認してください。`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">マイクラSDGs 管理</h1>
          <p className="text-sm md:text-base text-gray-600">全ユーザーの進捗確認と承認作業を行います</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <ShieldCheck className="inline w-5 h-5 mr-2" /> 承認待ち
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <List className="inline w-5 h-5 mr-2" /> 進捗一覧
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
          <>
            {/* PC用テーブル表示 */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
                          className="inline-flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

            {/* スマホ用カード表示 */}
            <div className="md:hidden space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-900 mb-1">
                        {approval.user_nickname}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {approval.user_email}
                      </div>
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        ステージ {approval.stage_id}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <div className="text-xs text-gray-500 mb-2">
                      申請日時: {new Date(approval.submitted_at).toLocaleString('ja-JP')}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {approval.sdgs_form_submitted_at ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className="text-gray-700">SDGsワーク</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {approval.programming_form_submitted_at ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className="text-gray-700">マイクラワーク</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={processingId === approval.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      {processingId === approval.id ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          処理中
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          承認
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openRejectModal(approval)}
                      disabled={processingId === approval.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      却下
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
          )
        ) : (
          <>
            {/* PC用テーブル表示 */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
                              className="inline-flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

            {/* スマホ用カード表示 */}
            <div className="md:hidden space-y-4">
              {allProgress.map(row => (
                <div key={row.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-900 mb-1">
                        {row.user_nickname}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {row.user_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          ステージ {row.stage_id}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : row.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {row.status === 'pending_approval' ? (
                    <div className="flex gap-2 mt-3 border-t pt-3">
                      <button
                        onClick={() => handleApprove(row)}
                        disabled={processingId === row.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        <CheckCircle className="w-5 h-5" /> 承認
                      </button>
                      <button
                        onClick={() => openRejectModal(row)}
                        disabled={processingId === row.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        <XCircle className="w-5 h-5" /> 却下
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-gray-400 mt-3 border-t pt-3">
                      承認操作対象外
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 却下モーダル */}
      {rejectModalOpen && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
              ステージ{selectedApproval.stage_id}を却下
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              {selectedApproval.user_nickname}さんのステージを却下します。<br />
              却下理由を入力してください（ユーザーに通知されます）
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="却下理由を入力..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] text-base focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedApproval(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedApproval.id}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
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
