'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ModalLoadingFallback, logChunkInfo } from '@/components/common/DynamicLoader'

// ==========================================
// StageModalの型定義
// ==========================================

interface StageModalProps {
  stageId: number | null
  onClose: () => void
  isOpen: boolean
}

// ==========================================
// StageModalの動的インポート
// ==========================================

const StageModalComponent = dynamic(
  () => import('@/components/quest/StageModal').then((mod) => {
    logChunkInfo('StageModal')
    return { default: mod.StageModal }
  }),
  {
    loading: () => <ModalLoadingFallback title="ステージ情報を読み込み中..." />,
    ssr: false
  }
)

// ==========================================
// 最適化されたStageModal
// ==========================================

export const DynamicStageModal: React.FC<StageModalProps> = (props) => {
  // モーダルが開いていない、またはstageIdがない場合は何もレンダリングしない
  if (!props.isOpen || !props.stageId) {
    return null
  }

  return <StageModalComponent {...props} />
}

// ==========================================
// プリロード機能付きStageModal
// ==========================================

interface PreloadableStageModalProps extends StageModalProps {
  preloadOnHover?: boolean
}

export const PreloadableStageModal: React.FC<PreloadableStageModalProps> = ({
  preloadOnHover = true,
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = React.useState(props.isOpen)

  // モーダルが開かれた時にロード
  React.useEffect(() => {
    if (props.isOpen && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [props.isOpen, shouldLoad])

  if (!shouldLoad) {
    return null
  }

  return <StageModalComponent {...props} />
}

// ==========================================
// StageModal管理用カスタムフック
// ==========================================

export const useStageModal = () => {
  const [selectedStageId, setSelectedStageId] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [shouldPreload, setShouldPreload] = React.useState(false)

  const openModal = React.useCallback((stageId: number) => {
    setSelectedStageId(stageId)
    setIsModalOpen(true)
    setShouldPreload(true)
  }, [])

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false)
    setSelectedStageId(null)
  }, [])

  const preloadModal = React.useCallback(() => {
    if (!shouldPreload) {
      setShouldPreload(true)
    }
  }, [shouldPreload])

  // ステージクリックハンドラー（認証状態考慮）
  const createStageClickHandler = React.useCallback((
    stageId: number, 
    isAuthenticated: boolean
  ) => {
    return () => {
      // ステージ1は未ログインでもアクセス可能
      if (stageId === 1 || isAuthenticated) {
        openModal(stageId)
      } else {
        // 他のステージで未ログインの場合
        const shouldLogin = confirm('このステージにアクセスするにはログインが必要です。ログインしますか？')
        if (shouldLogin) {
          window.dispatchEvent(new CustomEvent('openAuthModal'))
        }
      }
    }
  }, [openModal])

  const ModalComponent = React.useMemo(() => {
    if (!shouldPreload && !isModalOpen) return null
    
    return (
      <DynamicStageModal
        stageId={selectedStageId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    )
  }, [selectedStageId, isModalOpen, closeModal, shouldPreload])

  return {
    selectedStageId,
    isModalOpen,
    openModal,
    closeModal,
    preloadModal,
    createStageClickHandler,
    ModalComponent
  }
}

// ==========================================
// ステージノード用プリロード機能
// ==========================================

interface StageNodeWithPreloadProps {
  stageId: number
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const StageNodeWithPreload: React.FC<StageNodeWithPreloadProps> = ({
  stageId,
  children,
  className = '',
  onClick,
  disabled = false
}) => {
  const [hasPreloaded, setHasPreloaded] = React.useState(false)

  const handleMouseEnter = React.useCallback(() => {
    if (!hasPreloaded && !disabled) {
      setHasPreloaded(true)
      // StageModalのプリロード
      import('@/components/quest/StageModal').then(() => {
        logChunkInfo(`StageModal (preloaded for stage ${stageId})`)
      }).catch(console.warn)
    }
  }, [hasPreloaded, disabled, stageId])

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  )
}

export default DynamicStageModal 