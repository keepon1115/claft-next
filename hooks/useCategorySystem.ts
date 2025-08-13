'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  CategoryModalOptions,
  CategoryWithLessons,
  UserCategoryProgress,
  Category,
  CategoryLesson,
  CategoryLessonKind,
  InstructorInfo
} from '@/types/category'

// =====================================================
// カテゴリシステム管理フック
// =====================================================

interface UseCategorySystemProps {
  /** ユーザーのメインクエスト進行状況 */
  userMainQuestProgress: number
  /** 認証状態 */
  isAuthenticated: boolean
}

interface UseCategorySystemReturn {
  /** モーダル状態 */
  modalOptions: CategoryModalOptions | null
  isModalOpen: boolean
  
  /** モーダル操作 */
  openModal: (options: CategoryModalOptions) => void
  closeModal: () => void
  
  /** カテゴリデータ生成（デモ用） */
  generateDemoCategories: () => CategoryWithLessons[]
  
  /** ユーザー進行状況生成（デモ用） */
  generateDemoProgress: () => UserCategoryProgress[]
}

export const useCategorySystem = ({
  userMainQuestProgress,
  isAuthenticated
}: UseCategorySystemProps): UseCategorySystemReturn => {
  
  // モーダル状態
  const [modalOptions, setModalOptions] = useState<CategoryModalOptions | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // モーダル操作
  const openModal = useCallback((options: CategoryModalOptions) => {
    setModalOptions(options)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setModalOptions(null)
  }, [])

  // デモカテゴリデータ生成
  const generateDemoCategories = useCallback((): CategoryWithLessons[] => {
    const baseDate = new Date().toISOString()
    
    return [
      {
        id: 'money-economics',
        slug: 'money-economics',
        title: 'おかね・経済',
        emoji: '💰',
        description: 'お金の機能や役割について考えてみましょう',
        unlock_required_stage: 1, // カテゴリ自体は常に表示
        display_order: 1,
        created_at: baseDate,
        updated_at: baseDate,
        lessons: [
          {
            id: 'money-primary',
            category_id: 'money-economics',
            order: 1,
            title: 'お金ってなんだろう？',
            kind: CategoryLessonKind.PRIMARY,
            youtube_id: 'EBudngoyo2M', // おかね・経済の動画
            form_url: 'https://forms.gle/jtRSPrCyCro3Sp5e9', // おかね・経済のクエストフォーム
            description: 'お金の機能や役割について考えてみましょう',
            unlock_required_stage: 1, // ①は常にアクセス可
            created_at: baseDate,
            updated_at: baseDate
          },
          {
            id: 'money-lesson-2',
            category_id: 'money-economics',
            order: 2,
            title: '貯金の重要性',
            kind: CategoryLessonKind.LESSON,
            youtube_id: 'dQw4w9WgXcQ',
            description: '貯金の大切さを学びます',
            unlock_required_stage: 6,
            created_at: baseDate,
            updated_at: baseDate
          },

        ],
        instructor: {
          id: 'money-instructor',
          name: '田中 経済',
          profile: '経済学博士。20年以上の金融業界経験を持ち、お金の教育に情熱を注いでいます。\n\n「お金は人生の道具です。正しく使えば、夢を実現する力になります。」',
          photo_url: '/images/instructor/tanaka-keizai.jpg',
          intro_video_youtube_id: '2z9I_Y7fmyE', // 講師紹介動画
          created_at: baseDate,
          updated_at: baseDate
        }
      },
      {
        id: 'presentation-communication',
        slug: 'presentation-communication',
        title: 'プレゼン・発表',
        emoji: '🎤',
        description: 'コミュニケーションについて考えてみましょう',
        unlock_required_stage: 1,
        display_order: 2,
        created_at: baseDate,
        updated_at: baseDate,
        lessons: [
          {
            id: 'presentation-primary',
            category_id: 'presentation-communication',
            order: 1,
            title: '準備中です',
            kind: CategoryLessonKind.PRIMARY,
            youtube_id: '2z9I_Y7fmyE', // プレゼン・コミュニケーションの動画
            description: '準備中です',
            unlock_required_stage: 1,
            created_at: baseDate,
            updated_at: baseDate
          },
          {
            id: 'presentation-lesson-2',
            category_id: 'presentation-communication',
            order: 2,
            title: 'プレゼン資料の作り方',
            kind: CategoryLessonKind.LESSON,
            youtube_id: 'dQw4w9WgXcQ',
            description: '効果的な資料作成方法を学びます',
            unlock_required_stage: 6,
            created_at: baseDate,
            updated_at: baseDate
          },
        ],
        instructor: {
          id: 'presentation-instructor',
          name: '佐藤 コミュ',
          profile: 'コミュニケーション専門家。企業研修講師として1000回以上の講演実績があります。\n\n「伝える力は誰でも身につけられます。一緒に成長していきましょう！」',
          photo_url: '/images/instructor/sato-komyu.jpg',
          intro_video_youtube_id: '2z9I_Y7fmyE', // 講師紹介動画
          created_at: baseDate,
          updated_at: baseDate
        }
      },
      {
        id: 'ai-it-skills',
        slug: 'ai-it-skills',
        title: 'AI・ITスキル',
        emoji: '🤖',
        description: 'アイデアを形にするためにAIを使いましょう',
        unlock_required_stage: 1,
        display_order: 3,
        created_at: baseDate,
        updated_at: baseDate,
        lessons: [
          {
            id: 'ai-it-primary',
            category_id: 'ai-it-skills',
            order: 1,
            title: 'AIといっしょに描こう!',
            kind: CategoryLessonKind.PRIMARY,
            youtube_id: 'QCPWmaj-vGQ', // AI・ITスキルの動画
            form_url: 'https://forms.gle/7Ko8UUYX7BWAgLxg7', // AI・ITスキルのクエストフォーム
            description: 'アイデアを形にするためにAIを使いましょう',
            unlock_required_stage: 1,
            created_at: baseDate,
            updated_at: baseDate
          },
          {
            id: 'ai-it-lesson-2',
            category_id: 'ai-it-skills',
            order: 2,
            title: 'プログラミング入門',
            kind: CategoryLessonKind.LESSON,
            youtube_id: 'dQw4w9WgXcQ',
            description: 'プログラミングの基礎を学びます',
            unlock_required_stage: 6,
            created_at: baseDate,
            updated_at: baseDate
          },
        ],
        instructor: {
          id: 'ai-it-instructor',
          name: '高橋 AI',
          profile: 'AI研究者・エンジニア。最新のAI技術を分かりやすく教えることが得意です。\n\n「AIは怖いものではありません。正しく理解して、上手に活用していきましょう。」',
          photo_url: '/images/instructor/takahashi-ai.jpg',
          intro_video_youtube_id: '2z9I_Y7fmyE', // 講師紹介動画
          created_at: baseDate,
          updated_at: baseDate
        }
      },
      {
        id: 'sdgs-environment',
        slug: 'sdgs-environment',
        title: 'SDGs・環境',
        emoji: '🌍',
        description: 'SDGsについて学び、持続可能な社会について考えましょう',
        unlock_required_stage: 1,
        display_order: 4,
        created_at: baseDate,
        updated_at: baseDate,
        lessons: [
          {
            id: 'sdgs-primary',
            category_id: 'sdgs-environment',
            order: 1,
            title: 'SDGsってなんだろう？',
            kind: CategoryLessonKind.PRIMARY,
            youtube_id: '2f180PMAK2Y', // SDGs・環境の動画
            description: 'SDGsとは何か、まずは知りましょう',
            unlock_required_stage: 1,
            created_at: baseDate,
            updated_at: baseDate
          },
          {
            id: 'sdgs-lesson-2',
            category_id: 'sdgs-environment',
            order: 2,
            title: '気候変動問題',
            kind: CategoryLessonKind.LESSON,
            youtube_id: 'dQw4w9WgXcQ',
            description: '地球温暖化について学びます',
            unlock_required_stage: 6,
            created_at: baseDate,
            updated_at: baseDate
          },
        ],
        instructor: {
          id: 'sdgs-instructor',
          name: '山田 地球',
          profile: '環境学博士。国際的な環境プロジェクトに多数参加し、次世代への環境教育に力を入れています。\n\n「地球は私たちから借りているものです。未来に美しい地球を残しましょう。」',
          photo_url: '/images/instructor/yamada-chikyu.jpg',
          intro_video_youtube_id: '2z9I_Y7fmyE', // 講師紹介動画
          created_at: baseDate,
          updated_at: baseDate
        }
      }
    ]
  }, [])

  // デモ進行状況データ生成
  const generateDemoProgress = useCallback((): UserCategoryProgress[] => {
    const baseDate = new Date().toISOString()
    
    return [
      // 何も進行状況がない場合は空配列を返す
      // 実際の実装では、ユーザーの進行状況に応じてデータを生成
    ]
  }, [])

  return {
    modalOptions,
    isModalOpen,
    openModal,
    closeModal,
    generateDemoCategories,
    generateDemoProgress
  }
}
