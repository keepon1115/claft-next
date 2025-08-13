'use client'

import React, { useEffect, useRef } from 'react'

interface MinecraftAnimationsProps {
  className?: string
}

export default function MinecraftAnimations({ className = '' }: MinecraftAnimationsProps) {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!backgroundRef.current) return

    // 浮遊する芝ブロックを生成
    const createFloatingGrass = () => {
      if (!backgroundRef.current) return

      const numGrass = 8
      for (let i = 0; i < numGrass; i++) {
        const grass = document.createElement('div')
        grass.className = 'minecraft-floating-grass'
        grass.style.left = `${Math.random() * 100}%`
        grass.style.top = `${Math.random() * 80 + 10}%`
        grass.style.animationDelay = `${Math.random() * 15}s`
        grass.style.animationDuration = `${Math.random() * 10 + 10}s`
        backgroundRef.current.appendChild(grass)
      }
    }

    // 成長する木を生成
    const createGrowingTrees = () => {
      if (!backgroundRef.current) return

      const numTrees = 4
      for (let i = 0; i < numTrees; i++) {
        const treeContainer = document.createElement('div')
        treeContainer.className = 'minecraft-growing-tree'
        treeContainer.style.left = `${Math.random() * 90 + 5}%`
        treeContainer.style.animationDelay = `${Math.random() * 20}s`

        const trunk = document.createElement('div')
        trunk.className = 'minecraft-tree-trunk'
        
        const leaves = document.createElement('div')
        leaves.className = 'minecraft-tree-leaves'

        treeContainer.appendChild(trunk)
        treeContainer.appendChild(leaves)
        backgroundRef.current.appendChild(treeContainer)
      }
    }

    // エメラルドの煌めきを生成
    const createEmeraldSparkles = () => {
      if (!backgroundRef.current) return

      const numSparkles = 12
      for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div')
        sparkle.className = 'minecraft-emerald-sparkle'
        sparkle.style.left = `${Math.random() * 100}%`
        sparkle.style.top = `${Math.random() * 100}%`
        sparkle.style.animationDelay = `${Math.random() * 12}s`
        sparkle.style.animationDuration = `${Math.random() * 8 + 8}s`
        backgroundRef.current.appendChild(sparkle)
      }
    }

    // マイクラ風雲を生成
    const createMinecraftClouds = () => {
      if (!backgroundRef.current) return

      const cloudSizes = ['small', 'medium', 'large']
      const numClouds = 6

      for (let i = 0; i < numClouds; i++) {
        const cloud = document.createElement('div')
        const size = cloudSizes[Math.floor(Math.random() * cloudSizes.length)]
        cloud.className = `minecraft-cloud ${size}`
        cloud.style.animationDelay = `${Math.random() * 25}s`
        cloud.style.animationDuration = `${Math.random() * 15 + 20}s`
        backgroundRef.current.appendChild(cloud)
      }
    }

    // パーティクルシステムを生成
    const createParticleSystem = () => {
      if (!backgroundRef.current) return

      const particleContainer = document.createElement('div')
      particleContainer.className = 'minecraft-particle-system'

      const createParticle = () => {
        const particle = document.createElement('div')
        const types = ['grass-particle', 'dirt-particle', 'emerald-particle']
        const type = types[Math.floor(Math.random() * types.length)]
        
        particle.className = `minecraft-particle ${type}`
        particle.style.left = `${Math.random() * 100}%`
        particle.style.bottom = '0px'
        particle.style.animationDelay = `${Math.random() * 6}s`
        particle.style.animationDuration = `${Math.random() * 4 + 4}s`

        particleContainer.appendChild(particle)

        // パーティクルを削除
        setTimeout(() => {
          if (particleContainer.contains(particle)) {
            particleContainer.removeChild(particle)
          }
        }, 8000)
      }

      // 定期的にパーティクルを生成
      const particleInterval = setInterval(createParticle, 800)

      backgroundRef.current.appendChild(particleContainer)

      return () => clearInterval(particleInterval)
    }

    // 地面の層を作成
    const createGroundLayers = () => {
      if (!backgroundRef.current) return

      const groundLayers = document.createElement('div')
      groundLayers.className = 'minecraft-ground-layers'
      backgroundRef.current.appendChild(groundLayers)
    }

    // すべてのアニメーション要素を初期化
    const initializeAnimations = () => {
      if (backgroundRef.current) {
        backgroundRef.current.innerHTML = '' // 既存要素をクリア
      }

      createGroundLayers()
      createFloatingGrass()
      createGrowingTrees()
      createEmeraldSparkles()
      createMinecraftClouds()
      
      // パーティクルシステムは最後に追加（cleanup関数を取得）
      const cleanupParticles = createParticleSystem()

      return cleanupParticles
    }

    const cleanup = initializeAnimations()

    // 定期的にアニメーションを更新
    const updateInterval = setInterval(() => {
      if (backgroundRef.current) {
        // 古い要素を削除して新しい要素を追加
        const oldElements = backgroundRef.current.querySelectorAll('.minecraft-floating-grass, .minecraft-growing-tree, .minecraft-emerald-sparkle')
        oldElements.forEach(element => {
          if (Math.random() < 0.3) { // 30%の確率で要素を更新
            element.remove()
          }
        })

        // 不足分を補充
        if (backgroundRef.current.querySelectorAll('.minecraft-floating-grass').length < 5) {
          createFloatingGrass()
        }
        if (backgroundRef.current.querySelectorAll('.minecraft-emerald-sparkle').length < 8) {
          createEmeraldSparkles()
        }
      }
    }, 10000) // 10秒ごとに更新

    return () => {
      if (cleanup) cleanup()
      clearInterval(updateInterval)
    }
  }, [])

  return (
    <div className={`minecraft-background-elements ${className}`} ref={backgroundRef}>
      {/* JSXで静的な要素を配置（必要に応じて） */}
      <style jsx>{`
        .minecraft-background-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        /* パフォーマンス最適化 */
        .minecraft-background-elements * {
          will-change: transform;
          backface-visibility: hidden;
        }

        /* 低スペック端末での配慮 */
        @media (prefers-reduced-motion: reduce) {
          .minecraft-background-elements * {
            animation-duration: 30s !important;
            animation-iteration-count: 1 !important;
          }
        }

        @media (max-width: 768px) {
          .minecraft-background-elements {
            opacity: 0.7; /* モバイルでは少し控えめに */
          }
        }
      `}</style>
    </div>
  )
}