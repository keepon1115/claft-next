// =====================================================
// カテゴリレッスン関連の型定義
// =====================================================

/**
 * カテゴリレッスンの種類
 */
export enum CategoryLessonKind {
  /** プライマリレッスン（①） */
  PRIMARY = 'primary',
  /** 講師紹介 */
  INSTRUCTOR = 'instructor', 
  /** 通常レッスン（②③④...） */
  LESSON = 'lesson'
}

/**
 * カテゴリの定義
 */
export interface Category {
  /** カテゴリID */
  id: string
  /** カテゴリスラッグ */
  slug: string
  /** カテゴリタイトル */
  title: string
  /** カテゴリの絵文字 */
  emoji: string
  /** 説明 */
  description?: string
  /** 解除に必要なステージ数（メインクエスト） */
  unlock_required_stage: number
  /** 表示順 */
  display_order: number
  /** 作成日時 */
  created_at: string
  /** 更新日時 */
  updated_at: string
}

/**
 * カテゴリレッスンの定義
 */
export interface CategoryLesson {
  /** レッスンID */
  id: string
  /** カテゴリID */
  category_id: string
  /** レッスン番号（並び順） */
  order: number
  /** レッスンタイトル */
  title: string
  /** レッスンの種類 */
  kind: CategoryLessonKind
  /** YouTube動画ID */
  youtube_id?: string
  /** カスタムサムネイルURL */
  thumbnail_url?: string
  /** 動画URL（YouTube以外の場合） */
  video_url?: string
  /** フォームURL */
  form_url?: string
  /** レッスン説明 */
  description?: string
  /** 解除に必要なステージ数 */
  unlock_required_stage: number
  /** 作成日時 */
  created_at: string
  /** 更新日時 */
  updated_at: string
}

/**
 * 講師情報
 */
export interface InstructorInfo {
  /** 講師ID */
  id: string
  /** 講師名 */
  name: string
  /** 講師プロフィール */
  profile: string
  /** 講師の写真URL */
  photo_url?: string
  /** 講師紹介動画のYouTube ID */
  intro_video_youtube_id?: string
  /** 講師紹介動画URL */
  intro_video_url?: string
  /** 作成日時 */
  created_at: string
  /** 更新日時 */
  updated_at: string
}

/**
 * カテゴリとレッスンを含む完全なデータ
 */
export interface CategoryWithLessons extends Category {
  /** カテゴリのレッスン一覧 */
  lessons: CategoryLesson[]
  /** 講師情報 */
  instructor?: InstructorInfo
}

/**
 * ユーザーのカテゴリレッスン進行状況
 */
export interface UserCategoryProgress {
  /** ユーザーID */
  user_id: string
  /** カテゴリID */
  category_id: string
  /** レッスンID */
  lesson_id: string
  /** 進行状況 */
  status: 'locked' | 'current' | 'completed' | 'pending_approval'
  /** 開始日時 */
  started_at?: string
  /** 完了日時 */
  completed_at?: string
  /** 送信日時 */
  submitted_at?: string
  /** 承認日時 */
  approved_at?: string
  /** 作成日時 */
  created_at: string
  /** 更新日時 */
  updated_at: string
}

/**
 * カテゴリモーダルのタイプ
 */
export type CategoryModalType = 'primary' | 'instructor' | 'lesson' | 'login_prompt'

/**
 * カテゴリモーダルの開きオプション
 */
export interface CategoryModalOptions {
  /** モーダルのタイプ */
  type: CategoryModalType
  /** カテゴリ情報 */
  category: Category
  /** レッスン情報（typeがlessonの場合必須） */
  lesson?: CategoryLesson
  /** 講師情報（typeがinstructorの場合必須） */
  instructor?: InstructorInfo
}

/**
 * カテゴリブロックのプロップス
 */
export interface CategoryBlockProps {
  /** カテゴリ情報（レッスン含む） */
  category: CategoryWithLessons
  /** ユーザーのメインクエスト進行状況 */
  userMainQuestProgress: number
  /** ユーザーのカテゴリ進行状況 */
  userCategoryProgress: UserCategoryProgress[]
  /** モーダルを開くコールバック */
  onOpenModal: (options: CategoryModalOptions) => void
  /** クラス名 */
  className?: string
}

/**
 * サムネイル取得用のヘルパー関数の戻り値
 */
export interface ThumbnailInfo {
  /** サムネイルURL */
  url: string
  /** 代替テキスト */
  alt: string
  /** アスペクト比（16:9を想定） */
  aspectRatio: string
}

// =====================================================
// 定数とヘルパー関数
// =====================================================

/**
 * YouTube サムネイル URL を生成
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * レッスンのサムネイル情報を取得
 */
export const getLessonThumbnail = (lesson: CategoryLesson): ThumbnailInfo => {
  const aspectRatio = '16 / 9'
  
  if (lesson.thumbnail_url) {
    return {
      url: lesson.thumbnail_url,
      alt: `${lesson.title} サムネイル`,
      aspectRatio
    }
  }
  
  if (lesson.youtube_id) {
    return {
      url: getYouTubeThumbnail(lesson.youtube_id),
      alt: `${lesson.title} YouTube サムネイル`,
      aspectRatio
    }
  }
  
  // フォールバック画像
  return {
    url: '/images/quest/default-thumbnail.png',
    alt: `${lesson.title} デフォルトサムネイル`,
    aspectRatio
  }
}

/**
 * カテゴリがアンロックされているかを判定
 */
export const isCategoryUnlocked = (category: Category, userMainQuestProgress: number): boolean => {
  return userMainQuestProgress >= category.unlock_required_stage
}

/**
 * レッスンがアンロックされているかを判定
 */
export const isLessonUnlocked = (lesson: CategoryLesson, userMainQuestProgress: number): boolean => {
  return userMainQuestProgress >= lesson.unlock_required_stage
}

/**
 * 講師紹介のサムネイル情報を取得
 */
export const getInstructorThumbnail = (instructor: InstructorInfo): ThumbnailInfo => {
  const aspectRatio = '16 / 9'
  
  if (instructor.intro_video_youtube_id) {
    return {
      url: getYouTubeThumbnail(instructor.intro_video_youtube_id),
      alt: `${instructor.name} 講師紹介動画`,
      aspectRatio
    }
  }
  
  if (instructor.photo_url) {
    return {
      url: instructor.photo_url,
      alt: `${instructor.name} 講師写真`,
      aspectRatio
    }
  }
  
  // フォールバック画像
  return {
    url: '/images/instructor/default-instructor.png',
    alt: `${instructor.name} デフォルト画像`,
    aspectRatio
  }
}
