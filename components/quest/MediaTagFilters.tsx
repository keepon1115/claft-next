'use client'

import React from 'react'
import { DOMAIN_TAGS, SKILL_TAGS } from '@/components/quest/mediaTags'

interface MediaTagFiltersProps {
	selected: string[]
	onToggle: (tag: string) => void
	onClear: () => void
}

export default function MediaTagFilters({ selected, onToggle, onClear }: MediaTagFiltersProps) {
	const renderTag = (tag: string) => {
		const active = selected.includes(tag)
		return (
			<button
				key={tag}
				onClick={() => onToggle(tag)}
				className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-800 border-gray-300'}`}
			>
				{tag}
			</button>
		)
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">タグで絞る</h3>
				<button className="text-sm text-gray-600 underline" onClick={onClear}>条件をクリア</button>
			</div>
			<div>
				<div className="text-xs text-gray-500 mb-1">ドメイン系</div>
				<div className="flex flex-wrap gap-2">
					{DOMAIN_TAGS.map(renderTag)}
				</div>
			</div>
			<div>
				<div className="text-xs text-gray-500 mb-1">5つのチカラ</div>
				<div className="flex flex-wrap gap-2">
					{SKILL_TAGS.map(renderTag)}
				</div>
			</div>
		</div>
	)
}


