'use client'

import { useEffect } from 'react'
import type { MemberGame } from '@/data/games'

// iframeゲーム再生モーダル。ゲーム(Godot/Scratch等)は重いので、
// 親側で game が null の間は本コンポーネント自体をマウントしないこと(閉じたらアンマウント)。

interface GamePlayerModalProps {
  game: MemberGame
  onClose: () => void
}

export default function GamePlayerModal({ game, onClose }: GamePlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden' // 背景スクロール無効化
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${game.title} を再生中`}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3 pb-2 px-1">
        <span
          className="font-bold tracking-widest text-[#2ee6ff] truncate"
          style={{ textShadow: '0 0 8px rgba(46,230,255,0.6)' }}
        >
          {game.title}
        </span>
        <span className="text-[10px] text-[#e8ecf8]/50 shrink-0">🔊 音が出ることがあるよ</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 w-9 h-9 grid place-items-center rounded-full border border-[#ff2e88]/60 text-[#ff8ab8] font-bold hover:bg-[#ff2e88]/20 transition-colors"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      {/* ゲーム画面(モーダル表示中のみマウントされる) */}
      <iframe
        src={game.url}
        title={game.title}
        allow="fullscreen; autoplay; gamepad"
        className="flex-1 w-full rounded-lg border-2 border-[#2ee6ff]/30 bg-black"
      />
    </div>
  )
}
