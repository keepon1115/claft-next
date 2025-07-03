'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { PageLoadingFallback, TableLoadingFallback, CardLoadingFallback, logChunkInfo } from '@/components/common/DynamicLoader'

// ==========================================
// 管理画面コンポーネントの型定義
// ==========================================

interface AdminDashboardProps {
  user: any
  adminInfo: any
  initialStats: any
}

// ==========================================
// 管理画面の動的インポート
// ==========================================

const AdminDashboardComponent = dynamic(
  () => import('@/app/admin/AdminDashboard').then((mod) => {
    logChunkInfo('AdminDashboard')
    return { default: mod.default }
  }),
  {
    loading: () => <AdminDashboardLoadingFallback />,
    ssr: false
  }
)

// ==========================================
// 管理画面専用ローディング
// ==========================================

const AdminDashboardLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* ヘッダー部分 */}
    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
      <div className="max-width-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-48"></div>
        </div>
      </div>
    </div>

    {/* メインコンテンツ */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* メインセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 承認待ちセクション */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <TableLoadingFallback rows={3} cols={3} />
          </div>
        </div>

        {/* 承認履歴セクション */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <CardLoadingFallback count={3} />
          </div>
        </div>
      </div>

      {/* ユーザー管理セクション */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <TableLoadingFallback rows={5} cols={5} />
        </div>
      </div>
    </div>
  </div>
)

// ==========================================
// 権限確認付き管理画面
// ==========================================

export const DynamicAdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return <AdminDashboardComponent {...props} />
}

// ==========================================
// 管理画面の分割読み込み
// ==========================================

// 統計セクション - 一時的に無効化
const DynamicStatsSection = dynamic(
  () => Promise.resolve({ default: () => <div className="text-gray-500">統計セクションは準備中です</div> }),
  {
    loading: () => <CardLoadingFallback count={4} />,
    ssr: false
  }
)

// 承認セクション - 一時的に無効化
const DynamicApprovalSection = dynamic(
  () => Promise.resolve({ default: () => <div className="text-gray-500">承認セクションは準備中です</div> }),
  {
    loading: () => <TableLoadingFallback rows={5} cols={4} />,
    ssr: false
  }
)

// ユーザー管理セクション - 一時的に無効化
const DynamicUserManagementSection = dynamic(
  () => Promise.resolve({ default: () => <div className="text-gray-500">ユーザー管理セクションは準備中です</div> }),
  {
    loading: () => <TableLoadingFallback rows={10} cols={6} />,
    ssr: false
  }
)

// ==========================================
// セクション分割版管理画面
// ==========================================

interface ModularAdminDashboardProps extends AdminDashboardProps {
  enableLazyLoading?: boolean
}

export const ModularAdminDashboard: React.FC<ModularAdminDashboardProps> = ({
  enableLazyLoading = true,
  ...props
}) => {
  const [visibleSections, setVisibleSections] = React.useState({
    stats: true,
    approval: !enableLazyLoading,
    userManagement: !enableLazyLoading
  })

  React.useEffect(() => {
    if (enableLazyLoading) {
      // スクロール位置に基づいて遅延読み込み
      const timer = setTimeout(() => {
        setVisibleSections(prev => ({
          ...prev,
          approval: true
        }))
      }, 1000)

      const timer2 = setTimeout(() => {
        setVisibleSections(prev => ({
          ...prev,
          userManagement: true
        }))
      }, 2000)

      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
      }
    }
  }, [enableLazyLoading])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🛡️ 管理画面</h1>
          <p className="text-purple-100 mt-2">CLAFTプラットフォーム管理</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 統計セクション - 常に表示 */}
        {visibleSections.stats && (
          <section>
            <h2 className="text-2xl font-bold mb-6">📊 統計情報</h2>
            <DynamicStatsSection />
          </section>
        )}

        {/* 承認セクション - 遅延読み込み */}
        {visibleSections.approval && (
          <section>
            <h2 className="text-2xl font-bold mb-6">⏳ 承認管理</h2>
            <DynamicApprovalSection />
          </section>
        )}

        {/* ユーザー管理セクション - さらに遅延読み込み */}
        {visibleSections.userManagement && (
          <section>
            <h2 className="text-2xl font-bold mb-6">👥 ユーザー管理</h2>
            <DynamicUserManagementSection />
          </section>
        )}

        {/* セクション読み込みボタン */}
        {enableLazyLoading && (
          <div className="text-center space-x-4">
            {!visibleSections.approval && (
              <button
                onClick={() => setVisibleSections(prev => ({ ...prev, approval: true }))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                承認管理セクションを読み込む
              </button>
            )}
            {!visibleSections.userManagement && (
              <button
                onClick={() => setVisibleSections(prev => ({ ...prev, userManagement: true }))}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ユーザー管理セクションを読み込む
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 権限チェック用HOC
// ==========================================

export const withAdminAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function AdminProtectedComponent(props: any) {
    const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null)

    React.useEffect(() => {
      // 権限チェック（ここでは props.adminInfo があることで確認）
      const checkAuth = async () => {
        try {
          if (props.adminInfo && props.adminInfo.is_active) {
            setIsAuthorized(true)
          } else {
            setIsAuthorized(false)
          }
        } catch (error) {
          console.error('権限チェックエラー:', error)
          setIsAuthorized(false)
        }
      }

      checkAuth()
    }, [props.adminInfo])

    if (isAuthorized === null) {
      return <PageLoadingFallback title="権限を確認中..." />
    }

    if (!isAuthorized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
            <p className="text-gray-600 mb-4">このページにアクセスする権限がありません。</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

export default DynamicAdminDashboard 