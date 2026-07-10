import { z } from 'zod'
import type { Database } from './database'

// =====================================================
// DB行型
// =====================================================

export type RoboTheme = Database['public']['Tables']['robo_themes']['Row']
export type RoboThemeInsert = Database['public']['Tables']['robo_themes']['Insert']
export type RoboThemeUpdate = Database['public']['Tables']['robo_themes']['Update']

export type RoboQuestion = Database['public']['Tables']['robo_questions']['Row']
export type RoboQuestionInsert = Database['public']['Tables']['robo_questions']['Insert']
export type RoboQuestionUpdate = Database['public']['Tables']['robo_questions']['Update']

export type RoboQuizAnswer = Database['public']['Tables']['robo_quiz_answers']['Row']
export type RoboOpenAnswer = Database['public']['Tables']['robo_open_answers']['Row']
export type RoboFeedback = Database['public']['Tables']['robo_feedbacks']['Row']
export type RoboThemeClear = Database['public']['Tables']['robo_theme_clears']['Row']

// =====================================================
// 生徒向け画面用の合成型
// =====================================================

export interface RoboThemeWithQuestions extends RoboTheme {
  robo_questions: RoboQuestion[]
}

export type RoboThemeStatus = 'locked' | 'available' | 'completed'

export interface RoboThemeProgress extends RoboTheme {
  status: RoboThemeStatus
}

export interface RoboWallEntry {
  id: string
  user_id: string
  body: string
  created_at: string
  nickname: string
}

// =====================================================
// 管理画面フォーム用 Zod スキーマ
// =====================================================

export const roboThemeFormSchema = z.object({
  level: z.coerce.number().int().min(1, 'レベルは1以上で入力してください'),
  theme_number: z.coerce.number().int().min(1, 'テーマ番号は1以上で入力してください'),
  title: z.string().min(1, 'タイトルは必須です'),
  question_prompt: z.string().min(1, '問いの本文は必須です'),
  case_study_md: z.string().default(''),
  is_published: z.boolean().default(false),
  display_order: z.coerce.number().int().default(0),
  icon_url: z.string().nullable().default(null),
  icon_emoji: z.string().default('🤖'),
  question_image_url: z.string().nullable().default(null),
  case_image_url: z.string().nullable().default(null),
})

export type RoboThemeFormValues = z.infer<typeof roboThemeFormSchema>

export const roboQuestionFormSchema = z.object({
  body: z.string().min(1, '設問本文は必須です'),
  choice_1: z.string().min(1, '選択肢1は必須です'),
  choice_2: z.string().min(1, '選択肢2は必須です'),
  choice_3: z.string().min(1, '選択肢3は必須です'),
  correct_index: z.coerce.number().int().min(0).max(2),
  explanation: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  video_url: z.string().nullable().default(null),
  reference_note: z.string().nullable().default(null),
  display_order: z.coerce.number().int().default(0),
})

export type RoboQuestionFormValues = z.infer<typeof roboQuestionFormSchema>

// =====================================================
// CSVインポート用の型
// =====================================================

export interface RoboThemeCsvRow {
  level: number
  theme_number: number
  title: string
  question_prompt: string
  question_image_url: string | null
  case_study_md: string
  case_image_url: string | null
  icon_url: string | null
  icon_emoji: string
  is_published: boolean
  display_order: number
}

export interface RoboQuestionCsvRow {
  themeKey: string // "1-1" 形式
  display_order: number
  body: string
  choice_1: string
  choice_2: string
  choice_3: string
  correct_index: number
  explanation: string | null
  image_url: string | null
  video_url: string | null
  reference_note: string | null
}

export type CsvImportRowAction = 'insert' | 'update'

export interface CsvImportPreviewRow<T> {
  rowNumber: number // 1始まり（ヘッダー除く）
  action: CsvImportRowAction
  data: T
  errors: string[]
}

export interface CsvImportPreview<T> {
  rows: CsvImportPreviewRow<T>[]
  hasErrors: boolean
}
