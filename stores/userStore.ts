'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// =====================================================
// 型定義
// =====================================================

export interface ProfileData {
  nickname: string
  character: string
  skills: string[]
  weakness: string
  favoritePlace: string
  energyCharge: string
  companion: string
  catchphrase: string
  message: string
  avatarUrl?: string
  profileCompletion: number
}

export interface ExtendedUserStats {
  userId: string
  loginCount: number
  lastLoginDate: string
  totalPlayTime: number
  level: number
  experience: number
  experienceToNext: number
  questsCompleted: number
  questsInProgress: number
  currentStreak: number
  maxStreak: number
  achievementCount: number
  goldBadges: number
  silverBadges: number
  bronzeBadges: number
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'gold' | 'silver' | 'bronze'
  iconClass: string
  unlockedAt?: string
  isUnlocked: boolean
}

export interface UserActivity {
  id: string
  userId: string
  activityType: 'login' | 'quest_complete' | 'profile_update' | 'level_up'
  description: string
  experienceGained?: number
  timestamp: string
}

// =====================================================
// デフォルト値
// =====================================================

const defaultProfileData: ProfileData = {
  nickname: 'CLAFT冒険者',
  character: '',
  skills: [''],
  weakness: '',
  favoritePlace: '',
  energyCharge: '',
  companion: '',
  catchphrase: '',
  message: '',
  avatarUrl: '',
  profileCompletion: 85,
}

const defaultExtendedStats: ExtendedUserStats = {
  userId: 'dev-user-001',
  loginCount: 12,
  lastLoginDate: new Date().toISOString(),
  totalPlayTime: 1800, // 30分
  level: 5,
  experience: 420,
  experienceToNext: 80,
  questsCompleted: 3,
  questsInProgress: 2,
  currentStreak: 3,
  maxStreak: 7,
  achievementCount: 4,
  goldBadges: 1,
  silverBadges: 2,
  bronzeBadges: 1,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日前
  updatedAt: new Date().toISOString(),
}

// 事前定義された実績
const predefinedAchievements: Achievement[] = [
  {
    id: 'first_login',
    title: '初回ログイン',
    description: 'CLAFTへようこそ！',
    type: 'bronze',
    iconClass: 'fa-star',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'profile_complete',
    title: 'プロフィール完成',
    description: 'プロフィールを完成させた',
    type: 'silver',
    iconClass: 'fa-user-check',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'first_quest',
    title: '初クエスト',
    description: '最初のクエストをクリアした',
    type: 'bronze',
    iconClass: 'fa-flag-checkered',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'level_5',
    title: 'レベル5達成',
    description: 'レベル5に到達した',
    type: 'silver',
    iconClass: 'fa-level-up-alt',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quest_master',
    title: 'クエストマスター',
    description: '10個のクエストをクリアした',
    type: 'gold',
    iconClass: 'fa-crown',
    isUnlocked: false,
  },
  {
    id: 'streak_7',
    title: '7日連続',
    description: '7日連続でログインした',
    type: 'gold',
    iconClass: 'fa-fire',
    isUnlocked: false,
  },
]

// =====================================================
// ユーザーストアの型定義
// =====================================================

interface UserState {
  // プロフィール情報
  profileData: ProfileData
  extendedStats: ExtendedUserStats | null
  achievements: Achievement[]
  recentActivities: UserActivity[]
  
  // 状態管理
  isLoading: boolean
  isSaving: boolean
  error: string | null
  lastSyncTime: string | null
  isInitialized: boolean
  
  // 基本アクション
  initialize: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>
  addExperience: (amount: number, reason?: string) => Promise<{ success: boolean; levelUp?: boolean; error?: string }>
  calculateProfileCompletion: () => number
  clearError: () => void
}

// =====================================================
// レベル・経験値計算ユーティリティ
// =====================================================

const calculateLevel = (experience: number): number => {
  return Math.floor(experience / 100) + 1
}

const calculateExperienceToNext = (experience: number): number => {
  const currentLevel = calculateLevel(experience)
  const nextLevelExp = currentLevel * 100
  return nextLevelExp - experience
}

// =====================================================
// Zustandユーザーストア
// =====================================================

export const useUserStore = create<UserState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // 初期状態
          profileData: { ...defaultProfileData },
          extendedStats: null,
          achievements: [...predefinedAchievements],
          recentActivities: [],
          isLoading: false,
          isSaving: false,
          error: null,
          lastSyncTime: null,
          isInitialized: false,

          // =====================================================
          // 初期化
          // =====================================================
          initialize: async (userId: string) => {
            if (!userId) {
              set((state) => {
                state.error = 'ユーザーIDが指定されていないため、初期化できません。'
                state.isLoading = false
              })
              return
            }
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              console.log('🔧 userStore初期化開始:', userId)
              
              // Supabaseクライアント作成
              const supabase = createBrowserSupabaseClient()
              
              // プロフィールデータを取得
              const { data: profileData, error: profileError } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

              if (profileError && profileError.code !== 'PGRST116') {
                console.error('❌ プロフィール取得エラー:', profileError)
                throw profileError
              }

              // 統計データを取得
              const { data: statsData, error: statsError } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()

              if (statsError && statsError.code !== 'PGRST116') {
                console.error('❌ 統計データ取得エラー:', statsError)
                throw statsError
              }

              // プロフィールデータを変換
              const profile: ProfileData = profileData ? {
                nickname: profileData.nickname || defaultProfileData.nickname,
                character: profileData.character_type || defaultProfileData.character,
                skills: profileData.skills || defaultProfileData.skills,
                weakness: profileData.weakness || defaultProfileData.weakness,
                favoritePlace: profileData.favorite_place || defaultProfileData.favoritePlace,
                energyCharge: profileData.energy_charge || defaultProfileData.energyCharge,
                companion: profileData.companion || defaultProfileData.companion,
                catchphrase: profileData.catchphrase || defaultProfileData.catchphrase,
                message: profileData.message || defaultProfileData.message,
                avatarUrl: profileData.avatar_url || defaultProfileData.avatarUrl,
                profileCompletion: profileData.profile_completion || 0,
              } : { ...defaultProfileData }

              // 統計データを変換
              const stats: ExtendedUserStats = statsData ? {
                userId,
                loginCount: statsData.login_count || 0,
                lastLoginDate: statsData.last_login_date || new Date().toISOString(),
                totalPlayTime: 0,
                level: Math.floor((statsData.total_exp || 0) / 100) + 1,
                experience: statsData.total_exp || 0,
                experienceToNext: 100 - ((statsData.total_exp || 0) % 100),
                questsCompleted: statsData.quest_clear_count || 0,
                questsInProgress: 0,
                currentStreak: 0,
                maxStreak: 0,
                achievementCount: 0,
                goldBadges: 0,
                silverBadges: 0,
                bronzeBadges: 0,
                createdAt: statsData.created_at || new Date().toISOString(),
                updatedAt: statsData.updated_at || new Date().toISOString(),
              } : { ...defaultExtendedStats, userId }

              // 状態を更新
              set((state) => {
                state.profileData = profile
                state.extendedStats = stats
                state.achievements = predefinedAchievements.map(achievement => ({ ...achievement }))
                state.recentActivities = [
                  {
                    id: '1',
                    userId,
                    activityType: 'profile_update',
                    description: 'プロフィールを更新しました',
                    experienceGained: 5,
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  },
                  {
                    id: '2',
                    userId,
                    activityType: 'quest_complete',
                    description: '「自己紹介」クエストをクリアしました',
                    experienceGained: 20,
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                  },
                ]
                state.isInitialized = true
                state.lastSyncTime = new Date().toISOString()
                state.error = null
              })
              
              console.log('✅ userStore: 初期化完了')
              
            } catch (error) {
              console.error('❌ userStore初期化エラー:', error)
              set((state) => {
                state.error = 'userStore初期化に失敗しました'
                // エラーの場合でもデフォルトデータで初期化
                state.profileData = { ...defaultProfileData }
                state.extendedStats = { ...defaultExtendedStats, userId }
                state.achievements = predefinedAchievements.map(achievement => ({ ...achievement }))
                state.isInitialized = true
              })
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // プロフィール更新
          // =====================================================
          updateProfile: async (updates: Partial<ProfileData>) => {
            set((state) => {
              state.isSaving = true
              state.error = null
            })

            try {
              // プロフィールデータを更新
              set((state) => {
                Object.assign(state.profileData, updates)
              })

              // プロフィール完成度を再計算
              const completion = get().calculateProfileCompletion()
              set((state) => {
                state.profileData.profileCompletion = completion
                state.lastSyncTime = new Date().toISOString()
              })

              console.log('✅ プロフィール更新完了')
              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'プロフィール更新に失敗しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isSaving = false
              })
            }
          },

          // =====================================================
          // 経験値追加
          // =====================================================
          addExperience: async (amount: number, reason?: string) => {
            const { extendedStats } = get()
            if (!extendedStats) {
              return { success: false, error: '統計データが初期化されていません' }
            }

            try {
              const newExperience = extendedStats.experience + amount
              const oldLevel = extendedStats.level
              const newLevel = calculateLevel(newExperience)
              const experienceToNext = calculateExperienceToNext(newExperience)
              
              set((state) => {
                if (state.extendedStats) {
                  state.extendedStats.experience = newExperience
                  state.extendedStats.level = newLevel
                  state.extendedStats.experienceToNext = experienceToNext
                  state.extendedStats.updatedAt = new Date().toISOString()
                }
              })

              console.log(`✅ 経験値追加: +${amount}XP ${reason ? `(${reason})` : ''}`)
              
              const levelUp = newLevel > oldLevel
              if (levelUp) {
                console.log(`🎉 レベルアップ！ Lv.${oldLevel} → Lv.${newLevel}`)
              }

              return { success: true, levelUp }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : '経験値追加に失敗しました'
              return { success: false, error: errorMessage }
            }
          },

          // =====================================================
          // プロフィール完成度計算
          // =====================================================
          calculateProfileCompletion: () => {
            const profile = get().profileData
            const fields = [
              profile.nickname,
              profile.character,
              profile.skills.length > 0 ? 'filled' : '',
              profile.weakness,
              profile.favoritePlace,
              profile.energyCharge,
              profile.companion,
              profile.catchphrase,
              profile.message
            ]
            
            const filledFields = fields.filter(field => field && field.length > 0).length
            return Math.round((filledFields / fields.length) * 100)
          },

          // =====================================================
          // エラークリア
          // =====================================================
          clearError: () => {
            set((state) => {
              state.error = null
            })
          },
        }),
        {
          name: 'claft-user-store',
          version: 1,
        }
      )
    ),
    {
      name: 'CLAFT User Store',
    }
  )
)

// =====================================================
// 利便性フック
// =====================================================

export const useUserProfile = () => {
  const { profileData, isLoading, error } = useUserStore()
  return {
    profileData,
    isLoading,
    error
  }
}

export const useUserStats = () => {
  const { extendedStats, isLoading } = useUserStore()
  return {
    userStats: extendedStats,
    isLoading
  }
} 