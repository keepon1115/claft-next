import { z } from 'zod'

// =====================================================
// MonthlyReport content JSONB スキーマ
// 将来的に項目を増やす際はこのスキーマを拡張するだけでOK
// =====================================================

export const monthlyReportContentSchema = z.object({
  session1: z.object({
    date: z.string().default(''),
    description: z.string().default(''),
  }).default({ date: '', description: '' }),
  session2: z.object({
    date: z.string().default(''),
    description: z.string().default(''),
  }).default({ date: '', description: '' }),
  proficiency: z.string().default(''),
  notes: z.string().default(''),
})

export type MonthlyReportContent = z.infer<typeof monthlyReportContentSchema>

export const DEFAULT_REPORT_CONTENT: MonthlyReportContent = {
  session1: { date: '', description: '' },
  session2: { date: '', description: '' },
  proficiency: '',
  notes: '',
}

// =====================================================
// DB行型
// =====================================================

export interface Student {
  id: string
  name: string
  grade: string
  course: string
  schedule: string
  interests: string
  created_at: string
  updated_at: string
}

export interface MonthlyReport {
  id: string
  student_id: string
  month: string
  goal: string
  content: MonthlyReportContent
  created_at: string
  updated_at: string
}

export interface StudentWithReports extends Student {
  monthly_reports: MonthlyReport[]
}

// =====================================================
// Zodバリデーションスキーマ
// =====================================================

export const studentFormSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  grade: z.string().default(''),
  course: z.string().default(''),
  schedule: z.string().default(''),
  interests: z.string().default(''),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>

export const monthlyReportFormSchema = z.object({
  month: z.string().min(1, '月は必須です').regex(/^\d{4}-\d{2}$/, 'YYYY-MM形式で入力してください'),
  goal: z.string().default(''),
  content: monthlyReportContentSchema,
})

export type MonthlyReportFormValues = z.infer<typeof monthlyReportFormSchema>

// =====================================================
// フィルター / 検索
// =====================================================

export interface StudentFilter {
  search: string
  grade: string
  course: string
  schedule: string
}

export const GRADE_OPTIONS = [
  '小1', '小2', '小3', '小4', '小5', '小6',
  '中1', '中2', '中3',
  '高1', '高2', '高3',
] as const

export const COURSE_OPTIONS = [
  'プログラミング基礎',
  'ゲーム制作',
  'Webデザイン',
  'ロボティクス',
  'AI入門',
] as const

export const SCHEDULE_OPTIONS = [
  '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜',
] as const
