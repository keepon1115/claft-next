'use client'

import dynamic from 'next/dynamic'
import { ModalLoadingFallback } from '@/components/common/DynamicLoader'

// 5ステップモーダルを動的インポート
const MinecraftStageModal = dynamic(
  () => import('./MinecraftStageModal'),
  { 
    loading: () => <ModalLoadingFallback title="SDGsワークを読み込み中..." />, 
    ssr: false 
  }
)

interface DynamicStageModalProps {
  stageId: number
  isOpen: boolean
  onClose: () => void
}

function DynamicStageModal({ stageId, isOpen, onClose }: DynamicStageModalProps) {
  return (
    <MinecraftStageModal
      stageId={stageId}
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}

export default DynamicStageModal