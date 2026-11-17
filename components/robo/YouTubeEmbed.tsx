'use client'

import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils/youtube'

interface YouTubeEmbedProps {
  url: string
  title?: string
  className?: string
}

export default function YouTubeEmbed({ url, title = 'YouTube動画', className = '' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
