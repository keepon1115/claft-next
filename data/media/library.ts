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
		tags: ['series:section', 'topic:money', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:money', 'stage:jibuncraft'],
		url: 'https://www.youtube.com/watch?v=2z9I_Y7fmyE',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/2z9I_Y7fmyE/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},

	// プレゼン・発表
	{
		id: 'presentation-001',
		title: '1-1 コミュニケーションとは',
		description: 'プレゼンの基礎を学ぶ',
		tags: ['series:section', 'topic:presentation', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:presentation', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:presentation', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:presentation', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:ai', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:ai', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:sdgs', 'stage:jibuncraft'],
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
		tags: ['series:section', 'topic:sdgs', 'stage:jibuncraft'],
		url: 'https://youtu.be/vrEMf56073o',
		provider: 'youtube',
		thumbnailUrl: 'https://img.youtube.com/vi/vrEMf56073o/hqdefault.jpg',
		createdAt: '2024-01-01T00:00:00.000Z'
	},
]

// ジブンクラフト横断ライブラリ: セクション固定 + 追加メディア(items.ts) をマージ
export const mediaItems: MediaItem[] = [
  ...sectionMediaItems,
  ...additionalItems,
]

export default mediaItems


