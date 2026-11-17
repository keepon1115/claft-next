'use client'

import React from 'react'
import MediaSearchBar from '@/components/quest/MediaSearchBar'
import MediaTagFilters from '@/components/quest/MediaTagFilters'
import MediaGrid from '@/components/quest/MediaGrid'
import MediaPlayerModal from '@/components/quest/MediaPlayerModal'
import { mediaItems } from '@/data/media/library'
import { ALL_TAGS } from '@/components/quest/mediaTags'
import type { MediaItem } from '@/types/media'

function useDebouncedValue<T>(value: T, delay = 300) {
	const [v, setV] = React.useState(value)
	React.useEffect(() => {
		const id = setTimeout(() => setV(value), delay)
		return () => clearTimeout(id)
	}, [value, delay])
	return v
}

export default function JibunMediaLibrary() {
	const [query, setQuery] = React.useState('')
	const [selectedTags, setSelectedTags] = React.useState<string[]>([])
	const [selected, setSelected] = React.useState<MediaItem | null>(null)
	const [open, setOpen] = React.useState(false)

	const debouncedQuery = useDebouncedValue(query, 300)

	const filtered = React.useMemo(() => {
		const q = debouncedQuery.trim().toLowerCase()
		return mediaItems.filter((item) => {
			// 検索
			const inText = !q || [item.title, item.description, ...(item.tags || [])]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
				.includes(q)
			// タグAND
			const hasAllTags = selectedTags.every(tag => item.tags.includes(tag))
			return inText && hasAllTags
		}).sort((a, b) => a.title.localeCompare(b.title))
	}, [debouncedQuery, selectedTags])

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
	}

	const clearFilters = () => {
		setSelectedTags([])
		setQuery('')
	}

	return (
		<div className="jibun-media p-4 bg-white/80 rounded-xl border border-gray-200">
			<div className="mb-4">
				<h2 className="text-xl font-bold">🎥 ジブンクラフト メディアライブラリ</h2>
				<p className="text-sm text-gray-600">動画を検索・タグで絞り込みできます</p>
			</div>
			<MediaSearchBar value={query} onChange={setQuery} />
			<div className="mb-4">
				<MediaTagFilters selected={selectedTags} onToggle={toggleTag} onClear={clearFilters} />
			</div>
			<MediaGrid items={filtered} onSelect={(item) => { setSelected(item); setOpen(true) }} />

			<MediaPlayerModal item={selected} isOpen={open} onClose={() => setOpen(false)} />
		</div>
	)
}


