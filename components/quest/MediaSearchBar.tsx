'use client'

import React from 'react'

interface MediaSearchBarProps {
	value: string
	onChange: (value: string) => void
}

export default function MediaSearchBar({ value, onChange }: MediaSearchBarProps) {
	return (
		<div className="flex items-center gap-3 mb-4">
			<input
				type="text"
				className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
				placeholder="動画を検索（タイトル・説明・タグ）"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	)
}


