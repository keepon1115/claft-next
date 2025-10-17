'use client'

import React from 'react'
import OptimizedImage from '@/components/common/OptimizedImage'
import type { MediaItem } from '@/types/media'

interface MediaCardProps {
	item: MediaItem
	onClick: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null
    // 対応: youtu.be/<id>, youtube.com/watch?v=<id>
    try {
      const short = url.match(/youtu\.be\/([\w-]+)/)
      if (short && short[1]) return `https://img.youtube.com/vi/${short[1]}/hqdefault.jpg`
      const v = new URL(url).searchParams.get('v')
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`
      // 予備: /embed/<id>
      const embed = url.match(/youtube\.com\/embed\/([\w-]+)/)
      if (embed && embed[1]) return `https://img.youtube.com/vi/${embed[1]}/hqdefault.jpg`
    } catch {}
    return null
  }

  const thumbnail = item.thumbnailUrl || getYoutubeThumbnail(item.url) || '/icon-192.png'

	return (
		<button
			className="text-left rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
			onClick={() => onClick(item)}
		>
      <div className="aspect-video bg-gray-100">
        <OptimizedImage src={thumbnail} alt={item.title} width={640} height={360} className="w-full h-full object-cover" />
      </div>
			<div className="p-3">
				<div className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</div>
				<div className="text-xs text-gray-600 line-clamp-2">{item.description}</div>
			</div>
		</button>
	)
}


