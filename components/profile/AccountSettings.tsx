'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// =====================================================
// バリデーションスキーマ
// =====================================================

const emailUpdateSchema = z.object({
  newEmail: z
    .string()
    .min(1, '新しいメールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
})

const passwordUpdateSchema = z.object({
  newPassword: z
    .string()
    .min(1, '新しいパスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(128, 'パスワードは128文字以下で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワードの確認を入力してください')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>
type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>

// =====================================================
// コンポーネントの型定義
// =====================================================

interface AccountSettingsProps {
  /** 追加のスタイルクラス */
  className?: string
}

// =====================================================
// AccountSettingsコンポーネント
// =====================================================

/**
 * アカウント設定コンポーネント
 * メールアドレス確認・変更、パスワード変更機能を提供
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   return (
 *     <div>
 *       <h1>プロフィール</h1>
 *       <AccountSettings />
 *     </div>
 *   )
 * }
 * ```
 */
export const AccountSettings: React.FC<AccountSettingsProps> = ({
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<'email' | 'password'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastUpdateResult, setLastUpdateResult] = useState<{
    type: 'email' | 'password'
    success: boolean
    message: string
  } | null>(null)
  
  const { user, updateEmail, updatePassword, error, clearError } = useAuth()

  // メールアドレス更新フォーム
  const emailForm = useForm<EmailUpdateFormData>({
    resolver: zodResolver(emailUpdateSchema),
    mode: 'onChange'
  })

  // パスワード更新フォーム
  const passwordForm = useForm<PasswordUpdateFormData>({
    resolver: zodResolver(passwordUpdateSchema),
    mode: 'onChange'
  })

  // メールアドレス更新処理
  const handleEmailUpdate = async (data: EmailUpdateFormData) => {
    setIsSubmitting(true)
    clearError()
    setLastUpdateResult(null)

    try {
      console.log('🔧 メールアドレス更新開始:', { newEmail: data.newEmail, timestamp: new Date().toISOString() })
      
      const result = await updateEmail(data.newEmail)
      
      console.log('🔧 メールアドレス更新結果:', { success: result.success, error: result.error })
      
      if (result.success) {
        console.log('✅ メールアドレス更新成功')
        setLastUpdateResult({
          type: 'email',
          success: true,
          message: '確認メールを送信しました。新しいメールアドレスをご確認ください。'
        })
        emailForm.reset()
      } else {
        console.error('❌ メールアドレス更新失敗:', result.error)
        setLastUpdateResult({
          type: 'email',
          success: false,
          message: result.error || 'メールアドレスの更新に失敗しました'
        })
      }
    } catch (err) {
      console.error('❌ メールアドレス更新例外:', err)
      setLastUpdateResult({
        type: 'email',
        success: false,
        message: 'メールアドレスの更新中にエラーが発生しました'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // パスワード更新処理
  const handlePasswordUpdate = async (data: PasswordUpdateFormData) => {
    setIsSubmitting(true)
    clearError()
    setLastUpdateResult(null)

    try {
      console.log('🔧 パスワード更新開始:', { timestamp: new Date().toISOString() })
      
      const result = await updatePassword(data.newPassword)
      
      console.log('🔧 パスワード更新結果:', { success: result.success, error: result.error })
      
      if (result.success) {
        console.log('✅ パスワード更新成功')
        setLastUpdateResult({
          type: 'password',
          success: true,
          message: 'パスワードを正常に更新しました。'
        })
        passwordForm.reset()
        setShowPassword(false)
        setShowConfirmPassword(false)
      } else {
        console.error('❌ パスワード更新失敗:', result.error)
        setLastUpdateResult({
          type: 'password',
          success: false,
          message: result.error || 'パスワードの更新に失敗しました'
        })
      }
    } catch (err) {
      console.error('❌ パスワード更新例外:', err)
      setLastUpdateResult({
        type: 'password',
        success: false,
        message: 'パスワードの更新中にエラーが発生しました'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // メール確認状態の判定
  const isEmailVerified = user?.email_confirmed_at !== null
  const currentEmail = user?.email || ''

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          アカウント設定
        </h2>
        <p className="text-gray-600">
          メールアドレスとパスワードの管理
        </p>
      </div>

      {/* セクション切り替えタブ */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'email'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Mail className="w-4 h-4 inline-block mr-2" />
          メールアドレス
        </button>
        <button
          onClick={() => setActiveSection('password')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'password'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Shield className="w-4 h-4 inline-block mr-2" />
          パスワード
        </button>
      </div>

      {/* 共通エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* 成功・エラーメッセージ */}
      {lastUpdateResult && (
        <div className={`mb-4 p-3 border rounded-lg text-sm flex items-center gap-2 ${
          lastUpdateResult.success 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {lastUpdateResult.success 
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />
          }
          {lastUpdateResult.message}
        </div>
      )}

      {/* メールアドレス設定 */}
      {activeSection === 'email' && (
        <div className="space-y-6">
          {/* 現在のメールアドレス */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              現在のメールアドレス
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-gray-900 font-medium">{currentEmail}</div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isEmailVerified 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isEmailVerified 
                    ? <CheckCircle className="w-3 h-3" />
                    : <AlertCircle className="w-3 h-3" />
                  }
                  {isEmailVerified ? '確認済み' : '未確認'}
                </div>
              </div>
            </div>
            {!isEmailVerified && (
              <p className="mt-2 text-sm text-yellow-700">
                ⚠️ メールアドレスが確認されていません。確認メールをご確認ください。
              </p>
            )}
          </div>

          {/* メールアドレス変更フォーム */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              メールアドレスを変更
            </h3>
            <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4">
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいメールアドレス
                </label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="new-email@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    emailForm.formState.errors.newEmail 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  {...emailForm.register('newEmail')}
                />
                {emailForm.formState.errors.newEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {emailForm.formState.errors.newEmail.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 メールアドレスを変更すると、新しいメールアドレス宛に確認メールが送信されます。
                  メール内のリンクをクリックして変更を完了してください。
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !emailForm.formState.isValid}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </span>
                ) : (
                  '📧 メールアドレスを更新'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* パスワード設定 */}
      {activeSection === 'password' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              パスワードを変更
            </h3>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
              {/* 新しいパスワード */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6文字以上の新しいパスワード"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      passwordForm.formState.errors.newPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    {...passwordForm.register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* パスワード確認 */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワードの確認
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="新しいパスワードをもう一度入力"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      passwordForm.formState.errors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    {...passwordForm.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 パスワードは6文字以上で設定してください。
                  大文字・小文字・数字・記号を組み合わせると、より安全です。
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passwordForm.formState.isValid}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </span>
                ) : (
                  '🔒 パスワードを更新'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountSettings
