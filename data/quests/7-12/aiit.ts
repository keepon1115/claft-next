import type { VideoItem } from '@/stores/quest/types'

const videos: VideoItem[] = [
	{
		 id: 'aiit-001',
		 title: 'AIで画像を作ってみよう',
		 thumbnailUrl: 'https://img.youtube.com/vi/QCPWmaj-vGQ/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'QCPWmaj-vGQ',
		 videoUrl: 'https://youtu.be/QCPWmaj-vGQ',
		 categoryId: 'aiit',
		 order: 1,
		 tags: ['AI', 'クリエイティブ', 'series:section'],
		 formUrl: 'https://forms.gle/FXdVHvHMNYZW9K668'
	},
	{
		 id: 'aiit-002',
		 title: 'AIで動画を作ってみよう',
		 thumbnailUrl: 'https://img.youtube.com/vi/v42HNh-DoSk/hqdefault.jpg',
		 source: 'youtube',
		 sourceId: 'v42HNh-DoSk',
		 videoUrl: 'https://youtu.be/v42HNh-DoSk',
		 categoryId: 'aiit',
		 order: 2,
		 tags: ['AI', '動画生成', 'series:section'],
		 formUrl: 'https://forms.gle/CgG2hSchj1tj2vbL8'
	},
]

export default videos


