'use client'

import { useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

/**
 * 通知システムフック
 * ブラウザ通知APIとコンソールログを組み合わせた軽量な通知システム
 */
export function useToast() {
  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    options?: Partial<ToastOptions>
  ) => {
    const fullMessage = message ? `${title}: ${message}` : title
    
    // コンソールログ
    const logStyle = {
      success: 'color: #10B981; font-weight: bold;',
      error: 'color: #EF4444; font-weight: bold;',
      info: 'color: #3B82F6; font-weight: bold;',
      warning: 'color: #F59E0B; font-weight: bold;'
    }
    
    console.log(`%c[${type.toUpperCase()}] ${fullMessage}`, logStyle[type])
    
    // ブラウザ通知（権限があれば）
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-96.png',
            tag: `claft-${type}`
          })
        } catch (error) {
          // 通知作成エラーは無視（非クリティカル）
          console.warn('通知作成エラー:', error)
        }
      } else if (Notification.permission === 'default') {
        // 初回のみ権限を要求
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            try {
              new Notification(title, {
                body: message,
                icon: '/icon-192.png'
              })
            } catch (error) {
              console.warn('通知作成エラー:', error)
            }
          }
        }).catch(error => {
          console.warn('通知権限要求エラー:', error)
        })
      }
    }
    
    // 今後、実際のトーストUIコンポーネントに置き換え可能
    return {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    }
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    return showToast('success', title, message)
  }, [showToast])

  const showError = useCallback((title: string, message?: string) => {
    return showToast('error', title, message)
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string) => {
    return showToast('info', title, message)
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string) => {
    return showToast('warning', title, message)
  }, [showToast])

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

export default useToast 