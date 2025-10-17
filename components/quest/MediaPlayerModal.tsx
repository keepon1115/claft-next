'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { MediaItem } from '@/types/media'
import StepFlow, { StepDef } from '@/components/common/StepFlow'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface MediaPlayerModalProps {
	item: MediaItem | null
	isOpen: boolean
	onClose: () => void
}

export default function MediaPlayerModal({ item, isOpen, onClose }: MediaPlayerModalProps) {
  const { user } = useAuth()
  const [showMessage, setShowMessage] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(false)
  const [messageData, setMessageData] = useState<null | { title: string; body: string; created_at: string }>(null)
  const [toast, setToast] = useState<string | null>(null)
	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => { document.body.style.overflow = prev }
	}, [isOpen])

  // Hooks の順序を安定させるため、早期 return はフック定義の後に行う。
  // item が未確定のときはプレースホルダ値を使う。
  let unitKey = 'mediaItem:__unknown__'
  let steps: StepDef[] = []
  if (item) {
    unitKey = `mediaItem:${item.id}`
    steps = [
      { id: 'video', type: 'video', title: item.title, linkUrl: item.url, ctaLabel: '動画を開く', doneLabel: '視聴完了' },
      ...(item.questUrl ? [{ id: 'form', type: 'form', title: 'クエストに挑む', linkUrl: item.questUrl, ctaLabel: 'クエストに挑む', doneLabel: '提出完了' } as StepDef] : []),
      { id: 'complete', type: 'complete', title: '視聴クリア', doneLabel: 'クリア！' }
    ]
  }

  const openMessageModal = useCallback(async () => {
    if (!user?.id) return
    setShowMessage(true)
    setLoadingMessage(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase
        .from('messages')
        .select('title, body, created_at')
        .eq('user_id', user.id)
        .eq('context_type', 'media')
        .eq('context_id', unitKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (!error && data) {
        setMessageData(data as any)
      } else {
        setMessageData(null)
      }
    } catch (e) {
      setMessageData(null)
    } finally {
      setLoadingMessage(false)
    }
  }, [user?.id, unitKey])

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl w-[min(640px,100%)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="font-semibold">{item.title}</div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">閉じる</button>
        </div>
        <div className="p-4">
          <StepFlow
            unitKey={unitKey}
            steps={steps}
            onOpenMessages={() => openMessageModal()}
            onStepDone={(_, type) => {
              if (type === 'complete') {
                setToast('クリア！おつかれさまでした')
                setTimeout(() => setToast(null), 3000)
              }
            }}
          />
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10002]">
          <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold px-4 py-2 rounded-lg shadow">
            {toast}
          </div>
        </div>
      )}

      {/* メッセージモーダル */}
      {showMessage && (
        <div className="fixed inset-0 z-[10001] bg-black/60 flex items-center justify-center" onClick={() => setShowMessage(false)}>
          <div className="bg-white border-4 border-gray-800 p-6 max-w-lg w-[92%] rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">メッセージ</h3>
              <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setShowMessage(false)}>閉じる</button>
            </div>

            {loadingMessage ? (
              <div className="text-center py-6 text-gray-600">読み込み中...</div>
            ) : messageData ? (
              <div>
                <div className="font-semibold text-gray-900 mb-2">{messageData.title}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{messageData.body}</div>
                <div className="text-xs text-gray-400 text-right">{new Date(messageData.created_at).toLocaleString('ja-JP')}</div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600">メッセージはありません</div>
            )}
          </div>
        </div>
      )}
    </div>
	)
}


