'use client'

import React, { useState, useEffect } from 'react'

// =====================================================
// 型定義
// =====================================================

interface HamburgerMenuProps {
  /** ハンバーガーメニューのアクティブ状態（外部から制御する場合） */
  isActive?: boolean
  /** クリック時のコールバック関数 */
  onToggle?: (isActive: boolean) => void
  /** 追加のCSSクラス */
  className?: string
  /** カスタムスタイル */
  style?: React.CSSProperties
  /** アクセシビリティ用のラベル */
  ariaLabel?: string
  /** 無効化フラグ */
  disabled?: boolean
  /** サイズバリアント */
  size?: 'small' | 'medium' | 'large'
  /** テーマバリアント */
  variant?: 'default' | 'light' | 'dark'
}

// =====================================================
// サイズとテーマの設定
// =====================================================

const SIZE_VARIANTS = {
  small: {
    container: 'w-[35px] h-[35px] p-[6px]',
    bar: 'w-[20px] h-[2px]',
    gap: 'gap-[2px]',
    responsive: 'max-[480px]:w-[30px] max-[480px]:h-[30px]'
  },
  medium: {
    container: 'w-[45px] h-[45px] p-2.5',
    bar: 'w-[25px] h-[3px]',
    gap: 'gap-[3px]',
    responsive: 'max-sm:w-[40px] max-sm:h-[40px] max-sm:p-2'
  },
  large: {
    container: 'w-[50px] h-[50px] p-3',
    bar: 'w-[30px] h-[4px]',
    gap: 'gap-[4px]',
    responsive: 'lg:w-[55px] lg:h-[55px] lg:p-[14px]'
  }
}

const THEME_VARIANTS = {
  default: {
    background: 'bg-white/95',
    bar: 'bg-gray-800',
    shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]'
  },
  light: {
    background: 'bg-white/90',
    bar: 'bg-gray-700',
    shadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]'
  },
  dark: {
    background: 'bg-gray-800/95',
    bar: 'bg-white',
    shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]'
  }
}

// =====================================================
// メインコンポーネント
// =====================================================

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isActive: externalIsActive,
  onToggle,
  className = '',
  style,
  ariaLabel,
  disabled = false,
  size = 'medium',
  variant = 'default'
}) => {
  // 内部状態管理
  const [internalIsActive, setInternalIsActive] = useState(false)
  
  // 外部制御か内部制御かを判定
  const isControlled = externalIsActive !== undefined
  const isActive = isControlled ? externalIsActive : internalIsActive

  // スタイル設定を取得
  const sizeConfig = SIZE_VARIANTS[size]
  const themeConfig = THEME_VARIANTS[variant]

  // クリックハンドラー
  const handleClick = () => {
    if (disabled) return

    const newActiveState = !isActive

    // 内部制御の場合は状態を更新
    if (!isControlled) {
      setInternalIsActive(newActiveState)
    }

    // コールバック関数があれば呼び出し
    if (onToggle) {
      onToggle(newActiveState)
    }
  }

  // キーボードイベントハンドラー
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  // デバッグ用ログ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🍔 HamburgerMenu: isActive=${isActive}, controlled=${isControlled}`)
    }
  }, [isActive, isControlled])

  // アクセシビリティ用のラベル
  const defaultAriaLabel = isActive ? 'メニューを閉じる' : 'メニューを開く'
  const finalAriaLabel = ariaLabel || defaultAriaLabel

  return (
    <button
      type="button"
      className={`
        hamburger-menu
        fixed z-[10000] cursor-pointer
        rounded-[10px] transition-all duration-300 ease-in-out
        flex flex-col justify-center items-center
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${sizeConfig.container}
        ${sizeConfig.gap}
        ${sizeConfig.responsive}
        ${themeConfig.background}
        ${themeConfig.shadow}
        ${isActive ? 'active' : ''}
        ${className}
      `}
      style={{
        // 基本位置（navigation.cssに合わせる）
        top: '20px',
        left: '20px',
        pointerEvents: 'auto',
        ...style
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={finalAriaLabel}
      aria-expanded={isActive}
      aria-controls="sidebar"
      role="button"
      tabIndex={0}
    >
      {/* 1本目のバー */}
      <div
        className={`
          bar block rounded-[3px] transition-all duration-300 ease-in-out
          ${sizeConfig.bar}
          ${themeConfig.bar}
        `}
        style={{
          transform: isActive ? 'rotate(45deg) translate(5px, 5px)' : 'none'
        }}
      />
      
      {/* 2本目のバー（アクティブ時に消える） */}
      <div
        className={`
          bar block rounded-[3px] transition-all duration-300 ease-in-out
          ${sizeConfig.bar}
          ${themeConfig.bar}
          ${isActive ? 'opacity-0' : 'opacity-100'}
        `}
      />
      
      {/* 3本目のバー */}
      <div
        className={`
          bar block rounded-[3px] transition-all duration-300 ease-in-out
          ${sizeConfig.bar}
          ${themeConfig.bar}
        `}
        style={{
          transform: isActive ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
        }}
      />

      {/* レスポンシブ対応のためのCSS（navigation.css互換） */}
      <style jsx>{`
        @media (max-width: 770px) {
          .hamburger-menu {
            top: 15px !important;
            left: 15px !important;
          }
        }
        
        @media (max-width: 770px) and (max-height: 500px) {
          .hamburger-menu {
            top: 10px !important;
            left: 10px !important;
          }
        }
        
        @media (min-width: 1200px) {
          .hamburger-menu {
            top: 25px !important;
            left: 25px !important;
          }
        }
      `}</style>
    </button>
  )
}

// =====================================================
// カスタムフック
// =====================================================

/**
 * ハンバーガーメニューの状態管理用フック
 * サイドバーやその他のコンポーネントとの連携に使用
 */
export const useHamburgerMenu = (initialState = false) => {
  const [isActive, setIsActive] = useState(initialState)

  const toggle = () => {
    setIsActive(prev => !prev)
  }

  const open = () => {
    setIsActive(true)
  }

  const close = () => {
    setIsActive(false)
  }

  return {
    isActive,
    toggle,
    open,
    close,
    setIsActive
  }
}

// =====================================================
// ユーティリティコンポーネント
// =====================================================

/**
 * プリセット済みのサイドバー連携ハンバーガーメニュー
 */
export const SidebarHamburgerMenu: React.FC<{
  onToggle: (isActive: boolean) => void
  isActive: boolean
  className?: string
}> = ({ onToggle, isActive, className }) => {
  return (
    <HamburgerMenu
      isActive={isActive}
      onToggle={onToggle}
      className={className}
      ariaLabel={isActive ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      size="medium"
      variant="default"
    />
  )
}

/**
 * 小さいサイズのハンバーガーメニュー（モバイル専用など）
 */
export const CompactHamburgerMenu: React.FC<{
  onToggle?: (isActive: boolean) => void
  className?: string
}> = ({ onToggle, className }) => {
  return (
    <HamburgerMenu
      onToggle={onToggle}
      className={className}
      size="small"
      variant="light"
    />
  )
}

// =====================================================
// デフォルトエクスポート
// =====================================================

export default HamburgerMenu

// =====================================================
// 型エクスポート
// =====================================================

export type { HamburgerMenuProps }

// =====================================================
// 使用例とドキュメント
// =====================================================

/**
 * HamburgerMenu コンポーネント
 * 
 * 既存のnavigation.cssスタイルを完全に維持したハンバーガーメニュー
 * 
 * @example
 * ```tsx
 * // 基本的な使用方法
 * import HamburgerMenu from '@/components/common/HamburgerMenu'
 * 
 * function App() {
 *   const [sidebarOpen, setSidebarOpen] = useState(false)
 * 
 *   return (
 *     <HamburgerMenu
 *       isActive={sidebarOpen}
 *       onToggle={setSidebarOpen}
 *     />
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // カスタムフック使用
 * import HamburgerMenu, { useHamburgerMenu } from '@/components/common/HamburgerMenu'
 * 
 * function App() {
 *   const { isActive, toggle } = useHamburgerMenu()
 * 
 *   return (
 *     <HamburgerMenu
 *       isActive={isActive}
 *       onToggle={() => toggle()}
 *     />
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // プリセットコンポーネント使用
 * import { SidebarHamburgerMenu } from '@/components/common/HamburgerMenu'
 * 
 * function Layout() {
 *   const [sidebarOpen, setSidebarOpen] = useState(false)
 * 
 *   return (
 *     <>
 *       <SidebarHamburgerMenu
 *         isActive={sidebarOpen}
 *         onToggle={setSidebarOpen}
 *       />
 *       <Sidebar isOpen={sidebarOpen} />
 *     </>
 *   )
 * }
 * ```
 * 
 * @features
 * - 既存のnavigation.cssスタイル完全対応
 * - 3本線→×への滑らかなアニメーション
 * - 外部制御・内部制御両対応
 * - 複数のサイズとテーマバリアント
 * - 完全なアクセシビリティ対応
 * - レスポンシブ対応（navigation.css互換）
 * - TypeScript完全対応
 * 
 * @accessibility
 * - ARIA属性完備
 * - キーボードナビゲーション対応
 * - スクリーンリーダー対応
 * - フォーカス管理
 */ 