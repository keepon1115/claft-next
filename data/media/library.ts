import type { MediaItem } from '@/types/media'
import { mediaItems as additionalItems } from '@/data/media/items'

// ジブンクラフト向けの横断メディアライブラリ
// セクション動画もタグで混在表示させる

// 既存のセクション系メディア（固定）
const sectionMediaItems: MediaItem[] = [
	// おかね・経済（セクションにも掲載）
	{
		id: 'money-001',
		title: '【マネーリテラシー】①お金ってなんだろう？',
		description: 'お金の役割や機能を学ぶ',
		tags: ['お金・経済'],
		url: 'https://youtu.be/EBudngoyo2M',
		questUrl: 'https://forms.gle/ZNAD2jkyMXycBj937',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/EBudngoyo2M/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 'money-002-claft',
		title: 'CLAFTとは何か',
		description: 'CLAFTの概要紹介',
		tags: ['お金・経済'],
		url: 'https://www.youtube.com/watch?v=2z9I_Y7fmyE',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/2z9I_Y7fmyE/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 'money-005',
		title: '【マネーリテラシー】⑤お金を貯めよう！',
		description: 'お金を貯める方法と重要性を学ぶ',
		tags: ['お金・経済'],
		url: 'https://youtu.be/GK23ZcNMjLc',
		questUrl: 'https://forms.gle/cr5jFpGjSwWVhTV79',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/S-S0UBln5Vc/hqdefault.jpg',
		createdAt: '2024-12-16T00:00:00.000Z'
	},
	{
		id: 'money-006',
		title: '【マネーリテラシー】⑥貯めたお金はどこにおけばいいの？',
		description: '貯蓄の方法と投資の基本を学ぶ',
		tags: ['お金・経済'],
		url: 'https://youtu.be/S-S0UBln5Vc',
		questUrl: 'https://forms.gle/zr1jHnLJdE2zjFY68',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/U8iEgioKsNU/hqdefault.jpg',
		createdAt: '2024-12-16T00:00:00.000Z'
	},

	// プレゼン・発表
	{
		id: 'presentation-001',
		title: '1-1 コミュニケーションとは',
		description: 'プレゼンの基礎を学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/hNBKZniVR3M',
		questUrl: 'https://forms.gle/22renznZyLnoeCAMA',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/hNBKZniVR3M/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 'presentation-002',
		title: '1-2 コミュニケーションの歴史',
		description: 'コミュニケーションの変遷',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/h9kyWs_fcpc',
		questUrl: 'https://forms.gle/V4f49SE18cPLM9df6',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/h9kyWs_fcpc/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	// 追加: 2-1 わかりにくい話とは
	{
		id: 'presentation-003',
		title: '2-1 わかりにくい話とは',
		description: 'プレゼンで伝わりにくくなる要因を学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/vZuRgzRho0Q',
		questUrl: 'https://forms.gle/mf3w3tvjwWTrNMhg8',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/vZuRgzRho0Q/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	// 追加: 2-2 わかりやすい話とは
	{
		id: 'presentation-004',
		title: '2-2 わかりやすい話とは',
		description: 'わかりやすく伝えるためのポイントを学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/DzMA1UDNQHo',
		questUrl: 'https://forms.gle/1yf4yjxdQZVmGv3e8',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/DzMA1UDNQHo/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},

	// AI・ITスキル
	{
		id: 'aiit-001',
		title: '【生成AI】①AIといっしょに描こう！',
		description: '生成AIで画像を作る',
		tags: ['AI・ITスキル'],
		url: 'https://youtu.be/QCPWmaj-vGQ',
		questUrl: 'https://forms.gle/FXdVHvHMNYZW9K668',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/QCPWmaj-vGQ/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 'aiit-002',
		title: '【生成AI】②AIと仲良くなろう！',
		description: '生成AIで動画を作る',
		tags: ['AI・ITスキル'],
		url: 'https://youtu.be/v42HNh-DoSk',
		questUrl: 'https://forms.gle/CgG2hSchj1tj2vbL8',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/v42HNh-DoSk/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},

	// SDGs・環境
	{
		id: 'sdgs-001',
		title: '①SDGsってなんだろう？',
		description: 'SDGsの入門',
		tags: ['SDGs・環境'],
		url: 'https://youtu.be/fryzvmt_cN8',
		questUrl: 'https://forms.gle/QPZN79KeXtRYUwA18',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/fryzvmt_cN8/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 'sdgs-002',
		title: '②SDGsってなんだろう？',
		description: '気候変動の基礎',
		tags: ['SDGs・環境'],
		url: 'https://youtu.be/vrEMf56073o',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/vrEMf56073o/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},

	// 哲学・思考
	{
		id: 'philosophy-001',
		title: '時間の正体①内側の時間と外側の時間',
		description: '時間の概念を探究する',
		tags: ['哲学・思考'],
		url: 'https://youtu.be/P-TYeM3yY1U',
		questUrl: 'https://forms.gle/Yii4NH6hDHKsgSXi9',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/P-TYeM3yY1U/hqdefault.jpg',
		createdAt: '2024-12-09T00:00:00.000Z'
	},
	{
		id: 'philosophy-002',
		title: '時間の正体②心を震わす「共鳴」とは？',
		description: '共鳴について深く理解する',
		tags: ['哲学・思考'],
		url: 'https://youtu.be/heqo0iuNTdg',
		questUrl: 'https://forms.gle/uhXwEMFy8CME4Jv77',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/heqo0iuNTdg/hqdefault.jpg',
		createdAt: '2024-12-09T00:00:00.000Z'
	},

	// プレゼン・発表 (追加動画)
	{
		id: 'presentation-005',
		title: '【プレゼン・発表】2-4「話す」の基本',
		description: '効果的な話し方の基本を学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/V9SSFXkjsH4',
		questUrl: 'https://forms.gle/rafRquA2NqZaChLv6',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/V9SSFXkjsH4/hqdefault.jpg',
		createdAt: '2024-12-09T00:00:00.000Z'
	},

	// マネーリテラシー (追加動画)
	{
		id: 'money-007',
		title: '【マネーリテラシー】⑦保険ってなんだろう？',
		description: '保険の基本と重要性を学ぶ',
		tags: ['お金・経済'],
		url: 'https://youtu.be/U8iEgioKsNU',
		questUrl: 'https://forms.gle/3r2k5CYM3RDJ5tHr5',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/U8iEgioKsNU/hqdefault.jpg',
		createdAt: '2024-12-28T00:00:00.000Z'
	},

	// キャリア理論入門
	{
		id: 'career-001',
		title: '【キャリア理論入門】①キャリアについて',
		description: 'キャリアの基本概念を学ぶ',
		tags: ['キャリア'],
		url: 'https://youtu.be/gHYcdNBSi5Y',
		questUrl: 'https://forms.gle/39f85VK7q6SUzBWm7',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/gHYcdNBSi5Y/hqdefault.jpg',
		createdAt: '2024-12-28T00:00:00.000Z'
	},
	{
		id: 'career-002',
		title: '【キャリア理論入門】②D.E.スーパー',
		description: 'D.E.スーパーのキャリア理論を学ぶ',
		tags: ['キャリア'],
		url: 'https://youtu.be/k7T4EFzcKa0',
		questUrl: 'https://forms.gle/yobZR1GVMLsXRyBv9',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/k7T4EFzcKa0/hqdefault.jpg',
		createdAt: '2024-12-28T00:00:00.000Z'
	},
	{
		id: 'career-003',
		title: '【キャリア理論入門】③J.D.クランボルツ',
		description: 'J.D.クランボルツのキャリア理論を学ぶ',
		tags: ['キャリア'],
		url: 'https://youtu.be/uiAygESMsP0',
		questUrl: 'https://forms.gle/wLss2hkHtej55Uqm6',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/uiAygESMsP0/hqdefault.jpg',
		createdAt: '2025-01-06T00:00:00.000Z'
	},
	{
		id: 'career-004',
		title: '【キャリア理論入門】④M.L.サビカス',
		description: 'M.L.サビカスのキャリア理論を学ぶ',
		tags: ['キャリア'],
		url: 'https://youtu.be/WokTgU92J4g',
		questUrl: 'https://forms.gle/8dD7MDqjL9eLk3Xn9',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/WokTgU92J4g/hqdefault.jpg',
		createdAt: '2025-01-06T00:00:00.000Z'
	},

	// プレゼン・発表
	{
		id: 'presentation-001',
		title: '【発表・プレゼン】3-2 「聴く」の基本',
		description: 'プレゼンテーションにおける「聴く」スキルを学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/Mj0DbqyOvkQ',
		questUrl: 'https://forms.gle/XTrBpQswkWWdt2aY9',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/Mj0DbqyOvkQ/hqdefault.jpg',
		createdAt: '2025-01-15T00:00:00.000Z'
	},
	{
		id: 'presentation-002',
		title: '【発表・プレゼン】3-3 「訊く」の基本',
		description: 'プレゼンテーションにおける「訊く」スキルを学ぶ',
		tags: ['プレゼン・発表'],
		url: 'https://youtu.be/k3JjPE9ksao',
		questUrl: 'https://forms.gle/zgPTqVYs4JX7VzSQ9',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/k3JjPE9ksao/hqdefault.jpg',
		createdAt: '2025-01-15T00:00:00.000Z'
	},
]

// ジブンクラフト横断ライブラリ: セクション固定 + 追加メディア(items.ts) をマージ
export const mediaItems: MediaItem[] = [
  ...sectionMediaItems,
  ...additionalItems,
]

export default mediaItems


