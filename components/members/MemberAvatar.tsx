'use client'

import { motion } from 'framer-motion'
import OptimizedImage from '@/components/common/OptimizedImage'

// アバターの見た目ソース(09-avatar-sync.md参照)。
// 'sprite' = member_avatars のドット絵(public/avatars/{spriteId}.png)、
// 'image' = 既存のプロフィール画像('' ならプレースホルダ絵文字)
export type MemberAvatarVisual =
  | { type: 'image'; src: string }
  | { type: 'sprite'; spriteId: string }

interface MemberAvatarProps {
  nickname: string
  visual: MemberAvatarVisual
  message?: string // ひとこと(hover/focusで吹き出し表示)
  isSelf?: boolean
  floatDelay?: number // 浮遊アニメの位相ずらし(秒)
  onClick: () => void
}

export default function MemberAvatar({
  nickname,
  visual,
  message,
  isSelf = false,
  floatDelay = 0,
  onClick,
}: MemberAvatarProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center focus:outline-none group"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative block">
        {/* ひとこと吹き出し(hover/focusで表示) */}
        {message && (
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-10 max-w-44 truncate whitespace-nowrap bg-white border-2 border-[#7ec850] rounded-xl px-2.5 py-1 text-xs font-bold text-[#2f6b1a] shadow opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
            {message}
          </span>
        )}
        <span
          className={`block w-16 h-16 rounded-full overflow-hidden bg-white shadow-md border-4 ${
            isSelf
              ? 'border-yellow-400 ring-4 ring-yellow-300/60'
              : 'border-white group-hover:border-pink-300'
          } transition-colors duration-200`}
        >
          {visual.type === 'sprite' ? (
            // ドット絵スプライト(16x16)。拡大してもボケないようpixelated
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/avatars/${visual.spriteId}.png`}
              alt={`${nickname}のアバター`}
              width={64}
              height={64}
              className="w-full h-full object-contain p-1 [image-rendering:pixelated] bg-gradient-to-br from-[#d7f0fa] to-white"
            />
          ) : visual.src ? (
            <OptimizedImage
              src={visual.src}
              alt={`${nickname}のアバター`}
              width={64}
              height={64}
              enableBlur={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="w-full h-full grid place-items-center text-3xl bg-gradient-to-br from-orange-100 to-white">
              👨‍🎓
            </span>
          )}
        </span>
        {isSelf && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded-full px-1.5 py-0.5 shadow">
            きみ
          </span>
        )}
      </span>
      {/* ニックネーム札 */}
      <span className="mt-1 max-w-20 truncate bg-white/90 border border-[#7ec850] text-[#2f6b1a] text-xs font-bold rounded-full px-2 py-0.5 shadow-sm">
        {nickname}
      </span>
    </motion.button>
  )
}
