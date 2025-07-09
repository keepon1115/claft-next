'use client'

import { useState } from 'react'

// =====================================================
// HamburgerMenu型定義
// =====================================================

export interface HamburgerMenuProps {
  /** メニューの開閉状態 */
  isOpen?: boolean
  /** クリック時のコールバック */
  onToggle?: () => void
  /** 追加のクラス名 */
  className?: string
}

// =====================================================
// HamburgerMenuコンポーネント
// =====================================================

export function HamburgerMenu({
  isOpen = false,
  onToggle,
  className = ''
}: HamburgerMenuProps) {
  const [isActive, setIsActive] = useState(isOpen)

  const handleClick = () => {
    setIsActive(!isActive)
    onToggle?.()
  }

  return (
    <>
      <div
        className={`
          fixed cursor-pointer z-[10000]
          bg-white/95 rounded-[10px] p-[10px]
          shadow-[0_4px_15px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-in-out
          w-[45px] h-[45px]
          flex flex-col justify-center items-center gap-[3px]
          hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]
          ${isActive ? 'active' : ''}
          ${className}
        `}
        onClick={handleClick}
        role="button"
        aria-label="メニューを開く"
        style={{
          top: '20px',
          left: '20px'
        }}
      >
        {/* 1本目のバー */}
        <div
          className={`
            block w-[25px] h-[3px] bg-gray-800 rounded-[3px]
            transition-all duration-300 ease-in-out
          `}
          style={{
            transform: isActive ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }}
        />
        
        {/* 2本目のバー */}
        <div
          className={`
            block w-[25px] h-[3px] bg-gray-800 rounded-[3px]
            transition-all duration-300 ease-in-out
            ${isActive ? 'opacity-0' : 'opacity-100'}
          `}
        />
        
        {/* 3本目のバー */}
        <div
          className={`
            block w-[25px] h-[3px] bg-gray-800 rounded-[3px]
            transition-all duration-300 ease-in-out
          `}
          style={{
            transform: isActive ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
          }}
        />
      </div>

      {/* レスポンシブ対応 */}
      <style jsx>{`
        @media (max-width: 770px) {
          .hamburger-menu {
            top: 15px !important;
            left: 15px !important;
          }
        }
        
        @media (min-width: 1200px) {
          .hamburger-menu {
            top: 25px !important;
            left: 25px !important;
          }
        }
      `}</style>
    </>
  )
}

export default HamburgerMenu 