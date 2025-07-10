'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { CardLoadingFallback, logChunkInfo } from '@/components/common/DynamicLoader'

// ==========================================
// ProfileCardの型定義
// ==========================================

interface ProfileCardProps {
  className?: string
}

// ==========================================
// ProfileCardの動的インポート
// ==========================================

const ProfileCardComponent = dynamic(
  () => import('@/components/home/ProfileCard').then((mod) => {
    logChunkInfo('ProfileCard')
    return { default: mod.default }
  }),
  {
    loading: () => <ProfileCardLoadingFallback />,
    ssr: false
  }
)

// ==========================================
// ProfileCard専用ローディング
// ==========================================

const ProfileCardLoadingFallback: React.FC = () => (
  <div className="profile-card-skeleton animate-pulse">
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* アバター部分 */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-40 mx-auto"></div>
      </div>

      {/* 能力・特性 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* パーソナル情報 */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* 冒険パートナー */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>

      {/* ひとこと */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* 編集ボタン */}
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
)

// ==========================================
// 遅延読み込み対応ProfileCard
// ==========================================

export const DynamicProfileCard: React.FC<ProfileCardProps> = (props) => {
  return <ProfileCardComponent {...props} />
}

// ==========================================
// インターセクション対応ProfileCard
// ==========================================

interface LazyProfileCardProps extends ProfileCardProps {
  rootMargin?: string
  threshold?: number
}

export const LazyProfileCard: React.FC<LazyProfileCardProps> = ({
  rootMargin = '100px',
  threshold = 0.1,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [shouldLoad, setShouldLoad] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return (
    <div ref={ref} className={props.className}>
      {shouldLoad ? (
        <DynamicProfileCard {...props} />
      ) : (
        <ProfileCardLoadingFallback />
      )}
    </div>
  )
}

// ==========================================
// プリロード機能付きProfileCard
// ==========================================

interface PreloadableProfileCardProps extends ProfileCardProps {
  preloadDelay?: number
  enableHoverPreload?: boolean
}

export const PreloadableProfileCard: React.FC<PreloadableProfileCardProps> = ({
  preloadDelay = 2000,
  enableHoverPreload = true,
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = React.useState(false)
  const [hasPreloaded, setHasPreloaded] = React.useState(false)

  // 遅延プリロード
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, preloadDelay)

    return () => clearTimeout(timer)
  }, [preloadDelay])

  // ホバープリロード
  const handleMouseEnter = React.useCallback(() => {
    if (enableHoverPreload && !hasPreloaded) {
      setHasPreloaded(true)
      setShouldLoad(true)
    }
  }, [enableHoverPreload, hasPreloaded])

  if (!shouldLoad) {
    return (
      <div onMouseEnter={handleMouseEnter} className={props.className}>
        <ProfileCardLoadingFallback />
      </div>
    )
  }

  return <DynamicProfileCard {...props} />
}

// ==========================================
// プロフィールカードコンテナ
// ==========================================

interface ProfileCardContainerProps {
  children?: React.ReactNode
  loadingStrategy?: 'immediate' | 'lazy' | 'preload' | 'intersection'
  className?: string
}

export const ProfileCardContainer: React.FC<ProfileCardContainerProps> = ({
  children,
  loadingStrategy = 'preload',
  className = ''
}) => {
  const profileCardProps = { className }

  const renderProfileCard = () => {
    switch (loadingStrategy) {
      case 'immediate':
        return <DynamicProfileCard {...profileCardProps} />
      
      case 'lazy':
        return <ProfileCardLoadingFallback />
      
      case 'preload':
        return <PreloadableProfileCard {...profileCardProps} />
      
      case 'intersection':
        return <LazyProfileCard {...profileCardProps} />
      
      default:
        return <DynamicProfileCard {...profileCardProps} />
    }
  }

  return (
    <div className="profile-card-container">
      {renderProfileCard()}
      {children}
    </div>
  )
}

// ==========================================
// ProfileCardプリロード用ユーティリティ
// ==========================================

export const preloadProfileCard = () => {
  if (typeof window !== 'undefined') {
    import('@/components/home/ProfileCard').then(() => {
      logChunkInfo('ProfileCard (preloaded)')
    }).catch((error) => {
      console.warn('ProfileCard preload failed:', error)
    })
  }
}

// ホームページ読み込み時にプリロード
export const useProfileCardPreload = (enabled: boolean = true) => {
  React.useEffect(() => {
    if (enabled) {
      // アイドル時間にプリロード
      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadProfileCard)
      } else {
        setTimeout(preloadProfileCard, 1000)
      }
    }
  }, [enabled])
}

export default DynamicProfileCard 