'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'
import StageNode from '@/components/quest/StageNode'
import { DynamicStageModal } from '@/components/dynamic/DynamicStageModal'
import { Map, Compass, Star, Trophy, Zap } from 'lucide-react'
import type { StageProgress } from '@/stores/questStore'

// ==========================================
// クエストページメインコンポーネント
// ==========================================

export default function QuestPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { 
    stageDetails, 
    statistics, 
    isLoading, 
    initialize
  } = useQuestStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)

  // ステージ詳細を配列に変換
  const stages: StageProgress[] = Object.values(stageDetails).sort((a, b) => a.stageId - b.stageId)

  // 認証確認とデータロード
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    if (user?.id) {
      initialize(user.id)
    }
  }, [isAuthenticated, user?.id, router, initialize])

  // ステージクリック処理
  const handleStageClick = (stageId: number) => {
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  // モーダルクローズ処理
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedStageId(null)
    }, 300)
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">冒険の準備中...</p>
        </div>
      </div>
    )
  }

  // 認証されていない場合
  if (!isAuthenticated) {
    return null
  }

  // メインレンダリング
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 pt-20 pb-10">
      {/* ヘッダーセクション */}
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg flex items-center justify-center gap-4">
            <Map className="w-12 h-12 md:w-16 md:h-16" />
            🗺️ 冒険マップ
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            あなたの冒険の軌跡。ステージをクリアして新しい冒険へ進もう！
          </p>
          
          {/* プログレス統計 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">
                  現在のステージ: {statistics.currentStage || 1}
                </span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">
                  クリア済み: {statistics.completedStages}
                </span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">
                  総ステージ数: {statistics.totalStages}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* クエストマップグリッド */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            {stages.map((stage: StageProgress, index: number) => (
              <div key={stage.stageId} className="flex justify-center">
                <StageNode
                  stage={stage}
                  onClick={handleStageClick}
                  showPathLine={true}
                  gridPosition={index + 1}
                  className="quest-map-node"
                />
              </div>
            ))}
          </div>

          {/* フッター情報 */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Compass className="w-6 h-6 text-white/80" />
                <h3 className="text-lg font-bold text-white">冒険のヒント</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                各ステージをクリックして詳細を確認できます。<br />
                ステージを順番にクリアして、あなただけの冒険ストーリーを進めましょう！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ステージ詳細モーダル */}
      {isModalOpen && selectedStageId && (
        <DynamicStageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          stageId={selectedStageId}
        />
      )}

      {/* カスタムスタイル */}
      <style jsx>{`
        .quest-map-node {
          transform-origin: center;
          transition: all 0.3s ease;
        }

        .quest-map-node:hover {
          z-index: 10;
        }

        /* グリッドアニメーション */
        .quest-map-node:nth-child(1) { animation-delay: 0.1s; }
        .quest-map-node:nth-child(2) { animation-delay: 0.2s; }
        .quest-map-node:nth-child(3) { animation-delay: 0.3s; }
        .quest-map-node:nth-child(4) { animation-delay: 0.4s; }
        .quest-map-node:nth-child(5) { animation-delay: 0.5s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quest-map-node {
          animation: fadeInUp 0.6s ease-out both;
        }
      `}</style>
    </div>
  )
} 