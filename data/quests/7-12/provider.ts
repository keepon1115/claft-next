import type { QuestDataSource, ListParams, ListResult, VideoItem } from '@/stores/quest/types'

// カテゴリ別の大容量データは必要時にのみ読み込む
async function importCategoryModule(categoryId: string): Promise<{ default: VideoItem[] }> {
	 switch (categoryId) {
		 case 'money':
			 return import('./okane')
		 case 'presentation':
			 return import('./presentation')
		 case 'aiit':
			 return import('./aiit')
		 case 'sdgs':
			 return import('./sdgs')
		 default:
			 return { default: [] as VideoItem[] }
	 }
}

export async function get7to12DataSource(): Promise<QuestDataSource> {
	 return {
		 async listVideos({ categoryId, page = 1, pageSize = 24, query }: ListParams): Promise<ListResult> {
			 const mod = await importCategoryModule(categoryId)
			 const all = mod.default || []
			 const filtered = query
				 ? all.filter(v =>
					 v.title.includes(query) ||
					 (v.tags?.some(t => t.includes(query)) ?? false)
				 )
				 : all
			 const start = (page - 1) * pageSize
			 const end = start + pageSize
			 return { items: filtered.slice(start, end), hasMore: end < filtered.length }
		 }
	 }
}


