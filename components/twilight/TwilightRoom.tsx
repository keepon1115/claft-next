'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ──────────────────────────────────────────────────────────────────

type EmotionType =
  | '喜び' | '怒り' | '哀しみ' | '楽しさ' | '不安'
  | '決意' | '平静' | '懐かしさ' | '孤独' | '希望'

interface EmotionData { type: EmotionType; intensity: number }

interface Character {
  name: string
  firstPerson: string
  personality: string
  traits: string
  backgroundEpisodes: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'character'
  text: string
  emotion?: EmotionData
  timestamp: number
}

// ─── Emotion Themes ──────────────────────────────────────────────────────────

const EMOTION_THEMES: Record<EmotionType, { gradient: string; border: string; glow: string; accent: string }> = {
  喜び:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(180,83,9,0.45) 0%, transparent 65%)',   border: '#f59e0b', glow: 'rgba(245,158,11,0.3)',   accent: '#fbbf24' },
  怒り:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(127,29,29,0.55) 0%, transparent 65%)',  border: '#ef4444', glow: 'rgba(239,68,68,0.3)',    accent: '#f87171' },
  哀しみ: { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(30,27,75,0.55) 0%, transparent 65%)',   border: '#818cf8', glow: 'rgba(129,140,248,0.3)',  accent: '#a5b4fc' },
  楽しさ: { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(120,53,15,0.45) 0%, transparent 65%)',  border: '#fcd34d', glow: 'rgba(252,211,77,0.3)',   accent: '#fde68a' },
  不安:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(88,28,135,0.55) 0%, transparent 65%)',  border: '#a78bfa', glow: 'rgba(167,139,250,0.3)',  accent: '#c4b5fd' },
  決意:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(6,78,59,0.45) 0%, transparent 65%)',    border: '#34d399', glow: 'rgba(52,211,153,0.3)',   accent: '#6ee7b7' },
  平静:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(30,41,59,0.5) 0%, transparent 65%)',    border: '#94a3b8', glow: 'rgba(148,163,184,0.25)', accent: '#cbd5e1' },
  懐かしさ:{ gradient: 'radial-gradient(ellipse at 50% 70%, rgba(120,53,15,0.42) 0%, transparent 65%)', border: '#d97706', glow: 'rgba(217,119,6,0.3)',    accent: '#fbbf24' },
  孤独:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(15,23,42,0.65) 0%, transparent 65%)',   border: '#475569', glow: 'rgba(71,85,105,0.2)',    accent: '#64748b' },
  希望:   { gradient: 'radial-gradient(ellipse at 50% 70%, rgba(6,78,59,0.4) 0%, transparent 65%)',     border: '#4ade80', glow: 'rgba(74,222,128,0.3)',   accent: '#86efac' },
}

const DEFAULT_THEME = {
  gradient: 'radial-gradient(ellipse at 50% 70%, rgba(76,29,149,0.35) 0%, transparent 65%)',
  border: '#7c3aed', glow: 'rgba(124,58,237,0.25)', accent: '#a78bfa',
}

// Deterministic star field
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.508) % 100).toFixed(2),
  y: ((i * 97.317) % 100).toFixed(2),
  r: 0.5 + (i % 3) * 0.5,
  o: (0.1 + (i % 6) * 0.06).toFixed(2),
}))

const CHAR_ICONS = ['🌙', '⭐', '🗡️', '🔮', '🌊', '🌸', '🦋', '❄️', '🔥', '🌺', '🌟', '🎭']
const STORAGE_KEY = 'claft-twilight-room'

function getCharIcon(name: string) {
  if (!name) return '🌙'
  return CHAR_ICONS[name.charCodeAt(0) % CHAR_ICONS.length]
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function WelcomeScreen({ onSetup, theme }: { onSetup: () => void; theme: typeof DEFAULT_THEME }) {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md px-8"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-8"
        >
          🌙
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4 tracking-wider"
          style={{ textShadow: `0 0 30px ${theme.glow}` }}>
          対話する相手がいない
        </h2>
        <p className="text-white/45 text-sm leading-relaxed mb-8">
          まず、語り合う相手を召喚してください。<br />
          名前、性格、そして——彼らが抱える過去を。
        </p>
        <motion.button
          onClick={onSetup}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-xl font-medium text-white text-sm"
          style={{
            background: `linear-gradient(135deg, ${theme.glow}, ${theme.border}40)`,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 0 30px ${theme.glow}`,
          }}
        >
          キャラクターを召喚する
        </motion.button>
      </motion.div>
    </div>
  )
}

function CharMsgBubble({
  msg, charName, theme,
}: { msg: ChatMessage; charName: string; theme: typeof DEFAULT_THEME }) {
  const et = msg.emotion ? EMOTION_THEMES[msg.emotion.type] : theme
  return (
    <div className="flex justify-start">
      <div style={{ maxWidth: '75%' }}>
        <div className="flex items-center gap-2 mb-1 ml-1">
          <span className="text-xs text-white/40">{charName}</span>
          {msg.emotion && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
              background: et.glow, border: `1px solid ${et.border}60`, color: et.accent,
            }}>
              {msg.emotion.type}
            </span>
          )}
          <span className="text-[10px] text-white/20">{fmtTime(msg.timestamp)}</span>
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm text-white/85 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)',
            border: `1px solid ${et.border}45`,
            boxShadow: `0 0 18px ${et.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  )
}

function UserMsgBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div style={{ maxWidth: '70%' }}>
        <div className="flex justify-end mb-1 mr-1">
          <span className="text-[10px] text-white/20">{fmtTime(msg.timestamp)}</span>
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm text-white/65 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  )
}

function TypingDots({ charName, theme }: { charName: string; theme: typeof DEFAULT_THEME }) {
  return (
    <div className="flex justify-start">
      <div>
        <div className="text-xs text-white/40 mb-1 ml-1">{charName}</div>
        <div className="px-4 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
          style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${theme.border}40` }}>
          {[0, 0.18, 0.36].map((delay, i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.accent }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.4, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Character Setup Drawer ───────────────────────────────────────────────────

function SetupDrawer({
  draft, onChange, onSave, onClose, theme, isEdit,
}: {
  draft: Character; onChange: (c: Character) => void
  onSave: () => void; onClose: () => void
  theme: typeof DEFAULT_THEME; isEdit: boolean
}) {
  const set = (k: keyof Character) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...draft, [k]: e.target.value })

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 overflow-y-auto"
        style={{
          background: 'linear-gradient(170deg, rgba(8,3,28,0.99) 0%, rgba(12,5,35,0.99) 100%)',
          borderLeft: `1px solid ${theme.border}45`,
          boxShadow: `-25px 0 70px ${theme.glow}`,
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {isEdit ? 'キャラクターを編集' : 'キャラクターを召喚'}
              </h2>
              <p className="text-[11px] text-white/35 mt-1">空欄はAIが世界観に沿って補完します</p>
            </div>
            <button onClick={onClose} className="text-white/35 hover:text-white/65 transition-colors text-lg mt-0.5">✕</button>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <label className="block">
              <span className="text-[11px] text-white/55 font-medium tracking-widest uppercase mb-1.5 block">
                名前 <span className="text-red-400/80">*</span>
              </span>
              <input
                type="text" value={draft.name} onChange={set('name')}
                placeholder="キャラクターの名前"
                className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2.5
                  text-white placeholder-white/22 text-sm focus:outline-none focus:border-white/28 transition-colors"
              />
            </label>

            {/* First person */}
            <label className="block">
              <span className="text-[11px] text-white/55 font-medium tracking-widest uppercase mb-1.5 block">一人称</span>
              <select
                value={draft.firstPerson} onChange={set('firstPerson')}
                className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2.5
                  text-white text-sm focus:outline-none focus:border-white/28 transition-colors appearance-none"
                style={{ background: 'rgba(8,3,28,0.9)' }}
              >
                {['私', '僕', '俺', 'わたし', 'ボク', '我', 'あたし'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            {/* Personality */}
            <label className="block">
              <span className="text-[11px] text-white/55 font-medium tracking-widest uppercase mb-1.5 block">性格</span>
              <textarea
                value={draft.personality} onChange={set('personality')}
                placeholder="例：寡黙で冷静、しかし内に激しい感情を秘めている"
                rows={3}
                className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2.5
                  text-white placeholder-white/22 text-sm resize-none focus:outline-none focus:border-white/28 transition-colors"
              />
            </label>

            {/* Traits */}
            <label className="block">
              <span className="text-[11px] text-white/55 font-medium tracking-widest uppercase mb-1.5 block">特徴・外見</span>
              <textarea
                value={draft.traits} onChange={set('traits')}
                placeholder="例：かつて剣士だった女性。右手に古い傷がある。"
                rows={3}
                className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2.5
                  text-white placeholder-white/22 text-sm resize-none focus:outline-none focus:border-white/28 transition-colors"
              />
            </label>

            {/* Background — most important */}
            <label className="block">
              <span className="text-[11px] font-medium tracking-widest uppercase mb-1.5 block" style={{ color: theme.accent }}>
                過去のエピソード・背景 ✦ 最重要
              </span>
              <p className="text-[10px] text-white/30 mb-2 leading-relaxed">
                この欄が、言葉に深みを与えます。直接語らせるのではなく、<br />
                感情の重みとして言葉に滲み出させます。
              </p>
              <textarea
                value={draft.backgroundEpisodes} onChange={set('backgroundEpisodes')}
                placeholder="例：幼い頃、自分のせいで大切な人を失った。その後、感情を表に出すことを恐れ、人との距離を置くようになった。"
                rows={5}
                className="w-full bg-white/[0.04] rounded-lg px-3 py-2.5
                  text-white placeholder-white/22 text-sm resize-none focus:outline-none transition-colors"
                style={{ border: `1px solid ${theme.border}50` }}
              />
            </label>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm text-white/45 hover:text-white/65
                border border-white/10 hover:border-white/20 transition-all"
            >
              キャンセル
            </button>
            <motion.button
              onClick={onSave}
              disabled={!draft.name.trim()}
              whileHover={{ scale: draft.name.trim() ? 1.03 : 1 }}
              whileTap={{ scale: draft.name.trim() ? 0.97 : 1 }}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all
                disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${theme.border}55, ${theme.border}30)`,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 0 22px ${theme.glow}`,
              }}
            >
              {isEdit ? '更新する' : '召喚する'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_CHAR: Character = { name: '', firstPerson: '私', personality: '', traits: '', backgroundEpisodes: '' }

export function TwilightRoom() {
  const [character, setCharacter] = useState<Character>(DEFAULT_CHAR)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const [draft, setDraft] = useState<Character>(DEFAULT_CHAR)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const hasChar = !!character.name
  const theme = currentEmotion ? EMOTION_THEMES[currentEmotion.type] : DEFAULT_THEME

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const { character: c, messages: m } = JSON.parse(raw)
      if (c?.name) setCharacter(c)
      if (Array.isArray(m)) setMessages(m)
    } catch { /* ignore */ }
  }, [])

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ character, messages })) } catch { /* ignore */ }
  }, [character, messages])

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const openSetup = () => { setDraft({ ...character }); setSetupOpen(true) }

  const initiateConversation = async (char: Character) => {
    setLoading(true)
    try {
      const res = await fetch('/api/twilight/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: char, messages: [], userMessage: '__INIT__' }),
      })
      const { text, emotion } = await res.json()
      const initMsg: ChatMessage = { id: `init-${Date.now()}`, role: 'character', text, emotion: emotion ?? undefined, timestamp: Date.now() }
      setMessages([initMsg])
      if (emotion) setCurrentEmotion(emotion)
    } catch { /* ignore, static UI will show */ }
    setLoading(false)
  }

  const saveCharacter = () => {
    const nameChanged = draft.name !== character.name
    setCharacter(draft)
    setSetupOpen(false)
    if (nameChanged || !hasChar) {
      setMessages([])
      setCurrentEmotion(null)
      if (draft.name) initiateConversation(draft)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || !hasChar) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/twilight/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, messages: messages.slice(-10), userMessage: text }),
      })
      if (!res.ok) throw new Error()
      const { text: resText, emotion } = await res.json()

      const charMsg: ChatMessage = {
        id: `c-${Date.now()}`, role: 'character', text: resText,
        emotion: emotion ?? undefined, timestamp: Date.now(),
      }
      setMessages(prev => [...prev, charMsg])
      if (emotion) setCurrentEmotion(emotion)
    } catch {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'character',
        text: '……言葉が、出てこない。少し、待ってもらえますか', timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#030110' }}>

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o }}
          />
        ))}
      </div>

      {/* Emotion glow layer (cross-fade) */}
      <AnimatePresence>
        <motion.div
          key={currentEmotion?.type ?? 'default'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: theme.gradient }}
        />
      </AnimatePresence>

      {/* Bottom horizon glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: `linear-gradient(to top, ${theme.glow} 0%, transparent 100%)` }}
      />

      {/* ─── Header ─── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 className="text-xl font-black tracking-[0.12em] text-white leading-none"
            style={{ textShadow: `0 0 30px ${theme.glow}, 0 0 60px ${theme.glow}` }}>
            黄昏の対話室
          </h1>
          <p className="text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ color: theme.accent + '70' }}>
            Twilight Dialogue Room
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && hasChar && (
            <button
              onClick={() => { setMessages([]); setCurrentEmotion(null) }}
              className="text-[11px] text-white/25 hover:text-white/50 transition-colors px-2 py-1"
            >
              記憶を消す
            </button>
          )}
          <motion.button
            onClick={openSetup}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${hasChar ? theme.border + '55' : 'rgba(255,255,255,0.10)'}`,
              boxShadow: hasChar ? `0 0 18px ${theme.glow}` : 'none',
            }}
          >
            {hasChar ? (
              <><span>{getCharIcon(character.name)}</span><span className="max-w-[100px] truncate">{character.name}</span></>
            ) : (
              <span>＋ キャラクターを召喚</span>
            )}
          </motion.button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* Character sidebar */}
        <AnimatePresence>
          {hasChar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 136, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-shrink-0 flex flex-col items-center pt-8 gap-4 overflow-hidden"
              style={{ borderRight: '1px solid rgba(255,255,255,0.055)' }}
            >
              {/* Avatar */}
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  border: `2px solid ${theme.border}`,
                  background: 'rgba(0,0,0,0.5)',
                }}
                animate={{ boxShadow: `0 0 ${22 + (currentEmotion?.intensity ?? 0) * 20}px ${theme.glow}` }}
                transition={{ duration: 1.5 }}
              >
                {getCharIcon(character.name)}
              </motion.div>

              {/* Name */}
              <div className="text-[11px] font-bold text-white/80 text-center px-2"
                style={{ textShadow: `0 0 10px ${theme.border}` }}>
                {character.name}
              </div>

              {/* Emotion */}
              <AnimatePresence mode="wait">
                {currentEmotion && (
                  <motion.div
                    key={currentEmotion.type}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex flex-col items-center gap-2 px-2"
                  >
                    <div className="text-[10px] px-2 py-0.5 rounded-full text-center"
                      style={{
                        background: theme.glow,
                        border: `1px solid ${theme.border}55`,
                        color: theme.accent,
                      }}>
                      {currentEmotion.type}
                    </div>
                    <div className="w-10 h-0.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: theme.border }}
                        animate={{ width: `${currentEmotion.intensity * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${theme.border}35 transparent` }}
          >
            {!hasChar && <WelcomeScreen onSetup={openSetup} theme={theme} />}

            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {msg.role === 'character'
                    ? <CharMsgBubble msg={msg} charName={character.name} theme={theme} />
                    : <UserMsgBubble msg={msg} />
                  }
                </motion.div>
              ))}
              {loading && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <TypingDots charName={character.name} theme={theme} />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {hasChar && (
            <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`${character.name}に話しかける…`}
                  rows={2}
                  disabled={loading}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white/80
                    placeholder-white/20 resize-none focus:outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: `1px solid ${input ? theme.border + '60' : 'rgba(255,255,255,0.09)'}`,
                    boxShadow: input ? `0 0 16px ${theme.glow}` : 'none',
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: input.trim() && !loading ? 1.06 : 1 }}
                  whileTap={{ scale: input.trim() && !loading ? 0.94 : 1 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white
                    disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${theme.border}55, ${theme.border}30)`,
                    border: `1px solid ${theme.border}70`,
                    boxShadow: `0 0 22px ${theme.glow}`,
                  }}
                >
                  送る
                </motion.button>
              </div>
              <p className="text-[10px] text-white/18 mt-1.5 text-right">Shift+Enter で改行</p>
            </div>
          )}
        </div>
      </div>

      {/* Setup drawer */}
      <AnimatePresence>
        {setupOpen && (
          <SetupDrawer
            draft={draft} onChange={setDraft}
            onSave={saveCharacter} onClose={() => setSetupOpen(false)}
            theme={theme} isEdit={hasChar}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
