'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function PblPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <HamburgerMenu
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <iframe
        src="https://claft-hp.vercel.app/pbl?embed=true"
        style={{ width: '100%', height: 'calc(100vh - 64px)', border: 'none' }}
      />
    </>
  )
}
