'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { LockedContent } from '@/components/common/LockedContent'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'

const DynamicCraftStory = dynamic(() => import('@/components/home/CraftStory'), { ssr: false })
const DynamicJibunCraft = dynamic(() => import('@/components/home/JibunCraft'), { ssr: false })

export default function MyselfStoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAdmin, user } = useAuth()
  const { statistics, initialize } = useQuestStore()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    initialize(user?.id)
  }, [user?.id, initialize])

  const isLocked = !isAdmin && statistics.completedStages < 12

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen relative bg-[#faf6ee] bg-[radial-gradient(#2d5a3d0d_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[#2d5a3d] bg-[#c9a227]/10 border border-[#c9a227]/40 rounded-full px-3 py-1 font-bold text-xs tracking-wide">
                📜 標本記録
              </div>
              <h1 className="mt-3 font-serif text-3xl md:text-4xl font-black text-[#2d5a3d] tracking-wide">
                きみの冒険の書
              </h1>
              <p className="mt-2 text-[#2d5a3d]/70 font-serif">
                目標とこれまでの歩みを書きとめよう
              </p>
            </div>

            <div className="space-y-6">
              <LockedContent
                isLocked={isLocked}
                unlockConditionText={<>このエリアはクエスト12をクリアすると開放されます</>}
              >
                <DynamicCraftStory />
              </LockedContent>
              <LockedContent
                isLocked={isLocked}
                unlockConditionText={<>このエリアはクエスト12をクリアすると開放されます</>}
              >
                <DynamicJibunCraft />
              </LockedContent>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
