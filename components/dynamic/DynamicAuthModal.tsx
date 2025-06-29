'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ModalLoadingFallback, logChunkInfo } from '@/components/common/DynamicLoader'

// ==========================================
// AuthModalの動的インポート
// ==========================================

const AuthModalComponent = dynamic(
  () => import('@/components/auth/AuthModal').then((mod) => {
    logChunkInfo('AuthModal')
    return { default: mod.AuthModal }
  }),
  {
    loading: () => <ModalLoadingFallback title="認証画面を読み込み中..." />,
    ssr: false
  }
)

// ==========================================
// 型安全な動的AuthModal
// ==========================================

interface DynamicAuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
  redirectTo?: string
}

export const DynamicAuthModal: React.FC<DynamicAuthModalProps> = (props) => {
  // モーダルが開いていない場合は何もレンダリングしない（バンドル読み込みも行わない）
  if (!props.isOpen) {
    return null
  }

  return <AuthModalComponent {...props} />
}

// ==========================================
// プリロード機能付きAuthModal
// ==========================================

export const PreloadableAuthModal: React.FC<DynamicAuthModalProps> = (props) => {
  const [shouldLoad, setShouldLoad] = React.useState(props.isOpen)

  // プリロード処理
  React.useEffect(() => {
    if (props.isOpen && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [props.isOpen, shouldLoad])

  // ホバー時のプリロード
  const handlePreload = React.useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true)
    }
  }, [shouldLoad])

  if (!shouldLoad) {
    return null
  }

  return (
    <div onMouseEnter={handlePreload}>
      <AuthModalComponent {...props} />
    </div>
  )
}

// ==========================================
// AuthModalトリガーコンポーネント
// ==========================================

interface AuthModalTriggerProps {
  children: React.ReactNode
  defaultTab?: 'login' | 'signup'
  redirectTo?: string
  className?: string
  preload?: boolean
}

export const AuthModalTrigger: React.FC<AuthModalTriggerProps> = ({
  children,
  defaultTab = 'login',
  redirectTo = '/',
  className = '',
  preload = false
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [shouldPreload, setShouldPreload] = React.useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleMouseEnter = () => {
    if (preload && !shouldPreload) {
      setShouldPreload(true)
    }
  }

  return (
    <>
      <div
        onClick={openModal}
        onMouseEnter={handleMouseEnter}
        className={className}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openModal()
          }
        }}
      >
        {children}
      </div>

      {(isModalOpen || shouldPreload) && (
        <DynamicAuthModal
          isOpen={isModalOpen}
          onClose={closeModal}
          defaultTab={defaultTab}
          redirectTo={redirectTo}
        />
      )}
    </>
  )
}

// ==========================================
// カスタムフック
// ==========================================

export const useAuthModal = (defaultTab: 'login' | 'signup' = 'login') => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'login' | 'signup'>(defaultTab)

  const openLoginModal = React.useCallback(() => {
    setTab('login')
    setIsOpen(true)
  }, [])

  const openSignupModal = React.useCallback(() => {
    setTab('signup')
    setIsOpen(true)
  }, [])

  const closeModal = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const ModalComponent = React.useMemo(() => {
    if (!isOpen) return null
    
    return (
      <DynamicAuthModal
        isOpen={isOpen}
        onClose={closeModal}
        defaultTab={tab}
      />
    )
  }, [isOpen, closeModal, tab])

  return {
    isOpen,
    openLoginModal,
    openSignupModal,
    closeModal,
    ModalComponent
  }
}

export default DynamicAuthModal 