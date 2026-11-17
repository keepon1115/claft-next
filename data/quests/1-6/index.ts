import type { QuestDataSource, VideoItem, ListParams, ListResult } from '@/stores/quest/types'

// 1-6は軽量のため全件返却でOK（ページングなし）
const allByCategory: Record<'money' | 'presentation' | 'aiit' | 'sdgs', VideoItem[]> = {
	 money: [],
	 presentation: [],
	 aiit: [],
	 sdgs: [],
}

export function get1to6DataSource(): QuestDataSource {
	 return {
		 async listVideos({ categoryId }: ListParams): Promise<ListResult> {
			 const items = allByCategory[categoryId] ?? []
			 return { items, hasMore: false }
		 }
	 }
}


