'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import LevelUpModal from '@/components/common/LevelUpModal';
import { useNotifications, createNotificationHelpers } from '@/components/common/NotificationSystem';
import { triggerConfetti, triggerFireworks } from '@/components/common/LevelUpModal';

// =====================================================
// 型定義
// =====================================================

interface HomePageInteractionsProps {
  className?: string;
}

// =====================================================
// デモボタンコンポーネント
// =====================================================

interface DemoButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

const DemoButton: React.FC<DemoButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  className = '' 
}) => {
  const variants = {
    primary: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    secondary: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    success: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    warning: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    error: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-white font-medium text-sm
        bg-gradient-to-r ${variants[variant]}
        shadow-lg hover:shadow-xl transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

// =====================================================
// メインコンポーネント
// =====================================================

const HomePageInteractions: React.FC<HomePageInteractionsProps> = ({ className = '' }) => {
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [currentExp, setCurrentExp] = useState(275);
  
  const { addNotification } = useNotifications();
  const notify = createNotificationHelpers(addNotification);

  // レベルアップモーダルを開く
  const handleOpenLevelUpModal = useCallback(() => {
    setLevelUpModalOpen(true);
    setCurrentLevel(prev => prev + 1);
    setCurrentExp(prev => prev + 100);
  }, []);

  // 通知のデモ
  const handleShowSuccessNotification = useCallback(() => {
    notify.success(
      'クエスト完了！', 
      '「はじめてのプログラミング」クエストをクリアしました',
      {
        label: '詳細を見る',
        onClick: () => console.log('詳細を表示')
      }
    );
  }, [notify]);

  const handleShowErrorNotification = useCallback(() => {
    notify.error(
      'エラーが発生しました',
      'サーバーとの接続に問題があります。しばらく後にもう一度お試しください。'
    );
  }, [notify]);

  const handleShowWarningNotification = useCallback(() => {
    notify.warning(
      'プロフィールが未完成です',
      'プロフィールを完成させて経験値ボーナスを獲得しましょう！',
      {
        label: 'プロフィール編集',
        onClick: () => console.log('プロフィール編集画面へ')
      }
    );
  }, [notify]);

  const handleShowInfoNotification = useCallback(() => {
    notify.info(
      '新機能のお知らせ',
      'スキルツリー機能が追加されました！新しいスキルを習得して成長しましょう。'
    );
  }, [notify]);

  const handleShowLevelUpNotification = useCallback(() => {
    notify.levelUp(currentLevel + 1, currentExp + 150);
  }, [notify, currentLevel, currentExp]);

  const handleShowAchievementNotification = useCallback(() => {
    notify.achievement(
      '初回ログイン達成',
      'CLAFTへようこそ！冒険の第一歩を踏み出しました。'
    );
  }, [notify]);

  // confettiエフェクト
  const handleTriggerConfetti = useCallback(() => {
    triggerConfetti();
  }, []);

  const handleTriggerFireworks = useCallback(() => {
    triggerFireworks();
  }, []);

  return (
    <>
      {/* デモコントロールパネル */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className={`
          fixed bottom-4 left-4 z-[999]
          bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4
          border border-gray-200
          ${className}
        `}
      >
        <h3 className="text-sm font-bold mb-3 text-gray-800">🎮 デモ機能</h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* レベルアップモーダル */}
          <DemoButton onClick={handleOpenLevelUpModal} variant="primary">
            🆙 レベルアップ
          </DemoButton>

          {/* 通知デモ */}
          <DemoButton onClick={handleShowSuccessNotification} variant="success">
            ✅ 成功通知
          </DemoButton>
          
          <DemoButton onClick={handleShowErrorNotification} variant="error">
            ❌ エラー通知
          </DemoButton>
          
          <DemoButton onClick={handleShowWarningNotification} variant="warning">
            ⚠️ 警告通知
          </DemoButton>
          
          <DemoButton onClick={handleShowInfoNotification} variant="secondary">
            ℹ️ 情報通知
          </DemoButton>
          
          <DemoButton onClick={handleShowLevelUpNotification} variant="primary">
            🎉 Lv通知
          </DemoButton>
          
          <DemoButton onClick={handleShowAchievementNotification} variant="success">
            🏆 実績通知
          </DemoButton>

          {/* エフェクトデモ */}
          <DemoButton onClick={handleTriggerConfetti}>
            🎊 Confetti
          </DemoButton>
          
          <DemoButton onClick={handleTriggerFireworks}>
            🎆 花火
          </DemoButton>
        </div>

        {/* 現在のステータス表示 */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div>Level: {currentLevel}</div>
            <div>EXP: {currentExp}</div>
          </div>
        </div>
      </motion.div>

      {/* レベルアップモーダル */}
      <LevelUpModal
        isOpen={levelUpModalOpen}
        onClose={() => setLevelUpModalOpen(false)}
        level={currentLevel}
        experience={currentExp}
        rewards={[
          {
            id: 'exp_bonus',
            type: 'exp',
            name: '経験値ボーナス',
            description: '+100 EXP',
            icon: '⭐',
            rarity: 'common'
          },
          {
            id: 'new_skill',
            type: 'skill',
            name: 'スキル解放',
            description: '新しいスキルが解放されました',
            icon: '🎯',
            rarity: 'rare'
          },
          {
            id: 'special_badge',
            type: 'badge',
            name: 'レベルマスター',
            description: 'レベルアップ達成バッジ',
            icon: '🥇',
            rarity: 'epic'
          }
        ]}
      />

      {/* レスポンシブ対応 */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .fixed {
            bottom: 2rem;
            left: 1rem;
            right: 1rem;
            width: auto;
          }
          
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default HomePageInteractions; 