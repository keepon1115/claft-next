'use client'

import React from 'react'
import type { MediaItem } from '@/types/media'

interface MediaCardProps {
	item: MediaItem
	onClick: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
	return (
		<button
			className="text-left rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
			onClick={() => onClick(item)}
		>
			<div className="aspect-video bg-gray-100 flex items-center justify-center">
				<span className="text-3xl">🎬</span>
			</div>
			<div className="p-3">
				<div className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</div>
				<div className="text-xs text-gray-600 line-clamp-2">{item.description}</div>
			</div>
		</button>
	)
}


