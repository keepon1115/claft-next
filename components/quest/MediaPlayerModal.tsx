'use client'

import React, { useEffect } from 'react'
import type { MediaItem } from '@/types/media'

interface MediaPlayerModalProps {
	item: MediaItem | null
	isOpen: boolean
	onClose: () => void
}

export default function MediaPlayerModal({ item, isOpen, onClose }: MediaPlayerModalProps) {
	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => { document.body.style.overflow = prev }
	}, [isOpen])

	if (!isOpen || !item) return null

	const isYouTube = item.url.includes('youtu')
	const embedUrl = isYouTube
		? item.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
		: item.url

	return (
		<div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
			<div className="bg-white rounded-xl w-[min(960px,100%)] overflow-hidden">
				<div className="flex items-center justify-between px-4 py-2 border-b">
					<div className="font-semibold">{item.title}</div>
					<button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">閉じる</button>
				</div>
				<div className="aspect-video bg-black">
					<iframe
						className="w-full h-full"
						src={embedUrl}
						title={item.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
					/>
				</div>
				{item.description && (
					<div className="p-4 text-sm text-gray-700 border-t">{item.description}</div>
				)}
			</div>
		</div>
	)
}


