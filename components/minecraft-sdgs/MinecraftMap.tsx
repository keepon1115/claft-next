'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Compass, Star, Trophy, Zap, Target, FileText, Users, Route, X } from 'lucide-react'
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
  const [isWorksModalOpen, setIsWorksModalOpen] = useState(false)
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false)

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

  // ESCキーで各モーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isWorldDataModalOpen) setIsWorldDataModalOpen(false)
        if (isWorksModalOpen) setIsWorksModalOpen(false)
        if (isFlowModalOpen) setIsFlowModalOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isWorldDataModalOpen, isWorksModalOpen, isFlowModalOpen])

  return (
    <>
      {/* マイクラ風アニメーション背景 */}
      <div ref={animationContainerRef} className="minecraft-animations-container" />
      
      <div className="minecraft-map">
        {/* ヘッダー下の機能ボタン */}
        <div className="minecraft-header-stats" aria-label="機能メニュー">
          {/* 進捗（元の左側を残しつつ、他ボタンと同デザインに統一） */}
          <div className="minecraft-feature-button brown" role="button" aria-label="進捗" aria-live="polite">
            <Trophy className="w-5 h-5" />
            <span>進捗: {statistics.completedStages}/{statistics.totalStages}</span>
          </div>
          <div className="minecraft-feature-buttons" role="group" aria-label="マイクラ機能">
            <button 
              onClick={() => setIsFlowModalOpen(true)}
              className="minecraft-feature-button yellow"
              role="button"
              aria-label="学習の流れ"
            >
              <Route className="w-5 h-5" />
              <span>学習の流れ</span>
            </button>
            <button 
              onClick={() => setIsWorksModalOpen(true)}
              className="minecraft-feature-button pink"
              role="button"
              aria-label="みんなの作品"
            >
              <Users className="w-5 h-5" />
              <span>みんなの作品</span>
            </button>
            <button 
              onClick={() => setIsWorldDataModalOpen(true)}
              className="minecraft-feature-button green"
              role="button"
              aria-label="ワールドデータについて"
            >
              <FileText className="w-5 h-5" />
              <span>ワールドデータについて</span>
            </button>
          </div>
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
        {isWorksModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="works-modal-title" onClick={(e) => { if (e.target === e.currentTarget) setIsWorksModalOpen(false) }}>
            <div className="relative bg-white minecraft-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="minecraft-modal-header">
                <h2 id="works-modal-title" className="text-2xl font-bold text-minecraft-brown flex items-center gap-2">🎨 みんなの作品</h2>
                <button onClick={() => setIsWorksModalOpen(false)} className="minecraft-close-button" aria-label="閉じる"><X size={24} /></button>
              </div>
              <div className="minecraft-modal-content">
                <p className="text-minecraft-brown mb-3">ここでは発表ステージで創ったみんなの作品ワールドが見れるぞ！</p>
                <p className="text-minecraft-brown mb-6">みんなの作品を参考にスキルアップを目指そう！</p>
                <a
                  className="works-cta-btn"
                  href="https://www.canva.com/design/DAG0UePXGZY/tcddPlbN4kPAPYc1xE2lfw/edit?utm_content=DAG0UePXGZY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="みんなの作品を見る"
                >
                  みんなの作品を見る
                </a>
              </div>
            </div>
          </div>
        )}
        {isFlowModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="flow-modal-title" onClick={(e) => { if (e.target === e.currentTarget) setIsFlowModalOpen(false) }}>
            <div className="relative bg-white minecraft-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="minecraft-modal-header">
                <h2 id="flow-modal-title" className="text-2xl font-bold text-minecraft-brown flex items-center gap-2">🧭 学習の流れ</h2>
                <button onClick={() => setIsFlowModalOpen(false)} className="minecraft-close-button" aria-label="閉じる"><X size={24} /></button>
              </div>
              <div className="minecraft-modal-content whitespace-pre-wrap text-sm leading-6 text-minecraft-brown">
{`①SDGsワーク
まずはテーマ動画を見よう！補助プリントを参考にしながらフォームに回答しよう！
発表ステージをダウンロードしてワークの解決案をマインクラフトの世界で表現するぞ！
しかし、いきなり建築するのではなく、プリントの地図で建築計画を立てて建築をはじめよう！

②マイクラワーク
まずはテーマ動画を見よう！AP道場をダウンロードして補助プリントを参考にプログラミングにチャレンジ！
できたプログラミングと発表ステージで作ったワールドをフォームに回答できたら、ミッション完了だ！`}
              </div>
            </div>
          </div>
        )}
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

        /* 旧ヘッダーボタンスタイルは残す（他ページ互換）。本ページでは.feature-buttonsを使用 */
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

        /* 作品モーダルCTA（強調） */
        .works-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 18px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, var(--btn-pink) 0%, #FF2E7E 100%);
          border: 3px solid var(--minecraft-brown);
          box-shadow: inset 2px 2px 0 rgba(255,255,255,.3), inset -2px -2px 0 rgba(0,0,0,.25), 4px 4px 0 rgba(0,0,0,.25);
          border-radius: 10px;
          text-decoration: none;
          transition: transform .1s ease, box-shadow .1s ease;
        }
        .works-cta-btn:hover { transform: translate(-1px, -1px); box-shadow: inset 2px 2px 0 rgba(255,255,255,.35), inset -2px -2px 0 rgba(0,0,0,.3), 6px 6px 0 rgba(0,0,0,.28); }
        .works-cta-btn:active { transform: translate(0,0); box-shadow: inset 2px 2px 0 rgba(0,0,0,.3), inset -2px -2px 0 rgba(255,255,255,.1), 2px 2px 0 rgba(0,0,0,.2); }

      `}</style>
    </>
  )
}