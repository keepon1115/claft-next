'use client'

import { useState, useEffect } from 'react'

// ==========================================
// PWA関連の型定義
// ==========================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isStandalone: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface PWAActions {
  install: () => Promise<boolean>
  showInstallPrompt: () => void
  clearInstallPrompt: () => void
}

export interface UsePWAReturn extends PWAState, PWAActions {}

// ==========================================
// PWAフック
// ==========================================

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isStandalone: false,
    installPrompt: null
  })

  // インストール可能状態の監視
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as BeforeInstallPromptEvent
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent
      }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // オンライン状態の監視
  useEffect(() => {
    const updateOnlineStatus = () => {
      setState(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // スタンドアロンモードの検出
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore
        window.navigator.standalone ||
        document.referrer.includes('android-app://')

      setState(prev => ({ ...prev, isStandalone }))
    }

    checkStandalone()
    
    // display-mode の変更を監視
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isStandalone: e.matches }))
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // 古いブラウザ対応
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  // 初期インストール状態の確認
  useEffect(() => {
    // Service Workerがアクティブかどうかでインストール状態を推測
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setState(prev => ({ ...prev, isInstalled: true }))
        }
      })
    }
  }, [])

  // ==========================================
  // アクション関数
  // ==========================================

  const install = async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false
    }

    try {
      await state.installPrompt.prompt()
      const choiceResult = await state.installPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('インストールエラー:', error)
      return false
    }
  }

  const showInstallPrompt = () => {
    // カスタムインストールプロンプトを表示する場合に使用
    console.log('インストールプロンプトを表示')
  }

  const clearInstallPrompt = () => {
    setState(prev => ({
      ...prev,
      isInstallable: false,
      installPrompt: null
    }))
  }

  return {
    // State
    isInstallable: state.isInstallable,
    isInstalled: state.isInstalled,
    isOnline: state.isOnline,
    isStandalone: state.isStandalone,
    installPrompt: state.installPrompt,
    
    // Actions
    install,
    showInstallPrompt,
    clearInstallPrompt
  }
}

// ==========================================
// ユーティリティ関数
// ==========================================

export const PWAUtils = {
  // PWAとして実行中かどうか
  isRunningAsPWA: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           // @ts-ignore
           window.navigator.standalone ||
           document.referrer.includes('android-app://')
  },

  // Service Workerの更新チェック
  checkForSWUpdate: async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          return true
        }
      } catch (error) {
        console.error('Service Worker更新エラー:', error)
      }
    }
    return false
  },

  // キャッシュクリア
  clearCache: async (): Promise<boolean> => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        return true
      } catch (error) {
        console.error('キャッシュクリアエラー:', error)
      }
    }
    return false
  }
} 