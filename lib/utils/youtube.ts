/**
 * YouTube URL（watch / youtu.be / shorts の3形式）から動画IDを抽出する。
 * 抽出できない場合は null を返す。
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/)
      if (shortsMatch) return shortsMatch[1]
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/)
      if (embedMatch) return embedMatch[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * プライバシー強化モード（youtube-nocookie.com）の埋め込み用URLを返す。
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
