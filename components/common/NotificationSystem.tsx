'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// 型定義
// =====================================================

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'level-up' | 'achievement';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
}

// =====================================================
// 通知管理コンテキスト
// =====================================================

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | null>(null);

// =====================================================
// カスタムフック
// =====================================================

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// =====================================================
// 通知カードコンポーネント
// =====================================================

interface NotificationCardProps {
  notification: Notification;
  onRemove: (id: string) => void;
  index: number;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onRemove, 
  index 
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  // 自動削除タイマー
  useEffect(() => {
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.duration, notification.id]);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  }, [notification.id, onRemove]);

  // 通知タイプごとのスタイル
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-600',
          border: 'border-green-400',
          icon: notification.icon || '✅'
        };
      case 'error':
        return {
          bg: 'from-red-500 to-pink-600',
          border: 'border-red-400',
          icon: notification.icon || '❌'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-orange-600',
          border: 'border-yellow-400',
          icon: notification.icon || '⚠️'
        };
      case 'info':
        return {
          bg: 'from-blue-500 to-cyan-600',
          border: 'border-blue-400',
          icon: notification.icon || 'ℹ️'
        };
      case 'level-up':
        return {
          bg: 'from-purple-500 to-indigo-600',
          border: 'border-purple-400',
          icon: notification.icon || '🆙'
        };
      case 'achievement':
        return {
          bg: 'from-yellow-500 to-amber-600',
          border: 'border-yellow-400',
          icon: notification.icon || '🏆'
        };
      default:
        return {
          bg: 'from-gray-500 to-slate-600',
          border: 'border-gray-400',
          icon: notification.icon || 'ℹ️'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: 100,
        scale: 0.8
      }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? 100 : 0,
        scale: isRemoving ? 0.8 : 1,
        transition: {
          type: "spring",
          damping: 25,
          stiffness: 300,
          delay: index * 0.1
        }
      }}
      exit={{ 
        opacity: 0, 
        x: 100,
        scale: 0.8,
        transition: {
          duration: 0.3,
          ease: "easeIn"
        }
      }}
      layout
      className={`
        relative overflow-hidden rounded-xl border-2 ${style.border}
        bg-gradient-to-r ${style.bg} text-white shadow-lg
        backdrop-blur-sm min-w-[320px] max-w-[400px]
      `}
    >
      {/* 背景アニメーション */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%'],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            backgroundSize: '200% 100%'
          }}
        />
      </div>

      {/* プログレスバー */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ 
          width: '0%',
          transition: {
            duration: (notification.duration || 5000) / 1000,
            ease: "linear"
          }
        }}
        className="absolute bottom-0 left-0 h-1 bg-white/50"
      />

      {/* コンテンツ */}
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          {/* アイコン */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: notification.type === 'level-up' ? [0, 10, -10, 0] : [0],
              transition: {
                duration: notification.type === 'level-up' ? 2 : 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="text-2xl flex-shrink-0"
          >
            {style.icon}
          </motion.div>

          {/* テキストコンテンツ */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1 truncate">
              {notification.title}
            </h4>
            <p className="text-xs opacity-90 break-words">
              {notification.message}
            </p>

            {/* アクションボタン */}
            {notification.action && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.3 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={notification.action.onClick}
                className="
                  mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 
                  rounded-full text-xs font-medium transition-colors
                "
              >
                {notification.action.label}
              </motion.button>
            )}
          </div>

          {/* クローズボタン */}
          <button
            onClick={handleRemove}
            className="
              flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30
              flex items-center justify-center text-white/70 hover:text-white
              transition-colors text-xs
            "
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// 通知システムコンポーネント
// =====================================================

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  className = '',
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notificationData,
      id
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ポジション設定
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      <div className={`fixed z-[1001] ${getPositionClasses()} ${className}`}>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRemove={removeNotification}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* クリアオールボタン */}
        {notifications.length > 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearAllNotifications}
            className="
              mt-3 w-full px-3 py-2 bg-black/70 hover:bg-black/80
              text-white text-xs rounded-lg transition-colors
            "
          >
            すべてクリア
          </motion.button>
        )}
      </div>
    </NotificationContext.Provider>
  );
};

// =====================================================
// プロバイダーコンポーネント
// =====================================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <NotificationSystem />
    </>
  );
};

// =====================================================
// ユーティリティ関数
// =====================================================

// 便利な通知発火関数
export const createNotificationHelpers = (addNotification: NotificationContextType['addNotification']) => ({
  success: (title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'success', title, message, action });
  },
  
  error: (title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'error', title, message, action, duration: 7000 });
  },
  
  warning: (title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'warning', title, message, action });
  },
  
  info: (title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'info', title, message, action });
  },
  
  levelUp: (level: number, experience: number) => {
    addNotification({
      type: 'level-up',
      title: 'レベルアップ！',
      message: `Level ${level} に到達しました！ (${experience} EXP)`,
      duration: 8000,
      icon: '🎉'
    });
  },
  
  achievement: (title: string, description: string) => {
    addNotification({
      type: 'achievement',
      title: `🏆 ${title}`,
      message: description,
      duration: 6000
    });
  }
});

// =====================================================
// エクスポート
// =====================================================

export default NotificationSystem;
export type { Notification, NotificationSystemProps }; 