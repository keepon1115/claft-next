'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()

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
              <a 
                href="/"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🏠</i>
                <span className="text-base">ホーム</span>
              </a>
            </li>
            
            <li>
              <a 
                href="/profile"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/profile'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">😊</i>
                <span className="text-base">プロフィール</span>
              </a>
            </li>
            
            <li>
              <a 
                href="/quest"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/quest'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🏋️‍♂️</i>
                <span className="text-base">クエスト</span>
              </a>
            </li>
            
            <li>
              <a
                href="/pbl"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/pbl'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🕵️</i>
                <span className="text-base">PBL</span>
              </a>
            </li>

            <li>
              <a
                href="/minecraft-sdgs"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-green-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/minecraft-sdgs'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🌱</i>
                <span className="text-base">マイクラSDGs</span>
              </a>
            </li>
            
            <li>
              <Link
                href="/robo"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-green-400
                "
                onClick={() => onClose()}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🤖</i>
                <span className="text-base">ロボクエスト</span>
              </Link>
            </li>

            <li>
              <a
                href="/yononaka"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/yononaka'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">😆</i>
                <span className="text-base">Yononaka</span>
              </a>
            </li>
            
            <li>
              <a 
                href="/mirai"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/mirai'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🌍</i>
                <span className="text-base">ミライクラフト</span>
              </a>
            </li>
            
            <li>
              <a 
                href="/entrepreneur"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/entrepreneur'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🤝</i>
                <span className="text-base">アントレプレナー</span>
              </a>
            </li>

            {/* ひらめきポスト/Q＆A（アントレプレナーの次） */}
            <li>
              <a
                href="/hirameki-post"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-yellow-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/hirameki-post'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">💡</i>
                <span className="text-base">ひらめきポスト/Q＆A</span>
              </a>
            </li>

            <li>
              <a
                href="/twilight"
                className="
                  flex items-center py-[15px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                  focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-purple-400
                "
                onClick={(e) => { e.preventDefault(); router.push('/twilight'); onClose(); }}
              >
                <i className="w-[25px] text-[18px] mr-[15px] text-center">🌙</i>
                <span className="text-base">黄昏の対話室</span>
              </a>
            </li>
            
            {isAuthenticated && isAdmin && (
              <>
                <li className="mt-2 px-[25px] py-[8px] text-xs uppercase tracking-wide text-white/50">
                  管理セクション
                </li>
                <li>
                  <a 
                    href="/admin/minecraft-sdgs"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      hover:text-white hover:bg-white/10 transition-colors duration-150
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/minecraft-sdgs'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">🧱</i>
                    <span className="text-base">マイクラSDGs管理</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/admin"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      transition-all duration-300 ease-in-out font-medium
                      hover:bg-white/10 hover:text-white hover:pl-[35px]
                      focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">📊</i>
                    <span className="text-base">ダッシュボード</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/admin/users"
                    className="
                  flex items-center py-[12px] px-[25px] text-white/80 no-underline
                  transition-all duration-300 ease-in-out font-medium
                  hover:bg-white/10 hover:text-white hover:pl-[35px]
                      focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/users'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">👥</i>
                    <span className="text-base">ユーザー管理</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/admin/quests"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      transition-all duration-300 ease-in-out font-medium
                      hover:bg-white/10 hover:text-white hover:pl-[35px]
                      focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/quests'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">🗺️</i>
                    <span className="text-base">クエスト管理</span>
                  </a>
                </li>
                <li>
                  <Link
                    href="/admin/robo"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      transition-all duration-300 ease-in-out font-medium
                      hover:bg-white/10 hover:text-white hover:pl-[35px]
                      focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                    "
                    onClick={() => onClose()}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">🤖</i>
                    <span className="text-base">ロボクエスト管理</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="/admin/settings"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      transition-all duration-300 ease-in-out font-medium
                      hover:bg-white/10 hover:text-white hover:pl-[35px]
                      focus:bg-white/15 focus:text-white focus:border-l-4 focus:border-blue-400
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/settings'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">⚙️</i>
                    <span className="text-base">システム設定</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/admin/students"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      hover:text-white hover:bg-white/10 transition-colors duration-150
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/students'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">🎓</i>
                    <span className="text-base">スクール生管理</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/admin/hirameki-posts"
                    className="
                      flex items-center py-[12px] px-[25px] text-white/80 no-underline
                      hover:text-white hover:bg-white/10 transition-colors duration-150
                    "
                    onClick={(e) => { e.preventDefault(); router.push('/admin/hirameki-posts'); onClose(); }}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">💡</i>
                    <span className="text-base">ひらめき管理</span>
                  </a>
                </li>
              </>
            )}
            
            {/* 「認証」ページは不要なため削除 */}
            {/* <li>
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
            </li> */}
          </ul>
        </nav>
      </aside>
    </>
  )
} 