'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

interface PWAInstallPromptProps {
  autoShow?: boolean
  showDelay?: number
  className?: string
}

export default function PWAInstallPrompt({ 
  autoShow = true, 
  showDelay = 3000,
  className = '' 
}: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, isStandalone, install, clearInstallPrompt } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (isInstallable && autoShow && !dismissed && !isInstalled && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, showDelay)

      return () => clearTimeout(timer)
    }
  }, [isInstallable, autoShow, showDelay, dismissed, isInstalled, isStandalone])

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const success = await install()
      if (success) {
        setShowPrompt(false)
        clearInstallPrompt()
      }
    } catch (error) {
      console.error('インストールエラー:', error)
    } finally {
      setInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    clearInstallPrompt()
  }

  if (!isInstallable || isInstalled || isStandalone || dismissed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full ${className}`}>
        <div className="relative p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Download size={32} className="text-white" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">CLAFTアプリをインストール</h3>
            <p className="text-gray-600 mb-6">ホーム画面に追加して、より快適に！</p>
            
            <div className="space-y-3">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
              >
                {installing ? 'インストール中...' : 'インストール'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 