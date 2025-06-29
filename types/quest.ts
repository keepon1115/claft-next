import type { Database } from './database'

// =====================================================
// クエスト関連型定義
// =====================================================

/**
 * データベースから直接抽出される基本型
 */
export type QuestProgress = Database['public']['Tables']['quest_progress']['Row']
export type QuestProgressInsert = Database['public']['Tables']['quest_progress']['Insert']
export type QuestProgressUpdate = Database['public']['Tables']['quest_progress']['Update']

export type ClaftQuest = Database['public']['Tables']['claft-quest']['Row']
export type ClaftQuestInsert = Database['public']['Tables']['claft-quest']['Insert']
export type ClaftQuestUpdate = Database['public']['Tables']['claft-quest']['Update']

// =====================================================
// クエスト進行状況
// =====================================================

/**
 * クエスト進行ステータス
 */
export enum QuestStatus {
  /** 未開始 */
  NOT_STARTED = 'not_started',
  /** 進行中 */
  IN_PROGRESS = 'in_progress',
  /** 提出済み */
  SUBMITTED = 'submitted',
  /** 承認済み */
  APPROVED = 'approved',
  /** 却下 */
  REJECTED = 'rejected',
  /** 完了 */
  COMPLETED = 'completed',
  /** スキップ */
  SKIPPED = 'skipped'
}

/**
 * クエスト難易度
 */
export enum QuestDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert',
  LEGENDARY = 'legendary'
}

/**
 * クエストカテゴリー
 */
export enum QuestCategory {
  LEARNING = 'learning',
  PRACTICE = 'practice',
  PROJECT = 'project',
  CHALLENGE = 'challenge',
  SPECIAL = 'special'
}

/**
 * クエストタイプ
 */
export enum QuestType {
  /** 個人クエスト */
  INDIVIDUAL = 'individual',
  /** グループクエスト */
  GROUP = 'group',
  /** デイリークエスト */
  DAILY = 'daily',
  /** ウィークリークエスト */
  WEEKLY = 'weekly',
  /** イベントクエスト */
  EVENT = 'event'
}

// =====================================================
// クエスト詳細情報
// =====================================================

/**
 * クエストステージ情報
 */
export interface QuestStage {
  /** ステージID */
  id: number
  /** ステージ名 */
  title: string
  /** 説明 */
  description: string
  /** 難易度 */
  difficulty: QuestDifficulty
  /** カテゴリー */
  category: QuestCategory
  /** 必要時間（分） */
  estimatedMinutes: number
  /** 獲得可能経験値 */
  experiencePoints: number
  /** 前提条件となるステージID */
  prerequisites: number[]
  /** リソース・参考資料 */
  resources: QuestResource[]
  /** 提出要件 */
  requirements: QuestRequirement[]
  /** 評価基準 */
  evaluationCriteria: EvaluationCriterion[]
  /** GoogleフォームURL */
  googleFormUrl?: string
  /** 公開状態 */
  isPublished: boolean
  /** 作成日時 */
  createdAt: Date
  /** 更新日時 */
  updatedAt: Date
}

/**
 * クエストリソース（参考資料）
 */
export interface QuestResource {
  /** リソースID */
  id: string
  /** タイトル */
  title: string
  /** 説明 */
  description?: string
  /** URL */
  url: string
  /** リソースタイプ */
  type: 'video' | 'article' | 'documentation' | 'tool' | 'example'
  /** 必須フラグ */
  isRequired: boolean
}

/**
 * クエスト提出要件
 */
export interface QuestRequirement {
  /** 要件ID */
  id: string
  /** 要件タイトル */
  title: string
  /** 詳細説明 */
  description: string
  /** 提出形式 */
  submissionType: 'text' | 'url' | 'file' | 'code' | 'screenshot'
  /** 必須フラグ */
  isRequired: boolean
  /** バリデーションルール */
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    allowedFileTypes?: string[]
    maxFileSize?: number
  }
}

/**
 * 評価基準
 */
export interface EvaluationCriterion {
  /** 基準ID */
  id: string
  /** 基準名 */
  name: string
  /** 説明 */
  description: string
  /** 配点 */
  points: number
  /** 評価レベル */
  levels: EvaluationLevel[]
}

/**
 * 評価レベル
 */
export interface EvaluationLevel {
  /** レベル */
  level: number
  /** レベル名 */
  name: string
  /** 説明 */
  description: string
  /** 得点率 */
  scoreRatio: number
}

// =====================================================
// 拡張クエスト進行情報
// =====================================================

/**
 * 拡張クエスト進行情報
 * 進行状況にステージ情報を組み合わせた型
 */
export interface EnhancedQuestProgress {
  /** 基本進行情報 */
  progress: QuestProgress
  /** ステージ詳細情報 */
  stage: QuestStage
  /** 派生情報 */
  computed: {
    /** 実際の所要時間（分） */
    actualMinutes?: number
    /** 進行率（0-100） */
    progressPercentage: number
    /** 次のアクション */
    nextAction: QuestAction
    /** 提出可能フラグ */
    canSubmit: boolean
    /** 期限切れフラグ */
    isOverdue: boolean
  }
}

/**
 * クエストアクション
 */
export enum QuestAction {
  START = 'start',
  CONTINUE = 'continue',
  SUBMIT = 'submit',
  RESUBMIT = 'resubmit',
  REVIEW = 'review',
  COMPLETE = 'complete',
  SKIP = 'skip'
}

/**
 * ユーザーのクエスト全体進行状況
 */
export interface UserQuestOverview {
  /** ユーザーID */
  userId: string
  /** 総ステージ数 */
  totalStages: number
  /** 完了ステージ数 */
  completedStages: number
  /** 進行中ステージ数 */
  inProgressStages: number
  /** 未開始ステージ数 */
  notStartedStages: number
  /** 総獲得経験値 */
  totalExperience: number
  /** 平均完了時間（分） */
  averageCompletionTime: number
  /** 現在のストリーク */
  currentStreak: number
  /** 最長ストリーク */
  longestStreak: number
  /** 各ステージの進行状況 */
  stageProgress: EnhancedQuestProgress[]
}

// =====================================================
// クエスト検索・フィルタリング
// =====================================================

/**
 * クエスト検索フィルター
 */
export interface QuestSearchFilter {
  /** 検索クエリ */
  query?: string
  /** 難易度 */
  difficulty?: QuestDifficulty[]
  /** カテゴリー */
  category?: QuestCategory[]
  /** ステータス */
  status?: QuestStatus[]
  /** ユーザーID */
  userId?: string
  /** ステージID範囲 */
  stageIdRange?: {
    from: number
    to: number
  }
  /** 日付範囲 */
  dateRange?: {
    from: Date
    to: Date
  }
}

/**
 * クエストソート条件
 */
export enum QuestSortBy {
  STAGE_ID = 'stage_id',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  SUBMITTED_AT = 'submitted_at',
  DIFFICULTY = 'difficulty',
  STATUS = 'status'
}

/**
 * クエスト一覧取得オプション
 */
export interface QuestListOptions {
  /** フィルター条件 */
  filter?: QuestSearchFilter
  /** ソート条件 */
  sortBy?: QuestSortBy
  /** ソート方向 */
  sortDirection?: 'asc' | 'desc'
  /** ページネーション */
  pagination?: {
    offset: number
    limit: number
  }
}

// =====================================================
// クエスト統計・分析
// =====================================================

/**
 * クエスト統計サマリー
 */
export interface QuestStatsSummary {
  /** 総クエスト数 */
  totalQuests: number
  /** アクティブユーザー数 */
  activeUsers: number
  /** 平均完了率 */
  averageCompletionRate: number
  /** 難易度別統計 */
  byDifficulty: Record<QuestDifficulty, QuestDifficultyStats>
  /** カテゴリー別統計 */
  byCategory: Record<QuestCategory, QuestCategoryStats>
  /** 週次進行統計 */
  weeklyProgress: WeeklyProgressStats[]
}

/**
 * 難易度別統計
 */
export interface QuestDifficultyStats {
  /** 総数 */
  total: number
  /** 完了数 */
  completed: number
  /** 完了率 */
  completionRate: number
  /** 平均所要時間 */
  averageTime: number
}

/**
 * カテゴリー別統計
 */
export interface QuestCategoryStats {
  /** 総数 */
  total: number
  /** 完了数 */
  completed: number
  /** 完了率 */
  completionRate: number
  /** 人気度 */
  popularity: number
}

/**
 * 週次進行統計
 */
export interface WeeklyProgressStats {
  /** 週 */
  week: string
  /** 開始されたクエスト数 */
  started: number
  /** 完了されたクエスト数 */
  completed: number
  /** アクティブユーザー数 */
  activeUsers: number
}

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * クエストステータスから進行率を計算
 */
export function calculateProgressPercentage(status: QuestStatus): number {
  switch (status) {
    case QuestStatus.NOT_STARTED:
      return 0
    case QuestStatus.IN_PROGRESS:
      return 25
    case QuestStatus.SUBMITTED:
      return 75
    case QuestStatus.APPROVED:
    case QuestStatus.COMPLETED:
      return 100
    case QuestStatus.REJECTED:
      return 50
    case QuestStatus.SKIPPED:
      return 100
    default:
      return 0
  }
}

/**
 * 次に実行すべきアクションを決定
 */
export function getNextQuestAction(status: QuestStatus): QuestAction {
  switch (status) {
    case QuestStatus.NOT_STARTED:
      return QuestAction.START
    case QuestStatus.IN_PROGRESS:
      return QuestAction.SUBMIT
    case QuestStatus.REJECTED:
      return QuestAction.RESUBMIT
    case QuestStatus.SUBMITTED:
      return QuestAction.REVIEW
    case QuestStatus.APPROVED:
    case QuestStatus.COMPLETED:
      return QuestAction.COMPLETE
    default:
      return QuestAction.START
  }
}

/**
 * 提出可能かどうかを判定
 */
export function canSubmitQuest(status: QuestStatus): boolean {
  return status === QuestStatus.IN_PROGRESS || status === QuestStatus.REJECTED
}

/**
 * 難易度から色を取得
 */
export function getDifficultyColor(difficulty: QuestDifficulty): string {
  switch (difficulty) {
    case QuestDifficulty.EASY:
      return '#22c55e' // green
    case QuestDifficulty.NORMAL:
      return '#3b82f6' // blue
    case QuestDifficulty.HARD:
      return '#f59e0b' // amber
    case QuestDifficulty.EXPERT:
      return '#ef4444' // red
    case QuestDifficulty.LEGENDARY:
      return '#8b5cf6' // purple
    default:
      return '#6b7280' // gray
  }
}

/**
 * ステータスから色を取得
 */
export function getStatusColor(status: QuestStatus): string {
  switch (status) {
    case QuestStatus.NOT_STARTED:
      return '#6b7280' // gray
    case QuestStatus.IN_PROGRESS:
      return '#3b82f6' // blue
    case QuestStatus.SUBMITTED:
      return '#f59e0b' // amber
    case QuestStatus.APPROVED:
    case QuestStatus.COMPLETED:
      return '#22c55e' // green
    case QuestStatus.REJECTED:
      return '#ef4444' // red
    case QuestStatus.SKIPPED:
      return '#8b5cf6' // purple
    default:
      return '#6b7280' // gray
  }
}

/**
 * EnhancedQuestProgressを作成するヘルパー関数
 */
export function createEnhancedQuestProgress(
  progress: QuestProgress,
  stage: QuestStage
): EnhancedQuestProgress {
  const progressPercentage = calculateProgressPercentage(progress.status as QuestStatus)
  const nextAction = getNextQuestAction(progress.status as QuestStatus)
  const canSubmit = canSubmitQuest(progress.status as QuestStatus)
  
  // 実際の所要時間を計算
  let actualMinutes: number | undefined
  if (progress.submitted_at && progress.created_at) {
    const start = new Date(progress.created_at)
    const end = new Date(progress.submitted_at)
    actualMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
  }
  
  return {
    progress,
    stage,
    computed: {
      actualMinutes,
      progressPercentage,
      nextAction,
      canSubmit,
      isOverdue: false // TODO: 期限機能を実装する場合
    }
  }
} 