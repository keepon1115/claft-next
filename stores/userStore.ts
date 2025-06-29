'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'
import type { UserProfile, UserStats } from '@/types'

// =====================================================
// ユーザープロフィール関連の型定義
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
  // 基本統計
  userId: string
  loginCount: number
  lastLoginDate: string
  totalPlayTime: number
  level: number
  experience: number
  experienceToNext: number
  
  // クエスト関連
  questsCompleted: number
  questsInProgress: number
  currentStreak: number
  maxStreak: number
  
  // バッジ・実績
  achievementCount: number
  goldBadges: number
  silverBadges: number
  bronzeBadges: number
  
  // 作成・更新日時
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
  
  // アクション
  initialize: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>
  updateStats: (updates: Partial<ExtendedUserStats>) => Promise<{ success: boolean; error?: string }>
  addExperience: (amount: number, reason?: string) => Promise<{ success: boolean; levelUp?: boolean; error?: string }>
  recordActivity: (activityType: UserActivity['activityType'], description: string, experienceGained?: number) => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<{ success: boolean; error?: string }>
  calculateProfileCompletion: () => number
  autoSave: () => Promise<void>
  syncWithSupabase: () => Promise<void>
  resetProfile: () => void
  clearError: () => void
}

// =====================================================
// デフォルト値
// =====================================================

const defaultProfileData: ProfileData = {
  nickname: '冒険者',
  character: '',
  skills: [],
  weakness: '',
  favoritePlace: '',
  energyCharge: '',
  companion: '',
  catchphrase: '',
  message: '',
  avatarUrl: '',
  profileCompletion: 0,
}

const defaultExtendedStats: ExtendedUserStats = {
  userId: '',
  loginCount: 0,
  lastLoginDate: '',
  totalPlayTime: 0,
  level: 1,
  experience: 0,
  experienceToNext: 100,
  questsCompleted: 0,
  questsInProgress: 0,
  currentStreak: 0,
  maxStreak: 0,
  achievementCount: 0,
  goldBadges: 0,
  silverBadges: 0,
  bronzeBadges: 0,
  createdAt: new Date().toISOString(),
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
    isUnlocked: false,
  },
  {
    id: 'profile_complete',
    title: 'プロフィール完成',
    description: 'プロフィールを100%完成させた',
    type: 'silver',
    iconClass: 'fa-user-check',
    isUnlocked: false,
  },
  {
    id: 'first_quest',
    title: '初クエスト',
    description: '最初のクエストをクリアした',
    type: 'bronze',
    iconClass: 'fa-flag-checkered',
    isUnlocked: false,
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
    id: 'level_10',
    title: 'レベル10達成',
    description: 'レベル10に到達した',
    type: 'silver',
    iconClass: 'fa-level-up-alt',
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

const calculateRequiredExp = (level: number): number => {
  return (level - 1) * 100
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
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const supabase = createBrowserSupabaseClient()

              // プロフィールデータの取得
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single()

              if (profile) {
                set((state) => {
                  state.profileData = {
                    nickname: profile.nickname || '冒険者',
                    character: profile.character || '',
                    skills: profile.skills || [],
                    weakness: profile.weakness || '',
                    favoritePlace: profile.favorite_place || '',
                    energyCharge: profile.energy_charge || '',
                    companion: profile.companion || '',
                    catchphrase: profile.catchphrase || '',
                    message: profile.message || '',
                    avatarUrl: profile.avatar_url || '',
                    profileCompletion: 0, // 後で計算
                  }
                })
              }

              // 統計データの取得
              const { data: stats } = await supabase
                .from('user_extended_stats')
                .select('*')
                .eq('user_id', userId)
                .single()

              if (stats) {
                set((state) => {
                  state.extendedStats = {
                    userId: stats.user_id,
                    loginCount: stats.login_count || 0,
                    lastLoginDate: stats.last_login_date || '',
                    totalPlayTime: stats.total_play_time || 0,
                    level: stats.level || 1,
                    experience: stats.experience || 0,
                    experienceToNext: calculateExperienceToNext(stats.experience || 0),
                    questsCompleted: stats.quests_completed || 0,
                    questsInProgress: stats.quests_in_progress || 0,
                    currentStreak: stats.current_streak || 0,
                    maxStreak: stats.max_streak || 0,
                    achievementCount: stats.achievement_count || 0,
                    goldBadges: stats.gold_badges || 0,
                    silverBadges: stats.silver_badges || 0,
                    bronzeBadges: stats.bronze_badges || 0,
                    createdAt: stats.created_at || new Date().toISOString(),
                    updatedAt: stats.updated_at || new Date().toISOString(),
                  }
                })
              } else {
                // 統計データが存在しない場合は作成
                const newStats = { ...defaultExtendedStats, userId }
                await supabase
                  .from('user_extended_stats')
                  .insert(newStats)
                
                set((state) => {
                  state.extendedStats = newStats
                })
              }

              // 実績データの取得
              const { data: userAchievements } = await supabase
                .from('user_achievements')
                .select('achievement_id, unlocked_at')
                .eq('user_id', userId)

              if (userAchievements && userAchievements.length > 0) {
                set((state) => {
                  state.achievements = state.achievements.map(achievement => ({
                    ...achievement,
                    isUnlocked: userAchievements.some(ua => ua.achievement_id === achievement.id),
                    unlockedAt: userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at,
                  }))
                })
              }

              // 最近のアクティビティ取得
              const { data: activities } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false })
                .limit(20)

              if (activities) {
                set((state) => {
                  state.recentActivities = activities.map(activity => ({
                    id: activity.id,
                    userId: activity.user_id,
                    activityType: activity.activity_type,
                    description: activity.description,
                    experienceGained: activity.experience_gained,
                    timestamp: activity.timestamp,
                  }))
                })
              }

              // プロフィール完成度を計算
              const completion = get().calculateProfileCompletion()
              set((state) => {
                state.profileData.profileCompletion = completion
                state.isInitialized = true
                state.lastSyncTime = new Date().toISOString()
              })

            } catch (error) {
              console.error('ユーザーストア初期化エラー:', error)
              set((state) => {
                state.error = error instanceof Error ? error.message : '初期化に失敗しました'
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
            const { extendedStats } = get()
            if (!extendedStats?.userId) {
              const errorMessage = 'ユーザーIDが見つかりません'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            }

            set((state) => {
              state.isSaving = true
              state.error = null
            })

            try {
              const supabase = createBrowserSupabaseClient()

              // プロフィールデータを更新
              set((state) => {
                Object.assign(state.profileData, updates)
              })

              // プロフィール完成度を再計算
              const completion = get().calculateProfileCompletion()
              set((state) => {
                state.profileData.profileCompletion = completion
              })

              // Supabaseに保存
              const profileToSave = {
                user_id: extendedStats.userId,
                nickname: get().profileData.nickname,
                character: get().profileData.character,
                skills: get().profileData.skills,
                weakness: get().profileData.weakness,
                favorite_place: get().profileData.favoritePlace,
                energy_charge: get().profileData.energyCharge,
                companion: get().profileData.companion,
                catchphrase: get().profileData.catchphrase,
                message: get().profileData.message,
                avatar_url: get().profileData.avatarUrl,
                profile_completion: completion,
                updated_at: new Date().toISOString(),
              }

              await supabase
                .from('user_profiles')
                .upsert(profileToSave)

              // プロフィール更新アクティビティを記録
              await get().recordActivity('profile_update', 'プロフィールを更新しました', 5)

              // プロフィール完成実績をチェック
              if (completion === 100) {
                await get().unlockAchievement('profile_complete')
              }

              set((state) => {
                state.lastSyncTime = new Date().toISOString()
              })

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
          // 統計データ更新
          // =====================================================
          updateStats: async (updates: Partial<ExtendedUserStats>) => {
            const { extendedStats } = get()
            if (!extendedStats) {
              const errorMessage = '統計データが初期化されていません'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            }

            set((state) => {
              state.isSaving = true
              state.error = null
            })

            try {
              const supabase = createBrowserSupabaseClient()

              // 統計データを更新
              set((state) => {
                if (state.extendedStats) {
                  Object.assign(state.extendedStats, {
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  })
                }
              })

              // Supabaseに保存
              await supabase
                .from('user_extended_stats')
                .update({
                  ...updates,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', extendedStats.userId)

              set((state) => {
                state.lastSyncTime = new Date().toISOString()
              })

              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : '統計データ更新に失敗しました'
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
          // 経験値追加（レベルアップ判定付き）
          // =====================================================
          addExperience: async (amount: number, reason?: string) => {
            const { extendedStats } = get()
            if (!extendedStats) {
              return { success: false, error: '統計データが初期化されていません' }
            }

            const newExperience = extendedStats.experience + amount
            const oldLevel = extendedStats.level
            const newLevel = calculateLevel(newExperience)
            const levelUp = newLevel > oldLevel

            // 統計を更新
            const statsUpdate = {
              experience: newExperience,
              level: newLevel,
              experienceToNext: calculateExperienceToNext(newExperience),
            }

            const result = await get().updateStats(statsUpdate)

            if (result.success) {
              // アクティビティを記録
              if (reason) {
                await get().recordActivity('quest_complete', reason, amount)
              }

              // レベルアップした場合
              if (levelUp) {
                await get().recordActivity('level_up', `レベル${newLevel}に到達！`, 0)
                
                // レベル関連の実績チェック
                if (newLevel >= 10) {
                  await get().unlockAchievement('level_10')
                }
              }

              return { success: true, levelUp }
            }

            return result
          },

          // =====================================================
          // アクティビティ記録
          // =====================================================
          recordActivity: async (activityType: UserActivity['activityType'], description: string, experienceGained?: number) => {
            const { extendedStats } = get()
            if (!extendedStats?.userId) return

            try {
              const supabase = createBrowserSupabaseClient()

              const activity: Omit<UserActivity, 'id'> = {
                userId: extendedStats.userId,
                activityType,
                description,
                experienceGained,
                timestamp: new Date().toISOString(),
              }

              const { data } = await supabase
                .from('user_activities')
                .insert(activity)
                .select()
                .single()

              if (data) {
                set((state) => {
                  state.recentActivities = [data as UserActivity, ...state.recentActivities.slice(0, 19)]
                })
              }

            } catch (error) {
              console.error('アクティビティ記録エラー:', error)
            }
          },

          // =====================================================
          // 実績解除
          // =====================================================
          unlockAchievement: async (achievementId: string) => {
            const { extendedStats, achievements } = get()
            if (!extendedStats?.userId) {
              return { success: false, error: 'ユーザーIDが見つかりません' }
            }

            const achievement = achievements.find(a => a.id === achievementId)
            if (!achievement || achievement.isUnlocked) {
              return { success: false, error: '実績が見つからないか、既に解除済みです' }
            }

            try {
              const supabase = createBrowserSupabaseClient()
              const unlockedAt = new Date().toISOString()

              // データベースに記録
              await supabase
                .from('user_achievements')
                .insert({
                  user_id: extendedStats.userId,
                  achievement_id: achievementId,
                  unlocked_at: unlockedAt,
                })

              // ストア状態を更新
              set((state) => {
                const achievementIndex = state.achievements.findIndex(a => a.id === achievementId)
                if (achievementIndex !== -1) {
                  state.achievements[achievementIndex].isUnlocked = true
                  state.achievements[achievementIndex].unlockedAt = unlockedAt
                }

                // バッジカウント更新
                if (state.extendedStats) {
                  state.extendedStats.achievementCount += 1
                  switch (achievement.type) {
                    case 'gold':
                      state.extendedStats.goldBadges += 1
                      break
                    case 'silver':
                      state.extendedStats.silverBadges += 1
                      break
                    case 'bronze':
                      state.extendedStats.bronzeBadges += 1
                      break
                  }
                }
              })

              // 統計を更新
              await get().updateStats({
                achievementCount: extendedStats.achievementCount + 1,
                goldBadges: extendedStats.goldBadges + (achievement.type === 'gold' ? 1 : 0),
                silverBadges: extendedStats.silverBadges + (achievement.type === 'silver' ? 1 : 0),
                bronzeBadges: extendedStats.bronzeBadges + (achievement.type === 'bronze' ? 1 : 0),
              })

              // アクティビティを記録
              await get().recordActivity('quest_complete', `実績「${achievement.title}」を解除しました！`, 20)

              return { success: true }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : '実績解除に失敗しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            }
          },

          // =====================================================
          // プロフィール完成度計算
          // =====================================================
          calculateProfileCompletion: () => {
            const { profileData } = get()
            const fields = [
              'nickname', 'character', 'weakness', 'favoritePlace', 
              'energyCharge', 'companion', 'catchphrase', 'message'
            ]
            
            let filledCount = 0
            
            fields.forEach(field => {
              const value = profileData[field as keyof ProfileData]
              if (field === 'skills') {
                if (Array.isArray(value) && value.length > 0) filledCount++
              } else if (value && String(value).trim() !== '') {
                filledCount++
              }
            })
            
            // スキルフィールドを別途チェック
            if (profileData.skills.length > 0) {
              filledCount++
            }
            
            const totalFields = fields.length + 1 // +1 for skills
            return Math.round((filledCount / totalFields) * 100)
          },

          // =====================================================
          // 自動保存
          // =====================================================
          autoSave: async () => {
            const { profileData, extendedStats, isSaving } = get()
            
            if (isSaving || !extendedStats?.userId) return

            try {
              // ローカルストレージに保存
              localStorage.setItem('claft-profile-data', JSON.stringify(profileData))
              localStorage.setItem('claft-last-save', new Date().toISOString())

              // 定期的にSupabaseと同期
              const lastSync = get().lastSyncTime
              const now = new Date()
              const lastSyncTime = lastSync ? new Date(lastSync) : new Date(0)
              const timeDiff = now.getTime() - lastSyncTime.getTime()
              
              // 5分以上経過していたら同期
              if (timeDiff > 5 * 60 * 1000) {
                await get().syncWithSupabase()
              }

            } catch (error) {
              console.error('自動保存エラー:', error)
            }
          },

          // =====================================================
          // Supabaseとの同期
          // =====================================================
          syncWithSupabase: async () => {
            const { profileData, extendedStats } = get()
            if (!extendedStats?.userId) return

            try {
              const result = await get().updateProfile(profileData)
              if (result.success) {
                set((state) => {
                  state.lastSyncTime = new Date().toISOString()
                })
              }
            } catch (error) {
              console.error('Supabase同期エラー:', error)
            }
          },

          // =====================================================
          // プロフィールリセット
          // =====================================================
          resetProfile: () => {
            set((state) => {
              state.profileData = { ...defaultProfileData }
              state.profileData.profileCompletion = 0
            })
            
            // ローカルストレージからも削除
            localStorage.removeItem('claft-profile-data')
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
          partialize: (state) => ({
            profileData: state.profileData,
            lastSyncTime: state.lastSyncTime,
            isInitialized: state.isInitialized,
          })
        }
      )
    ),
    {
      name: 'user-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// =====================================================
// セレクター（便利関数）
// =====================================================

export const useUserProfile = () => {
  const store = useUserStore()
  return {
    // プロフィールデータ
    profileData: store.profileData,
    profileCompletion: store.profileData.profileCompletion,
    
    // 状態
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    error: store.error,
    isInitialized: store.isInitialized,
    
    // アクション
    updateProfile: store.updateProfile,
    resetProfile: store.resetProfile,
    autoSave: store.autoSave,
    clearError: store.clearError,
  }
}

export const useUserStats = () => {
  const store = useUserStore()
  return {
    // 統計データ
    stats: store.extendedStats,
    achievements: store.achievements,
    recentActivities: store.recentActivities,
    
    // 派生状態
    unlockedAchievements: store.achievements.filter(a => a.isUnlocked),
    experienceProgress: store.extendedStats ? 
      (store.extendedStats.experience / (store.extendedStats.level * 100)) * 100 : 0,
    
    // アクション
    updateStats: store.updateStats,
    addExperience: store.addExperience,
    unlockAchievement: store.unlockAchievement,
    recordActivity: store.recordActivity,
  }
}

export const useUserActions = () => {
  const store = useUserStore()
  return {
    initialize: store.initialize,
    updateProfile: store.updateProfile,
    updateStats: store.updateStats,
    addExperience: store.addExperience,
    unlockAchievement: store.unlockAchievement,
    recordActivity: store.recordActivity,
    calculateProfileCompletion: store.calculateProfileCompletion,
    autoSave: store.autoSave,
    syncWithSupabase: store.syncWithSupabase,
    resetProfile: store.resetProfile,
    clearError: store.clearError,
  }
}

// =====================================================
// 開発用デバッグ関数
// =====================================================

export const useUserDebug = () => {
  const store = useUserStore()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return {
    // 開発用のテスト関数
    addTestExperience: () => store.addExperience(50, 'テスト経験値'),
    unlockAllAchievements: async () => {
      for (const achievement of store.achievements) {
        if (!achievement.isUnlocked) {
          await store.unlockAchievement(achievement.id)
        }
      }
    },
    resetAllData: () => {
      store.resetProfile()
      // その他のリセット処理
    },
    getState: () => ({
      profileData: store.profileData,
      extendedStats: store.extendedStats,
      achievements: store.achievements,
      recentActivities: store.recentActivities,
    }),
  }
}

export default useUserStore 