// カリキュラム動画(/videos)の動画リスト。
// 動画の追加・変更はこのファイルの編集だけで完結する(管理画面は作らない)。
// 詳細仕様: docs/renovation/06-videos.md

export type VideoCategory = 'minecraft' | 'presentation' | 'ai' | 'robot'

export interface CurriculumVideo {
  id: string
  category: VideoCategory
  title: string
  description?: string
  youtubeId?: string // YouTube動画はこちら。ページ内モーダルで再生される
  url?: string // YouTube以外はこちら。新しいタブで開く
  thumbnail?: string // 省略時はYouTubeサムネ(hqdefault)を自動使用
}

// 追加例:
// { id: 'mc-001', category: 'minecraft', title: '第1回 ワールドの歩き方', youtubeId: 'XXXXXXXXXXX' },
export const CURRICULUM_VIDEOS: CurriculumVideo[] = []

export const CATEGORY_META: Record<VideoCategory, { label: string; icon: string }> = {
  minecraft: { label: 'マイクラ', icon: '⛏️' },
  presentation: { label: '発表', icon: '🎤' },
  ai: { label: 'AI', icon: '🤖' },
  robot: { label: 'ロボット', icon: '🦾' },
}

export const CATEGORY_ORDER: VideoCategory[] = ['minecraft', 'presentation', 'ai', 'robot']
