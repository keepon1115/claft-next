'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface TutorialState {
  active: boolean
  step: number
  completedAt: string | null
  completedByUserId: string | null
  welcomeSeenByUserId: string | null
  version: number

  // アクション
  start: (userId?: string | null) => void
  next: () => void
  goTo: (step: number) => void
  skipAndComplete: (userId?: string | null) => void
  complete: (userId?: string | null) => void
  stop: () => void
  markWelcomeSeen: (userId?: string | null) => void
}

export const ONBOARDING_VERSION = 1

export const useTutorialStore = create<TutorialState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          active: false,
          step: 0,
          completedAt: null,
          completedByUserId: null,
          welcomeSeenByUserId: null,
          version: ONBOARDING_VERSION,

          start: (userId?: string | null) => {
            // 既に完了済みでも、別ユーザーなら起動する
            const { completedAt, completedByUserId, version } = get()
            if (completedAt && completedByUserId && userId && completedByUserId === userId && version === ONBOARDING_VERSION) {
              return
            }
            set((state) => {
              state.active = true
              state.step = 0
              state.version = ONBOARDING_VERSION
            })
          },

          next: () => {
            set((state) => {
              state.step = state.step + 1
            })
          },

          goTo: (step: number) => {
            set((state) => {
              state.step = step
            })
          },

          skipAndComplete: (userId?: string | null) => {
            set((state) => {
              state.active = false
              state.completedAt = new Date().toISOString()
              state.completedByUserId = userId || null
            })
          },

          complete: (userId?: string | null) => {
            set((state) => {
              state.active = false
              state.completedAt = new Date().toISOString()
              state.completedByUserId = userId || null
            })
          },

          stop: () => {
            set((state) => {
              state.active = false
            })
          },

          markWelcomeSeen: (userId?: string | null) => {
            set((state) => {
              state.welcomeSeenByUserId = userId || null
            })
          }
        }),
        {
          name: 'claft-tutorial-store'
        }
      )
    ),
    { name: 'tutorial-store' }
  )
)


