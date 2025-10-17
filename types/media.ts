'use client'

export type MediaProvider = 'youtube' | 'vimeo' | 'file'

export type Genre = 'お金・経済' | 'プレゼン・発表' | 'AI・ITスキル' | 'SDGs・環境' | '脳・心理'
export type Power = 'ひらく' | 'えがく' | 'つなぐ' | 'なりきる' | 'まきこむ'

export interface MediaItem {
	/** 一意なID */
	id: string
	/** タイトル */
	title: string
	/** 説明（任意） */
	description?: string
	/** タグ（ドメイン/チカラ混在でOK） */
	tags: string[]
	/** 再生URL（YouTube等） */
	url: string
	/** クエストURL（Googleフォーム等、任意） */
	questUrl?: string
	/** プロバイダ種別 */
	provider: MediaProvider
	/** 秒数（任意） */
	durationSec?: number
	/** サムネイル（任意。未指定ならプロバイダから推定） */
	thumbnailUrl?: string
	/** 追加メタ（任意） */
	createdAt?: string
}


