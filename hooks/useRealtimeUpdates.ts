'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeNotification {
  id: string
  type: 'new_pending' | 'approved_by_other' | 'rejected_by_other'
  title: string
  message: string
  userId: string
  stageId: number
  timestamp: string
  read: boolean
}

interface UseRealtimeUpdatesOptions {
  onNotification?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void
  onDataUpdate?: () => void
  currentAdminId?: string | null
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { onNotification, onDataUpdate, currentAdminId } = options

  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])

  const supabase = useRef(createBrowserSupabaseClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  const getUserInfo = useCallback(async (userId: string) => {
    try {
      const { data: user } = await supabase.current
        .from('users_profile')
        .select('nickname, email')
        .eq('id', userId)
        .single()
      
      return user?.nickname || user?.email?.split('@')[0] || 'Unknown'
    } catch (error) {
      return 'Unknown'
    }
  }, [])

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)])
    
    if (onNotification) {
      const notificationType = notification.type === 'new_pending' ? 'info' : 'success'
      onNotification(notificationType, notification.title, notification.message)
    }
  }, [onNotification])

  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload
      const record = newRecord || oldRecord

      if (!record) return

      const userName = await getUserInfo(record.user_id)

      if (eventType === 'INSERT' && record.status === 'pending_approval') {
        addNotification({
          type: 'new_pending',
          title: '新しい承認待ち',
          message: `${userName}さんがステージ${record.stage_id}を提出しました`,
          userId: record.user_id,
          stageId: record.stage_id
        })
      } else if (eventType === 'UPDATE') {
        if (record.status === 'completed' && record.approved_by !== currentAdminId) {
          addNotification({
            type: 'approved_by_other',
            title: '他の管理者が承認',
            message: `${userName}さんのステージ${record.stage_id}が承認されました`,
            userId: record.user_id,
            stageId: record.stage_id
          })
        } else if (record.status === 'current' && record.rejected_by !== currentAdminId) {
          addNotification({
            type: 'rejected_by_other',
            title: '他の管理者が却下',
            message: `${userName}さんのステージ${record.stage_id}が却下されました`,
            userId: record.user_id,
            stageId: record.stage_id
          })
        }
      }

      if (onDataUpdate) {
        onDataUpdate()
      }
    } catch (error) {
      console.error('Realtimeイベント処理エラー:', error)
    }
  }, [getUserInfo, addNotification, currentAdminId, onDataUpdate])

  const connectRealtime = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    const channel = supabase.current.channel('admin-quest-updates')

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quest_progress'
        },
        handleRealtimeUpdate
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setTimeout(connectRealtime, 5000)
        }
      })

    channelRef.current = channel
  }, [handleRealtimeUpdate])

  useEffect(() => {
    connectRealtime()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [connectRealtime])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications,
    reconnect: connectRealtime
  }
} 