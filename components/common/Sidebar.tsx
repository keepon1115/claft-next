'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  // ESCキーでサイドバーを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // サイドバーが開いている時、背景スクロールを防ぐ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-[9998] transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={onClose}
      />
      
      {/* サイドバー */}
      <aside 
        className={`
          fixed top-0 w-[280px] h-full z-[9999] overflow-y-auto
          bg-gradient-to-b from-slate-700 to-slate-800
          shadow-[5px_0_15px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'left-0' : '-left-[280px]'}
          ${className}
        `}
      >
        {/* ヘッダー */}
        <div className="p-[30px_20px] bg-black/10 text-center border-b border-white/10">
          <h1 className="text-[28px] font-black text-white text-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] tracking-wide">
            CLAFT
          </h1>
        </div>
        
        {/* ナビゲーション */}
        <nav className="py-5">
          <ul className="list-none p-0 m-0">
            <li>
              <Link 
                href="/" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🏠</i>
                <span className="text-base">ホーム</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/profile" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">👤</i>
                <span className="text-base">プロフィール</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/quest" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🎯</i>
                <span className="text-base">クエスト</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/yononaka" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🌍</i>
                <span className="text-base">Yononaka</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/mirai" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🚀</i>
                <span className="text-base">ミライクラフト</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/admin" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">⚙️</i>
                <span className="text-base">管理画面</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/unauthorized" 
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={onClose}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🔒</i>
                <span className="text-base">認証</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
} 