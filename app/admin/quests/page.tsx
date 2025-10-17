'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
// 承認フロー撤廃に伴い、承認系アクションのインポートを削除
import { Map as MapIcon, Trophy, Clock, CheckCircle, XCircle, ChevronLeft, RefreshCw, Users, TrendingUp, Filter, MessageSquare, Send, X } from 'lucide-react'
// 承認フロー撤廃のため ApprovalTable は未使用
import { useCallback } from 'react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import type { MessageRecord } from '@/types/message'

// =====================================================
// 型定義
// =====================================================

interface QuestProgress {
  id: string
  user_id: string
  stage_id: number
  status: string
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  google_form_submitted: boolean | null
  feedback_message: string | null
  feedback_sent_at: string | null
  feedback_sent_by: string | null
  users_profile: {
    nickname: string | null
    email: string
  } | null
}

interface QuestStats {
  totalQuests: number
  completedQuests: number
  feedbackPending: number
  feedbackSent: number
  averageCompletionTime: number
  stageStats: {
    [key: number]: {
      completed: number
      feedbackPending: number
      feedbackSent: number
    }
  }
}

// =====================================================
// クエスト管理ページ
// =====================================================

export default function QuestsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  
  // 状態管理
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([])
  const [stats, setStats] = useState<QuestStats>({
    totalQuests: 0,
    completedQuests: 0,
    feedbackPending: 0,
    feedbackSent: 0,
    averageCompletionTime: 0,
    stageStats: {}
  })
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('feedback_pending')
  const [error, setError] = useState<string | null>(null)
  // ステージ6承認待ち関連の状態は撤廃
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    questId: string
    userId: string
    stageId: number
    message: string
  }>({
    isOpen: false,
    questId: '',
    userId: '',
    stageId: 0,
    message: ''
  })
  const [sendingFeedback, setSendingFeedback] = useState(false)
  // ===== メディア・フィードバック用追加状態 =====
  const [activeTab, setActiveTab] = useState<'quest' | 'media'>('quest')
  const [mediaProgress, setMediaProgress] = useState<any[]>([])
  const [mediaMsg, setMediaMsg] = useState<{ userId: string; contextId: string; title: string; body: string }>({ userId: '', contextId: '', title: '', body: '' })
  const [sendingMsg, setSendingMsg] = useState(false)
  const [recentMessages, setRecentMessages] = useState<MessageRecord[]>([] as any)
  
  const supabase = createBrowserSupabaseClient()
  const handleApprovalChange = useCallback(() => {
    // 承認変更後に統計とリストを更新
    loadQuestData()
  }, [])

  // Realtime: セクション/ジブンも含めて自動更新
  useRealtimeUpdates({
    onDataUpdate: () => {
      if (!isAdmin) return
      if (activeTab === 'quest') {
        loadQuestData()
      } else {
        loadMediaProgress()
      }
    }
  })

  // 管理者権限チェック（初期化完了を待つ）
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }

      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        setIsAdmin(!adminError && adminData?.is_active === true)
      } catch (error) {
        console.error('管理者チェックエラー:', error)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }

    if (!isLoading) {
      checkAdminStatus()
    }
  }, [isAuthenticated, isLoading, user, supabase])

  // ステージ6承認待ちデータ取得ロジックは撤廃

  // クエストデータ読み込み
  const loadQuestData = async () => {
    try {
      setLoading(true)
      setError(null)

      // クエスト進捗データを取得
      let progressQuery = supabase
        .from('quest_progress')
        .select(`
          id,
          user_id,
          stage_id,
          status,
          submitted_at,
          approved_at,
          rejected_at,
          google_form_submitted,
          feedback_message,
          feedback_sent_at,
          feedback_sent_by
        `)
        .order('approved_at', { ascending: false })
        .limit(100)

      // フィルター適用
      if (selectedStage) {
        progressQuery = progressQuery.eq('stage_id', selectedStage)
      }

      if (selectedStatus === 'feedback_pending') {
        // フィードバック待ち（完了済みでフィードバック未送信）
        progressQuery = progressQuery
          .eq('status', 'completed')
          .is('feedback_message', null)
      } else if (selectedStatus === 'feedback_sent') {
        // フィードバック送信済み
        progressQuery = progressQuery
          .eq('status', 'completed')
          .not('feedback_message', 'is', null)
      } else if (selectedStatus !== 'all') {
        progressQuery = progressQuery.eq('status', selectedStatus)
      }

      const { data: progressData, error: progressError } = await progressQuery

      if (progressError) throw progressError

      // ユーザー情報を複数のソースから取得
      const userIds = progressData?.map(p => p.user_id) || []
      let userProfiles: any[] = []
      
      if (userIds.length > 0) {
        // まず users_profile から取得
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        
        userProfiles = profileData || []
        
        // users_profile で見つからないユーザーの情報を auth.users から取得
        const missingUserIds = userIds.filter(userId => 
          !userProfiles.some(profile => profile.id === userId)
        )
        
        if (missingUserIds.length > 0) {
          try {
            const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
            if (!authError && users) {
              const authUsers = users.filter(user => missingUserIds.includes(user.id))
              const authUserProfiles = authUsers.map(user => ({
                id: user.id,
                nickname: user.user_metadata?.full_name || user.user_metadata?.name || null,
                email: user.email || 'unknown@example.com'
              }))
              userProfiles = [...userProfiles, ...authUserProfiles]
            }
          } catch (authError) {
            console.warn('認証ユーザー情報取得エラー:', authError)
            // 見つからないユーザーにはデフォルト値を設定
            const defaultProfiles = missingUserIds.map(userId => ({
              id: userId,
              nickname: null,
              email: `user-${userId.substring(0, 8)}@example.com`
            }))
            userProfiles = [...userProfiles, ...defaultProfiles]
          }
        }
      }

      // データを結合
      const combinedProgress = progressData?.map(progress => ({
        ...progress,
        users_profile: userProfiles.find(profile => profile.id === progress.user_id) || {
          nickname: null,
          email: 'unknown@example.com'
        }
      })) || []

      setQuestProgress(combinedProgress)

      // 統計データを計算
      await calculateStats()

    } catch (error) {
      console.error('クエストデータ取得エラー:', error)
      setError('クエストデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setRecentMessages((data || []) as any)
    } catch (e) {
      // noop
    }
  }

  // 統計データ計算
  const calculateStats = async () => {
    try {
      // 全体統計を取得
      const [
        { count: totalQuests },
        { count: completedQuests },
        { count: feedbackPending },
        { count: feedbackSent }
      ] = await Promise.all([
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed').is('feedback_message', null),
        supabase.from('quest_progress').select('*', { count: 'exact', head: true }).eq('status', 'completed').not('feedback_message', 'is', null)
      ])

      // ステージ別統計を取得
      const { data: stageData } = await supabase
        .from('quest_progress')
        .select('stage_id, status, feedback_message')

      const stageStats: { [key: number]: { completed: number; feedbackPending: number; feedbackSent: number } } = {}
      
      for (let stage = 1; stage <= 6; stage++) {
        stageStats[stage] = { completed: 0, feedbackPending: 0, feedbackSent: 0 }
      }

      stageData?.forEach(item => {
        if (stageStats[item.stage_id]) {
          if (item.status === 'completed') {
            stageStats[item.stage_id].completed++
            if (item.feedback_message) {
              stageStats[item.stage_id].feedbackSent++
            } else {
              stageStats[item.stage_id].feedbackPending++
            }
          }
        }
      })

      setStats({
        totalQuests: totalQuests || 0,
        completedQuests: completedQuests || 0,
        feedbackPending: feedbackPending || 0,
        feedbackSent: feedbackSent || 0,
        averageCompletionTime: 0, // TODO: 実装
        stageStats
      })

    } catch (error) {
      console.error('統計計算エラー:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadQuestData()
      loadRecentMessages()
      loadMediaProgress()
    }
  }, [isAdmin, selectedStage, selectedStatus])

  const loadMediaProgress = async () => {
    try {
      // 1) コンテンツ進捗（video/form/complete）を取得
      const { data: cp, error: cpError } = await supabase
        .from('content_progress')
        .select('user_id, context_type, context_id, step_id, done_at')
        .eq('context_type', 'media')
        .order('done_at', { ascending: false })
        .limit(1000)
      if (cpError) throw cpError

      // group by user_id + context_id
      type MediaGroup = { user_id: string; context_id: string; video?: string; form?: string; complete?: string }
      const keyOf = (r: any) => `${r.user_id}|${r.context_id}`
      const groups: Map<string, MediaGroup> = new Map()
      ;(cp || []).forEach((row: any) => {
        const k = keyOf(row)
        if (!groups.has(k)) groups.set(k, { user_id: row.user_id, context_id: row.context_id })
        const g = groups.get(k)!
        if (row.step_id === 'video' && !g.video) g.video = row.done_at
        if (row.step_id === 'form' && !g.form) g.form = row.done_at
        if (row.step_id === 'complete' && !g.complete) g.complete = row.done_at
      })

      const grouped: MediaGroup[] = Array.from(groups.values())

      // 2) 対象のメッセージを取得（最新）
      const userIds = Array.from(new Set(grouped.map(g => g.user_id)))
      const contextIds = Array.from(new Set(grouped.map(g => g.context_id)))
      let messages: any[] = []
      if (userIds.length && contextIds.length) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('user_id, context_id, title, body, created_at, status')
          .eq('context_type', 'media')
          .in('user_id', userIds)
          .in('context_id', contextIds)
        messages = msgData || []
      }

      // 最新メッセージ時刻を辞書化
      const latestMsgMap: Map<string, string> = new Map()
      messages.forEach((m: any) => {
        const k = `${m.user_id}|${m.context_id}`
        const prev = latestMsgMap.get(k)
        if (!prev || (new Date(m.created_at as string).getTime() > new Date(prev).getTime())) {
          latestMsgMap.set(k, m.created_at)
        }
      })

      // 3) ユーザー情報
      let profiles: any[] = []
      if (userIds.length) {
        const { data: p } = await supabase
          .from('users_profile')
          .select('id, nickname, email')
          .in('id', userIds)
        profiles = p || []
      }

      // 4) ステータス算出
      const merged = grouped.map((g: MediaGroup) => {
        const latestMessageAt = latestMsgMap.get(`${g.user_id}|${g.context_id}`)
        let status: 'feedback_pending' | 'feedback_sent' | 'current' = 'current'
        if (g.complete) {
          if (latestMessageAt && new Date(latestMessageAt).getTime() >= new Date(g.complete as string).getTime()) {
            status = 'feedback_sent'
          } else {
            status = 'feedback_pending'
          }
        } else if (g.form) {
          status = 'current'
        }
        return {
          user_id: g.user_id,
          context_id: g.context_id,
          step_complete_at: g.complete || null,
          last_message_at: latestMessageAt || null,
          status,
          latest_step: g.complete ? 'complete' : (g.form ? 'form' : 'video'),
          user: (profiles as any[]).find(u => u.id === g.user_id) || { nickname: null, email: 'unknown@example.com' }
        }
      })

      setMediaProgress(merged)
    } catch (e) {
      console.warn('loadMediaProgress warn:', e)
      setMediaProgress([])
    }
  }

  // フィードバック送信
  const handleSendFeedback = async () => {
    if (!feedbackModal.message.trim()) {
      alert('フィードバックメッセージを入力してください')
      return
    }

    setSendingFeedback(true)
    try {
      const { error } = await supabase
        .from('quest_progress')
        .update({
          feedback_message: feedbackModal.message.trim(),
          feedback_sent_at: new Date().toISOString(),
          feedback_sent_by: user?.id
        })
        .eq('id', feedbackModal.questId)

      if (error) throw error

      // ユーザーに通知を送信
      const notificationData = {
        user_id: feedbackModal.userId,
        type: 'feedback',
        title: `ステージ${feedbackModal.stageId}のフィードバックが届きました`,
        message: `ステージ${feedbackModal.stageId}に対する管理者からのフィードバックが届いています。クエストページでご確認ください。`,
        data: {
          stage_id: feedbackModal.stageId,
          feedback_message: feedbackModal.message.substring(0, 100) + (feedbackModal.message.length > 100 ? '...' : '')
        }
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (notificationError) {
        console.error('通知送信エラー:', notificationError)
        // 通知エラーは致命的ではないので、警告のみ
      } else {
        console.log('📧 フィードバック通知送信完了:', {
          userId: feedbackModal.userId,
          stageId: feedbackModal.stageId
        })
      }

      alert('フィードバックを送信し、ユーザーに通知しました！')
      setFeedbackModal({ isOpen: false, questId: '', userId: '', stageId: 0, message: '' })
      await loadQuestData() // データを再読み込み

    } catch (error) {
      console.error('フィードバック送信エラー:', error)
      alert('フィードバック送信に失敗しました')
    } finally {
      setSendingFeedback(false)
    }
  }

  // ステージ6承認/却下処理は撤廃

  // フィードバックモーダルを開く
  const openFeedbackModal = (quest: QuestProgress) => {
    setFeedbackModal({
      isOpen: true,
      questId: quest.id,
      userId: quest.user_id,
      stageId: quest.stage_id,
      message: quest.feedback_message || ''
    })
  }

  // 日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  // ステータスバッジ
  const getStatusBadge = (status: string, feedbackMessage: string | null) => {
    if (status === 'completed') {
      if (feedbackMessage) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            フィードバック済み
          </span>
        )
      } else {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            フィードバック待ち
          </span>
        )
      }
    }

    const badges = {
      'current': { color: 'bg-blue-100 text-blue-800', text: '進行中', icon: TrendingUp },
      'pending_approval': { color: 'bg-orange-100 text-orange-800', text: '承認待ち', icon: Clock },
      'rejected': { color: 'bg-red-100 text-red-800', text: '却下', icon: XCircle }
    }
    
    const badge = badges[status as keyof typeof badges] || badges['current']
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={14} className="mr-1" />
        {badge.text}
      </span>
    )
  }

  // 管理者権限確認中
  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl font-semibold">管理者権限確認中...</p>
        </div>
      </div>
    )
  }

  // 管理者権限なし
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-6">このページは管理者のみアクセス可能です。</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            管理画面に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapIcon size={32} className="text-purple-600" />
                  クエスト管理
                </h1>
                <p className="text-gray-600 mt-1">クエスト完了状況とフィードバック管理</p>
              </div>
            </div>
            <button
              onClick={() => {
                loadQuestData()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              更新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 承認待ちカードは撤廃 */}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapIcon size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総完了数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedQuests}</p>
              </div>
            </div>
          </div>

          {/* ステージ6承認待ちカードは撤廃 */}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">フィードバック待ち</p>
                <p className="text-2xl font-bold text-gray-900">{stats.feedbackPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">フィードバック済み</p>
                <p className="text-2xl font-bold text-gray-900">{stats.feedbackSent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総クエスト数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ステージ別統計 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ステージ別フィードバック状況</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.stageStats).map(([stage, data]) => (
              <div key={stage} className="border rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">ステージ {stage}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">完了:</span>
                      <span className="font-medium">{data.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">FB待ち:</span>
                      <span className="font-medium">{data.feedbackPending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">FB済み:</span>
                      <span className="font-medium">{data.feedbackSent}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">フィルター:</span>
            </div>
            
            <select
              value={selectedStage || ''}
              onChange={(e) => setSelectedStage(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全ステージ</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(stage => (
                <option key={stage} value={stage}>ステージ {stage}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="feedback_pending">フィードバック待ち</option>
              <option value="feedback_sent">フィードバック済み</option>
              <option value="all">全ステータス</option>
              <option value="current">進行中</option>
            </select>

            <button
              onClick={() => {
                setSelectedStage(null)
                setSelectedStatus('feedback_pending')
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              クリア
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* ステージ6承認待ちセクションは撤廃 */}

        {/* タブ切替 */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveTab('quest')} className={`px-3 py-1 rounded ${activeTab==='quest'?'bg-purple-600 text-white':'bg-gray-100'}`}>クエスト</button>
          <button onClick={() => setActiveTab('media')} className={`px-3 py-1 rounded ${activeTab==='media'?'bg-purple-600 text-white':'bg-gray-100'}`}>セクション/ジブン</button>
        </div>

        {/* クエスト進捗テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab==='quest' ? `クエスト一覧 (${questProgress.length}件)` : `セクション進捗 (${mediaProgress.length}件)`}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {activeTab==='quest' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステージ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完了日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フィードバック
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questProgress.map((quest) => (
                  <tr key={quest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quest.users_profile?.nickname || 'ユーザー名なし'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quest.users_profile?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ステージ {quest.stage_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quest.status, quest.feedback_message)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quest.approved_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quest.feedback_sent_at ? formatDate(quest.feedback_sent_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {quest.status === 'completed' && (
                        <button
                          onClick={() => openFeedbackModal(quest)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        >
                          <MessageSquare size={16} />
                          {quest.feedback_message ? 'フィードバック編集' : 'フィードバック送信'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コンテキスト</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステップ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完了日時</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mediaProgress.map((row, idx) => (
                  <tr key={`${row.user_id}-${row.context_id}-${row.step_id}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{row.user?.nickname || 'ユーザー名なし'}</div>
                      <div className="text-sm text-gray-500">{row.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.context_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.latest_step}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.status === 'feedback_pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">FB待ち</span>
                      ) : row.status === 'feedback_sent' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">FB済み</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">進行中</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(row.step_complete_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}

            {questProgress.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
                <p className="text-gray-500">
                  選択した条件に該当するクエストが見つかりませんでした。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===================== メディア・フィードバック ===================== */}
        <div className="bg-white rounded-lg shadow p-6 mt-10 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">メディア・フィードバック（セクション/ジブン動画）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border px-3 py-2 rounded"
              placeholder="宛先ユーザーID"
              value={mediaMsg.userId}
              onChange={(e) => setMediaMsg(prev => ({ ...prev, userId: e.target.value }))}
            />
            <input
              className="border px-3 py-2 rounded"
              placeholder="context（例 mediaItem:aiit-001）"
              value={mediaMsg.contextId}
              onChange={(e) => setMediaMsg(prev => ({ ...prev, contextId: e.target.value }))}
            />
            <input
              className="border px-3 py-2 rounded md:col-span-2"
              placeholder="タイトル"
              value={mediaMsg.title}
              onChange={(e) => setMediaMsg(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="border px-3 py-2 rounded md:col-span-2 h-28"
              placeholder="本文"
              value={mediaMsg.body}
              onChange={(e) => setMediaMsg(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              disabled={!user || !mediaMsg.userId || !mediaMsg.contextId || !mediaMsg.title || !mediaMsg.body}
              onClick={async () => {
                try {
                  if (!user) return
                  const { error } = await supabase
                    .from('messages')
                    .insert({
                      user_id: mediaMsg.userId,
                      context_type: 'media',
                      context_id: mediaMsg.contextId,
                      title: mediaMsg.title,
                      body: mediaMsg.body,
                      status: 'unread',
                      sent_by: user.id
                    })
                  if (error) throw error
                  await supabase.from('notifications').insert({
                    user_id: mediaMsg.userId,
                    type: 'message',
                    title: '新しいメッセージが届きました',
                    message: mediaMsg.title,
                    data: { context: mediaMsg.contextId }
                  }).catch(() => {})
                  alert('送信しました')
                  setMediaMsg({ userId: '', contextId: '', title: '', body: '' })
                  loadRecentMessages()
                } catch (e) {
                  console.error(e)
                  alert('送信に失敗しました')
                }
              }}
            >送信</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">直近のメッセージ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コンテキスト</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(m.created_at).toLocaleString('ja-JP')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{(m.user_id || '').slice(0,8)}…</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{m.context_type}:{m.context_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{m.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{m.status === 'unread' ? '未読' : '既読'}</td>
                  </tr>
                ))}
                {recentMessages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">メッセージはありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* フィードバックモーダル */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                ステージ{feedbackModal.stageId} フィードバック送信
              </h3>
              <button
                onClick={() => setFeedbackModal({ isOpen: false, questId: '', userId: '', stageId: 0, message: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フィードバックメッセージ
              </label>
              <textarea
                value={feedbackModal.message}
                onChange={(e) => setFeedbackModal(prev => ({ ...prev, message: e.target.value }))}
                placeholder="ユーザーへのフィードバックを入力してください..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFeedbackModal({ isOpen: false, questId: '', userId: '', stageId: 0, message: '' })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendFeedback}
                disabled={sendingFeedback || !feedbackModal.message.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingFeedback ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    送信中...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    フィードバック送信
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 