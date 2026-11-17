'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface UseUserGoalsReturn {
	shortTermGoal: string
	longTermGoal: string
	setShortTermGoal: (v: string) => void
	setLongTermGoal: (v: string) => void
	isSaving: boolean
	isLoading: boolean
	lastSavedAt: string | null
}

export const useUserGoals = (userId?: string | null): UseUserGoalsReturn => {
	const [shortTermGoal, setShortTermGoal] = useState('')
	const [longTermGoal, setLongTermGoal] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

	// 初期ロード
	useEffect(() => {
		if (!userId) {
			setShortTermGoal('')
			setLongTermGoal('')
			return
		}
		const supabase = createBrowserSupabaseClient()
		setIsLoading(true)
		supabase
			.from('user_goals')
			.select('short_term_goal,long_term_goal,updated_at')
			.eq('user_id', userId)
			.single()
			.then(({ data }) => {
				if (data) {
					setShortTermGoal(data.short_term_goal || '')
					setLongTermGoal(data.long_term_goal || '')
					setLastSavedAt(data.updated_at || null)
				}
			})
			.finally(() => setIsLoading(false))
	}, [userId])

	// 自動保存（デバウンス）
	useEffect(() => {
		if (!userId) return
		const timer = setTimeout(async () => {
			setIsSaving(true)
			const supabase = createBrowserSupabaseClient()
			await supabase
				.from('user_goals')
				.upsert({
					user_id: userId,
					short_term_goal: shortTermGoal,
					long_term_goal: longTermGoal,
					updated_at: new Date().toISOString()
				})
			setIsSaving(false)
			setLastSavedAt(new Date().toISOString())
		}, 600)
		return () => clearTimeout(timer)
	}, [userId, shortTermGoal, longTermGoal])

	return {
		shortTermGoal,
		longTermGoal,
		setShortTermGoal,
		setLongTermGoal,
		isSaving,
		isLoading,
		lastSavedAt
	}
}


