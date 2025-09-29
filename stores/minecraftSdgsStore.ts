'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createBrowserSupabaseClient, safeSupabaseQuery } from '@/lib/supabase/client'
import {
  fetchMinecraftSdgsStages,
  fetchUserMinecraftSdgsProgress,
  fetchUserMinecraftSdgsStats,
  initializeUserStats,
  markSdgsVideoWatched,
  markSdgsWorkCompleted,
  markProgrammingVideoWatched,
  markProgrammingWorkCompleted,
  markStageCompleted,
  unlockNextStage,
  generateDemoStats,
  type MinecraftSdgsProgressRow,
  type MinecraftSdgsStageRow,
  type MinecraftSdgsStatsRow
} from '@/lib/api/minecraft-sdgs'

// =====================================================
// マイクラSDGsストアの型定義
// =====================================================

export type MinecraftStageStatus = 'locked' | 'current' | 'sdgs_video_watched' | 'sdgs_work_completed' | 'programming_video_watched' | 'programming_work_completed' | 'completed' | 'pending_approval'

export interface MinecraftStageProgress {
  stageId: number
  status: MinecraftStageStatus
  title: string
  description: string
  sdgsWorkUrl?: string // SDGsワーク動画URL
  sdgsFormUrl?: string // SDGsワーク回答フォームURL
  sdgsSupportPrintUrl?: string // SDGsワーク補助プリントURL
  sdgsStageDownloadUrl?: string // 発表ステージダウンロードURL（新規）
  programmingWorkUrl?: string // マイクラワーク動画URL
  programmingFormUrl?: string // マイクラワーク回答フォームURL
  programmingSupportPrintUrl?: string // マイクラワーク補助プリントURL
  programmingApDojoUrl?: string // AP道場ダウンロードURL（新規）
  message: string
  iconImage?: string
  iconUrl?: string
  fallbackIcon: string
  sdgsGoal?: number // 対応するSDGs目標番号（1-17、またはウェディングケーキモデルなら0）
  completedAt?: string
  submittedAt?: string
  lastUpdated?: string
}

export interface MinecraftUserProgress {
  [stageId: number]: MinecraftStageStatus
}

export interface MinecraftStatistics {
  totalStages: number
  completedStages: number
  currentStage: number | null
  progressPercentage: number
  lastCompletedStage: number | null
  sdgsGoalsCompleted: number[] // 完了済みSDGs目標のリスト
}

interface MinecraftSdgsState {
  // 状態
  userProgress: MinecraftUserProgress
  stageDetails: Record<number, MinecraftStageProgress>
  statistics: MinecraftStatistics
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  lastSyncTime: string | null
  isInitialized: boolean
  currentUserId: string | null

  // アクション
  initialize: (userId?: string) => Promise<void>
  updateStageProgress: (stageId: number, status: MinecraftStageStatus, optimistic?: boolean) => Promise<{ success: boolean; error?: string }>
  completeStage: (stageId: number) => Promise<{ success: boolean; error?: string }>
  watchSdgsVideo: (stageId: number) => Promise<{ success: boolean; error?: string }>
  completeSdgsWork: (stageId: number) => Promise<{ success: boolean; error?: string }>
  watchProgrammingVideo: (stageId: number) => Promise<{ success: boolean; error?: string }>
  completeProgrammingWork: (stageId: number) => Promise<{ success: boolean; error?: string }>
  resetProgress: () => Promise<{ success: boolean; error?: string }>
  calculateStatistics: () => MinecraftStatistics
  getNextAvailableStage: () => number | null
  canAccessStage: (stageId: number) => boolean
  syncWithSupabase: () => Promise<void>
  clearError: () => void
  setDemoMode: () => void
}

// =====================================================
// デフォルト値とスタティックデータ
// =====================================================

const TOTAL_STAGES = 19

const defaultStageDetails: Record<number, MinecraftStageProgress> = {
  1: {
    stageId: 1,
    status: 'locked',
    title: 'SDGsって何だろう？',
    description: '〜ウェディングケーキモデルで全体像を理解しよう(前編)〜',
    message: 'SDGsの基本を学ぼう！',
    sdgsWorkUrl: 'https://youtu.be/fryzvmt_cN8',
    sdgsFormUrl: 'https://forms.gle/DXPLF6bZB3Wo26pVA',
    sdgsSupportPrintUrl: 'https://www.canva.com/design/DAGxDTjOMo8/irXI-r2wI1O2cIPO74cd2Q/edit?utm_content=DAGxDTjOMo8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton',
    programmingWorkUrl: 'https://youtu.be/fryzvmt_cN8',
    programmingFormUrl: 'https://forms.gle/3aqJuMPhjtL9bkAe7',
    programmingSupportPrintUrl: 'https://www.canva.com/design/DAGyoEbJUe0/JXH-kgcYUifhlFI1-EnTJg/edit?utm_content=DAGyoEbJUe0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton',
    fallbackIcon: '🌍',
    sdgsGoal: 0 // ウェディングケーキモデル
  },
  2: {
    stageId: 2,
    status: 'locked',
    title: 'SDGsって何だろう？',
    description: '〜ウェディングケーキモデルで全体像を理解しよう(後編)〜',
    message: 'SDGsの構造を深く理解しよう！',
    sdgsWorkUrl: 'https://youtu.be/fryzvmt_cN8',
    sdgsFormUrl: 'https://forms.gle/DXPLF6bZB3Wo26pVA',
    sdgsSupportPrintUrl: 'https://example.com/stage-2-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/fryzvmt_cN8',
    programmingFormUrl: 'https://forms.gle/3aqJuMPhjtL9bkAe7',
    programmingSupportPrintUrl: 'https://example.com/stage-2-programming-support',
    fallbackIcon: '🎂',
    sdgsGoal: 0 // ウェディングケーキモデル
  },
  3: {
    stageId: 3,
    status: 'locked',
    title: '貧困をなくそう',
    description: '〜SDGs目標1〜',
    message: '世界から貧困をなくす方法を考えよう！',
    sdgsWorkUrl: 'https://youtu.be/sample3-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample3-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-3-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample3-programming',
    programmingFormUrl: 'https://forms.gle/sample3-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-3-programming-support',
    fallbackIcon: '🏠',
    sdgsGoal: 1
  },
  4: {
    stageId: 4,
    status: 'locked',
    title: '飢餓をゼロに',
    description: '〜SDGs目標2〜',
    message: '食料問題を解決する技術を学ぼう！',
    sdgsWorkUrl: 'https://youtu.be/sample4-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample4-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-4-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample4-programming',
    programmingFormUrl: 'https://forms.gle/sample4-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-4-programming-support',
    fallbackIcon: '🌾',
    sdgsGoal: 2
  },
  5: {
    stageId: 5,
    status: 'locked',
    title: 'すべての人に健康と福祉を',
    description: '〜SDGs目標3〜',
    message: 'ヘルステックで世界を変えよう！',
    sdgsWorkUrl: 'https://youtu.be/sample5-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample5-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-5-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample5-programming',
    programmingFormUrl: 'https://forms.gle/sample5-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-5-programming-support',
    fallbackIcon: '⚕️',
    sdgsGoal: 3
  },
  6: {
    stageId: 6,
    status: 'locked',
    title: '質の高い教育をみんなに',
    description: '〜SDGs目標4〜',
    message: 'EdTechで教育を革新しよう！',
    sdgsWorkUrl: 'https://youtu.be/sample6-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample6-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-6-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample6-programming',
    programmingFormUrl: 'https://forms.gle/sample6-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-6-programming-support',
    fallbackIcon: '📚',
    sdgsGoal: 4
  },
  7: {
    stageId: 7,
    status: 'locked',
    title: 'ジェンダー平等を実現しよう',
    description: '〜SDGs目標5〜',
    message: '平等な社会をプログラミングで実現！',
    sdgsWorkUrl: 'https://youtu.be/sample7-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample7-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-7-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample7-programming',
    programmingFormUrl: 'https://forms.gle/sample7-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-7-programming-support',
    fallbackIcon: '⚖️',
    sdgsGoal: 5
  },
  8: {
    stageId: 8,
    status: 'locked',
    title: '安全な水とトイレを世界中に',
    description: '〜SDGs目標6〜',
    message: 'クリーンウォーター技術を開発しよう！',
    sdgsWorkUrl: 'https://youtu.be/sample8-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample8-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-8-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample8-programming',
    programmingFormUrl: 'https://forms.gle/sample8-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-8-programming-support',
    fallbackIcon: '💧',
    sdgsGoal: 6
  },
  9: {
    stageId: 9,
    status: 'locked',
    title: 'エネルギーをみんなにそしてクリーンに',
    description: '〜SDGs目標7〜',
    message: '再生可能エネルギーをプログラミング！',
    sdgsWorkUrl: 'https://youtu.be/sample9-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample9-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-9-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample9-programming',
    programmingFormUrl: 'https://forms.gle/sample9-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-9-programming-support',
    fallbackIcon: '⚡',
    sdgsGoal: 7
  },
  10: {
    stageId: 10,
    status: 'locked',
    title: '働きがいも経済成長も',
    description: '〜SDGs目標8〜',
    message: 'ワークテックで働き方を変革！',
    sdgsWorkUrl: 'https://youtu.be/sample10-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample10-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-10-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample10-programming',
    programmingFormUrl: 'https://forms.gle/sample10-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-10-programming-support',
    fallbackIcon: '💼',
    sdgsGoal: 8
  },
  11: {
    stageId: 11,
    status: 'locked',
    title: '産業と技術革新の基盤をつくろう',
    description: '〜SDGs目標9〜',
    message: 'イノベーションでインフラを構築！',
    sdgsWorkUrl: 'https://youtu.be/sample11-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample11-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-11-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample11-programming',
    programmingFormUrl: 'https://forms.gle/sample11-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-11-programming-support',
    fallbackIcon: '🏭',
    sdgsGoal: 9
  },
  12: {
    stageId: 12,
    status: 'locked',
    title: '人や国の不平等をなくそう',
    description: '〜SDGs目標10〜',
    message: 'テクノロジーで格差を解消！',
    sdgsWorkUrl: 'https://youtu.be/sample12-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample12-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-12-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample12-programming',
    programmingFormUrl: 'https://forms.gle/sample12-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-12-programming-support',
    fallbackIcon: '🤝',
    sdgsGoal: 10
  },
  13: {
    stageId: 13,
    status: 'locked',
    title: '住み続けられるまちづくりを',
    description: '〜SDGs目標11〜',
    message: 'スマートシティをプログラミング！',
    sdgsWorkUrl: 'https://youtu.be/sample13-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample13-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-13-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample13-programming',
    programmingFormUrl: 'https://forms.gle/sample13-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-13-programming-support',
    fallbackIcon: '🏙️',
    sdgsGoal: 11
  },
  14: {
    stageId: 14,
    status: 'locked',
    title: 'つくる責任 つかう責任',
    description: '〜SDGs目標12〜',
    message: 'サステナブルなプロダクトを開発！',
    sdgsWorkUrl: 'https://youtu.be/sample14-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample14-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-14-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample14-programming',
    programmingFormUrl: 'https://forms.gle/sample14-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-14-programming-support',
    fallbackIcon: '♻️',
    sdgsGoal: 12
  },
  15: {
    stageId: 15,
    status: 'locked',
    title: '気候変動に具体的な対策を',
    description: '〜SDGs目標13〜',
    message: 'クライメートテックで地球を守ろう！',
    sdgsWorkUrl: 'https://youtu.be/sample15-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample15-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-15-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample15-programming',
    programmingFormUrl: 'https://forms.gle/sample15-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-15-programming-support',
    fallbackIcon: '🌡️',
    sdgsGoal: 13
  },
  16: {
    stageId: 16,
    status: 'locked',
    title: '海の豊かさを守ろう',
    description: '〜SDGs目標14〜',
    message: 'オーシャンテックで海を救おう！',
    sdgsWorkUrl: 'https://youtu.be/sample16-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample16-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-16-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample16-programming',
    programmingFormUrl: 'https://forms.gle/sample16-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-16-programming-support',
    fallbackIcon: '🌊',
    sdgsGoal: 14
  },
  17: {
    stageId: 17,
    status: 'locked',
    title: '陸の豊かさも守ろう',
    description: '〜SDGs目標15〜',
    message: 'グリーンテックで自然を保護！',
    sdgsWorkUrl: 'https://youtu.be/sample17-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample17-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-17-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample17-programming',
    programmingFormUrl: 'https://forms.gle/sample17-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-17-programming-support',
    fallbackIcon: '🌳',
    sdgsGoal: 15
  },
  18: {
    stageId: 18,
    status: 'locked',
    title: '平和と公正をすべての人に',
    description: '〜SDGs目標16〜',
    message: 'リーガルテックで正義を実現！',
    sdgsWorkUrl: 'https://youtu.be/sample18-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample18-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-18-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample18-programming',
    programmingFormUrl: 'https://forms.gle/sample18-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-18-programming-support',
    fallbackIcon: '⚖️',
    sdgsGoal: 16
  },
  19: {
    stageId: 19,
    status: 'locked',
    title: 'パートナーシップで目標を達成しよう',
    description: '〜SDGs目標17〜',
    message: 'グローバルな協力をテクノロジーで！',
    sdgsWorkUrl: 'https://youtu.be/sample19-sdgs',
    sdgsFormUrl: 'https://forms.gle/sample19-sdgs',
    sdgsSupportPrintUrl: 'https://example.com/stage-19-sdgs-support',
    programmingWorkUrl: 'https://youtu.be/sample19-programming',
    programmingFormUrl: 'https://forms.gle/sample19-programming',
    programmingSupportPrintUrl: 'https://example.com/stage-19-programming-support',
    fallbackIcon: '🤝',
    sdgsGoal: 17
  }
}

// =====================================================
// Zustandストア作成
// =====================================================

export const useMinecraftSdgsStore = create<MinecraftSdgsState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初期状態
        userProgress: {},
        stageDetails: defaultStageDetails,
        statistics: {
          totalStages: TOTAL_STAGES,
          completedStages: 0,
          currentStage: null,
          progressPercentage: 0,
          lastCompletedStage: null,
          sdgsGoalsCompleted: []
        },
        isLoading: false,
        isSyncing: false,
        error: null,
        lastSyncTime: null,
        isInitialized: false,
        currentUserId: null,

        // アクション実装
        initialize: async (userId?: string) => {
          const currentState = get()
          
          // 既に初期化済みで、同じユーザーまたはデモモードの場合はスキップ
          if (currentState.isInitialized) {
            if (userId && currentState.currentUserId === userId) {
              console.log('MinecraftSDGs: 既に同じユーザーで初期化済み、スキップ')
              return
            }
            if (!userId && !currentState.currentUserId) {
              console.log('MinecraftSDGs: 既にデモモードで初期化済み、スキップ')
              return
            }
          }

          // ローディング中はスキップ
          if (currentState.isLoading) {
            console.log('MinecraftSDGs: 既にローディング中、スキップ')
            return
          }

          console.log('MinecraftSDGs: 初期化開始', { userId, isInitialized: currentState.isInitialized })
          
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            if (userId) {
              set((state) => {
                state.currentUserId = userId
              })
              
              // Supabaseからデータを取得
              await get().syncWithSupabase()
            } else {
              // デモモードの設定
              get().setDemoMode()
            }

            set((state) => {
              state.isInitialized = true
              state.isLoading = false
            })
            
            console.log('MinecraftSDGs: 初期化完了')
          } catch (error) {
            console.error('MinecraftSDGs初期化エラー:', error)
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Unknown error'
              state.isLoading = false
              state.isInitialized = true
            })
            // エラー時はデモモードにフォールバック（setの外で実行）
            get().setDemoMode()
          }
        },

        updateStageProgress: async (stageId: number, status: MinecraftStageStatus, optimistic = true) => {
          const { currentUserId } = get()
          
          if (!currentUserId) {
            return { success: false, error: 'ユーザーがログインしていません' }
          }

          if (optimistic) {
            set((state) => {
              state.userProgress[stageId] = status
              if (state.stageDetails[stageId]) {
                state.stageDetails[stageId].status = status
              }
              state.statistics = get().calculateStatistics()
            })
          }

          try {
            // Supabaseに保存
            let apiCall: Promise<MinecraftSdgsProgressRow>
            
            switch (status) {
              case 'sdgs_video_watched':
                apiCall = markSdgsVideoWatched(currentUserId, stageId)
                break
              case 'sdgs_work_completed':
                apiCall = markSdgsWorkCompleted(currentUserId, stageId)
                break
              case 'programming_video_watched':
                apiCall = markProgrammingVideoWatched(currentUserId, stageId)
                break
              case 'programming_work_completed':
                apiCall = markProgrammingWorkCompleted(currentUserId, stageId)
                break
              case 'completed':
                apiCall = markStageCompleted(currentUserId, stageId)
                // ステージ完了時は次のステージを解放
                await unlockNextStage(currentUserId, stageId)
                break
              default:
                throw new Error(`未対応のステータス: ${status}`)
            }

            await apiCall
            
            // 統計を再同期
            await get().syncWithSupabase()
            
            return { success: true }
          } catch (error) {
            console.error('進捗更新エラー:', error)
            
            // ロールバック
            if (optimistic) {
              set((state) => {
                const previousStatus = Object.entries(state.userProgress)
                  .find(([id, _]) => parseInt(id) === stageId)?.[1] || 'locked'
                state.userProgress[stageId] = previousStatus
                if (state.stageDetails[stageId]) {
                  state.stageDetails[stageId].status = previousStatus
                }
                state.statistics = get().calculateStatistics()
              })
            }
            
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
          }
        },

        watchSdgsVideo: async (stageId: number) => {
          return await get().updateStageProgress(stageId, 'sdgs_video_watched')
        },

        completeSdgsWork: async (stageId: number) => {
          return await get().updateStageProgress(stageId, 'sdgs_work_completed')
        },

        watchProgrammingVideo: async (stageId: number) => {
          return await get().updateStageProgress(stageId, 'programming_video_watched')
        },

        completeProgrammingWork: async (stageId: number) => {
          return await get().updateStageProgress(stageId, 'programming_work_completed')
        },

        completeStage: async (stageId: number) => {
          return await get().updateStageProgress(stageId, 'completed')
        },

        resetProgress: async () => {
          try {
            set((state) => {
              state.userProgress = {}
              state.stageDetails = { ...defaultStageDetails }
              state.statistics = get().calculateStatistics()
            })
            return { success: true }
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
          }
        },

        calculateStatistics: () => {
          const { userProgress } = get()
          const completedStages = Object.values(userProgress).filter(status => status === 'completed').length
          const sdgsGoalsCompleted = Object.entries(userProgress)
            .filter(([_, status]) => status === 'completed')
            .map(([stageIdStr, _]) => {
              const stageId = parseInt(stageIdStr)
              const stage = defaultStageDetails[stageId]
              return stage?.sdgsGoal || 0
            })
            .filter(goal => goal > 0) // ウェディングケーキモデル(0)は除外

          const currentStageId = Object.entries(userProgress)
            .filter(([_, status]) => status !== 'completed' && status !== 'locked')
            .map(([stageIdStr, _]) => parseInt(stageIdStr))
            .sort((a, b) => a - b)[0] || (completedStages < TOTAL_STAGES ? completedStages + 1 : null)

          return {
            totalStages: TOTAL_STAGES,
            completedStages,
            currentStage: currentStageId,
            progressPercentage: Math.round((completedStages / TOTAL_STAGES) * 100),
            lastCompletedStage: completedStages > 0 ? completedStages : null,
            sdgsGoalsCompleted: [...new Set(sdgsGoalsCompleted)] // 重複除去
          }
        },

        getNextAvailableStage: () => {
          const { userProgress } = get()
          const completedStages = Object.values(userProgress).filter(status => status === 'completed').length
          return completedStages < TOTAL_STAGES ? completedStages + 1 : null
        },

        canAccessStage: (stageId: number) => {
          const { userProgress } = get()
          const completedStages = Object.values(userProgress).filter(status => status === 'completed').length
          return stageId <= completedStages + 1
        },

        syncWithSupabase: async () => {
          const { currentUserId } = get()
          
          if (!currentUserId) {
            console.warn('ユーザーIDが設定されていないため、同期をスキップします')
            return
          }

          set((state) => {
            state.isSyncing = true
          })

          try {
            // ステージ定義を取得
            const stages = await fetchMinecraftSdgsStages()
            
            // ユーザー進捗を取得
            const progressData = await fetchUserMinecraftSdgsProgress(currentUserId)
            
            // ユーザー統計を取得（存在しない場合は初期化）
            let statsData = await fetchUserMinecraftSdgsStats(currentUserId)
            if (!statsData) {
              statsData = await initializeUserStats(currentUserId)
            }

            // ステージ詳細とユーザー進捗をマージ
            const stageDetails: Record<number, MinecraftStageProgress> = {}
            const userProgress: MinecraftUserProgress = {}

            stages.forEach((stage) => {
              const progress = progressData.find(p => p.stage_id === stage.id)
              const status = progress?.status as MinecraftStageStatus || 'locked'
              
              // ステージ1は常にcurrentに設定（アクセス可能）
              const finalStatus = stage.id === 1 && status === 'locked' ? 'current' : status
              
              // 既定の定義をベースに、バックエンド値で上書き（欠落値は既定を使う）
              const defaults = defaultStageDetails[stage.id] || ({} as MinecraftStageProgress)
              stageDetails[stage.id] = {
                stageId: stage.id,
                status: finalStatus,
                title: stage.title || defaults.title,
                description: stage.description || defaults.description,
                message: stage.message || defaults.message,
                // ステージ1は常にローカル定義を優先（指定URLの保証）
                sdgsWorkUrl: stage.id === 1 ? defaults.sdgsWorkUrl : (stage.sdgs_work_video_url || defaults.sdgsWorkUrl),
                sdgsFormUrl: stage.id === 1 ? defaults.sdgsFormUrl : (stage.sdgs_form_url || defaults.sdgsFormUrl),
                sdgsSupportPrintUrl: (stage as any).sdgs_support_print_url || defaults.sdgsSupportPrintUrl,
                sdgsStageDownloadUrl: (stage as any).sdgs_stage_download_url || defaults.sdgsStageDownloadUrl,
                programmingWorkUrl: stage.id === 1 ? defaults.programmingWorkUrl : (stage.programming_work_video_url || defaults.programmingWorkUrl),
                programmingFormUrl: stage.id === 1 ? defaults.programmingFormUrl : (stage.programming_form_url || defaults.programmingFormUrl),
                programmingSupportPrintUrl: (stage as any).programming_support_print_url || defaults.programmingSupportPrintUrl,
                programmingApDojoUrl: (stage as any).programming_ap_dojo_url || defaults.programmingApDojoUrl,
                iconUrl: stage.icon_url || defaults.iconUrl,
                fallbackIcon: stage.fallback_icon || defaults.fallbackIcon,
                sdgsGoal: stage.sdgs_goal || defaults.sdgsGoal,
                completedAt: progress?.completed_at || undefined,
                submittedAt: progress?.sdgs_form_submitted_at || progress?.programming_form_submitted_at || undefined,
                lastUpdated: progress?.updated_at || undefined
              }
              
              userProgress[stage.id] = finalStatus
            })

            // 統計データの変換
            const statistics: MinecraftStatistics = {
              totalStages: statsData.total_stages,
              completedStages: statsData.completed_stages,
              currentStage: statsData.current_stage,
              progressPercentage: statsData.progress_percentage,
              lastCompletedStage: statsData.completed_stages > 0 ? statsData.completed_stages : null,
              sdgsGoalsCompleted: statsData.sdgs_goals_completed || []
            }

            // 状態を更新
            set((state) => {
              state.stageDetails = stageDetails
              state.userProgress = userProgress
              state.statistics = statistics
              state.lastSyncTime = new Date().toISOString()
              state.error = null
            })

          } catch (error) {
            console.error('Supabase同期エラー:', error)
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Sync failed'
            })
          } finally {
            set((state) => {
              state.isSyncing = false
            })
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null
          })
        },

        setDemoMode: () => {
          const demoStats = generateDemoStats()
          
          set((state) => {
            state.userProgress = {}
            // 深いコピーでdefaultStageDetailsをコピー
            state.stageDetails = {}
            Object.entries(defaultStageDetails).forEach(([key, stageDetail]) => {
              state.stageDetails[parseInt(key)] = {
                ...stageDetail,
                status: parseInt(key) === 1 ? 'current' : 'locked' // ステージ1のみアクセス可能
              }
            })
            state.statistics = {
              totalStages: demoStats.total_stages,
              completedStages: demoStats.completed_stages,
              currentStage: demoStats.current_stage,
              progressPercentage: demoStats.progress_percentage,
              lastCompletedStage: demoStats.last_stage_completed_at ? demoStats.completed_stages : null,
              sdgsGoalsCompleted: demoStats.sdgs_goals_completed
            }
            state.currentUserId = null
            state.isInitialized = true
            state.error = null
          })
        }
      })),
      {
        name: 'minecraft-sdgs-store',
        partialize: (state) => ({
          userProgress: state.userProgress,
          lastSyncTime: state.lastSyncTime,
          currentUserId: state.currentUserId
        }),
      }
    ),
    {
      name: 'minecraft-sdgs-store',
    }
  )
)