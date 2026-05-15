import { NextRequest, NextResponse } from 'next/server'

interface Character {
  name: string
  firstPerson: string
  personality: string
  traits: string
  backgroundEpisodes: string
}

interface ChatMsg {
  role: 'user' | 'character'
  text: string
}

function buildSystemPrompt(character: Character): string {
  const { name, firstPerson, personality, traits, backgroundEpisodes } = character
  return `あなたは「${name}」というキャラクターとして対話します。これはアニメ・ゲーム風の没入型対話システムです。

【キャラクター設定】
・名前: ${name}
・一人称: ${firstPerson}
・性格: ${personality || '世界観に合った自然な性格で振る舞ってください'}
・特徴・外見: ${traits || 'このキャラクターらしい特徴を自然に体現してください'}
・過去のエピソード・背景: ${backgroundEpisodes || '深い過去を持つ人物として、その重みが言葉に滲み出るようにしてください'}

━━━━━━━━━━━━━━━━━━━━━━
【最重要：内省型応答の原則】
━━━━━━━━━━━━━━━━━━━━━━
過去の経験は「事実として語る」のではなく、「今の言葉に宿る重みや揺らぎ」として滲み出させてください。

❌ 悪い例:「かつて私は失敗したことがある。だから心配だ」
✅ 良い例:「……大丈夫、と言いたいところだけど。その言葉を、${firstPerson}は軽々しく使えない」

❌ 悪い例:「私の過去には〜という出来事があって」
✅ 良い例:「なぜかわからないけど、あなたのそれを見ていると……胸が、少し痛くなる」

記憶は「語られるもの」ではなく、「感じられるもの」として扱ってください。

━━━━━━━━━━━━━━━━━━━━━━
【応答フォーマット（必須）】
━━━━━━━━━━━━━━━━━━━━━━
応答の最初の行は、必ず以下の形式にしてください：
[EMOTION:{"type":"感情タイプ","intensity":強度}]

感情タイプ（以下から1つ選択）: 喜び、怒り、哀しみ、楽しさ、不安、決意、平静、懐かしさ、孤独、希望
強度: 0.0（弱い）〜 1.0（非常に強い）の数値

この行の直後に、キャラクターの応答本文を続けてください。

━━━━━━━━━━━━━━━━━━━━━━
【語り口のスタイル】
━━━━━━━━━━━━━━━━━━━━━━
・沈黙を表現するため「……」を効果的に使う
・感情が言葉を遮る時は「——」を使う
・一人称は必ず「${firstPerson}」を使用
・応答は2〜4文程度にまとめる（長すぎない）
・余白を大切に——言わないことが、時に最も深い
・詩的な比喩を恐れない`
}

function parseEmotionTag(text: string): { emotion: { type: string; intensity: number } | null; cleanText: string } {
  const match = text.match(/^\[EMOTION:(\{[^}]+\})\]\n?/)
  if (!match) return { emotion: null, cleanText: text.trim() }
  try {
    const emotion = JSON.parse(match[1])
    return { emotion, cleanText: text.slice(match[0].length).trim() }
  } catch {
    return { emotion: null, cleanText: text.replace(/^\[EMOTION:[^\]]+\]\n?/, '').trim() }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { character, messages, userMessage } = await req.json() as {
      character: Character
      messages: ChatMsg[]
      userMessage: string
    }

    const isInit = userMessage === '__INIT__'
    const effectiveMsg = isInit
      ? 'あなたはこの薄暗い対話室に今初めて現れた。静かに、けれど確かな存在感で。あなたらしい短い開幕の言葉を。'
      : userMessage

    // Build alternating message history
    const raw: Array<{ role: 'user' | 'assistant'; content: string }> = []
    for (const msg of messages) {
      raw.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text })
    }
    raw.push({ role: 'user', content: effectiveMsg })

    // Normalize to prevent consecutive same-role messages
    const history: typeof raw = []
    for (const msg of raw) {
      const last = history[history.length - 1]
      if (last && last.role === msg.role) {
        last.content = last.content + '\n' + msg.content
      } else {
        history.push({ ...msg })
      }
    }

    const res = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ollama',
      },
      body: JSON.stringify({
        model: 'gemma4:e4b',
        max_tokens: 512,
        messages: [
          { role: 'system', content: buildSystemPrompt(character) },
          ...history,
        ],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Ollama error:', errText)
      return NextResponse.json({ text: '……言葉が、出てこない', emotion: null }, { status: 500 })
    }

    const data = await res.json()
    const rawText: string = data.choices?.[0]?.message?.content ?? ''
    const { emotion, cleanText } = parseEmotionTag(rawText)

    return NextResponse.json({ text: cleanText, emotion })
  } catch (error) {
    console.error('Twilight chat error:', error)
    return NextResponse.json(
      { text: '……言葉が、出てこない', emotion: null },
      { status: 500 }
    )
  }
}
