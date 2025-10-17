'use client'

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'
import { listMessages, markMessageRead } from '@/lib/api/messages'
import type { MessageRecord } from '@/types/message'

export default function MessagesPage() {
	const { isAuthenticated, user, isLoading } = useAuth()
	const params = useSearchParams()
	const router = useRouter()

	const [messages, setMessages] = React.useState<MessageRecord[]>([])
	const [statusFilter, setStatusFilter] = React.useState<'all'|'unread'|'read'>(params.get('status') as any || 'all')
	const contextParam = params.get('context') || ''

	const [loading, setLoading] = React.useState(true)

	React.useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			window.dispatchEvent(new CustomEvent('openAuthModal'))
			router.push('/login')
		}
	}, [isLoading, isAuthenticated, router])

	const load = React.useCallback(async () => {
		if (!user) return
		setLoading(true)
		const [ctxType, ctxId] = contextParam.split(':')
		const list = await listMessages({ userId: user.id, status: statusFilter, context: ctxType ? { type: ctxType as any, id: ctxId } : undefined })
		setMessages(list)
		setLoading(false)
	}, [user, statusFilter, contextParam])

	React.useEffect(() => { load() }, [load])

	const handleMarkRead = async (id: string) => {
		await markMessageRead(id)
		await load()
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-3xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-4">メッセージ</h1>
				<div className="mb-4 flex gap-2">
					<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border px-3 py-2 rounded">
						<option value="all">すべて</option>
						<option value="unread">未読</option>
						<option value="read">既読</option>
					</select>
				</div>
				<div className="bg-white border rounded">
					{loading ? (
						<div className="p-6 text-center text-gray-500">読み込み中...</div>
					) : messages.length === 0 ? (
						<div className="p-6 text-center text-gray-500">メッセージはありません</div>
					) : (
						<ul className="divide-y">
							{messages.map(m => (
								<li key={m.id} className="p-4">
									<div className="flex items-start justify-between">
										<div>
											<div className="text-sm text-gray-500">{new Date(m.created_at).toLocaleString('ja-JP')} ・ {m.context_type}:{m.context_id}</div>
											<div className="font-bold">{m.title}</div>
											<p className="text-gray-700 whitespace-pre-wrap">{m.body}</p>
										</div>
										<div className="flex items-center gap-2">
											{m.status === 'unread' && (
												<button onClick={() => handleMarkRead(m.id)} className="px-3 py-1 bg-blue-600 text-white rounded">既読にする</button>
											)}
											<button onClick={() => {
												const [type, id] = (m.context_id || '').split(':')
												if (m.context_type === 'media' || type === 'mediaItem') {
													// 将来: 対象モーダルを直接開く導線を検討
													alert('対象動画の画面からご確認ください')
												}
											}} className="px-3 py-1 bg-gray-200 rounded">対象を開く</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}


