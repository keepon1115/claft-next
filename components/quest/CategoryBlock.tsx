'use client'

import React, { useState, useCallback } from 'react'
import { Lock } from 'lucide-react'
import OptimizedImage from '@/components/common/OptimizedImage'
import {
  CategoryBlockProps,
  CategoryLesson,
  CategoryLessonKind,
  getLessonThumbnail,
  getInstructorThumbnail,
} from '@/types/category'
import { useAuth } from '@/hooks/useAuth'

/* ============= PrimaryTile（①） ============= */
interface PrimaryTileProps {
  lesson: CategoryLesson
  isUnlocked: boolean
  onClick: () => void
}
const PrimaryTile: React.FC<PrimaryTileProps> = ({ lesson, isUnlocked, onClick }) => {
  const [imageError, setImageError] = useState(false)
  const thumbnail = getLessonThumbnail(lesson)
  return (
    <button
      className={`tile tile--primary ${!isUnlocked ? 'tile--locked' : ''}`}
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      aria-label={`${lesson.title}${!isUnlocked ? '（ロック中）' : ''}`}
    >
      <div className="tile__media">
        {!imageError ? (
          <OptimizedImage
            src={thumbnail.url}
            alt={thumbnail.alt}
            width={400}
            height={225}
            className="tile__img"
            onError={() => setImageError(true)}
            fallbackSrc="/images/quest/default-thumbnail.png"
          />
        ) : (
          <div className="tile__img tile__img--fallback"><span className="text-4xl">📚</span></div>
        )}
        {!isUnlocked && (
          <div className="tile__lock-overlay">
            <Lock className="tile__lock-icon" size={32} />
            <span className="tile__lock-text">ロック中</span>
          </div>
        )}
      </div>

    </button>
  )
}

/* ============= InstructorTile（講師紹介） ============= */
interface InstructorTileProps {
  categoryTitle: string
  instructor?: any
  isUnlocked: boolean
  onClick: () => void
}
const InstructorTile: React.FC<InstructorTileProps> = ({
  categoryTitle,
  instructor,
  isUnlocked,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false)
  const thumbnail = instructor
    ? getInstructorThumbnail(instructor)
    : { url: '/images/instructor/default-instructor.png', alt: `${categoryTitle} 講師紹介` }

  return (
    <button
      className={`tile tile--instructor ${!isUnlocked ? 'tile--locked' : ''}`}
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      aria-label={`${instructor?.name || '講師'}紹介${!isUnlocked ? '（ロック中）' : ''}`}
    >
      <div className="tile__media">
        {!imageError ? (
          <OptimizedImage
            src={thumbnail.url}
            alt={thumbnail.alt}
            width={300}
            height={169}
            className="tile__img"
            onError={() => setImageError(true)}
            fallbackSrc="/images/instructor/default-instructor.png"
          />
        ) : (
          <div className="tile__img tile__img--fallback"><span className="text-3xl">👨‍🏫</span></div>
        )}
        {!isUnlocked && (
          <div className="tile__lock-overlay">
            <Lock className="tile__lock-icon" size={24} />
          </div>
        )}
      </div>
    </button>
  )
}

/* ============= LessonTile（②③：プレースホルダ対応） ============= */
interface LessonTileProps {
  order: 2 | 3
  lesson?: CategoryLesson | null
  isUnlocked: boolean
  onClick?: () => void
}
const LessonTile: React.FC<LessonTileProps> = ({ order, lesson, isUnlocked, onClick }) => {
  const [imageError, setImageError] = useState(false)
  const locked = !isUnlocked || !lesson

  return (
    <button
      className={`tile tile--lesson ${locked ? 'tile--locked' : ''}`}
      disabled={locked}
      onClick={locked ? undefined : onClick}
      aria-label={locked ? 'メインクエスト6をクリアすると開放' : `レッスン${order}`}
      title={locked ? 'メインクエスト6をクリアすると開放' : ''}
    >
      {locked ? (
        <div className="lesson-lock-content">
          <span className="lesson-lock-icon">🔒</span>
          メインクエスト6をクリアすると開放
        </div>
      ) : (
        <>
          <div className="tile__badge tile__badge--small"><span className="badge__number">{order}</span></div>
          <div className="tile__media">
            {!imageError ? (
              <OptimizedImage
                src={getLessonThumbnail(lesson).url}
                alt={getLessonThumbnail(lesson).alt}
                width={300}
                height={169}
                className="tile__img"
                onError={() => setImageError(true)}
                fallbackSrc="/images/quest/default-thumbnail.png"
              />
            ) : (
              <div className="tile__img tile__img--fallback"><span className="text-2xl">📚</span></div>
            )}
          </div>
        </>
      )}
    </button>
  )
}

/* ============= EtcTile（…etc） ============= */
interface EtcTileProps { onClick: () => void }
const EtcTile: React.FC<EtcTileProps> = ({ onClick }) => (
  <button className="tile tile--etc" onClick={onClick} aria-label="その他のレッスンを見る">
    <div className="tile__image tile__image--etc"><span className="etc__dots">…</span></div>
  </button>
)

/* ============= CategoryBlock ============= */
const CategoryBlock: React.FC<CategoryBlockProps> = ({
  category,
  userMainQuestProgress,
  userCategoryProgress,
  onOpenModal,
  className = '',
}) => {
  const { isAuthenticated } = useAuth()

  const theme = (() => {
    switch (category.id) {
      case 'money-economics':
        return { borderColor: '#fbbf24', accentColor: '#f59e0b', shadowColor: 'rgba(251,191,36,.3)' }
      case 'presentation-communication':
        return { borderColor: '#ef4444', accentColor: '#dc2626', shadowColor: 'rgba(239,68,68,.3)' }
      case 'ai-it-skills':
        return { borderColor: '#3b82f6', accentColor: '#2563eb', shadowColor: 'rgba(59,130,246,.3)' }
      case 'sdgs-environment':
        return { borderColor: '#10b981', accentColor: '#059669', shadowColor: 'rgba(16,185,129,.3)' }
      default:
        return { borderColor: '#6b7280', accentColor: '#4b5563', shadowColor: 'rgba(107,114,128,.3)' }
    }
  })()

  const isCategoryUnlocked = userMainQuestProgress >= category.unlock_required_stage

  const primaryLesson = category.lessons.find(l => l.kind === CategoryLessonKind.PRIMARY) || null
  const regularLessons = category.lessons
    .filter(l => l.kind === CategoryLessonKind.LESSON)
    .sort((a, b) => a.order - b.order)

  // ①/講師：ログインユーザーなら可（未ログインはログイン誘導）
  const isPrimaryAccessible = true

  // ②③：ログインかつメイン6クリアで解放
  const areSecondaryLessonsUnlocked = isAuthenticated && userMainQuestProgress >= 6

  const handleOpenPrimaryModal = useCallback(() => {
    if (!primaryLesson) return
    if (!isAuthenticated) {
      onOpenModal({ type: 'login_prompt', category, lesson: primaryLesson } as any)
      return
    }
    onOpenModal({ type: 'primary', category, lesson: primaryLesson })
  }, [primaryLesson, isAuthenticated, onOpenModal, category])

  const handleOpenInstructorModal = useCallback(() => {
    if (!isAuthenticated) {
      onOpenModal({ type: 'login_prompt', category, instructor: category.instructor } as any)
      return
    }
    onOpenModal({ type: 'instructor', category, instructor: category.instructor })
  }, [isAuthenticated, onOpenModal, category])

  const handleOpenLessonModal = useCallback(
    (lesson: CategoryLesson) => {
      if (!areSecondaryLessonsUnlocked) return
      if (!isAuthenticated) {
        onOpenModal({ type: 'login_prompt', category, lesson } as any)
        return
      }
      onOpenModal({ type: 'lesson', category, lesson })
    },
    [areSecondaryLessonsUnlocked, isAuthenticated, onOpenModal, category]
  )

  if (!isCategoryUnlocked) {
    return (
      <div className={`category-block category-block--locked ${className}`}>
        <h3 className="category-title">{category.emoji} {category.title}</h3>
        <div className="category-grid">
          <div className="category-lock-message">
            <Lock className="lock-message__icon" size={48} />
            <p className="lock-message__text">
              このカテゴリはメインクエスト{category.unlock_required_stage}をクリアすると開放されます
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---- ここがポイント：下段スロットを [2,3] に固定 ----
  const getByOrder = (n: 2 | 3) => regularLessons.find(l => l.order === n) ?? null
  const bottomSlots: Array<{ order: 2 | 3; lesson: CategoryLesson | null }> = [
    { order: 2, lesson: getByOrder(2) },
    { order: 3, lesson: getByOrder(3) },
  ]

  return (
    <div
      className={`category-block ${className}`}
      style={
        {
          '--category-border-color': theme.borderColor,
          '--category-accent-color': theme.accentColor,
          '--category-shadow-color': theme.shadowColor,
        } as React.CSSProperties
      }
    >
      <h3 className="category-title">{category.emoji} {category.title}</h3>

      <div className="category-grid">
        {/* 上段：① + 講師紹介 */}
        <div className="category-grid--top">
          {primaryLesson && (
            <PrimaryTile lesson={primaryLesson} isUnlocked={isPrimaryAccessible} onClick={handleOpenPrimaryModal} />
          )}
          <InstructorTile
            categoryTitle={category.title}
            instructor={category.instructor}
            isUnlocked={isPrimaryAccessible}
            onClick={handleOpenInstructorModal}
          />
        </div>

        {/* 下段：② / ③ / …etc（常に3タイル） */}
        <div className="category-grid--bottom">
          {bottomSlots.map(({ order, lesson }) => (
            <LessonTile
              key={order}
              order={order}
              lesson={lesson}
              isUnlocked={areSecondaryLessonsUnlocked && !!lesson}
              onClick={lesson ? () => handleOpenLessonModal(lesson) : undefined}
            />
          ))}

          <EtcTile onClick={() => alert('Coming soon')} />
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .category-block{
          margin-bottom:32px; border:3px solid var(--category-border-color,#6b7280);
          border-radius:16px; padding:20px; background:rgba(255,255,255,.08);
          box-shadow:0 4px 12px var(--category-shadow-color,rgba(107,114,128,.3)); transition:.3s;
        }
        .category-block:hover{ transform:translateY(-2px); box-shadow:0 8px 20px var(--category-shadow-color,rgba(107,114,128,.4)); }
        .category-block--locked{ opacity:.7; }
        .category-title{ font-size:1.5rem; font-weight:700; color:var(--category-accent-color,#1f2937); margin-bottom:16px; text-align:center; text-shadow:0 1px 2px rgba(0,0,0,.1); }
        .category-grid{ display:grid; gap:16px; }
        .category-grid--top{ display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:stretch; }
        .category-grid--bottom{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:12px; }

        /* tiles */
        .category-block :global(.tile){ position:relative; border-radius:12px; overflow:hidden; border:none; background:white; cursor:pointer; transition:.3s; box-shadow:0 2px 8px rgba(0,0,0,.1); width:100%; display:block; }
        .category-block :global(.tile:hover:not(.tile--locked)){ transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.15); }
        .category-block :global(.tile--locked){ background:#d1d5db; display:flex; align-items:center; justify-content:center; min-height:140px; cursor:not-allowed; }
        .category-block :global(.tile__media){ position:relative; padding-top:56.25%; }
        .category-block :global(.tile__img){ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
        .category-block :global(.tile__badge){ position:absolute; top:8px; left:8px; background:rgba(0,0,0,.6); color:#fff; font-weight:700; font-size:12px; padding:4px 6px; border-radius:8px; }
        .category-block :global(.tile__badge--small){ font-size:11px; padding:3px 5px; }
        .category-block :global(.lesson-lock-content){ text-align:center; color:#111; font-weight:600; line-height:1.4; }
        .category-block :global(.lesson-lock-icon){ font-size:20px; display:block; margin-bottom:6px; }
        .category-block :global(.tile--etc){ border:2px dashed rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; font-weight:700; color:#444; min-height:140px; }

        /* 余計なタイトルを出さない */
        .category-block :global(.tile-title){ display:none !important; }

        /* ロックメッセージ */
        .category-lock-message{ grid-column:1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 24px; background:#f9fafb; border:2px dashed #d1d5db; border-radius:12px; text-align:center; }
        .lock-message__icon{ color:#6b7280; margin-bottom:16px; }
        .lock-message__text{ color:#4b5563; font-size:1rem; line-height:1.5; margin:0; }

        @media (max-width:768px){
          .category-grid--top{ grid-template-columns:1fr; }
          .category-grid--bottom{ grid-template-columns:repeat(2,1fr); }
          .category-title{ font-size:1.25rem; }
        }
        @media (max-width:480px){
          .category-grid--bottom{ grid-template-columns:1fr; }
          .category-block :global(.tile__badge){ width:32px; height:32px; font-size:.875rem; }
        }
      `}</style>
    </div>
  )
}

export default CategoryBlock
