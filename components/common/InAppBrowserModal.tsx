'use client'

import React, { useEffect, useRef, useState } from 'react'

type InAppBrowserModalProps = {
  isOpen: boolean
  onClose: () => void
  url: string
  title?: string
}

export default function InAppBrowserModal({ isOpen, onClose, url, title }: InAppBrowserModalProps) {
  const [loaded, setLoaded] = useState(false)
  const [suspectedBlocked, setSuspectedBlocked] = useState(false)
  const loadTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setLoaded(false)
    setSuspectedBlocked(false)
    // 一定時間でロードされなければブロックを疑う
    loadTimerRef.current = window.setTimeout(() => {
      setSuspectedBlocked(true)
    }, 2000)
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
    }
  }, [isOpen, url])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white border-4 border-gray-800 rounded-xl w-[min(1000px,95vw)] h-[min(80vh,90vh)] mx-4 p-0 relative overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b-4 border-gray-800 bg-gray-100">
          <h2 className="text-lg font-black text-gray-800 truncate">{title || '外部サイト'}</h2>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-blue-600 text-white text-xs font-bold border-2 border-blue-900 rounded hover:bg-blue-700"
            >
              別タブで開く
            </a>
            <button aria-label="閉じる" className="w-8 h-8 bg-red-600 text-white border-2 border-red-900 rounded hover:bg-red-700" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="relative w-full h-[calc(100%-44px)]">
          <iframe
            title={title || 'external'}
            src={url}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={() => {
              setLoaded(true)
              if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
            }}
          />
          {/* 埋め込みがブロックされた可能性のフォールバック */}
          {!loaded && suspectedBlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
              <div className="text-5xl">🧱</div>
              <p className="text-sm text-gray-700 px-6 text-center">
                このサイトはセキュリティ設定によりアプリ内表示(iframe)がブロックされています。
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-sm font-bold border-2 border-blue-900 rounded hover:bg-blue-700"
              >
                別タブで開く
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


