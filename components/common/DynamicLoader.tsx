'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// ==========================================
// 共通ローディングコンポーネント
// ==========================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  type?: 'spinner' | 'pulse' | 'dots' | 'skeleton'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = '読み込み中...',
  className = '',
  type = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32 w-full mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 rounded h-4 w-3/4"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2"></div>
        </div>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && <p className={`mt-4 text-gray-600 ${textSizes[size]}`}>{text}</p>}
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
        {text && <p className={`mt-4 text-gray-600 ${textSizes[size]}`}>{text}</p>}
      </div>
    )
  }

  // デフォルトスピナー
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
      {text && <p className={`mt-4 text-gray-600 ${textSizes[size]}`}>{text}</p>}
    </div>
  )
}

// ==========================================
// モーダル用ローディング
// ==========================================

export const ModalLoadingFallback: React.FC<{ title?: string }> = ({ 
  title = 'モーダルを読み込み中...' 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <LoadingSpinner size="lg" text={title} type="dots" />
    </div>
  </div>
)

// ==========================================
// ページ用ローディング
// ==========================================

export const PageLoadingFallback: React.FC<{ title?: string }> = ({ 
  title = 'ページを読み込み中...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" text={title} type="spinner" />
      <div className="mt-8 space-y-2">
        <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
)

// ==========================================
// カード用ローディング
// ==========================================

export const CardLoadingFallback: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// ==========================================
// テーブル用ローディング
// ==========================================

export const TableLoadingFallback: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="animate-pulse">
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* 行 */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// ==========================================
// 動的インポート用ヘルパー関数
// ==========================================

interface DynamicComponentOptions {
  fallback?: React.ComponentType
  errorBoundary?: boolean
  timeout?: number
}

export function createDynamicComponent<T = any>(
  componentImport: () => Promise<{ default: React.ComponentType<T> }>,
  options: DynamicComponentOptions = {}
) {
  const { 
    fallback: Fallback = LoadingSpinner, 
    errorBoundary = true,
    timeout = 10000 
  } = options

  const DynamicComponent = dynamic(componentImport, {
    loading: () => <Fallback />,
    ssr: false
  })

  if (!errorBoundary) {
    return DynamicComponent
  }

  // エラーバウンダリー付きのコンポーネント
  class ErrorBoundary extends React.Component<
    { children: React.ReactNode }, 
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Dynamic component error:', error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              コンポーネントの読み込みに失敗しました
            </h3>
            <p className="text-red-600 mb-4">
              ページを再読み込みしてください
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        )
      }

      return this.props.children
    }
  }

  return function WrappedDynamicComponent(props: T) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <DynamicComponent {...(props as any)} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// ==========================================
// チャンク分析用ユーティリティ
// ==========================================

export const logChunkInfo = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Dynamic component loaded: ${componentName}`)
    
    // パフォーマンス計測
    if (typeof window !== 'undefined' && 'performance' in window) {
      const entries = performance.getEntriesByType('navigation')
      if (entries.length > 0) {
        const navigation = entries[0] as PerformanceNavigationTiming
        console.log(`📊 Page load time: ${navigation.loadEventEnd - navigation.fetchStart}ms`)
      }
    }
  }
}

// ==========================================
// プリロード用ヘルパー
// ==========================================

export const preloadComponent = (
  componentImport: () => Promise<{ default: React.ComponentType<any> }>
) => {
  if (typeof window !== 'undefined') {
    // ユーザーアクション（ホバー、フォーカス等）でプリロードを開始
    const preload = () => {
      componentImport().then(() => {
        console.log('Component preloaded successfully')
      }).catch((error) => {
        console.warn('Component preload failed:', error)
      })
    }

    // アイドル時間にプリロード
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload)
    } else {
      setTimeout(preload, 100)
    }
  }
}

export default LoadingSpinner 