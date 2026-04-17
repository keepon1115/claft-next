'use client'

import AppLayout from '../app-layout'

export default function PblPage() {
  return (
    <AppLayout>
      {/* AppLayout の p-6 pt-4 パディングを打ち消してiframeを端まで広げる */}
      <div className="-m-6 -mt-4">
        <iframe
          src="https://claft-hp.vercel.app/pbl?embed=true"
          style={{ width: '100%', height: 'calc(100vh - 80px)', border: 'none', display: 'block' }}
        />
      </div>
    </AppLayout>
  )
}
