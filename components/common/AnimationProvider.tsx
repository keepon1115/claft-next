'use client';

import React from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

// =====================================================
// 型定義
// =====================================================

interface AnimationProviderProps {
  children: React.ReactNode;
}

// =====================================================
// アニメーション設定（シンプル版）
// =====================================================

// 基本的なフェードイン
export const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// スケールイン
export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

// 左からスライドイン
export const slideLeftVariants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

// 右からスライドイン  
export const slideRightVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
};

// ステージング用コンテナ
export const staggerContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// ステージング用子要素
export const staggerChildVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// =====================================================
// アニメーションプロバイダー
// =====================================================

const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </MotionConfig>
  );
};

// =====================================================
// ユーティリティコンポーネント（シンプル版）
// =====================================================

// フェードイン要素
export const FadeInElement: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => (
  <motion.div
    variants={fadeInUpVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// フロートアニメーション要素
export const FloatingElement: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    animate={{
      y: [-10, 10, -10],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ホバー効果要素（シンプル版）
export const HoverElement: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

// ステージング要素
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={staggerContainerVariants}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerChild: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={staggerChildVariants}
    transition={{ duration: 0.4 }}
    className={className}
  >
    {children}
  </motion.div>
);

export default AnimationProvider; 