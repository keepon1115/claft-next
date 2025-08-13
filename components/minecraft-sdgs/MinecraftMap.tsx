'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Compass, Star, Trophy, Zap, Target, FileText } from 'lucide-react'
import MinecraftStageNode from './MinecraftStageNode'
import WorldDataModal from './WorldDataModal'
import type { MinecraftStageProgress } from '@/stores/minecraftSdgsStore'

interface MinecraftMapProps {
  stages: MinecraftStageProgress[]
  statistics: {
    currentStage: number
    completedStages: number
    totalStages: number
    sdgsGoalsCompleted: number[]
  }
  onStageClick: (stageId: number) => void
}

export default function MinecraftMap({ stages, statistics, onStageClick }: MinecraftMapProps) {
  const animationContainerRef = useRef<HTMLDivElement>(null)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [isWorldDataModalOpen, setIsWorldDataModalOpen] = useState(false)

  const handleImageError = (stageId: number) => {
    setImageErrors(prev => ({ ...prev, [stageId]: true }))
  }

  // マイクラ風パーティクルアニメーション
  useEffect(() => {
    if (!animationContainerRef.current) return

    const createParticles = () => {
      if (!animationContainerRef.current) return
      animationContainerRef.current.innerHTML = ''
      
      const NUM_PARTICLES = 15
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = document.createElement('div')
        particle.classList.add('minecraft-particle')
        
        // ランダムなパーティクル種類
        const types = ['grass', 'dirt', 'wood', 'emerald']
        const type = types[Math.floor(Math.random() * types.length)]
        particle.classList.add(type)
        
        // ランダムな位置と動き
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        const duration = Math.random() * 10 + 5
        particle.style.animationDuration = `${duration}s`
        particle.style.animationDelay = `${Math.random() * duration}s`
        
        animationContainerRef.current.appendChild(particle)
      }
    }

    createParticles()
    
    // 定期的にパーティクルを再生成
    const interval = setInterval(createParticles, 15000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* マイクラ風アニメーション背景 */}
      <div ref={animationContainerRef} className="minecraft-animations-container" />
      
      <div className="minecraft-map">
        {/* 簡素化されたヘッダー統計 */}
        <div className="minecraft-header-stats">
          <div className="minecraft-stat-card">
            <Trophy className="w-5 h-5 text-minecraft-gold" />
            <span>クリア済み: {statistics.completedStages}</span>
          </div>
          <button 
            onClick={() => setIsWorldDataModalOpen(true)}
            className="minecraft-world-data-button"
          >
            <FileText className="w-5 h-5 text-white" />
            <span>ワールドデータについて</span>
          </button>
        </div>

        {/* マイクラSDGsマップ */}
        <div className="minecraft-stage-grid">
          {Array.from({ length: 19 }, (_, index) => {
            const stageNumber = index + 1
            const stage = stages.find(s => s.stageId === stageNumber) || {
              stageId: stageNumber,
              status: stageNumber === 1 ? 'current' : 'locked',
              title: `ステージ ${stageNumber}`,
              description: '',
              message: '',
              fallbackIcon: '❓',
              sdgsGoal: 0
            }

            return (
              <MinecraftStageNode
                key={stageNumber}
                stage={stage}
                onClick={() => onStageClick(stageNumber)}
                imageError={imageErrors[stageNumber]}
                onImageError={() => handleImageError(stageNumber)}
              />
            )
          })}
        </div>

        {/* ワールドデータモーダル */}
        <WorldDataModal 
          isOpen={isWorldDataModalOpen}
          onClose={() => setIsWorldDataModalOpen(false)}
        />
      </div>

      {/* マイクラパーティクルアニメーション用CSS */}
      <style jsx>{`
        .minecraft-animations-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .minecraft-animations-container :global(.minecraft-particle) {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: minecraft-float 10s infinite ease-in-out;
          opacity: 0.6;
        }

        .minecraft-animations-container :global(.minecraft-particle.grass) {
          background: var(--minecraft-grass);
          box-shadow: 0 0 0 1px var(--minecraft-grass-dark);
        }

        .minecraft-animations-container :global(.minecraft-particle.dirt) {
          background: var(--minecraft-dirt);
          box-shadow: 0 0 0 1px var(--minecraft-brown);
        }

        .minecraft-animations-container :global(.minecraft-particle.wood) {
          background: var(--minecraft-wood);
          box-shadow: 0 0 0 1px var(--minecraft-dirt);
        }

        .minecraft-animations-container :global(.minecraft-particle.emerald) {
          background: var(--minecraft-emerald);
          box-shadow: 0 0 0 1px var(--minecraft-grass);
          animation: minecraft-sparkle 3s infinite ease-in-out;
        }

        @keyframes minecraft-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-30px) rotate(270deg);
            opacity: 0.7;
          }
        }

        @keyframes minecraft-sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 0 1px var(--minecraft-grass), 0 0 10px var(--minecraft-emerald);
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            box-shadow: 0 0 0 1px var(--minecraft-grass), 0 0 20px var(--minecraft-emerald);
          }
        }

        /* 簡素化されたヘッダー統計 */
        .minecraft-header-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 8px;
        }

        @media (max-width: 768px) {
          .minecraft-header-stats {
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
        }

        /* ワールドデータボタンのスタイル */
        .minecraft-world-data-button {
          background: var(--minecraft-emerald);
          border: 3px solid var(--minecraft-emerald-dark);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px 16px;
          border-radius: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          font-size: 0.9rem;
          box-shadow: 0 4px 0 var(--minecraft-emerald-dark), 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        @media (min-width: 768px) {
          .minecraft-world-data-button {
            padding: 12px 20px;
            font-size: 1rem;
          }
        }

        .minecraft-world-data-button:hover {
          background: var(--minecraft-emerald-dark) !important;
          transform: translateY(-2px);
          box-shadow: 
            0 6px 0 var(--minecraft-emerald-dark),
            0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .minecraft-world-data-button:active {
          transform: translateY(0);
          box-shadow: 
            0 2px 0 var(--minecraft-emerald-dark),
            0 4px 8px rgba(0, 0, 0, 0.1);
        }


      `}</style>
    </>
  )
}