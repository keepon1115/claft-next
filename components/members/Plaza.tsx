'use client'

import { useMemo } from 'react'
import MemberAvatar from '@/components/members/MemberAvatar'
import type { AdventurerData } from '@/hooks/useAdventurerList'
import type { MemberAvatarRow } from '@/hooks/useMemberAvatars'

// =====================================================
// 決定論的配置アルゴリズム
// user_idのハッシュから広場の定位置を決める(リロードしても同じ場所=「あの子の定位置」)。
// フェーズ9でGodot(GDScript)に移植して「両世界で同じ定位置」を実現するため、
// 単純な整数演算だけで実装している。変更するときはGodot側との同期を忘れないこと。
// =====================================================

// FNV-1a 32bitハッシュ
export function hashUserId(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

// 格子は固定サイズ(人数で変えると新メンバー参加時に既存の定位置がずれるため)
const COLS = 20
const ROWS = 5
const CELL_W = 110
const CELL_H = 90
const SKY_H = 220 // 上1/3が空
export const PLAZA_W = COLS * CELL_W // 2200
export const PLAZA_H = SKY_H + ROWS * CELL_H + 40 // 710

// セル割り当て: hash % 総セル数。衝突はid昇順で処理して次の空きセルへ(決定論的)
function assignCells(ids: string[]): Map<string, number> {
  const total = COLS * ROWS
  const sorted = [...ids].sort()
  const used = new Set<number>()
  const map = new Map<string, number>()
  for (const id of sorted) {
    let cell = hashUserId(id) % total
    while (used.has(cell)) cell = (cell + 1) % total
    used.add(cell)
    map.set(id, cell)
  }
  return map
}

// セル内ジッター(±18px)。ハッシュ由来なのでこれも決定論的
function jitter(h: number): { jx: number; jy: number } {
  return {
    jx: ((h >> 8) % 37) - 18,
    jy: ((h >> 16) % 25) - 12,
  }
}

// 背景小物(絵文字で開始。画像アセットはあとから差し替え可)
const SKY_PROPS = [
  { emoji: '☀️', x: 120, y: 30, size: 48 },
  { emoji: '☁️', x: 420, y: 60, size: 40 },
  { emoji: '☁️', x: 900, y: 35, size: 52 },
  { emoji: '☁️', x: 1400, y: 70, size: 36 },
  { emoji: '🕊️', x: 1750, y: 50, size: 28 },
  { emoji: '☁️', x: 2000, y: 40, size: 44 },
]
const GROUND_PROPS = [
  { emoji: '🏠', x: 60, y: SKY_H - 55, size: 64 },
  { emoji: '🌳', x: 320, y: SKY_H - 45, size: 56 },
  { emoji: '🏡', x: 640, y: SKY_H - 55, size: 64 },
  { emoji: '🌲', x: 950, y: SKY_H - 45, size: 56 },
  { emoji: '⛲', x: 1250, y: SKY_H - 50, size: 60 },
  { emoji: '🌳', x: 1550, y: SKY_H - 45, size: 56 },
  { emoji: '🏠', x: 1850, y: SKY_H - 55, size: 64 },
  { emoji: '🌲', x: 2100, y: SKY_H - 45, size: 56 },
  { emoji: '🪑', x: 500, y: PLAZA_H - 60, size: 36 },
  { emoji: '🌷', x: 200, y: PLAZA_H - 50, size: 28 },
  { emoji: '🌼', x: 1100, y: PLAZA_H - 45, size: 28 },
  { emoji: '🪑', x: 1700, y: PLAZA_H - 60, size: 36 },
  { emoji: '🌷', x: 2050, y: PLAZA_H - 50, size: 28 },
]

interface PlazaProps {
  adventurers: AdventurerData[]
  avatars?: Map<string, MemberAvatarRow> // member_avatars(あればドット絵で表示)
  selfId?: string | null
  onSelectMember: (userId: string) => void
}

export default function Plaza({ adventurers, avatars, selfId, onSelectMember }: PlazaProps) {
  // 配置計算(メンバーが増減したときだけ再計算)
  const positioned = useMemo(() => {
    const cells = assignCells(adventurers.map((a) => a.id))
    return adventurers.map((a) => {
      const h = hashUserId(a.id)
      const cell = cells.get(a.id) ?? 0
      const col = cell % COLS
      const row = Math.floor(cell / COLS)
      const { jx, jy } = jitter(h)
      return {
        adventurer: a,
        x: col * CELL_W + CELL_W / 2 + jx,
        y: SKY_H + row * CELL_H + CELL_H / 2 + jy,
        floatDelay: (h % 20) / 10, // 0〜1.9秒で浮遊の位相をずらす
      }
    })
  }, [adventurers])

  return (
    <div className="overflow-x-auto rounded-3xl border-4 border-white shadow-xl [-webkit-overflow-scrolling:touch]">
      <div
        className="relative"
        style={{ width: PLAZA_W, height: PLAZA_H }}
      >
        {/* 空(上1/3)と芝生(下2/3) */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: SKY_H, background: 'linear-gradient(to bottom, #aee3f5, #d7f0fa)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: SKY_H, background: 'linear-gradient(to bottom, #8fd463, #7ec850)' }}
        />

        {/* 背景小物 */}
        {[...SKY_PROPS, ...GROUND_PROPS].map((prop, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{ left: prop.x, top: prop.y, fontSize: prop.size }}
            aria-hidden="true"
          >
            {prop.emoji}
          </span>
        ))}

        {/* メンバーアバター */}
        {positioned.map(({ adventurer, x, y, floatDelay }) => {
          // member_avatarsにレコードがあればドット絵+選んだ名前、なければ既存プロフィール画像
          const avatar = avatars?.get(adventurer.id)
          return (
            <div
              key={adventurer.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <MemberAvatar
                nickname={avatar?.nickname || adventurer.nickname}
                visual={
                  avatar
                    ? { type: 'sprite', spriteId: avatar.sprite_id }
                    : { type: 'image', src: adventurer.avatar_url || '' }
                }
                message={avatar?.message || undefined}
                isSelf={!!selfId && adventurer.id === selfId}
                floatDelay={floatDelay}
                onClick={() => onSelectMember(adventurer.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
