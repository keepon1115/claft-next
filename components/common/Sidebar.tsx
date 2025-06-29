'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { 
  Home, 
  User, 
  Scroll, 
  Globe, 
  Rocket, 
  Shield, 
  Settings,
  Menu,
  X
} from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  requireAuth?: boolean
  requireAdmin?: boolean
  description?: string
}

interface SidebarProps {
  className?: string
}

// =====================================================
// ナビゲーション設定
// =====================================================

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: '/',
    label: 'ホーム',
    icon: Home,
    description: 'トップページ'
  },
  {
    href: '/profile',
    label: 'プロフィール',
    icon: User,
    requireAuth: true,
    description: 'あなたの冒険者プロフィール'
  },
  {
    href: '/quest',
    label: 'クエスト',
    icon: Scroll,
    requireAuth: true,
    description: '冒険クエストに挑戦'
  },
  {
    href: '/yononaka',
    label: 'Yononaka',
    icon: Globe,
    description: '世の中を探索'
  },
  {
    href: '/mirai',
    label: 'ミライクラフト',
    icon: Rocket,
    description: '未来をクラフト'
  },
  {
    href: '/admin',
    label: '管理画面',
    icon: Shield,
    requireAuth: true,
    requireAdmin: true,
    description: 'システム管理（管理者専用）'
  }
]

// =====================================================
// ハンバーガーメニューコンポーネント
// =====================================================

interface HamburgerMenuProps {
  isActive: boolean
  onClick: () => void
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isActive, onClick }) => {
  return (
    <button
      className={`
        fixed top-5 left-5 z-[10000] 
        bg-white/95 rounded-[10px] p-2.5 cursor-pointer
        shadow-[0_4px_15px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-in-out
        w-[45px] h-[45px]
        flex flex-col justify-center items-center gap-[3px]
        hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]
        ${isActive ? 'active' : ''}
        lg:top-[25px] lg:left-[25px] lg:w-[50px] lg:h-[50px] lg:p-3
        max-sm:top-[15px] max-sm:left-[15px] max-sm:w-[40px] max-sm:h-[40px] max-sm:p-2
      `}
      onClick={onClick}
      aria-label={isActive ? 'メニューを閉じる' : 'メニューを開く'}
      type="button"
    >
      <div 
        className={`
          block w-[25px] h-[3px] bg-gray-800 
          transition-all duration-300 ease-in-out rounded-[3px]
          ${isActive ? 'rotate-45' : ''}
        `}
        style={isActive ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}}
      />
      <div 
        className={`
          block w-[25px] h-[3px] bg-gray-800 
          transition-all duration-300 ease-in-out rounded-[3px]
          ${isActive ? 'opacity-0' : ''}
        `}
      />
      <div 
        className={`
          block w-[25px] h-[3px] bg-gray-800 
          transition-all duration-300 ease-in-out rounded-[3px]
          ${isActive ? '-rotate-45' : ''}
        `}
        style={isActive ? { transform: 'rotate(-45deg) translate(7px, -6px)' } : {}}
      />
    </button>
  )
}

// =====================================================
// サイドバーオーバーレイコンポーネント
// =====================================================

interface SidebarOverlayProps {
  isActive: boolean
  onClick: () => void
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ isActive, onClick }) => {
  return (
    <div
      className={`
        fixed top-0 left-0 w-full h-full
        bg-black/50 transition-all duration-300 ease-in-out
        z-[9998]
        ${isActive ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

// =====================================================
// ナビゲーションアイテムコンポーネント
// =====================================================

interface NavigationItemProps {
  item: NavigationItem
  isActive: boolean
  onClick: () => void
}

const NavigationItemComponent: React.FC<NavigationItemProps> = ({ 
  item, 
  isActive, 
  onClick 
}) => {
  const Icon = item.icon
  
  return (
    <a
      href={item.href}
      className={`
        flex items-center px-6 py-4 
        text-white/80 no-underline
        transition-all duration-300 ease-in-out
        relative font-medium
        hover:bg-white/10 hover:text-white hover:pl-9
        ${isActive ? 'bg-white/15 text-white border-l-4 border-blue-400' : ''}
      `}
      onClick={(e) => {
        e.preventDefault()
        onClick()
        // Next.jsのルーティングを使用
        window.location.href = item.href
      }}
      title={item.description}
    >
      <Icon className="w-[25px] h-[18px] mr-4 text-center" />
      <span className="text-base">{item.label}</span>
    </a>
  )
}

// =====================================================
// メインサイドバーコンポーネント
// =====================================================

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState<NavigationItem[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isAdmin, displayName } = useAuth()
  const sidebarRef = useRef<HTMLElement>(null)

  // ナビゲーションアイテムのフィルタリング
  useEffect(() => {
    const items = NAVIGATION_ITEMS.filter(item => {
      // 認証が必要なアイテムのチェック
      if (item.requireAuth && !isAuthenticated) {
        return false
      }
      
      // 管理者権限が必要なアイテムのチェック
      if (item.requireAdmin && !isAdmin) {
        return false
      }
      
      return true
    })
    
    setFilteredItems(items)
  }, [isAuthenticated, isAdmin])

  // サイドバーを閉じる
  const closeSidebar = () => {
    setIsOpen(false)
  }

  // サイドバーを開閉する
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // ESCキーでサイドバーを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // 外部クリックでサイドバーを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest('.hamburger-menu')
      ) {
        closeSidebar()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ルート変更時にサイドバーを閉じる
  useEffect(() => {
    closeSidebar()
  }, [pathname])

  // 現在のページがアクティブかチェック
  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // アイテムクリック時の処理
  const handleItemClick = (href: string) => {
    closeSidebar()
    
    // Next.jsのルーターを使用してナビゲーション
    setTimeout(() => {
      router.push(href)
    }, 100) // サイドバーが閉じるアニメーションを待つ
  }

  return (
    <>
      {/* ハンバーガーメニュー */}
      <HamburgerMenu 
        isActive={isOpen} 
        onClick={toggleSidebar} 
      />

      {/* サイドバーオーバーレイ */}
      <SidebarOverlay 
        isActive={isOpen} 
        onClick={closeSidebar} 
      />

      {/* サイドバー */}
      <nav
        ref={sidebarRef}
        className={`
          fixed top-0 h-full
          bg-gradient-to-b from-slate-700 to-slate-800
          transition-all duration-300 ease-in-out
          z-[9999] overflow-y-auto
          w-[280px] md:w-[250px] max-sm:w-[240px] max-[480px]:w-[220px]
          ${isOpen ? 'left-0' : '-left-[280px] md:-left-[250px] max-sm:-left-[240px] max-[480px]:-left-[220px]'}
          ${className}
        `}
        style={{
          boxShadow: '5px 0 15px rgba(0, 0, 0, 0.1)'
        }}
        role="navigation"
        aria-label="メインナビゲーション"
      >
        {/* サイドバーヘッダー */}
        <div className="px-5 py-8 bg-black/10 text-center border-b border-white/10">
          <div 
            className="text-[28px] font-black text-white tracking-wide"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
          >
            CLAFT
          </div>
          {isAuthenticated && displayName && (
            <div className="mt-2 text-sm text-white/70">
              こんにちは、{displayName}さん
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="py-5">
          <ul className="list-none p-0 m-0">
            {filteredItems.map((item) => (
              <li key={item.href} className="m-0">
                <button
                  className={`
                    w-full flex items-center px-6 py-4 
                    text-white/80 transition-all duration-300 ease-in-out
                    relative font-medium border-none bg-transparent
                    cursor-pointer text-left
                    hover:bg-white/10 hover:text-white hover:pl-9
                    focus:outline-none focus:bg-white/10 focus:text-white
                    ${isItemActive(item.href) ? 'bg-white/15 text-white border-l-4 border-blue-400' : ''}
                  `}
                  onClick={() => handleItemClick(item.href)}
                  title={item.description}
                  type="button"
                >
                  <item.icon className="w-[25px] h-[18px] mr-4 text-center flex-shrink-0" />
                  <span className="text-base">{item.label}</span>
                  {item.requireAdmin && (
                    <Shield className="w-4 h-4 ml-auto text-yellow-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* フッター情報 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 border-t border-white/10">
          <div className="text-xs text-white/60 text-center">
            <div>CLAFT Navigation</div>
            {isAuthenticated && (
              <div className="mt-1">
                権限: {isAdmin ? '管理者' : '一般ユーザー'}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* サイドバーが開いている時の body スクロール防止 */}
      <style jsx global>{`
        ${isOpen ? `
          body {
            overflow: hidden;
          }
        ` : ''}
      `}</style>
    </>
  )
}

export default Sidebar

// =====================================================
// エクスポート用の型定義
// =====================================================

export type { NavigationItem, SidebarProps }

// =====================================================
// 使用例とドキュメント
// =====================================================

/**
 * Sidebar コンポーネント
 * 
 * Next.js 15 App Router対応のレスポンシブサイドバーナビゲーション
 * 
 * @example
 * ```tsx
 * import Sidebar from '@/components/common/Sidebar'
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <div>
 *       <Sidebar />
 *       <main>{children}</main>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @features
 * - 認証状態に応じたナビゲーション表示
 * - 管理者権限チェック
 * - 現在ページのハイライト表示
 * - レスポンシブ対応（モバイル・タブレット・デスクトップ）
 * - アクセシビリティ対応
 * - キーボードナビゲーション（ESCキーで閉じる）
 * - 外部クリックで閉じる
 * - スムーズなアニメーション
 * 
 * @accessibility
 * - ARIA ラベル
 * - キーボードナビゲーション
 * - フォーカス管理
 * - セマンティックHTML
 */ 