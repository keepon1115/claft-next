import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	// 1本目: 指定のYouTube
	{
		 id: 'money-001',
		 title: 'お金ってなんだろう？',
		 thumbnailUrl: 'https://img.youtube.com/vi/EBudngoyo2M/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'EBudngoyo2M',
		 videoUrl: 'https://youtu.be/EBudngoyo2M',
		 categoryId: 'money',
		 order: 1,
		 tags: ['経済', 'お金', 'series:section'],
		 formUrl: 'https://forms.gle/ZNAD2jkyMXycBj937'
	},
	// 2本目: 講師動画と同じ「CLAFTとは何か」
	{
		 id: 'money-002-claft',
		 title: 'CLAFTとは何か',
		 thumbnailUrl: 'https://img.youtube.com/vi/2z9I_Y7fmyE/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: '2z9I_Y7fmyE',
		 videoUrl: 'https://www.youtube.com/watch?v=2z9I_Y7fmyE',
		 categoryId: 'money',
		 order: 2,
		 tags: ['講師動画', 'series:section']
	},
]

export default videos


