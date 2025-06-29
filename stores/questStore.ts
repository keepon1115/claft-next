'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'
import type { QuestProgress, QuestStatus } from '@/types/quest'

// =====================================================
// クエストストアの型定義
// =====================================================

export type StageStatus = 'locked' | 'current' | 'completed' | 'pending_approval'

export interface StageProgress {
  stageId: number
  status: StageStatus
  title: string
  description: string
  message: string
  videoUrl?: string
  formUrl?: string
  iconImage?: string
  fallbackIcon: string
  completedAt?: string
  submittedAt?: string
  lastUpdated?: string
}

export interface UserQuestProgress {
  [stageId: number]: StageStatus
}

export interface QuestStatistics {
  totalStages: number
  completedStages: number
  currentStage: number | null
  progressPercentage: number
  lastCompletedStage: number | null
}

interface QuestState {
  // 状態
  userProgress: UserQuestProgress
  stageDetails: Record<number, StageProgress>
  statistics: QuestStatistics
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  lastSyncTime: string | null
  isInitialized: boolean
  currentUserId: string | null

  // アクション
  initialize: (userId?: string) => Promise<void>
  updateStageProgress: (stageId: number, status: StageStatus, optimistic?: boolean) => Promise<{ success: boolean; error?: string }>
  completeStage: (stageId: number) => Promise<{ success: boolean; error?: string }>
  submitStage: (stageId: number, submissionData?: Record<string, any>) => Promise<{ success: boolean; error?: string }>
  approveStage: (stageId: number) => Promise<{ success: boolean; error?: string }>
  rejectStage: (stageId: number, reason?: string) => Promise<{ success: boolean; error?: string }>
  resetProgress: () => Promise<{ success: boolean; error?: string }>
  calculateStatistics: () => QuestStatistics
  getNextAvailableStage: () => number | null
  canAccessStage: (stageId: number) => boolean
  syncWithSupabase: () => Promise<void>
  clearError: () => void
  setDemoMode: () => void
}

// =====================================================
// デフォルト値とスタティックデータ
// =====================================================

const TOTAL_STAGES = 6

const defaultStageDetails: Record<number, StageProgress> = {
  1: {
    stageId: 1,
    status: 'locked',
    title: '君はどんな冒険者？',
    description: '〜学びの地図をひらこう〜',
    message: '「勉強という二文字を忘れよう」',
    videoUrl: 'https://vimeo.com/1096785134/fc1a254212',
    formUrl: 'https://forms.gle/DX3GDXH9E62wVWTz7',
    iconImage: 'https://via.placeholder.com/64x64/8B4513/FFFFFF?text=House',
    fallbackIcon: '🏠'
  },
  2: {
    stageId: 2,
    status: 'locked',
    title: '新時代の冒険者に必要なものって？',
    description: '〜武器と道具の話〜',
    message: '「君は武器や道具をどう使う？」',
    videoUrl: 'https://youtube.com/watch?v=stage2video',
    formUrl: 'https://forms.google.com/your-form-2',
    iconImage: 'https://via.placeholder.com/64x64/228B22/FFFFFF?text=Forest',
    fallbackIcon: '🌲'
  },
  3: {
    stageId: 3,
    status: 'locked',
    title: '君はどんなキャラ？',
    description: '〜自分を育てる育成ゲーム〜',
    message: '「自分のキャラは、自分で決めよう」',
    videoUrl: 'https://youtube.com/watch?v=stage3video',
    formUrl: 'https://forms.google.com/your-form-3',
    iconImage: 'https://via.placeholder.com/64x64/4169E1/FFFFFF?text=Sword',
    fallbackIcon: '⚔️'
  },
  4: {
    stageId: 4,
    status: 'locked',
    title: 'ちがうって、おもしろい',
    description: '〜正解がないから広がる世界〜',
    message: '「だれかと違うのは怖いことじゃない」',
    videoUrl: 'https://youtube.com/watch?v=stage4video',
    formUrl: 'https://forms.google.com/your-form-4',
    iconImage: 'https://via.placeholder.com/64x64/FFD700/000000?text=Shield',
    fallbackIcon: '🛡️'
  },
  5: {
    stageId: 5,
    status: 'locked',
    title: '「？」が世界をひらく',
    description: '〜ワクワク＆もやもや〜',
    message: '「"もやもや"がアイデアをつくる！！」',
    videoUrl: 'https://youtube.com/watch?v=stage5video',
    formUrl: 'https://forms.google.com/your-form-5',
    iconImage: 'https://via.placeholder.com/64x64/32CD32/FFFFFF?text=Team',
    fallbackIcon: '👥'
  },
  6: {
    stageId: 6,
    status: 'locked',
    title: 'つくってつたえると気づける',
    description: '〜違いを生かして未来を創る〜',
    message: '「小さな一歩が、大きな未来につながる」',
    videoUrl: 'https://youtube.com/watch?v=stage6video',
    formUrl: 'https://forms.google.com/your-form-6',
    iconImage: 'https://via.placeholder.com/64x64/8B0000/FFFFFF?text=Boss',
    fallbackIcon: '🏰'
  }
}

const defaultUserProgress: UserQuestProgress = {
  1: 'locked',
  2: 'locked',
  3: 'locked',
  4: 'locked',
  5: 'locked',
  6: 'locked'
}

const defaultStatistics: QuestStatistics = {
  totalStages: TOTAL_STAGES,
  completedStages: 0,
  currentStage: null,
  progressPercentage: 0,
  lastCompletedStage: null
}

// =====================================================
// ヘルパー関数
// =====================================================

function mapSupabaseStatusToStageStatus(supabaseStatus: string): StageStatus {
  switch (supabaseStatus) {
    case 'not_started':
      return 'locked'
    case 'in_progress':
      return 'current'
    case 'submitted':
      return 'pending_approval'
    case 'completed':
    case 'approved':
      return 'completed'
    default:
      return 'locked'
  }
}

function mapStageStatusToSupabaseStatus(stageStatus: StageStatus): QuestStatus {
  switch (stageStatus) {
    case 'locked':
      return 'not_started' as QuestStatus
    case 'current':
      return 'in_progress' as QuestStatus
    case 'pending_approval':
      return 'submitted' as QuestStatus
    case 'completed':
      return 'completed' as QuestStatus
    default:
      return 'not_started' as QuestStatus
  }
}

// =====================================================
// Zustandクエストストア
// =====================================================

export const useQuestStore = create<QuestState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // 初期状態
          userProgress: { ...defaultUserProgress },
          stageDetails: { ...defaultStageDetails },
          statistics: { ...defaultStatistics },
          isLoading: false,
          isSyncing: false,
          error: null,
          lastSyncTime: null,
          isInitialized: false,
          currentUserId: null,

          // =====================================================
          // 初期化
          // =====================================================
          initialize: async (userId?: string) => {
            set((state) => {
              state.isLoading = true
              state.error = null
              state.currentUserId = userId || null
            })

            try {
              if (userId) {
                // 認証済みユーザーの場合、Supabaseからデータを取得
                const supabase = createBrowserSupabaseClient()

                const { data: questProgress } = await supabase
                  .from('quest_progress')
                  .select('*')
                  .eq('user_id', userId)
                  .order('stage_id', { ascending: true })

                if (questProgress && questProgress.length > 0) {
                  // Supabaseからのデータを使用
                  const progress: UserQuestProgress = {}
                  const stageDetails: Record<number, StageProgress> = { ...defaultStageDetails }

                  questProgress.forEach((item) => {
                    const stageId = item.stage_id
                    const status = mapSupabaseStatusToStageStatus(item.status)
                    progress[stageId] = status

                    // ステージ詳細情報を更新
                    if (stageDetails[stageId]) {
                      stageDetails[stageId] = {
                        ...stageDetails[stageId],
                        status,
                        completedAt: item.approved_at || undefined,
                        submittedAt: item.submitted_at || undefined,
                        lastUpdated: item.updated_at || undefined
                      }
                    }
                  })

                  set((state) => {
                    state.userProgress = progress
                    state.stageDetails = stageDetails
                  })
                } else {
                  // 初回ユーザーの場合、ステージ1をアクセス可能にする
                  set((state) => {
                    state.userProgress = { ...defaultUserProgress, 1: 'current' }
                    state.stageDetails = {
                      ...defaultStageDetails,
                      1: { ...defaultStageDetails[1], status: 'current' }
                    }
                  })
                }
              } else {
                // デモモードの場合
                get().setDemoMode()
              }

              // 統計を計算
              const statistics = get().calculateStatistics()
              set((state) => {
                state.statistics = statistics
                state.isInitialized = true
                state.lastSyncTime = new Date().toISOString()
              })

            } catch (error) {
              console.error('クエストストア初期化エラー:', error)
              set((state) => {
                state.error = error instanceof Error ? error.message : '初期化に失敗しました'
              })
              // エラーが発生してもデモモードで表示
              get().setDemoMode()
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // ステージ進捗更新（楽観的更新）
          // =====================================================
          updateStageProgress: async (stageId: number, status: StageStatus, optimistic = true) => {
            const { currentUserId } = get()

            // 楽観的更新
            if (optimistic) {
              set((state) => {
                state.userProgress[stageId] = status
                if (state.stageDetails[stageId]) {
                  state.stageDetails[stageId].status = status
                  state.stageDetails[stageId].lastUpdated = new Date().toISOString()
                }
                state.statistics = get().calculateStatistics()
              })
            }

            if (!currentUserId) {
              // デモモードでは楽観的更新のみ
              return { success: true }
            }

            set((state) => {
              state.isSyncing = true
              state.error = null
            })

            try {
              const supabase = createBrowserSupabaseClient()
              const now = new Date().toISOString()
              const supabaseStatus = mapStageStatusToSupabaseStatus(status)

              const progressData = {
                user_id: currentUserId,
                stage_id: stageId,
                status: supabaseStatus,
                updated_at: now,
                ...(status === 'completed' && { approved_at: now }),
                ...(status === 'pending_approval' && { submitted_at: now })
              }

              await supabase
                .from('quest_progress')
                .upsert(progressData)

              set((state) => {
                state.lastSyncTime = now
              })

              return { success: true }

            } catch (error) {
              console.error('ステージ進捗更新エラー:', error)
              const errorMessage = error instanceof Error ? error.message : 'ステージ進捗の更新に失敗しました'

              // 楽観的更新を元に戻す
              if (optimistic) {
                await get().syncWithSupabase()
              }

              set((state) => {
                state.error = errorMessage
              })

              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isSyncing = false
              })
            }
          },

          // =====================================================
          // ステージ完了
          // =====================================================
          completeStage: async (stageId: number) => {
            const result = await get().updateStageProgress(stageId, 'completed')
            
            if (result.success) {
              // 次のステージをアンロック
              const nextStageId = stageId + 1
              if (nextStageId <= TOTAL_STAGES) {
                await get().updateStageProgress(nextStageId, 'current', false)
              }
            }

            return result
          },

          // =====================================================
          // ステージ提出
          // =====================================================
          submitStage: async (stageId: number, submissionData?: Record<string, any>) => {
            return await get().updateStageProgress(stageId, 'pending_approval')
          },

          // =====================================================
          // ステージ承認
          // =====================================================
          approveStage: async (stageId: number) => {
            const result = await get().completeStage(stageId)
            return result
          },

          // =====================================================
          // ステージ却下
          // =====================================================
          rejectStage: async (stageId: number, reason?: string) => {
            return await get().updateStageProgress(stageId, 'current')
          },

          // =====================================================
          // 進捗リセット
          // =====================================================
          resetProgress: async () => {
            const { currentUserId } = get()

            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              if (currentUserId) {
                const supabase = createBrowserSupabaseClient()
                
                // Supabaseからすべての進捗を削除
                await supabase
                  .from('quest_progress')
                  .delete()
                  .eq('user_id', currentUserId)
              }

              // ローカル状態をリセット
              set((state) => {
                state.userProgress = { ...defaultUserProgress, 1: 'current' }
                state.stageDetails = {
                  ...defaultStageDetails,
                  1: { ...defaultStageDetails[1], status: 'current' }
                }
                state.statistics = get().calculateStatistics()
                state.lastSyncTime = new Date().toISOString()
              })

              return { success: true }

            } catch (error) {
              console.error('進捗リセットエラー:', error)
              const errorMessage = error instanceof Error ? error.message : '進捗リセットに失敗しました'
              set((state) => {
                state.error = errorMessage
              })
              return { success: false, error: errorMessage }
            } finally {
              set((state) => {
                state.isLoading = false
              })
            }
          },

          // =====================================================
          // 統計計算
          // =====================================================
          calculateStatistics: () => {
            const { userProgress } = get()
            
            const totalStages = TOTAL_STAGES
            const completedStages = Object.values(userProgress).filter(status => status === 'completed').length
            const progressPercentage = Math.round((completedStages / totalStages) * 100)
            
            let currentStage: number | null = null
            let lastCompletedStage: number | null = null

            for (let i = 1; i <= totalStages; i++) {
              if (userProgress[i] === 'current' || userProgress[i] === 'pending_approval') {
                currentStage = i
              }
              if (userProgress[i] === 'completed') {
                lastCompletedStage = i
              }
            }

            return {
              totalStages,
              completedStages,
              currentStage,
              progressPercentage,
              lastCompletedStage
            }
          },

          // =====================================================
          // 次のアクセス可能ステージ取得
          // =====================================================
          getNextAvailableStage: () => {
            const { userProgress } = get()
            
            for (let i = 1; i <= TOTAL_STAGES; i++) {
              if (userProgress[i] === 'current' || userProgress[i] === 'pending_approval') {
                return i
              }
            }
            
            return null
          },

          // =====================================================
          // ステージアクセス権限チェック
          // =====================================================
          canAccessStage: (stageId: number) => {
            const { userProgress } = get()
            
            if (stageId < 1 || stageId > TOTAL_STAGES) {
              return false
            }

            const stageStatus = userProgress[stageId]
            return stageStatus !== 'locked'
          },

          // =====================================================
          // Supabaseとの同期
          // =====================================================
          syncWithSupabase: async () => {
            const { currentUserId } = get()
            
            if (!currentUserId) {
              return
            }

            set((state) => {
              state.isSyncing = true
              state.error = null
            })

            try {
              const supabase = createBrowserSupabaseClient()

              const { data: questProgress } = await supabase
                .from('quest_progress')
                .select('*')
                .eq('user_id', currentUserId)
                .order('stage_id', { ascending: true })

              if (questProgress) {
                const progress: UserQuestProgress = { ...defaultUserProgress }
                const stageDetails: Record<number, StageProgress> = { ...defaultStageDetails }

                questProgress.forEach((item) => {
                  const stageId = item.stage_id
                  const status = mapSupabaseStatusToStageStatus(item.status)
                  progress[stageId] = status

                  if (stageDetails[stageId]) {
                    stageDetails[stageId] = {
                      ...stageDetails[stageId],
                      status,
                      completedAt: item.approved_at || undefined,
                      submittedAt: item.submitted_at || undefined,
                      lastUpdated: item.updated_at || undefined
                    }
                  }
                })

                set((state) => {
                  state.userProgress = progress
                  state.stageDetails = stageDetails
                  state.statistics = get().calculateStatistics()
                  state.lastSyncTime = new Date().toISOString()
                })
              }

            } catch (error) {
              console.error('Supabase同期エラー:', error)
              set((state) => {
                state.error = error instanceof Error ? error.message : '同期に失敗しました'
              })
            } finally {
              set((state) => {
                state.isSyncing = false
              })
            }
          },

          // =====================================================
          // エラークリア
          // =====================================================
          clearError: () => {
            set((state) => {
              state.error = null
            })
          },

          // =====================================================
          // デモモード設定
          // =====================================================
          setDemoMode: () => {
            set((state) => {
              state.userProgress = { ...defaultUserProgress, 1: 'current' }
              state.stageDetails = {
                ...defaultStageDetails,
                1: { ...defaultStageDetails[1], status: 'current' }
              }
              state.statistics = get().calculateStatistics()
              state.currentUserId = null
              state.isInitialized = true
            })
          }
        }),
        {
          name: 'claft-quest-store',
          partialize: (state) => ({
            // ローカルストレージに保存する項目を制限
            userProgress: state.userProgress,
            lastSyncTime: state.lastSyncTime,
            isInitialized: state.isInitialized
          })
        }
      )
    ),
    {
      name: 'quest-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// =====================================================
// セレクター（便利関数）
// =====================================================

export const useQuestProgress = () => {
  const store = useQuestStore()
  return {
    // 状態
    userProgress: store.userProgress,
    stageDetails: store.stageDetails,
    statistics: store.statistics,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    error: store.error,
    isInitialized: store.isInitialized,
    
    // 派生状態
    currentStage: store.getNextAvailableStage(),
    canAccessStage: store.canAccessStage,
    
    // アクション
    initialize: store.initialize,
    updateStageProgress: store.updateStageProgress,
    completeStage: store.completeStage,
    submitStage: store.submitStage,
    clearError: store.clearError
  }
}

export const useQuestActions = () => {
  const store = useQuestStore()
  return {
    initialize: store.initialize,
    updateStageProgress: store.updateStageProgress,
    completeStage: store.completeStage,
    submitStage: store.submitStage,
    approveStage: store.approveStage,
    rejectStage: store.rejectStage,
    resetProgress: store.resetProgress,
    syncWithSupabase: store.syncWithSupabase,
    clearError: store.clearError
  }
}

export const useQuestStatistics = () => {
  const store = useQuestStore()
  return {
    statistics: store.statistics,
    calculateStatistics: store.calculateStatistics,
    getNextAvailableStage: store.getNextAvailableStage
  }
} 