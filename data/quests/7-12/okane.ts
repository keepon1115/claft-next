import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	// 1本目: 指定のYouTube
	{
		 id: 'money-001',
		 title: '【マネーリテラシー】① お金ってなんだろう？',
		 thumbnailUrl: 'https://img.youtube.com/vi/EBudngoyo2M/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'EBudngoyo2M',
		 videoUrl: 'https://youtu.be/EBudngoyo2M',
		 categoryId: 'money',
		 order: 1,
		 tags: ['お金・経済'],
		 formUrl: 'https://forms.gle/ZNAD2jkyMXycBj937'
	},
	// 2本目: お金が足らないときには、どうするの？
	{
		 id: 'money-002',
		 title: '【マネーリテラシー】② お金が足らないときには、どうするの？',
		 thumbnailUrl: 'https://img.youtube.com/vi/CD0-66GBeXQ/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'CD0-66GBeXQ',
		 videoUrl: 'https://youtu.be/CD0-66GBeXQ',
		 categoryId: 'money',
		 order: 2,
		 tags: ['お金・経済'],
		 formUrl: 'https://forms.gle/P3GCVxC8ypy8tzpCA'
	},
]

export default videos


