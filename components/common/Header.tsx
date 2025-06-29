'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AuthButton from '../auth/AuthButton'

// =====================================================
// 型定義
// =====================================================

interface HeaderProps {
  /** 追加のCSSクラス */
  className?: string
  /** カスタムスタイル */
  style?: React.CSSProperties
  /** 経験値（0-100の値） */
  experience?: number
  /** レベル情報 */
  level?: number
  /** 実績バッジの表示制御 */
  showAchievements?: boolean
}

interface Achievement {
  id: string
  type: 'gold' | 'silver' | 'bronze'
  icon: string
  tooltip: string
  unlocked: boolean
}

// =====================================================
// サンプル実績データ
// =====================================================

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    type: 'bronze',
    icon: '🏆',
    tooltip: '初回クエスト完了',
    unlocked: true
  },
  {
    id: 'profile_complete',
    type: 'silver',
    icon: '⭐',
    tooltip: 'プロフィール完成',
    unlocked: true
  },
  {
    id: 'master_adventurer',
    type: 'gold',
    icon: '👑',
    tooltip: '上級冒険者',
    unlocked: false
  }
]

// =====================================================
// 実績バッジコンポーネント
// =====================================================

interface AchievementBadgeProps {
  achievement: Achievement
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!achievement.unlocked) return null

  const badgeStyles = {
    gold: 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-[0_4px_15px_rgba(255,215,0,0.4)]',
    silver: 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-[0_4px_15px_rgba(192,192,192,0.4)]',
    bronze: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_15px_rgba(205,127,50,0.4)]'
  }

  return (
    <div
      className={`
        relative w-10 h-10 rounded-full flex items-center justify-center
        text-xl cursor-pointer transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:scale-110
        ${badgeStyles[achievement.type]}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="z-10">{achievement.icon}</span>
      
      {/* ツールチップ */}
      {showTooltip && (
        <div className="
          absolute bottom-[-40px] left-1/2 transform -translate-x-1/2
          bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap
          opacity-100 visible transition-all duration-300 ease-in-out z-20
        ">
          {achievement.tooltip}
          <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800" />
        </div>
      )}
    </div>
  )
}

// =====================================================
// 経験値バーコンポーネント
// =====================================================

interface ExperienceBarProps {
  experience: number
  level?: number
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({ experience, level = 1 }) => {
  const clampedExp = Math.max(0, Math.min(100, experience))

  return (
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10">
      <div
        className="
          h-full bg-gradient-to-r from-yellow-400 to-yellow-500
          relative overflow-hidden transition-all duration-500 ease-out
        "
        style={{ width: `${clampedExp}%` }}
      >
        {/* シマーエフェクト */}
        <div
          className="
            absolute top-0 left-0 right-0 bottom-0
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            animate-[shimmer_2s_infinite]
          "
        />
      </div>
      
      {/* 経験値情報（ホバー時に表示） */}
      <div className="
        absolute top-[-30px] left-4 text-xs text-white/80
        opacity-0 hover:opacity-100 transition-opacity duration-300
        bg-black/20 px-2 py-1 rounded backdrop-blur-sm
      ">
        Lv.{level} - {clampedExp}% EXP
      </div>
    </div>
  )
}

// =====================================================
// プレイヤー情報コンポーネント
// =====================================================

interface PlayerInfoProps {
  user: any
  displayName: string
  achievements: Achievement[]
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ user, displayName, achievements }) => {
  return (
    <div className="flex items-center gap-5">
      {/* 挨拶セクション */}
      <div className="greeting-section">
        <h1 className="text-2xl font-black mb-1 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
          こんにちは、{displayName}さん！
        </h1>
        <p className="text-base opacity-90 text-white/90">
          今日も素晴らしい冒険を！
        </p>
      </div>

      {/* 実績バッジ */}
      <div className="flex gap-4 items-center">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )
}

// =====================================================
// ゲスト用情報コンポーネント
// =====================================================

const GuestInfo: React.FC = () => {
  return (
    <div className="greeting-section">
      <h1 className="text-2xl font-black mb-1 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
        ようこそ、CLAFT へ！
      </h1>
      <p className="text-base opacity-90 text-white/90">
        あなたの冒険を始めましょう
      </p>
    </div>
  )
}

// =====================================================
// 認証ボタンエリアコンポーネント
// =====================================================

const AuthButtonArea: React.FC = () => {
  return (
    <div className="
      fixed top-5 right-5 z-[998]
      flex items-center gap-4
      max-md:top-4 max-md:right-4
      max-lg:top-6 max-lg:right-6
    ">
      <AuthButton 
        variant="compact"
        size="md"
        enableUserMenu={false}
        className="auth-nav-btn"
      />
    </div>
  )
}

// =====================================================
// メインヘッダーコンポーネント
// =====================================================

const Header: React.FC<HeaderProps> = ({
  className = '',
  style,
  experience = 65,
  level = 1,
  showAchievements = true
}) => {
  const { isAuthenticated, user, displayName, isLoading } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS)

  // ユーザーの実績データを取得（実際のプロジェクトでは API から取得）
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: 実際のユーザー実績データをAPIから取得
      // 現在はサンプルデータを使用
      setAchievements(SAMPLE_ACHIEVEMENTS)
    } else {
      setAchievements([])
    }
  }, [isAuthenticated, user])

  // ローディング中の表示
  if (isLoading) {
    return (
      <header className={`
        header relative z-[90] overflow-hidden
        bg-gradient-to-br from-blue-400 to-purple-600
        text-white px-8 py-4 pl-[70px]
        shadow-[0_4px_20px_rgba(0,0,0,0.1)]
        ${className}
      `} style={style}>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-5">
            <div className="animate-pulse">
              <div className="h-7 bg-white/20 rounded w-32 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        {/* 経験値バー */}
        <ExperienceBar experience={experience} level={level} />
        
        {/* 認証ボタンエリア */}
        <AuthButtonArea />
      </header>
    )
  }

  return (
    <>
      <header className={`
        header relative z-[90] overflow-hidden
        bg-gradient-to-br from-blue-400 to-purple-600
        text-white px-8 py-4 pl-[70px]
        shadow-[0_4px_20px_rgba(0,0,0,0.1)]
        max-md:px-4 max-md:py-3 max-md:pl-[60px]
        ${className}
      `} style={style}>
        
        {/* 背景アニメーション */}
        <div 
          className="
            absolute -top-1/2 -left-1/2 w-[200%] h-[200%]
            bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]
            animate-[rotate-bg_30s_linear_infinite]
          "
        />

        {/* ヘッダーコンテンツ */}
        <div className="
          flex justify-between items-center relative z-10
          max-md:flex-col max-md:gap-3 max-md:items-start
        ">
          {/* プレイヤー情報 */}
          <div className="player-info">
            {isAuthenticated ? (
              <PlayerInfo 
                user={user}
                displayName={displayName || '冒険者'}
                achievements={showAchievements ? achievements : []}
              />
            ) : (
              <GuestInfo />
            )}
          </div>
        </div>

        {/* 経験値バー */}
        <ExperienceBar experience={experience} level={level} />
      </header>

      {/* 認証ボタンエリア（ヘッダー外に配置） */}
      <AuthButtonArea />

      {/* カスタムアニメーション定義 */}
      <style jsx>{`
        @keyframes rotate-bg {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        /* レスポンシブ調整 */
        @media (max-width: 768px) {
          .header {
            padding: 15px 15px 15px 60px;
          }
          
          .greeting-section h1 {
            font-size: 20px;
          }
          
          .greeting-section p {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .header {
            padding: 12px 12px 12px 55px;
          }
          
          .greeting-section h1 {
            font-size: 18px;
          }
          
          .greeting-section p {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}

// =====================================================
// ユーティリティコンポーネント
// =====================================================

/**
 * 簡易版ヘッダー（ローディング状態やエラー時用）
 */
export const SimpleHeader: React.FC<{ title?: string }> = ({ 
  title = 'CLAFT' 
}) => {
  return (
    <header className="
      bg-gradient-to-br from-blue-400 to-purple-600
      text-white px-8 py-4 pl-[70px]
      shadow-[0_4px_20px_rgba(0,0,0,0.1)]
    ">
      <h1 className="text-2xl font-black text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
        {title}
      </h1>
      <AuthButtonArea />
    </header>
  )
}

/**
 * カスタム経験値付きヘッダー
 */
export const HeaderWithCustomExp: React.FC<{
  experience: number
  level: number
  className?: string
}> = ({ experience, level, className }) => {
  return (
    <Header
      experience={experience}
      level={level}
      className={className}
    />
  )
}

// =====================================================
// デフォルトエクスポート
// =====================================================

export default Header

// =====================================================
// 型エクスポート
// =====================================================

export type { HeaderProps, Achievement }
