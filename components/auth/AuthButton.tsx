'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from './AuthModal'
import { User, LogOut, Settings, Crown } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface AuthButtonProps {
  /** ボタンのバリエーション */
  variant?: 'default' | 'compact' | 'minimal'
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg'
  /** ログイン成功後のリダイレクト先 */
  redirectTo?: string
  /** 初期表示タブ */
  defaultTab?: 'login' | 'signup'
  /** カスタムクラス名 */
  className?: string
  /** ユーザー名をクリック可能にするか */
  enableUserMenu?: boolean
  /** 管理者リンクの表示 */
  showAdminLink?: boolean
}

// =====================================================
// AuthButtonコンポーネント
// =====================================================

/**
 * 認証状態に応じてログイン/ログアウトボタンを表示するコンポーネント
 * 既存のauth.jsのスタイルを維持しながらReactコンポーネント化
 * 
 * @example
 * ```tsx
 * // 基本的な使用法
 * <AuthButton />
 * 
 * // カスタマイズ例
 * <AuthButton 
 *   variant="compact"
 *   size="sm"
 *   redirectTo="/dashboard"
 *   defaultTab="signup"
 *   enableUserMenu={true}
 *   showAdminLink={true}
 * />
 * ```
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'default',
  size = 'md',
  redirectTo = '/',
  defaultTab = 'login',
  className = '',
  enableUserMenu = false,
  showAdminLink = true
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { 
    isAuthenticated, 
    user, 
    displayName, 
    isAdmin, 
    isLoading, 
    logout 
  } = useAuth()

  // ログアウト処理
  const handleLogout = async () => {
    setShowUserMenu(false)
    const result = await logout()
    if (!result.success) {
      alert('ログアウトに失敗しました')
    }
  }

  // ログインモーダルを開く
  const openAuthModal = (tab: 'login' | 'signup' = defaultTab) => {
    setIsAuthModalOpen(true)
  }

  // ユーザーメニューを閉じる
  const closeUserMenu = () => {
    setShowUserMenu(false)
  }

  // サイズ別のスタイル定義
  const sizeStyles = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      avatar: 'w-6 h-6 text-xs',
      icon: 'w-4 h-4'
    },
    md: {
      button: 'px-4 py-2 text-base',
      avatar: 'w-8 h-8 text-sm',
      icon: 'w-5 h-5'
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      avatar: 'w-10 h-10 text-base',
      icon: 'w-6 h-6'
    }
  }

  const currentSize = sizeStyles[size]

  // 未認証時のボタン（ログインボタン）
  if (!isAuthenticated) {
    if (variant === 'minimal') {
      return (
        <>
          <button
            onClick={() => openAuthModal('login')}
            disabled={isLoading}
            className={`
              text-blue-600 hover:text-blue-800 font-medium transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
          
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            defaultTab={defaultTab}
            redirectTo={redirectTo}
          />
        </>
      )
    }

    if (variant === 'compact') {
      return (
        <>
          <div className={`flex space-x-2 ${className}`}>
            <button
              onClick={() => openAuthModal('login')}
              disabled={isLoading}
              className={`
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                ${currentSize.button}
              `}
            >
              {isLoading ? 'ログイン中...' : '🚪 ログイン'}
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              disabled={isLoading}
              className={`
                bg-green-500 text-black border-2 border-green-700 rounded-lg hover:bg-green-600 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                ${currentSize.button}
              `}
            >
              {isLoading ? '登録中...' : '⚔️ 新規登録'}
            </button>
          </div>
          
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            defaultTab={defaultTab}
            redirectTo={redirectTo}
          />
        </>
      )
    }

    // デフォルトバリエーション
    return (
      <>
        <button
          onClick={() => openAuthModal('login')}
          disabled={isLoading}
          className={`
            bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            flex items-center space-x-2
            ${currentSize.button} ${className}
          `}
          data-auth-action="login"
        >
          <User className={currentSize.icon} />
          <span>{isLoading ? 'ログイン中...' : 'ログイン'}</span>
        </button>
        
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={defaultTab}
          redirectTo={redirectTo}
        />
      </>
    )
  }

  // 認証済み時の表示
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <span className="text-gray-700">
          こんにちは、<span className="font-medium">{displayName}</span>さん
          {isAdmin && <Crown className="inline w-4 h-4 ml-1 text-yellow-500" />}
        </span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
          <div className={`
            ${currentSize.avatar} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold
          `}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700 font-medium">{displayName}</span>
          {isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
        </div>
        
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`
            bg-red-500 text-white rounded-lg hover:bg-red-600 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            ${currentSize.button}
          `}
          data-auth-action="logout"
        >
          <LogOut className={currentSize.icon} />
        </button>
      </div>
    )
  }

  // デフォルトバリエーション（ドロップダウンメニュー付き）
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        {/* ユーザー情報 */}
        <div 
          className={`
            flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 border
            ${enableUserMenu ? 'cursor-pointer hover:bg-gray-100' : ''}
          `}
          onClick={enableUserMenu ? () => setShowUserMenu(!showUserMenu) : undefined}
        >
          {/* アバター */}
          <div className={`
            ${currentSize.avatar} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold
          `}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          
          {/* ユーザー名と管理者バッジ */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="text-gray-800 font-medium">{displayName}</span>
              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-600 font-bold">管理者</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          
          {enableUserMenu && (
            <div className="ml-2">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`
            bg-red-500 text-white rounded-lg hover:bg-red-600 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            flex items-center space-x-2
            ${currentSize.button}
          `}
          data-auth-action="logout"
        >
          <LogOut className={currentSize.icon} />
          <span>{isLoading ? 'ログアウト中...' : 'ログアウト'}</span>
        </button>
      </div>

      {/* ドロップダウンメニュー */}
      {enableUserMenu && showUserMenu && (
        <>
          {/* 背景オーバーレイ */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeUserMenu}
          />
          
          {/* メニュー */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <div className="font-medium text-gray-800">{displayName}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              {isAdmin && (
                <div className="flex items-center space-x-1 mt-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">管理者権限</span>
                </div>
              )}
            </div>
            
            <div className="py-2">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  closeUserMenu()
                  // プロフィールページへの遷移などを実装
                }}
              >
                <User className="inline w-4 h-4 mr-2" />
                プロフィール
              </button>
              
              {isAdmin && showAdminLink && (
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    closeUserMenu()
                    // 管理者ページへの遷移を実装
                  }}
                >
                  <Crown className="inline w-4 h-4 mr-2" />
                  管理者パネル
                </button>
              )}
              
              <hr className="my-2" />
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  closeUserMenu()
                  handleLogout()
                }}
              >
                <LogOut className="inline w-4 h-4 mr-2" />
                ログアウト
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AuthButton 