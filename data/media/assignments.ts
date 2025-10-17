import type { Genre, Power } from '@/types/media'

// 各メディアIDごとにジャンル/5つのチカラを手入力で紐づけます。
// 必要に応じて配列を増減してください。
export const mediaAssignments: Record<string, { genres: Genre[]; powers: Power[] }> = {
	// 例: 'mem-1': { genres: ['脳・心理'], powers: ['ひらく'] },
	'mem-1': { genres: [], powers: [] },
	'mem-2': { genres: [], powers: [] },
	'mem-3': { genres: [], powers: [] },
	'sup-1': { genres: [], powers: [] },
	'sup-2': { genres: [], powers: [] },
}


