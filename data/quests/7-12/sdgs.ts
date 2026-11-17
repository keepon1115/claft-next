import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	{
		 id: 'sdgs-001',
		 title: 'SDGsで未来を変える',
		 thumbnailUrl: 'https://img.youtube.com/vi/fryzvmt_cN8/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'fryzvmt_cN8',
		 videoUrl: 'https://youtu.be/fryzvmt_cN8',
		 categoryId: 'sdgs',
		 order: 1,
		 tags: ['SDGs', '環境', 'series:section'],
		 formUrl: 'https://forms.gle/QPZN79KeXtRYUwA18'
	},
	{
		 id: 'sdgs-002',
		 title: '気候変動と私たち',
		 thumbnailUrl: 'https://img.youtube.com/vi/vrEMf56073o/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'vrEMf56073o',
		 videoUrl: 'https://youtu.be/vrEMf56073o',
		 categoryId: 'sdgs',
		 order: 2,
		 tags: ['気候変動', '環境', 'series:section'],
		 formUrl: 'https://forms.gle/QPZN79KeXtRYUwA18'
	},
]

export default videos


