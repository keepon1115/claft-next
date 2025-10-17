'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Video, Flame, MessageSquare, Play, User, Lock, LogIn } from 'lucide-react'
import { CategoryModalOptions, CategoryLesson, InstructorInfo } from '@/types/category'
import { useAuth } from '@/hooks/useAuth'
import OptimizedImage from '@/components/common/OptimizedImage'
import StepFlow, { StepDef } from '@/components/common/StepFlow'

/* ======================= LoginPrompt ======================= */

interface LoginPromptModalContentProps {
  categoryTitle: string
  lessonTitle?: string
  onLogin: () => void
}

const LoginPromptModalContent: React.FC<LoginPromptModalContentProps> = ({
  categoryTitle,
  lessonTitle,
  onLogin,
}) => {
  return (
    <div className="login-prompt-modal">
      <div className="text-center mb-8">
        <div className="login-icon-container mb-6">
          <Lock className="lock-icon" size={48} />
          <LogIn className="login-icon" size={32} />
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-4">ログインが必要です</h2>

        <p className="text-lg text-gray-600 leading-relaxed">
          {lessonTitle ? (
            <>
              「{categoryTitle}」の<br />
              「{lessonTitle}」を視聴するには<br />
              ログインが必要です
            </>
          ) : (
            <>
              「{categoryTitle}」の講師紹介を<br />
              視聴するにはログインが必要です
            </>
          )}
        </p>
      </div>

      <div className="benefits-section mb-8">
        <h3 className="benefits-title">ログインすると</h3>
        <ul className="benefits-list">
          <li className="benefit-item">
            <Video size={20} />
            <span>すべての学習動画が視聴できます</span>
          </li>
          <li className="benefit-item">
            <Flame size={20} />
            <span>クエストに挑戦して成長できます</span>
          </li>
          <li className="benefit-item">
            <MessageSquare size={20} />
            <span>講師からのメッセージが受け取れます</span>
          </li>
        </ul>
      </div>

      <div className="action-buttons">
        <button onClick={onLogin} className="login-button">
          <LogIn size={24} />
          ログインして始める
        </button>
      </div>

      <style jsx>{`
        .login-prompt-modal { width:100%; max-width:500px; margin:0 auto; }
        .login-icon-container { position:relative; display:flex; align-items:center; justify-content:center; }
        .lock-icon { color:#6b7280; }
        .login-icon { position:absolute; right:-10px; bottom:-5px; color:#3b82f6; background:#fff; border-radius:50%; padding:2px; }
        .benefits-section { background:#f8fafc; border:2px solid #e2e8f0; border-radius:12px; padding:24px; }
        .benefits-title { font-size:1.125rem; font-weight:700; color:#1f2937; margin-bottom:16px; text-align:center; }
        .benefits-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; }
        .benefit-item { display:flex; align-items:center; gap:12px; color:#4b5563; font-size:.875rem; }
        .benefit-item svg { color:#3b82f6; flex-shrink:0; }
        .action-buttons { display:flex; justify-content:center; }
        .login-button { display:flex; align-items:center; gap:8px; padding:16px 32px; background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%); color:#fff; border:none; border-radius:12px; font-size:1.125rem; font-weight:600; cursor:pointer; transition:.3s; box-shadow:0 4px 12px rgba(59,130,246,.3); }
        .login-button:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(59,130,246,.4); }
        .login-button:active { transform:translateY(0); }
        @media (max-width:768px){ .login-prompt-modal{ padding:0 16px; } .benefits-section{ padding:20px; } .login-button{ padding:14px 28px; font-size:1rem; } }
      `}</style>
    </div>
  )
}

/* ======================= Instructor ======================= */

interface InstructorModalContentProps {
  instructor: InstructorInfo
  categoryTitle: string
}

const InstructorModalContent: React.FC<InstructorModalContentProps> = ({ instructor, categoryTitle }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => setImageError(true)

  const handleVideoClick = () => {
    // CLAFTとは何かの動画（プレゼン・コミュニケーションと同じ動画）
    window.open('https://www.youtube.com/watch?v=2z9I_Y7fmyE', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="instructor-modal">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <User className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-black text-gray-800">講師紹介</h2>
        </div>
      </div>

      <div className="preparation-message mb-8">
        <div className="preparation-content">
          <p className="preparation-text">現在準備中です。<br />CLAFTとは何かの動画をご覧ください。</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button onClick={handleVideoClick} className="btn btn--primary">
          <Video size={24} />
          CLAFTとは何かの動画を見る
        </button>
      </div>

      <style jsx>{`
        .instructor-modal { width:100%; }
        .preparation-message { max-width:500px; margin:0 auto; text-align:center; }
        .preparation-content { background:#f9fafb; border:2px solid #e5e7eb; border-radius:12px; padding:32px 20px; }
        .preparation-text { color:#4b5563; line-height:1.6; margin:0; font-size:1.125rem; font-weight:500; }
        .btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 24px; border:none; border-radius:8px; font-weight:600; text-decoration:none; cursor:pointer; transition:.3s; }
        .btn--primary { background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%); color:#fff; box-shadow:0 4px 12px rgba(59,130,246,.3); }
        .btn--primary:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(59,130,246,.4); }
        @media (max-width:768px){ .preparation-content{ padding:24px 16px; } .preparation-text{ font-size:1rem; } }
      `}</style>
    </div>
  )
}

/* ======================= CategoryLesson ======================= */

interface CategoryLessonModalContentProps {
  lesson: CategoryLesson
  categoryTitle: string
  onCompleteLesson?: () => void
}

const CategoryLessonModalContent: React.FC<CategoryLessonModalContentProps> = ({
  lesson,
  categoryTitle,
  onCompleteLesson,
}) => {
  // StepFlow のステップを動的生成
  const videoUrl = lesson.video_url || (lesson.youtube_id ? `https://www.youtube.com/watch?v=${lesson.youtube_id}` : undefined)
  const steps: StepDef[] = [
    { id: 'video', type: 'video', title: `${categoryTitle} ${lesson.order}: ${lesson.title}`, linkUrl: videoUrl, ctaLabel: '動画を開く', doneLabel: '視聴完了' },
    ...(lesson.form_url ? [{ id: 'form', type: 'form', title: 'クエストに挑む', linkUrl: lesson.form_url, ctaLabel: 'フォームへ', doneLabel: '提出した' } as StepDef] : []),
    { id: 'complete', type: 'complete', title: 'ステージクリア', doneLabel: 'クリア！' }
  ]

  const unitKey = `categoryLesson:${lesson.id}`

  return (
    <div className="category-lesson-modal">
      <StepFlow unitKey={unitKey} steps={steps} />
    </div>
  )
}

/* ======================= Main Modal ======================= */

export function CategoryModal({ options, onClose, isOpen }: { options: CategoryModalOptions | null; onClose: () => void; isOpen: boolean }) {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // 常に定義されるコールバック（Hooks順序を固定）
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  // ✅ ログイン導線も「常に」定義（以前は早期returnの後で定義 → エラー原因）
  const handleLogin = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openAuthModal'))
    onClose()
  }, [onClose])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [isOpen, handleKeyDown])

  // 早期returnは「全フック定義の後」に配置
  if (!isOpen || !options || !mounted) return null

  const renderModalContent = () => {
    switch (options.type) {
      case 'login_prompt':
        return (
          <LoginPromptModalContent
            categoryTitle={options.category.title}
            lessonTitle={options.lesson?.title}
            onLogin={handleLogin}
          />
        )
      case 'instructor':
        return (
          <InstructorModalContent
            instructor={
              options.instructor || {
                id: 'default',
                name: '講師',
                profile: 'プロフィール情報が設定されていません。',
                created_at: '',
                updated_at: '',
              }
            }
            categoryTitle={options.category.title}
          />
        )
      case 'primary':
      case 'lesson':
        return (
          <CategoryLessonModalContent
            lesson={options.lesson!}
            categoryTitle={options.category.title}
            onCompleteLesson={() => alert('学習完了機能は準備中です')}
          />
        )
      default:
        return <div>Unknown modal type</div>
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]" onClick={handleBackdropClick}>
      <div className="bg-white border-4 border-gray-800 p-8 max-w-2xl w-full mx-4 relative rounded-lg max-h-[90vh] overflow-y-auto">
        <button className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white border-2 border-red-900 hover:bg-red-700 transition-colors rounded" onClick={onClose} aria-label="モーダルを閉じる">
          <X size={16} />
        </button>
        {renderModalContent()}
      </div>
    </div>,
    document.body
  )
}

export default CategoryModal
