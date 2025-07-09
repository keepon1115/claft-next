'use client'

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Check, X, Calendar, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { approveQuest, rejectQuest, bulkApprove } from '@/app/admin/actions'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

// =====================================================
// 型定義
// =====================================================

interface PendingApproval {
  id: string
  user_id: string
  stage_id: number
  status: string
  submitted_at: string | null
  google_form_submitted: boolean | null
  users_profile: {
    nickname: string | null
    email: string
  } | null
}

interface ApprovalTableProps {
  /** ページサイズ（デフォルト: 10） */
  pageSize?: number
  /** フィルター条件 */
  filters?: {
    userSearch?: string
    stageFilter?: number | null
    dateFilter?: string
  }
  /** 承認/却下時のコールバック */
  onApprovalChange?: () => void
  /** 通知表示関数 */
  onNotification?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

// =====================================================
// メモ化されたテーブル行コンポーネント
// =====================================================

const TableRow = memo(({ 
  approval, 
  isSelected, 
  onSelect, 
  onApprove, 
  onReject,
  isOptimistic
}: { 
  approval: PendingApproval
  isSelected: boolean
  onSelect: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isOptimistic: boolean
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '日時不明'
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className={`border-b hover:bg-gray-50 ${isOptimistic ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(approval.id)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
            {approval.users_profile?.nickname?.[0] || approval.users_profile?.email?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium">{approval.users_profile?.nickname || '名前未設定'}</div>
            <div className="text-sm text-gray-500">{approval.users_profile?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ステージ {approval.stage_id}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar size={14} />
          <span className="text-sm">{formatDate(approval.submitted_at)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onApprove(approval.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Check size={14} className="mr-1" />
            承認
          </button>
          <button
            onClick={() => onReject(approval.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <X size={14} className="mr-1" />
            却下
          </button>
        </div>
      </td>
    </tr>
  )
})

TableRow.displayName = 'TableRow'

// =====================================================
// メインコンポーネント
// =====================================================

export default function ApprovalTable({
  pageSize = 10,
  filters,
  onApprovalChange,
  onNotification
}: ApprovalTableProps) {
  // onNotificationの安定した参照を保持
  const onNotificationRef = useRef(onNotification)
  const onApprovalChangeRef = useRef(onApprovalChange)
  
  // refを更新
  useEffect(() => {
    onNotificationRef.current = onNotification
    onApprovalChangeRef.current = onApprovalChange
  }, [onNotification, onApprovalChange])

  // ステート管理
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set())
  
  // ページネーション
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: pageSize
  })

  // Supabaseクライアント
  const supabase = createBrowserSupabaseClient()

  // 通知ヘルパー
  const showNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    if (onNotificationRef.current) {
      onNotificationRef.current(type, title, message)
    } else {
      console.log(`[${type}] ${title}: ${message}`)
    }
  }, [])

  // データ読み込み
  const loadPendingApprovals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // まず quest_progress だけを取得
      let query = supabase
        .from('quest_progress')
        .select(`
          id,
          user_id,
          stage_id,
          status,
          submitted_at,
          google_form_submitted
        `, { count: 'exact' })
        .eq('status', 'pending_approval')
        .order('submitted_at', { ascending: false })

      // フィルター適用
      if (filters?.stageFilter) {
        query = query.eq('stage_id', filters.stageFilter)
      }

      if (filters?.dateFilter) {
        const filterDate = new Date(filters.dateFilter)
        const nextDay = new Date(filterDate)
        nextDay.setDate(nextDay.getDate() + 1)
        
        query = query
          .gte('submitted_at', filterDate.toISOString())
          .lt('submitted_at', nextDay.toISOString())
      }

      // ページネーション
      const startIndex = (pagination.currentPage - 1) * pageSize
      query = query.range(startIndex, startIndex + pageSize - 1)

      const { data: questData, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      // 別途 users_profile を取得
      const userIds = questData?.map(q => q.user_id) || []
      let userProfiles: any[] = []
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        
        userProfiles = profileData || []
      }

      // データを結合
      const combinedData = questData?.map(quest => ({
        ...quest,
        users_profile: userProfiles.find(profile => profile.id === quest.user_id) || {
          nickname: null,
          email: 'unknown@example.com'
        }
      })) || []

      // フィルター適用（ユーザー検索）
      let filteredData = combinedData
      if (filters?.userSearch) {
        const searchTerm = filters.userSearch.toLowerCase()
        filteredData = combinedData.filter(item => 
          item.users_profile?.nickname?.toLowerCase().includes(searchTerm) ||
          item.users_profile?.email?.toLowerCase().includes(searchTerm)
        )
      }

      setPendingApprovals(filteredData as PendingApproval[])
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }))

    } catch (error) {
      console.error('データ取得エラー:', error)
      setError('データの取得に失敗しました')
      setPendingApprovals([])
    } finally {
      setLoading(false)
    }
  }, [supabase, filters?.stageFilter, filters?.dateFilter, filters?.userSearch, pagination.currentPage, pageSize])

  // loadPendingApprovalsの安定した参照を保持
  const loadPendingApprovalsRef = useRef(loadPendingApprovals)
  
  // refを更新
  useEffect(() => {
    loadPendingApprovalsRef.current = loadPendingApprovals
  }, [loadPendingApprovals])

  // 初期化（依存配列を最小限に）
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          setCurrentAdminId(session.user.id)
        }
      } catch (error) {
        console.error('初期化エラー:', error)
        setError('初期化に失敗しました')
      }
    }

    initialize()
  }, [supabase])

  // データ読み込み専用のuseEffect（無限ループを防ぐ）
  useEffect(() => {
    loadPendingApprovalsRef.current?.()
  }, [filters?.stageFilter, filters?.dateFilter, filters?.userSearch, pagination.currentPage, pageSize])

  // 承認処理
  const handleApprove = async (id: string) => {
    try {
      const approval = pendingApprovals.find(a => a.id === id)
      if (!approval) return

      setOptimisticUpdates(prev => new Set([...prev, id]))

      const result = await approveQuest(approval.user_id, approval.stage_id)
      
      if (result.success) {
        showNotification('success', 'クエストを承認しました')
        if (onApprovalChangeRef.current) onApprovalChangeRef.current()
        await loadPendingApprovalsRef.current?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('承認エラー:', error)
      showNotification('error', '承認に失敗しました')
    } finally {
        setOptimisticUpdates(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // 却下処理
  const handleReject = async (id: string) => {
    try {
      const approval = pendingApprovals.find(a => a.id === id)
      if (!approval) return

      setOptimisticUpdates(prev => new Set([...prev, id]))

      const result = await rejectQuest(approval.user_id, approval.stage_id)
      
      if (result.success) {
        showNotification('success', 'クエストを却下しました')
        if (onApprovalChangeRef.current) onApprovalChangeRef.current()
        await loadPendingApprovalsRef.current?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('却下エラー:', error)
      showNotification('error', '却下に失敗しました')
    } finally {
        setOptimisticUpdates(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // 一括承認処理
  const handleBulkApprove = async () => {
    try {
      const selectedApprovals = pendingApprovals.filter(a => selectedItems.has(a.id))
      const userStageIds = selectedApprovals.map(a => ({
        userId: a.user_id,
        stageId: a.stage_id
      }))

      selectedApprovals.forEach(a => {
        setOptimisticUpdates(prev => new Set([...prev, a.id]))
      })
      
      const result = await bulkApprove(userStageIds)
      
      if (result.success) {
        showNotification('success', `${selectedItems.size}件のクエストを一括承認しました`)
        setSelectedItems(new Set())
        if (onApprovalChangeRef.current) onApprovalChangeRef.current()
        await loadPendingApprovalsRef.current?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('一括承認エラー:', error)
      showNotification('error', '一括承認に失敗しました')
    } finally {
      setOptimisticUpdates(new Set())
    }
  }

  // 選択処理
  const handleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 全選択処理
  const handleSelectAll = () => {
    if (selectedItems.size === pendingApprovals.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(pendingApprovals.map(a => a.id)))
    }
  }

  // ページ移動
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  // レンダリング
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">承認待ちクエスト</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {pagination.totalItems} 件
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPendingApprovalsRef.current?.()}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <RefreshCw size={14} className="mr-1" />
            更新
          </button>
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkApprove}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Check size={14} className="mr-1" />
              一括承認 ({selectedItems.size})
            </button>
          )}
          </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === pendingApprovals.length && pendingApprovals.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステージ
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                提出日時
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span>読み込み中...</span>
                    </div>
                  </td>
                </tr>
            ) : pendingApprovals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  承認待ちのクエストはありません
                </td>
              </tr>
            ) : (
              pendingApprovals.map(approval => (
                <TableRow
                  key={approval.id}
                  approval={approval}
                  isSelected={selectedItems.has(approval.id)}
                  onSelect={handleSelect}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isOptimistic={optimisticUpdates.has(approval.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              前へ
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              次へ
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                全 <span className="font-medium">{pagination.totalItems}</span> 件中
                <span className="font-medium"> {(pagination.currentPage - 1) * pageSize + 1} </span>
                -
                <span className="font-medium">
                  {' '}
                  {Math.min(pagination.currentPage * pageSize, pagination.totalItems)}{' '}
                </span>
                件を表示
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">前へ</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === i + 1
                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">次へ</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
