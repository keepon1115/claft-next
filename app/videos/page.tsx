'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import {
  CURRICULUM_VIDEOS,
  CATEGORY_META,
  CATEGORY_ORDER,
  type CurriculumVideo,
  type VideoCategory,
} from '@/data/curriculum-videos'

// 既存ページへ遷移する特別カード(棚の先頭に置く)。実装は動かさずリンクのみ
const SPECIAL_CARDS: Partial<Record<VideoCategory, { label: string; href: string; icon: string }>> = {
  minecraft: { label: 'マイクラSDGs\nワールドへ', href: '/minecraft-sdgs', icon: '⛏️' },
  robot: { label: 'ロボクエストへ', href: '/robo', icon: '🤖' },
}

const GOLD = '#f5d76e'

function thumbnailOf(video: CurriculumVideo): string | undefined {
  if (video.thumbnail) return video.thumbnail
  if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
  return undefined
}

/* ポスターカード(縦長サムネ+タイトルプレート) */
function PosterCard({ video, onPlay }: { video: CurriculumVideo; onPlay: (v: CurriculumVideo) => void }) {
  const thumb = thumbnailOf(video)

  const inner = (
    <>
      <div className="relative h-[60%] bg-[#0a0b0f] overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-4xl">🎬</div>
        )}
        <span className="absolute inset-0 grid place-items-center">
          <span className="w-11 h-11 grid place-items-center rounded-full bg-black/60 border border-[#f5d76e]/60 text-[#f5d76e] text-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
            ▶
          </span>
        </span>
      </div>
      <div className="h-[40%] px-3 py-2 flex flex-col justify-between bg-gradient-to-b from-[#1a1c24] to-[#111318]">
        <p className="text-sm font-bold text-[#f2f0e8] leading-snug line-clamp-2">{video.title}</p>
        {video.description && (
          <p className="text-[10px] text-[#f2f0e8]/50 leading-4 line-clamp-2">{video.description}</p>
        )}
      </div>
    </>
  )

  const cardClass =
    'group snap-start shrink-0 w-36 sm:w-44 aspect-[2/3] rounded-lg overflow-hidden border border-[#f5d76e]/25 bg-[#111318] text-left transition-all duration-300 hover:border-[#f5d76e] hover:shadow-[0_0_24px_rgba(245,215,110,0.25)] hover:-translate-y-1'

  // youtubeIdなし(url指定)は新しいタブで開く。youtubeIdありはモーダル再生
  if (!video.youtubeId && video.url) {
    return (
      <a href={video.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={() => onPlay(video)} className={cardClass}>
      {inner}
    </button>
  )
}

/* 既存ページへの特別カード */
function SpecialCard({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group snap-start shrink-0 w-36 sm:w-44 aspect-[2/3] rounded-lg overflow-hidden border-2 border-[#f5d76e]/60 bg-gradient-to-b from-[#2a2410] to-[#111318] grid place-items-center text-center transition-all duration-300 hover:border-[#f5d76e] hover:shadow-[0_0_28px_rgba(245,215,110,0.35)] hover:-translate-y-1"
    >
      <span className="px-3">
        <span className="block text-5xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="block text-sm font-black text-[#f5d76e] leading-snug whitespace-pre-line">{label}</span>
        <span className="mt-3 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f5d76e]/50 text-[#f5d76e]/80">
          入場する →
        </span>
      </span>
    </Link>
  )
}

/* 動画0件の棚の「上映準備中」スクリーン */
function EmptyScreen() {
  return (
    <div className="snap-start shrink-0 w-72 sm:w-96 aspect-video rounded-lg border border-[#f5d76e]/20 bg-gradient-to-b from-[#1a1c24] to-[#0a0b0f] grid place-items-center relative overflow-hidden">
      <div
        className="absolute inset-x-8 bottom-0 h-1/2 opacity-30"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${GOLD}33 0%, transparent 70%)` }}
      />
      <div className="text-center">
        <div className="text-3xl mb-2">🎞️</div>
        <p className="text-sm font-bold tracking-[0.3em] text-[#f2f0e8]/60">上映準備中</p>
        <p className="mt-1 text-[10px] tracking-widest text-[#f2f0e8]/30">COMING SOON</p>
      </div>
    </div>
  )
}

/* カテゴリ棚(横スクロール) */
function Shelf({ category, videos, onPlay }: { category: VideoCategory; videos: CurriculumVideo[]; onPlay: (v: CurriculumVideo) => void }) {
  const meta = CATEGORY_META[category]
  const special = SPECIAL_CARDS[category]

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
        <span className="text-2xl">{meta.icon}</span>
        <h2 className="text-lg sm:text-xl font-bold tracking-widest text-[#f5d76e]">{meta.label}</h2>
        <span className="flex-1 h-px bg-gradient-to-r from-[#f5d76e]/40 to-transparent" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 px-4 sm:px-0 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
        {special && <SpecialCard {...special} />}
        {videos.length > 0 ? videos.map((v) => <PosterCard key={v.id} video={v} onPlay={onPlay} />) : <EmptyScreen />}
      </div>
    </section>
  )
}

/* 再生モーダル(YouTube iframeはモーダルを開いたときだけマウント) */
function PlayerModal({ video, onClose }: { video: CurriculumVideo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm sm:text-base font-bold text-[#f5d76e] truncate pr-4">{video.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="shrink-0 w-9 h-9 grid place-items-center rounded-full border border-[#f5d76e]/50 text-[#f5d76e] hover:bg-[#f5d76e]/10 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden border border-[#f5d76e]/40 bg-black shadow-[0_0_40px_rgba(245,215,110,0.2)]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default function VideosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [playing, setPlaying] = useState<CurriculumVideo | null>(null)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen bg-[#111318] text-[#f2f0e8]">
        <div className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto sm:px-6">
            {/* ヒーロー(ネオンサイン) */}
            <div className="text-center mb-14 px-4">
              <p
                className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.5em] text-[#f5d76e] border border-[#f5d76e]/60 rounded-full px-4 py-1.5 animate-pulse"
                style={{ textShadow: `0 0 8px ${GOLD}` }}
              >
                NOW SHOWING
              </p>
              <h1
                className="mt-5 text-3xl sm:text-5xl font-black tracking-[0.15em] text-[#f5d76e]"
                style={{ textShadow: `0 0 20px ${GOLD}66, 0 0 60px ${GOLD}33` }}
              >
                CLAFT THEATER
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#f2f0e8]/60 leading-7">
                カリキュラム動画のシアターへようこそ。
                <br className="sm:hidden" />
                見たい棚から、好きな作品をどうぞ。
              </p>
            </div>

            {/* カテゴリ棚 */}
            {CATEGORY_ORDER.map((category) => (
              <Shelf
                key={category}
                category={category}
                videos={CURRICULUM_VIDEOS.filter((v) => v.category === category)}
                onPlay={setPlaying}
              />
            ))}
          </div>
        </div>
      </main>

      {playing && <PlayerModal video={playing} onClose={() => setPlaying(null)} />}
    </>
  )
}
