'use client'

import type { MemberGame } from '@/data/games'

// アーケード筐体風カード。上部マーキー(タイトル)+スクリーン部+INSERT COINボタン。
// url が '' のゲームは画面消灯の COMING SOON 筐体になる。

interface GameCabinetProps {
  game: MemberGame
  onPlay: (game: MemberGame) => void
}

export default function GameCabinet({ game, onPlay }: GameCabinetProps) {
  const isComingSoon = !game.url

  if (isComingSoon) {
    return (
      <div className="rounded-2xl border-2 border-[#2ee6ff]/15 bg-[#12121f] p-3 opacity-70 select-none">
        <div className="rounded-lg bg-[#0a0a12] border border-[#2ee6ff]/10 px-3 py-2 text-center">
          <span className="text-sm font-bold tracking-widest text-[#e8ecf8]/30">{game.title}</span>
        </div>
        {/* 消灯したスクリーン */}
        <div className="mt-3 aspect-video rounded-lg bg-black border border-[#e8ecf8]/10 grid place-items-center">
          <span className="text-xs font-bold tracking-[0.3em] text-[#e8ecf8]/25 animate-pulse">
            COMING SOON
          </span>
        </div>
        <div className="mt-3 rounded-full border border-[#e8ecf8]/10 py-2 text-center text-xs font-bold tracking-widest text-[#e8ecf8]/25">
          PREPARING...
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onPlay(game)}
      className="group w-full text-left rounded-2xl border-2 border-[#ff2e88]/40 bg-[#12121f] p-3 transition-all duration-300 hover:border-[#ff2e88] hover:shadow-[0_0_24px_rgba(255,46,136,0.35)] hover:-translate-y-1 focus:outline-none focus:border-[#2ee6ff]"
    >
      {/* マーキー(タイトル看板) */}
      <div className="rounded-lg bg-[#0a0a12] border border-[#2ee6ff]/30 px-3 py-2 text-center">
        <span
          className="text-sm font-bold tracking-widest text-[#2ee6ff] truncate block"
          style={{ textShadow: '0 0 8px rgba(46,230,255,0.6)' }}
        >
          {game.title}
        </span>
      </div>

      {/* スクリーン部 */}
      <div className="mt-3 aspect-video rounded-lg bg-black border border-[#e8ecf8]/15 overflow-hidden grid place-items-center">
        {game.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl group-hover:scale-110 transition-transform">🎮</span>
        )}
      </div>

      {/* 作者・説明 */}
      <div className="mt-3 px-1 min-h-[2.5rem]">
        <p className="text-xs text-[#e8ecf8]/60">
          made by <span className="font-bold text-[#e8ecf8]/90">{game.author}</span>
        </p>
        {game.description && (
          <p className="mt-0.5 text-xs text-[#e8ecf8]/45 leading-5 line-clamp-2">{game.description}</p>
        )}
      </div>

      {/* INSERT COIN */}
      <div
        className="mt-2 rounded-full border border-[#ff2e88]/60 bg-[#ff2e88]/10 py-2 text-center text-xs font-bold tracking-widest text-[#ff8ab8] group-hover:bg-[#ff2e88]/25 group-hover:text-white transition-colors"
        style={{ textShadow: '0 0 6px rgba(255,46,136,0.6)' }}
      >
        ▶ INSERT COIN {game.playMode === 'external' && '↗'}
      </div>
    </button>
  )
}
