import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	// 既存（例）
	{
		 id: 'presentation-001',
		 title: '伝わるプレゼンの基本',
		 thumbnailUrl: 'https://img.youtube.com/vi/hNBKZniVR3M/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'hNBKZniVR3M',
		 videoUrl: 'https://www.youtube.com/watch?v=hNBKZniVR3M',
		 categoryId: 'presentation',
		 order: 1,
		 tags: ['プレゼン', '発表']
	},

	// 1-2 コミュニケーションの歴史
	{
		 id: 'presentation-002',
		 title: 'コミュニケーションの歴史',
		 thumbnailUrl: 'https://img.youtube.com/vi/h9kyWs_fcpc/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'h9kyWs_fcpc',
		 videoUrl: 'https://youtu.be/h9kyWs_fcpc',
		 formUrl: 'https://forms.gle/V4f49SE18cPLM9df6',
		 categoryId: 'presentation',
		 order: 2,
		 tags: ['コミュニケーション', '歴史']
	},

	// 1-3 未来のコミュニケーション
	{
		 id: 'presentation-003',
		 title: '未来のコミュニケーション',
		 thumbnailUrl: 'https://img.youtube.com/vi/hNvF_1AIlw4/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'hNvF_1AIlw4',
		 videoUrl: 'https://youtu.be/hNvF_1AIlw4',
		 formUrl: 'https://forms.gle/wH662CjH7pfLKUq68',
		 categoryId: 'presentation',
		 order: 3,
		 tags: ['コミュニケーション', '未来']
	},

	// 1-4 コミュニケーションの基本
	{
		 id: 'presentation-004',
		 title: 'コミュニケーションの基本',
		 thumbnailUrl: 'https://img.youtube.com/vi/bhaz_oGRQz8/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'bhaz_oGRQz8',
		 videoUrl: 'https://youtu.be/bhaz_oGRQz8',
		 formUrl: 'https://forms.gle/TkYuHH4dRBTTtCh46',
		 categoryId: 'presentation',
		 order: 4,
		 tags: ['コミュニケーション', '基本']
	},
]

export default videos


