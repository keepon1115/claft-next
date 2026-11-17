'use client'

import React from 'react'
import { useQuestStore } from '@/stores/questStore'
import { useAuth } from '@/hooks/useAuth'

export type StepType = 'video' | 'form' | 'complete'

export interface StepDef {
	id: string
	type: StepType
	title: string
	description?: string
	linkUrl?: string
	ctaLabel?: string
	doneLabel?: string
	message?: string
}

interface StepFlowProps {
	unitKey: string // progress:{unitKey}:step:{id}
	steps: StepDef[]
	onOpenMessages?: (unitKey: string) => void
  onStepDone?: (stepId: string, type: StepType) => void
}

export default function StepFlow({ unitKey, steps, onOpenMessages, onStepDone }: StepFlowProps) {
	const mark = useQuestStore(s => s.markContentStepDone)
	const isDone = useQuestStore(s => s.isContentStepDone)
	const { isAuthenticated } = useAuth()

	const [active, setActive] = React.useState(0)

	// 正規の3タブを用意（formが無ければプレースホルダ）
	const tabOrder: StepType[] = ['video', 'form', 'complete']
	const stepMap = React.useMemo(() => Object.fromEntries(steps.map(s => [s.type, s])), [steps])
	const tabSteps: (StepDef & { disabled?: boolean })[] = tabOrder.map((t) => {
		const s = stepMap[t]
		if (s) return s
		if (t === 'form') return { id: 'form', type: 'form', title: 'クエストに挑む', description: '準備中です', disabled: true }
		return { id: t, type: t, title: t }
	})

  React.useEffect(() => {
    // 初期表示のみ：先頭の未完了ステップへ
    for (let i = 0; i < tabSteps.length; i++) {
      if (!isDone(unitKey, tabSteps[i].id)) { setActive(i); return }
    }
    setActive(tabSteps.length - 1)
  // unitKey が変わったときのみ自動選択を行う（ユーザー操作での遷移は上書きしない）
  }, [unitKey])

	const prevDone = (idx: number) => idx === 0 || isDone(unitKey, tabSteps[idx - 1].id)
	const canOpenTab = (idx: number, completedAll: boolean) => completedAll || prevDone(idx)

	const current = tabSteps[active]
	const completedAll = tabSteps.every(s => isDone(unitKey, s.id) || s.disabled)
	const canProceed = prevDone(active)

	const handleOpenLink = () => {
		if (!current.linkUrl || current.disabled) return
		window.open(current.linkUrl, '_blank', 'noopener,noreferrer')
	}

	const handleDone = () => {
		if (current.disabled) return
		mark(unitKey, current.id)
		if (active < tabSteps.length - 1) setActive(active + 1)
    try { onStepDone?.(current.id, current.type) } catch {}
	}

	const handleOpenMessages = () => {
		if (!isAuthenticated) {
			window.dispatchEvent(new CustomEvent('openAuthModal'))
			return
		}
		if (onOpenMessages) {
			onOpenMessages(unitKey)
			return
		}
		// メッセージセンター（未実装時は通知）
		try { window.location.assign(`/messages?context=${encodeURIComponent(unitKey)}`) } catch { alert('メッセージ機能は準備中です') }
	}

	return (
		<div className="stepflow">
			{/* タブヘッダ */}
			<div className="sf-tabs">
				{tabSteps.map((s, idx) => {
					const done = isDone(unitKey, s.id)
					const all = completedAll
					const canOpen = ((idx <= active) || canOpenTab(idx, all)) && !s.disabled
					return (
						<button
							key={s.id}
							className={`sf-tab ${idx===active?'is-active':''} ${done?'is-done':''} ${!canOpen?'is-locked':''} ${s.disabled?'is-disabled':''}`}
							onClick={() => { if (canOpen) setActive(idx) }}
							disabled={!canOpen}
						>
							<span className="sf-tab-index">{idx+1}</span>
							<span className="sf-tab-title">{s.type==='video'?'動画を見る':s.type==='form'?'クエストに挑む':'ステージクリア'}</span>
						</button>
					)
				})}
			</div>

			{/* 本文カード */}
			<div className="sf-card">
				<h3 className="sf-title">{current.title || (current.type==='video'?'動画を見る':current.type==='form'?'クエストに挑む':'ステージクリア')}</h3>
				{current.description && <p className="sf-desc">{current.description}</p>}

				<div className="sf-actions">
					{current.type !== 'complete' && (
						<>
							<button className="sf-btn sf-primary" onClick={handleOpenLink} disabled={!canProceed || current.disabled}>{current.ctaLabel || '開く'}</button>
							<button className="sf-btn sf-done" onClick={handleDone} disabled={!canProceed || current.disabled}>{current.doneLabel || '完了'}</button>
						</>
					)}
					{current.type === 'complete' && (
						<>
							<button className="sf-btn sf-done" onClick={handleDone} disabled={!canProceed}>{current.doneLabel || 'クリア！'}</button>
							<button className="sf-btn sf-secondary" onClick={handleOpenMessages}>メッセージ確認</button>
						</>
					)}
				</div>
			</div>

			{completedAll && (
				<div className="sf-complete">🎉 クリア！おつかれさまでした</div>
			)}

			<style jsx>{`
				.stepflow{ display:grid; gap:12px; }
				.sf-tabs{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
				.sf-tab{ display:flex; align-items:center; gap:8px; justify-content:center; padding:10px 12px; border:2px solid #d1d5db; background:#fff; border-radius:10px; font-weight:800; color:#374151; cursor:pointer; }
				.sf-tab.is-active{ border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,.15) inset; }
				.sf-tab.is-done{ background:#ecfdf5; border-color:#10b981; color:#065f46; }
				.sf-tab.is-locked{ cursor:not-allowed; opacity:.6; }
				.sf-tab.is-disabled{ background:#f3f4f6; border-color:#e5e7eb; color:#6b7280; }
				.sf-tab-index{ display:inline-flex; width:24px; height:24px; align-items:center; justify-content:center; background:#111827; color:#fff; border-radius:6px; font-size:.875rem; }
				.sf-tab.is-done .sf-tab-index{ background:#10b981; }
				.sf-card{ background:#fff; border:2px solid #e5e7eb; border-radius:12px; padding:16px; }
				.sf-title{ font-weight:800; margin:0 0 8px; color:#111827; }
				.sf-desc{ color:#4b5563; margin:0 0 12px; }
				.sf-actions{ display:flex; gap:8px; flex-wrap:wrap; }
				.sf-btn{ padding:10px 16px; border-radius:8px; border:0; font-weight:700; cursor:pointer; }
				.sf-primary{ background:#2563eb; color:#fff; }
				.sf-done{ background:#f59e0b; color:#fff; }
				.sf-secondary{ background:#6b7280; color:#fff; }
				.sf-complete{ background:#fef3c7; border:2px solid #f59e0b; border-radius:12px; padding:12px; text-align:center; font-weight:800; color:#92400e; }
			`}</style>
		</div>
	)
}


