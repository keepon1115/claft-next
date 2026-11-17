'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { AVATAR_CATALOG, DEFAULT_SPRITE_ID, avatarImageUrl } from '@/data/avatarCatalog'
import type { MemberAvatarRow } from '@/hooks/useMemberAvatars'

// アバター作成・きがえモーダル(フェーズ9a)。保存で member_avatars にupsertする。
// 親側で開いている間だけマウントすること(閉じたらアンマウント)。

const MESSAGE_MAX = 50 // DBのcheck制約と同値
const NICKNAME_MAX = 20

interface AvatarEditorModalProps {
  userId: string
  defaultNickname: string // 未作成時の初期値(users_profileのnickname)
  existing: MemberAvatarRow | null
  onSaved: () => void
  onClose: () => void
}

export default function AvatarEditorModal({
  userId,
  defaultNickname,
  existing,
  onSaved,
  onClose,
}: AvatarEditorModalProps) {
  const [spriteId, setSpriteId] = useState(existing?.sprite_id ?? DEFAULT_SPRITE_ID)
  const [nickname, setNickname] = useState(existing?.nickname ?? defaultNickname)
  const [message, setMessage] = useState(existing?.message ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserSupabaseClient()

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

  const handleSave = async () => {
    const trimmedNickname = nickname.trim()
    if (!trimmedNickname) {
      setError('なまえを入れてね')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const { error: upsertError } = await supabase.from('member_avatars').upsert({
        user_id: userId,
        sprite_id: spriteId,
        nickname: trimmedNickname.slice(0, NICKNAME_MAX),
        message: message.trim().slice(0, MESSAGE_MAX),
        updated_at: new Date().toISOString(),
      })
      if (upsertError) throw upsertError
      onSaved()
      onClose()
    } catch (e) {
      console.error('アバター保存エラー:', e)
      setError('保存に失敗しました。もういちど試してね')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="じぶんアバターをつくる"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-3xl border-4 border-[#7ec850] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#2f6b1a]">
            {existing ? '🎨 アバターをきがえる' : '✨ じぶんアバターをつくる'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-[#3c5a2a]/70">
          広場とYononakaマップの両方に、同じすがたで登場するよ
        </p>

        {/* 1. キャラ選択グリッド */}
        <div className="mt-5">
          <div className="text-sm font-bold text-[#2f6b1a]">すがたをえらぶ</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {AVATAR_CATALOG.map((sprite) => {
              const selected = sprite.spriteId === spriteId
              return (
                <button
                  key={sprite.spriteId}
                  type="button"
                  onClick={() => setSpriteId(sprite.spriteId)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                    selected
                      ? 'border-[#7ec850] bg-[#7ec850]/15 ring-2 ring-[#7ec850]/50'
                      : 'border-slate-200 hover:border-[#7ec850]/60 hover:bg-[#7ec850]/5'
                  }`}
                  aria-pressed={selected}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarImageUrl(sprite.spriteId)}
                    alt={sprite.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 [image-rendering:pixelated]"
                  />
                  <span className="text-[9px] font-bold text-[#3c5a2a] leading-tight text-center">
                    {sprite.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. なまえ */}
        <div className="mt-5">
          <label htmlFor="avatar-nickname" className="text-sm font-bold text-[#2f6b1a]">
            なまえ
          </label>
          <input
            id="avatar-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={NICKNAME_MAX}
            placeholder="ニックネーム(本名は入れないでね)"
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-[#2f6b1a] font-bold focus:outline-none focus:border-[#7ec850]"
          />
        </div>

        {/* 3. ひとこと */}
        <div className="mt-4">
          <label htmlFor="avatar-message" className="text-sm font-bold text-[#2f6b1a]">
            ひとこと
          </label>
          <input
            id="avatar-message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MESSAGE_MAX}
            placeholder="よろしくね！"
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-[#2f6b1a] focus:outline-none focus:border-[#7ec850]"
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-600">⚠️ 広場とマップのみんなに見えるよ！</span>
            <span className="text-slate-400">
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm font-bold text-red-500" role="alert">
            {error}
          </p>
        )}

        {/* 保存 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-[#7ec850] py-3 font-black text-white shadow hover:bg-[#6cb03f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'ほぞん中...' : 'これでけってい！'}
        </button>
      </div>
    </div>
  )
}
