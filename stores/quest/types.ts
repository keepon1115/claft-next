'use client'

// 7-12向けカテゴリ動画拡張の共通型

export type GradeBand = '1-6' | '7-12'

export type CategoryId = 'money' | 'presentation' | 'aiit' | 'sdgs'

export type VideoSource = 'youtube' | 'vimeo' | 'file'

export interface VideoItem {
	 id: string
	 title: string
	 thumbnailUrl: string
	 durationSec?: number
	 source: VideoSource
	 sourceId: string
	 categoryId: CategoryId
	 tags?: string[]
	 level?: number
 	 /** 表示順（カテゴリ内の連番） */
 	 order?: number
 	 /** フル動画URL（YouTubeのフルURLなどを保持したい場合） */
 	 videoUrl?: string
 	 /** クエスト（Googleフォーム等）のURL */
 	 formUrl?: string
}

export interface ListParams {
	 categoryId: CategoryId
	 page?: number
	 pageSize?: number
	 query?: string
}

export interface ListResult {
	 items: VideoItem[]
	 hasMore: boolean
}

export interface QuestDataSource {
	 listVideos: (params: ListParams) => Promise<ListResult>
}


