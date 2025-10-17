import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	{
		 id: 'presentation-001',
		 title: '伝わるプレゼンの基本',
		 thumbnailUrl: 'https://img.youtube.com/vi/hNBKZniVR3M/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'hNBKZniVR3M',
		 videoUrl: 'https://youtu.be/hNBKZniVR3M',
		 categoryId: 'presentation',
		 order: 1,
		 tags: ['プレゼン', '発表', 'series:section'],
		 formUrl: 'https://forms.gle/22renznZyLnoeCAMA'
	},
	{
		 id: 'presentation-002',
		 title: 'コミュニケーションの歴史',
		 thumbnailUrl: 'https://img.youtube.com/vi/h9kyWs_fcpc/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'h9kyWs_fcpc',
		 videoUrl: 'https://youtu.be/h9kyWs_fcpc',
		 categoryId: 'presentation',
		 order: 2,
		 tags: ['コミュニケーション', '歴史', 'series:section'],
		 formUrl: 'https://forms.gle/V4f49SE18cPLM9df6'
	},
]

export default videos


