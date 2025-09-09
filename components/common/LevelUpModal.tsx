'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// =====================================================
// 型定義
// =====================================================

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  experience: number;
  rewards?: Reward[];
  className?: string;
}

interface Reward {
  id: string;
  type: 'badge' | 'skill' | 'exp' | 'item';
  name: string;
  description: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// =====================================================
// サンプル報酬データ
// =====================================================

const SAMPLE_REWARDS: Reward[] = [
  {
    id: 'exp_bonus',
    type: 'exp',
    name: '経験値ボーナス',
    description: '+50 EXP',
    icon: '⭐',
    rarity: 'common'
  },
  {
    id: 'new_skill',
    type: 'skill',
    name: '新スキル解放',
    description: '「リーダーシップ」スキルが解放されました',
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'achievement_badge',
    type: 'badge',
    name: '実績バッジ',
    description: '「レベルアップマスター」バッジを獲得',
    icon: '🥇',
    rarity: 'epic'
  }
];

// =====================================================
// Confettiエフェクト
// =====================================================

const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // 左側から
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });

    // 右側から
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

// 花火エフェクト
const triggerFireworks = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 2000
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

// =====================================================
// 報酬カードコンポーネント
// =====================================================

interface RewardCardProps {
  reward: Reward;
  index: number;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, index }) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-500', 
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-yellow-500'
  };

  const rarityBorders = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300', 
    legendary: 'border-yellow-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        transition: {
          type: "spring",
          damping: 15,
          stiffness: 300,
          delay: index * 0.2
        }
      }}
      className={`
        reward-card relative p-4 rounded-xl border-2
        bg-gradient-to-br ${rarityColors[reward.rarity || 'common']}
        ${rarityBorders[reward.rarity || 'common']}
        text-white shadow-lg overflow-hidden
      `}
    >
      {/* 背景アニメーション */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            backgroundSize: '200% 200%'
          }}
        />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="text-3xl mb-2"
        >
          {reward.icon}
        </motion.div>
        
        <h4 className="font-bold text-sm mb-1">{reward.name}</h4>
        <p className="text-xs opacity-90">{reward.description}</p>
        
        {/* レアリティ表示 */}
        <div className="mt-2">
          <span className={`
            inline-block px-2 py-1 rounded-full text-xs font-bold
            ${reward.rarity === 'legendary' ? 'bg-yellow-500/20' : 
              reward.rarity === 'epic' ? 'bg-purple-500/20' :
              reward.rarity === 'rare' ? 'bg-blue-500/20' : 'bg-gray-500/20'}
          `}>
            {reward.rarity?.toUpperCase() || 'COMMON'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// メインモーダルコンポーネント
// =====================================================

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  level,
  experience,
  rewards = SAMPLE_REWARDS,
  className = ''
}) => {
  const [showRewards, setShowRewards] = useState(false);

  // モーダルが開いた時のエフェクト
  useEffect(() => {
    if (isOpen) {
      // 少し遅延してconfettiを発動
      setTimeout(() => {
        triggerFireworks();
      }, 500);

      // さらに遅延して報酬表示
      setTimeout(() => {
        setShowRewards(true);
        triggerConfetti();
      }, 1000);
    } else {
      setShowRewards(false);
    }
  }, [isOpen]);

  // ESCキーでクローズ
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed inset-0 z-[1000] flex items-center justify-center
            bg-black/60 backdrop-blur-sm ${className}
          `}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50,
              transition: { duration: 0.3 }
            }}
            className="
              bg-gradient-to-br from-blue-500 to-purple-600
              text-white p-8 rounded-2xl shadow-2xl
              max-w-lg w-full mx-4 relative overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* 背景アニメーション */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  transition: {
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                }}
              />
            </div>

            {/* クローズボタン */}
            <button
              onClick={onClose}
              className="
                absolute top-4 right-4 w-8 h-8 rounded-full
                bg-white/20 hover:bg-white/30 transition-colors
                flex items-center justify-center text-white/80 hover:text-white
              "
            >
              ✕
            </button>

            {/* メインコンテンツ */}
            <div className="relative z-10 text-center">
              {/* レベルアップアニメーション */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1,
                  rotate: 360
                }}
                transition={{
                  scale: {
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  },
                  rotate: {
                    duration: 1,
                    ease: "easeInOut"
                  }
                }}
                className="mb-6"
              >
                {/* バウンス効果のための内部アニメーション */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-6xl mb-2">🎉</div>
                </motion.div>
                <h2 className="text-3xl font-black mb-2">レベルアップ！</h2>
                <div className="text-xl">
                  <span className="text-yellow-300">Level {level}</span> 達成
                </div>
              </motion.div>

              {/* 経験値情報 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.3 }
                }}
                className="mb-6"
              >
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-sm mb-2">現在の経験値</div>
                  <div className="text-2xl font-bold">{experience} EXP</div>
                </div>
              </motion.div>

              {/* 報酬セクション */}
              <AnimatePresence>
                {showRewards && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <h3 className="text-xl font-bold mb-4">🎁 報酬</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {rewards.map((reward, index) => (
                        <RewardCard
                          key={reward.id}
                          reward={reward}
                          index={index}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* アクションボタン */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: 1.5 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="
                  bg-white text-blue-600 font-bold py-3 px-8 rounded-full
                  shadow-lg hover:shadow-xl transition-all
                  border-2 border-white hover:bg-blue-50
                "
              >
                続ける
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// エクスポート
// =====================================================

export default LevelUpModal;

// ユーティリティ関数もエクスポート
export { triggerConfetti, triggerFireworks };

// 型もエクスポート
export type { LevelUpModalProps, Reward }; 