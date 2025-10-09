'use client'

import React from 'react'
import type { MediaItem } from '@/types/media'
import MediaCard from '@/components/quest/MediaCard'

interface MediaGridProps {
	items: MediaItem[]
	onSelect: (item: MediaItem) => void
}

export default function MediaGrid({ items, onSelect }: MediaGridProps) {
	if (!items.length) {
		return (
			<div className="text-center text-gray-600 py-10">
				条件に一致する動画が見つかりませんでした。条件を調整してください。
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{items.map((item) => (
				<MediaCard key={item.id} item={item} onClick={onSelect} />
			))}
		</div>
	)
}


