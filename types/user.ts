import type { Database } from './database'

// =====================================================
// ユーザー関連型定義
// =====================================================

/**
 * データベースから直接抽出される基本型
 */
export type UserProfile = Database['public']['Tables']['users_profile']['Row']
export type UserProfileInsert = Database['public']['Tables']['users_profile']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['users_profile']['Update']

export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type UserStatsInsert = Database['public']['Tables']['user_stats']['Insert']
export type UserStatsUpdate = Database['public']['Tables']['user_stats']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']

// =====================================================
// エンハンスドユーザー型
// =====================================================

/**
 * ユーザーロール定義
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

/**
 * ユーザーステータス
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

/**
 * ユーザーレベル区分
 */
export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master'
}

/**
 * 拡張ユーザー情報型
 * プロフィールと統計を統合
 */
export interface EnhancedUser {
  /** ユーザープロフィール情報 */
  profile: UserProfile
  /** ユーザー統計情報 */
  stats: UserStats | null
  /** 管理者権限 */
  isAdmin: boolean
  /** 派生的な情報 */
  computed: {
    /** ユーザーレベル */
    level: UserLevel
    /** 表示名（nicknameまたは'冒険者'） */
    displayName: string
    /** アカウント作成からの日数 */
    daysSinceJoined: number
    /** 最後のログインからの日数 */
    daysSinceLastLogin: number | null
  }
}

/**
 * ユーザー作成時のフォームデータ
 */
export interface UserCreationForm {
  /** メールアドレス */
  email: string
  /** パスワード */
  password: string
  /** 冒険者名（ニックネーム） */
  nickname?: string
  /** 利用規約への同意 */
  termsAccepted: boolean
  /** プライバシーポリシーへの同意 */
  privacyAccepted: boolean
}

/**
 * ユーザープロフィール更新フォーム
 */
export interface UserProfileUpdateForm {
  /** 冒険者名 */
  nickname?: string
  /** メールアドレス */
  email?: string
}

/**
 * ユーザー検索フィルター
 */
export interface UserSearchFilter {
  /** 検索クエリ（ニックネーム、メール） */
  query?: string
  /** ユーザーレベル */
  level?: UserLevel
  /** 管理者フラグ */
  isAdmin?: boolean
  /** 作成日の範囲 */
  createdAfter?: Date
  /** 作成日の範囲 */
  createdBefore?: Date
  /** ログイン状況 */
  lastLoginAfter?: Date
}

/**
 * ユーザーソート条件
 */
export enum UserSortBy {
  CREATED_AT = 'created_at',
  NICKNAME = 'nickname',
  EMAIL = 'email',
  LAST_LOGIN = 'last_login_date',
  TOTAL_EXP = 'total_exp',
  LOGIN_COUNT = 'login_count'
}

/**
 * ソート方向
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * ユーザーリスト取得オプション
 */
export interface UserListOptions {
  /** フィルター条件 */
  filter?: UserSearchFilter
  /** ソート条件 */
  sortBy?: UserSortBy
  /** ソート方向 */
  sortDirection?: SortDirection
  /** ページネーション: 開始位置 */
  offset?: number
  /** ページネーション: 取得件数 */
  limit?: number
}

/**
 * ユーザー統計サマリー
 */
export interface UserStatsSummary {
  /** 総ユーザー数 */
  totalUsers: number
  /** アクティブユーザー数（7日以内にログイン） */
  activeUsers: number
  /** 新規ユーザー数（今月） */
  newUsersThisMonth: number
  /** 管理者数 */
  adminCount: number
  /** レベル別ユーザー数 */
  usersByLevel: Record<UserLevel, number>
}

/**
 * ユーザーアクティビティ
 */
export interface UserActivity {
  /** ユーザーID */
  userId: string
  /** アクティビティタイプ */
  type: 'login' | 'quest_complete' | 'profile_update' | 'achievement'
  /** 説明 */
  description: string
  /** 発生日時 */
  createdAt: Date
  /** 関連データ */
  metadata?: Record<string, any>
}

/**
 * ユーザー権限
 */
export interface UserPermissions {
  /** クエスト実行権限 */
  canExecuteQuests: boolean
  /** プロフィール編集権限 */
  canEditProfile: boolean
  /** 管理画面アクセス権限 */
  canAccessAdmin: boolean
  /** ユーザー管理権限 */
  canManageUsers: boolean
  /** システム設定権限 */
  canManageSystem: boolean
}

// =====================================================
// ヘルパー型とタイプガード
// =====================================================

/**
 * ユーザーがアクティブかどうかを判定
 */
export function isActiveUser(user: UserProfile, stats?: UserStats | null): boolean {
  if (!stats?.last_login_date) return false
  
  const lastLogin = new Date(stats.last_login_date)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysDiff <= 7
}

/**
 * ユーザーレベルを経験値から計算
 */
export function calculateUserLevel(totalExp: number): UserLevel {
  if (totalExp >= 10000) return UserLevel.MASTER
  if (totalExp >= 5000) return UserLevel.EXPERT
  if (totalExp >= 2000) return UserLevel.ADVANCED
  if (totalExp >= 500) return UserLevel.INTERMEDIATE
  return UserLevel.BEGINNER
}

/**
 * ユーザーの表示名を取得
 */
export function getUserDisplayName(user: UserProfile): string {
  return user.nickname || '冒険者'
}

/**
 * 管理者ユーザーかどうかの型ガード
 */
export function isAdminUser(user: any): user is AdminUser {
  return user && typeof user.user_id === 'string' && user.is_active === true
}

/**
 * EnhancedUserを作成するヘルパー関数
 */
export function createEnhancedUser(
  profile: UserProfile,
  stats: UserStats | null = null,
  isAdmin: boolean = false
): EnhancedUser {
  const now = new Date()
  const createdAt = new Date(profile.created_at || now)
  const lastLogin = stats?.last_login_date ? new Date(stats.last_login_date) : null
  
  return {
    profile,
    stats,
    isAdmin,
    computed: {
      level: calculateUserLevel(stats?.total_exp || 0),
      displayName: getUserDisplayName(profile),
      daysSinceJoined: Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceLastLogin: lastLogin 
        ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
        : null
    }
  }
}

// =====================================================
// バリデーション関連
// =====================================================

/**
 * ニックネームバリデーション
 */
export function validateNickname(nickname: string): { valid: boolean; message?: string } {
  if (!nickname.trim()) {
    return { valid: false, message: 'ニックネームを入力してください' }
  }
  
  if (nickname.length < 2) {
    return { valid: false, message: 'ニックネームは2文字以上で入力してください' }
  }
  
  if (nickname.length > 20) {
    return { valid: false, message: 'ニックネームは20文字以内で入力してください' }
  }
  
  // 禁止文字チェック
  const prohibitedChars = /[<>'"&]/
  if (prohibitedChars.test(nickname)) {
    return { valid: false, message: '使用できない文字が含まれています' }
  }
  
  return { valid: true }
}

/**
 * メールアドレスバリデーション
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email.trim()) {
    return { valid: false, message: 'メールアドレスを入力してください' }
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: '正しいメールアドレスの形式で入力してください' }
  }
  
  return { valid: true }
} 