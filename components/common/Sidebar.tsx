'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { NAV_GROUPS, ADMIN_NAV_ITEMS, type NavGroup, type NavItem } from './navConfig'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const LINK_CLASS = `
  flex items-center py-[15px] px-[25px] text-white/80 no-underline
  transition-all duration-300 ease-in-out font-medium
  hover:bg-white/10 hover:text-white hover:pl-[35px]
  focus:bg-white/15 focus:text-white focus:border-l-4
`

const SUBLINK_CLASS = `
  flex items-center py-[12px] pl-[45px] pr-[25px] text-white/80 no-underline
  transition-all duration-300 ease-in-out font-medium text-sm
  hover:bg-white/10 hover:text-white
  focus:bg-white/15 focus:text-white focus:border-l-4
`

function groupContainsPath(group: NavGroup, pathname: string): boolean {
  if (group.href) {
    return group.href === '/' ? pathname === '/' : pathname.startsWith(group.href)
  }
  return (group.items ?? []).some((item) => pathname.startsWith(item.href))
}

export function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isAdmin } = useAuth()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of NAV_GROUPS) {
      if (group.items && groupContainsPath(group, pathname ?? '')) {
        initial[group.id] = true
      }
    }
    return initial
  })

  // ページ遷移で現在パスを含むグループを自動展開
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      for (const group of NAV_GROUPS) {
        if (group.items && groupContainsPath(group, pathname ?? '')) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [pathname])

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

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
            {NAV_GROUPS.map((group) => {
              // 単独リンクグループ
              if (group.href) {
                return (
                  <li key={group.id}>
                    <a
                      href={group.href}
                      className={`${LINK_CLASS} focus:border-blue-400`}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(group.href as string)
                      }}
                    >
                      <i className="w-[25px] text-[18px] mr-[15px] text-center">{group.icon}</i>
                      <span className="text-base">{group.label}</span>
                    </a>
                  </li>
                )
              }

              // アコーディオングループ
              const items = group.items ?? []
              const isGroupOpen = !!openGroups[group.id]
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    className={`
                      w-full text-left flex items-center py-[15px] px-[25px] text-white/80
                      transition-all duration-300 ease-in-out font-medium
                      hover:bg-white/10 hover:text-white
                    `}
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isGroupOpen}
                  >
                    <i className="w-[25px] text-[18px] mr-[15px] text-center">{group.icon}</i>
                    <span className="text-base flex-1">{group.label}</span>
                    <span className="text-xs text-white/60">{isGroupOpen ? '▾' : '▸'}</span>
                  </button>
                  {isGroupOpen && (
                    <ul className="list-none p-0 m-0">
                      {items.map((item: NavItem) => (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            className={`${SUBLINK_CLASS} ${item.accent ?? 'focus:border-blue-400'}`}
                            onClick={(e) => {
                              e.preventDefault()
                              navigate(item.href)
                            }}
                          >
                            <i className="w-[20px] text-[16px] mr-[12px] text-center">{item.icon}</i>
                            <span>{item.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}

            {isAuthenticated && isAdmin && (
              <>
                <li className="mt-2 px-[25px] py-[8px] text-xs uppercase tracking-wide text-white/50">
                  管理セクション
                </li>
                {ADMIN_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="
                        flex items-center py-[12px] px-[25px] text-white/80 no-underline
                        hover:text-white hover:bg-white/10 transition-colors duration-150
                      "
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(item.href)
                      }}
                    >
                      <i className="w-[25px] text-[18px] mr-[15px] text-center">{item.icon}</i>
                      <span className="text-base">{item.label}</span>
                    </a>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  )
}
