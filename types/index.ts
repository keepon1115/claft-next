// =====================================================
// 型定義エントリーポイント
// =====================================================

// データベース基本型
export type { Database, Tables, TablesInsert, TablesUpdate, Json } from './database'

// ユーザー関連型（重複を避けて明示的にエクスポート）
export type {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  UserStats,
  UserStatsInsert,
  UserStatsUpdate,
  AdminUser,
  AdminUserInsert,
  AdminUserUpdate,
  UserRole,
  UserStatus,
  UserLevel,
  EnhancedUser,
  UserCreationForm,
  UserProfileUpdateForm,
  UserSearchFilter,
  UserSortBy,
  SortDirection,
  UserListOptions,
  UserStatsSummary,
  UserActivity,
  UserPermissions
} from './user'

// クエスト関連型
export type {
  QuestProgress,
  QuestProgressInsert,
  QuestProgressUpdate,
  ClaftQuest,
  ClaftQuestInsert,
  ClaftQuestUpdate,
  QuestStatus,
  QuestDifficulty,
  QuestCategory,
  QuestType,
  QuestStage,
  QuestResource,
  QuestRequirement,
  EvaluationCriterion,
  EvaluationLevel,
  EnhancedQuestProgress,
  QuestAction,
  UserQuestOverview,
  QuestSearchFilter,
  QuestSortBy,
  QuestListOptions,
  QuestStatsSummary,
  QuestDifficultyStats,
  QuestCategoryStats,
  WeeklyProgressStats
} from './quest'

// ヘルパー関数
export {
  isActiveUser,
  calculateUserLevel,
  getUserDisplayName,
  isAdminUser,
  createEnhancedUser,
  validateNickname,
  validateEmail
} from './user'

export {
  calculateProgressPercentage,
  getNextQuestAction,
  canSubmitQuest,
  getDifficultyColor,
  getStatusColor,
  createEnhancedQuestProgress
} from './quest'

// =====================================================
// 共通のユーティリティ型
// =====================================================

/**
 * API レスポンスの共通型
 */
export interface ApiResponse<T = any> {
  /** レスポンスデータ */
  data: T | null
  /** エラー情報 */
  error: string | null
  /** 成功フラグ */
  success: boolean
  /** メッセージ */
  message?: string
  /** メタデータ */
  meta?: {
    /** 総件数 */
    total?: number
    /** ページ情報 */
    page?: number
    /** 1ページあたりの件数 */
    limit?: number
    /** 次のページがあるか */
    hasNext?: boolean
    /** 前のページがあるか */
    hasPrev?: boolean
  }
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  /** 現在のページ */
  page: number
  /** 1ページあたりの件数 */
  limit: number
  /** 総件数 */
  total: number
  /** 総ページ数 */
  totalPages: number
  /** 次のページがあるか */
  hasNext: boolean
  /** 前のページがあるか */
  hasPrev: boolean
  /** 開始インデックス */
  startIndex: number
  /** 終了インデックス */
  endIndex: number
}

/**
 * ソート情報
 */
export interface SortInfo<T extends string = string> {
  /** ソートフィールド */
  field: T
  /** ソート方向 */
  direction: 'asc' | 'desc'
}

/**
 * 検索・フィルタークエリの基本型
 */
export interface BaseQuery {
  /** 検索クエリ */
  q?: string
  /** ページ */
  page?: number
  /** 1ページあたりの件数 */
  limit?: number
  /** ソートフィールド */
  sortBy?: string
  /** ソート方向 */
  sortDirection?: 'asc' | 'desc'
}

/**
 * 日付範囲
 */
export interface DateRange {
  /** 開始日 */
  from: Date
  /** 終了日 */
  to: Date
}

/**
 * 数値範囲
 */
export interface NumberRange {
  /** 最小値 */
  min: number
  /** 最大値 */
  max: number
}

/**
 * ファイルアップロード情報
 */
export interface FileUpload {
  /** ファイル名 */
  name: string
  /** ファイルサイズ（バイト） */
  size: number
  /** MIMEタイプ */
  type: string
  /** ファイルURL */
  url?: string
  /** アップロードプロバイダー */
  provider?: 'supabase' | 'cloudinary' | 'aws' | 'local'
  /** メタデータ */
  metadata?: Record<string, any>
}

/**
 * 通知情報
 */
export interface Notification {
  /** 通知ID */
  id: string
  /** タイトル */
  title: string
  /** メッセージ */
  message: string
  /** 通知タイプ */
  type: 'info' | 'success' | 'warning' | 'error'
  /** 読み取り状態 */
  isRead: boolean
  /** 作成日時 */
  createdAt: Date
  /** 関連URL */
  url?: string
  /** 有効期限 */
  expiresAt?: Date
}

/**
 * エラー情報の詳細型
 */
export interface ErrorDetails {
  /** エラーコード */
  code: string
  /** エラーメッセージ */
  message: string
  /** 詳細情報 */
  details?: Record<string, any>
  /** スタックトレース（開発環境のみ） */
  stack?: string
  /** タイムスタンプ */
  timestamp: Date
}

/**
 * バリデーションエラー
 */
export interface ValidationError {
  /** フィールド名 */
  field: string
  /** エラーメッセージ */
  message: string
  /** バリデーションルール */
  rule?: string
  /** 実際の値 */
  value?: any
}

/**
 * フォームの状態
 */
export interface FormState<T = Record<string, any>> {
  /** フォームデータ */
  data: T
  /** エラー情報 */
  errors: Record<keyof T, string>
  /** 送信中フラグ */
  isSubmitting: boolean
  /** バリデーション済みフラグ */
  isValid: boolean
  /** フォームが変更されたか */
  isDirty: boolean
  /** 初期化済みフラグ */
  isInitialized: boolean
}

/**
 * 設定値の型
 */
export interface AppConfig {
  /** アプリケーション名 */
  appName: string
  /** アプリケーションバージョン */
  version: string
  /** 環境 */
  env: 'development' | 'staging' | 'production'
  /** APIベースURL */
  apiBaseUrl: string
  /** Supabase設定 */
  supabase: {
    url: string
    anonKey: string
  }
  /** 機能フラグ */
  features: {
    /** リアルタイム機能 */
    realtime: boolean
    /** 通知機能 */
    notifications: boolean
    /** ファイルアップロード */
    fileUpload: boolean
    /** 分析機能 */
    analytics: boolean
  }
  /** 制限値 */
  limits: {
    /** ファイルサイズ制限（MB） */
    maxFileSize: number
    /** 1日あたりのクエスト制限 */
    dailyQuestLimit: number
    /** 1回あたりの検索結果制限 */
    searchResultLimit: number
  }
}

// =====================================================
// ユーティリティ型
// =====================================================

/**
 * オプショナルプロパティをすべて必須にする
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 指定したプロパティのみオプショナルにする
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Deep Partial（ネストしたオブジェクトもすべてオプショナル）
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 値の型からUnion型を作成
 */
export type ValueOf<T> = T[keyof T]

/**
 * 非nullableな型を作成
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 配列の要素型を取得
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 関数の戻り値型を取得（Promise型の場合は中身を取得）
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T 