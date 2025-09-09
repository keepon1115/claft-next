'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface UnlockAnimationProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnlockAnimation({ isOpen, onClose }: UnlockAnimationProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setStep(1), 500)
      const timer2 = setTimeout(() => setStep(2), 2000)
      const timer3 = setTimeout(() => setStep(3), 4000)
      const timer4 = setTimeout(() => {
        setStep(0)
        onClose()
      }, 7000)

      // Confetti エフェクト
      const confettiTimer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 1000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
        clearTimeout(confettiTimer)
      }
    }
  }, [isOpen, onClose])

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div className="text-center text-white">
            {/* Step 1: 完了祝福 */}
            <AnimatePresence>
              {step >= 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                  className="mb-8"
                >
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-4xl font-bold mb-2">空のエリア完全制覇！</h2>
                  <p className="text-xl text-blue-300">すべてのステージをクリアしました</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: 画面転換 */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                  onAnimationComplete={() => {
                    if (step === 1) triggerConfetti()
                  }}
                >
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold text-yellow-300">
                    新たなエリアが解放されます...
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: 新エリア発見 */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotateY: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1,
                    rotateY: 360
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    scale: {
                      type: "spring", 
                      damping: 15, 
                      stiffness: 260
                    },
                    opacity: {
                      duration: 0.5
                    },
                    rotateY: {
                      duration: 2,
                      ease: "easeInOut"
                    }
                  }}
                  className="mb-8"
                >
                  {/* バウンス効果を追加するための内部アニメーション */}
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 1.5,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="text-8xl mb-4">⛰️</div>
                  </motion.div>
                  <h2 className="text-4xl font-bold mb-2 text-green-300">新たなエリアを発見！</h2>
                  <h3 className="text-2xl text-green-200">「くれなずむ空」</h3>
                  <p className="text-lg text-gray-300 mt-4">より困難な挑戦があなたを待っています</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: 完了メッセージ */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-yellow-300">
                    挑戦を開始しましょう！
                  </h3>
                  <button
                    onClick={onClose}
                    className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    くれなずむ空に進む
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
