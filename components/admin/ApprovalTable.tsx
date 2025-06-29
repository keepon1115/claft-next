'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Check, X, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
// ApprovalTableコンポーネント
// =====================================================

export default function ApprovalTable({
  pageSize = 10,
  filters,
  onApprovalChange,
  onNotification
}: ApprovalTableProps) {
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

  // ヘルパー関数を先に定義
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    if (onNotification) {
      onNotification(type, title, message)
    } else {
      console.log(`[${type}] ${title}: ${message}`)
    }
  }
  
  // Realtimeフックの統合
  const {
    isConnected: realtimeConnected,
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
    markNotificationAsRead: markRealtimeNotificationAsRead,
    clearNotifications: clearRealtimeNotifications,
    reconnect: reconnectRealtime
  } = useRealtimeUpdates({
    onNotification: showNotification,
    onDataUpdate: () => {
      // データが更新された時にテーブルを再読み込み
      loadPendingApprovals()
    },
    currentAdminId
  })



  // =====================================================
  // 初期化とデータ取得
  // =====================================================

  useEffect(() => {
    initializeComponent()
  }, [])

  useEffect(() => {
    loadPendingApprovals()
  }, [filters, pagination.currentPage, pageSize])

  const initializeComponent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        setCurrentAdminId(session.user.id)
      }
      await loadPendingApprovals()
    } catch (error) {
      console.error('初期化エラー:', error)
      setError('初期化に失敗しました')
    }
  }

  const loadPendingApprovals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 承認待ちクエストを取得
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

      const startIndex = (pagination.currentPage - 1) * pageSize
      query = query.range(startIndex, startIndex + pageSize - 1)

      const { data: questData, error: questError, count } = await query

      if (questError) throw questError

      if (!questData || questData.length === 0) {
        setPendingApprovals([])
        setPagination(prev => ({
          ...prev,
          totalItems: 0,
          totalPages: 0,
          itemsPerPage: pageSize
        }))
        return
      }

      // ユーザー情報を別途取得
      const userIds = [...new Set(questData.map(item => item.user_id))]
      const { data: usersData, error: usersError } = await supabase
        .from('users_profile')
        .select('id, nickname, email')
        .in('id', userIds)

      if (usersError) {
        console.warn('ユーザー情報取得エラー:', usersError)
      }

      // ユーザー情報をマップ化
      const usersMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = user
        return acc
      }, {} as Record<string, { id: string; nickname: string | null; email: string }>)

      // データを結合
      const combinedData = questData.map(quest => ({
        ...quest,
        users_profile: usersMap[quest.user_id] || null
      }))

      // ユーザー検索のフィルタリング
      let filteredData = combinedData
      if (filters?.userSearch) {
        const searchTerm = filters.userSearch.toLowerCase()
        filteredData = combinedData.filter(item => {
          const userEmail = item.users_profile?.email?.toLowerCase() || ''
          const userName = item.users_profile?.nickname?.toLowerCase() || ''
          return userEmail.includes(searchTerm) || userName.includes(searchTerm)
        })
      }

      setPendingApprovals(filteredData)
      
      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / pageSize)
      
      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages,
        itemsPerPage: pageSize
      }))

    } catch (error: unknown) {
      console.error('承認待ちデータ取得エラー:', error)
      setError('データの取得に失敗しました')
      const errorMessage = error instanceof Error ? error.message : '承認待ちクエストの取得に失敗しました'
      showNotification('error', 'データ取得エラー', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [supabase, filters, pagination.currentPage, pageSize])

  // =====================================================
  // 選択管理
  // =====================================================

  const toggleSelection = useCallback((userId: string, stageId: number) => {
    const key = `${userId}-${stageId}`
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = pendingApprovals.map(item => `${item.user_id}-${item.stage_id}`)
      setSelectedItems(new Set(allKeys))
    } else {
      setSelectedItems(new Set())
    }
  }, [pendingApprovals])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  // =====================================================
  // ヘルパー関数
  // =====================================================

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getUserDisplayName = (userProfile: PendingApproval['users_profile']) => {
    if (!userProfile) return 'Unknown'
    return userProfile.nickname || userProfile.email?.split('@')[0] || 'Unknown'
  }

  const getUserAvatar = (userProfile: PendingApproval['users_profile']) => {
    const name = getUserDisplayName(userProfile)
    return name.charAt(0).toUpperCase()
  }

  // =====================================================
  // 承認/却下処理
  // =====================================================

  const handleApproveQuest = useCallback(async (userId: string, stageId: number) => {
    let userName = 'Unknown'
    try {
      const { data: user } = await supabase
        .from('users_profile')
        .select('nickname, email')
        .eq('id', userId)
        .single()
      
      userName = user?.nickname || user?.email?.split('@')[0] || 'Unknown'
    } catch (error) {
      console.warn('ユーザー情報取得失敗:', error)
    }

    const nextStageMessage = stageId < 6 ? 
      `次のステージ（ステージ${stageId + 1}）が自動的に解放されます` : 
      '全ステージ完了となります！🎉'
    
    const confirmMessage = `ユーザー: ${userName}\nステージ${stageId}のクエストを承認しますか？\n\n承認すると：\n・このステージが完了状態になります\n・${nextStageMessage}\n・ユーザーの統計情報が更新されます`
    
    if (!confirm(confirmMessage)) {
      return
    }

    // 楽観的更新: UIを即座に更新
    const optimisticKey = `${userId}-${stageId}`
    setOptimisticUpdates(prev => new Set(prev).add(optimisticKey))
    setPendingApprovals(prev => prev.filter(item => 
      !(item.user_id === userId && item.stage_id === stageId)
    ))

    try {
      showNotification('info', '処理中...', 'クエストを承認しています')
      
      const result = await approveQuest(userId, stageId)
      
      if (result.success) {
        const successMessage = result.nextStageUnlocked ? 
          `ステージ${stageId + 1}が解放されました！` : 
          '🎉 全ステージ完了おめでとうございます！'
        
        showNotification('success', '承認完了', `${result.message} ${successMessage}`)
        onApprovalChange?.()
      } else {
        throw new Error(result.error)
      }

    } catch (error: unknown) {
      console.error('承認エラー:', error)
      const errorMessage = error instanceof Error ? error.message : '承認処理中にエラーが発生しました'
      showNotification('error', '承認失敗', errorMessage)
      
      // エラー時は楽観的更新を取り消し
      await loadPendingApprovals()
    } finally {
      // 楽観的更新の清理（遅延実行）
      setTimeout(() => {
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(optimisticKey)
          return newSet
        })
      }, 2000)
    }
  }, [supabase, loadPendingApprovals, onApprovalChange])

  const handleRejectQuest = useCallback(async (userId: string, stageId: number) => {
    let userName = 'Unknown'
    try {
      const { data: user } = await supabase
        .from('users_profile')
        .select('nickname, email')
        .eq('id', userId)
        .single()
      
      userName = user?.nickname || user?.email?.split('@')[0] || 'Unknown'
    } catch (error) {
      console.warn('ユーザー情報取得失敗:', error)
    }

    const confirmMessage = `ユーザー: ${userName}\nステージ${stageId}のクエストを却下しますか？\n\n却下すると：\n・ステージが「挑戦中」状態に戻ります\n・ユーザーは再度クエストに挑戦できます\n・却下履歴が記録されます`
    
    if (!confirm(confirmMessage)) {
      return
    }

    // 楽観的更新: UIを即座に更新
    const optimisticKey = `${userId}-${stageId}`
    setOptimisticUpdates(prev => new Set(prev).add(optimisticKey))
    setPendingApprovals(prev => prev.filter(item => 
      !(item.user_id === userId && item.stage_id === stageId)
    ))

    try {
      showNotification('info', '処理中...', 'クエストを却下しています')
      
      const result = await rejectQuest(userId, stageId)
      
      if (result.success) {
        showNotification('success', '却下完了', result.message)
        onApprovalChange?.()
      } else {
        throw new Error(result.error)
      }

    } catch (error: unknown) {
      console.error('却下エラー:', error)
      const errorMessage = error instanceof Error ? error.message : '却下処理中にエラーが発生しました'
      showNotification('error', '却下失敗', errorMessage)
      
      // エラー時は楽観的更新を取り消し
      await loadPendingApprovals()
    } finally {
      // 楽観的更新の清理（遅延実行）
      setTimeout(() => {
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(optimisticKey)
          return newSet
        })
      }, 2000)
    }
  }, [supabase, loadPendingApprovals, onApprovalChange])

  // 一括承認処理
  const handleBulkApprove = useCallback(async () => {
    if (selectedItems.size === 0) {
      showNotification('error', 'エラー', '承認する項目を選択してください')
      return
    }

    const userStageIds = Array.from(selectedItems).map(key => {
      const [userId, stageId] = key.split('-')
      return { userId, stageId: parseInt(stageId) }
    })

    const confirmMessage = `選択された${userStageIds.length}件のクエストを一括承認しますか？\n\n注意：この操作は取り消せません。`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      showNotification('info', '処理中...', `${userStageIds.length}件のクエストを一括承認しています`)
      
      const result = await bulkApprove(userStageIds)
      
      if (result.success) {
        showNotification('success', '一括承認完了', result.message)
        if (result.errors) {
          console.warn('一括承認で一部エラー:', result.errors)
        }
        clearSelection()
        await loadPendingApprovals()
        onApprovalChange?.()
      } else {
        throw new Error(result.error)
      }

    } catch (error: unknown) {
      console.error('一括承認エラー:', error)
      const errorMessage = error instanceof Error ? error.message : '一括承認処理中にエラーが発生しました'
      showNotification('error', '一括承認失敗', errorMessage)
    }
  }, [selectedItems, loadPendingApprovals, onApprovalChange, clearSelection])

  // =====================================================
  // レンダリング
  // =====================================================

  if (loading) {
    return (
      <div className="approval-table-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>承認待ちクエストを読み込み中...</p>
        </div>
        
        <style jsx>{`
          .approval-table-container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .loading {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          .loading-spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #673AB7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="approval-table-container">
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <h3>エラーが発生しました</h3>
          <p>{error}</p>
          <button onClick={loadPendingApprovals} className="retry-button">
            再試行
          </button>
        </div>
        
        <style jsx>{`
          .approval-table-container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .error-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          .error-icon {
            width: 48px;
            height: 48px;
            color: #f44336;
            margin-bottom: 16px;
          }
          .retry-button {
            background: #673AB7;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 16px;
            transition: background 0.2s;
          }
          .retry-button:hover {
            background: #512DA8;
          }
        `}</style>
      </div>
    )
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="approval-table-container">
        <div className="empty-state">
          <Check className="empty-icon" />
          <h3>承認待ちのクエストはありません</h3>
          <p>現在、承認が必要なクエストはありません。</p>
        </div>
        
        <style jsx>{`
          .approval-table-container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          .empty-icon {
            width: 48px;
            height: 48px;
            color: #4CAF50;
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="approval-table-container">
      {/* リアルタイム接続ステータス */}
      <div className="realtime-status">
        <div className={`connection-indicator ${realtimeConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          <span className="status-text">
            {realtimeConnected ? 'リアルタイム接続中' : '接続を試行中...'}
          </span>
        </div>
        {realtimeUnreadCount > 0 && (
          <div className="notification-badge">
            <span className="badge-text">{realtimeUnreadCount}</span>
          </div>
        )}
      </div>

      {/* 一括アクション */}
      {selectedItems.size > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">
            {selectedItems.size}件選択中
          </span>
          <div className="bulk-buttons">
            <button onClick={handleBulkApprove} className="bulk-approve-btn">
              <Check size={16} />
              一括承認
            </button>
            <button onClick={clearSelection} className="clear-selection-btn">
              選択解除
            </button>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div className="table-wrapper">
        <table className="approval-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedItems.size === pendingApprovals.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="table-checkbox"
                />
              </th>
              <th>ユーザー</th>
              <th>ステージ</th>
              <th>提出日時</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item) => {
              const key = `${item.user_id}-${item.stage_id}`
              const isSelected = selectedItems.has(key)
              
              return (
                <tr key={key} className={isSelected ? 'selected' : ''}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(item.user_id, item.stage_id)}
                      className="table-checkbox"
                    />
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {getUserAvatar(item.users_profile)}
                      </div>
                      <div>
                        <div className="user-name">
                          {getUserDisplayName(item.users_profile)}
                        </div>
                        <div className="user-email">
                          {item.users_profile?.email || 'unknown@example.com'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="stage-badge">
                      ステージ {item.stage_id}
                    </span>
                  </td>
                  <td className="date-cell">
                    <Calendar size={16} />
                    {formatDate(item.submitted_at)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleApproveQuest(item.user_id, item.stage_id)}
                        className="approve-btn"
                        title="承認"
                      >
                        <Check size={16} />
                        承認
                      </button>
                      <button
                        onClick={() => handleRejectQuest(item.user_id, item.stage_id)}
                        className="reject-btn"
                        title="却下"
                      >
                        <X size={16} />
                        却下
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            {pagination.totalItems}件中 {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}件を表示
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
              前へ
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.currentPage) <= 2
                )
                .map((page, index, array) => (
                  <div key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="page-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => goToPage(page)}
                      className={`page-btn ${page === pagination.currentPage ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  </div>
                ))
              }
            </div>
            
            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-btn"
            >
              次へ
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .approval-table-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .realtime-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8f9fa;
          padding: 8px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border-left: 4px solid #673AB7;
        }
        
        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }
        
        .connection-indicator.connected .status-dot {
          background-color: #4CAF50;
          box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
        }
        
        .connection-indicator.disconnected .status-dot {
          background-color: #ff9800;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .status-text {
          font-size: 14px;
          color: #555;
          font-weight: 500;
        }
        
        .notification-badge {
          position: relative;
          background: #f44336;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-left: 12px;
        }
        
        .badge-text {
          line-height: 1;
        }
        
        .bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 2px solid #673AB7;
        }
        
        .selected-count {
          font-weight: 600;
          color: #673AB7;
        }
        
        .bulk-buttons {
          display: flex;
          gap: 8px;
        }
        
        .bulk-approve-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        
        .bulk-approve-btn:hover {
          background: #388E3C;
        }
        
        .clear-selection-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        
        .clear-selection-btn:hover {
          background: #5a6268;
        }
        
        .table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .approval-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        
        .approval-table th,
        .approval-table td {
          text-align: left;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .approval-table th {
          background: #f8f9fa;
          font-weight: 700;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .approval-table tr:hover {
          background: rgba(103, 58, 183, 0.05);
        }
        
        .approval-table tr.selected {
          background: rgba(103, 58, 183, 0.1);
        }
        
        .checkbox-cell {
          width: 50px;
          text-align: center;
        }
        
        .table-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #673AB7 0%, #E91E63 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
        }
        
        .user-name {
          font-weight: 700;
          color: #333;
        }
        
        .user-email {
          font-size: 14px;
          color: #666;
        }
        
        .stage-badge {
          background: #f0f0f0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }
        
        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .approve-btn,
        .reject-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        .approve-btn {
          background: #4CAF50;
          color: white;
        }
        
        .approve-btn:hover {
          background: #388E3C;
          transform: translateY(-1px);
        }
        
        .reject-btn {
          background: #f44336;
          color: white;
        }
        
        .reject-btn:hover {
          background: #d32f2f;
          transform: translateY(-1px);
        }
        
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }
        
        .pagination-info {
          color: #666;
          font-size: 14px;
        }
        
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pagination-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .page-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          min-width: 40px;
          text-align: center;
          transition: all 0.2s;
        }
        
        .page-btn:hover {
          background: #f8f9fa;
        }
        
        .page-btn.active {
          background: #673AB7;
          color: white;
          border-color: #673AB7;
        }
        
        .page-ellipsis {
          padding: 8px 4px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .approval-table-container {
            padding: 16px;
          }
          
          .bulk-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .bulk-buttons {
            justify-content: center;
          }
          
          .approval-table th,
          .approval-table td {
            padding: 12px 8px;
          }
          
          .user-cell {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .user-avatar {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 6px;
          }
          
          .approve-btn,
          .reject-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .pagination {
            flex-direction: column;
            gap: 12px;
          }
          
          .pagination-controls {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
