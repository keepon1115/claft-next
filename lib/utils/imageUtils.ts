// ==========================================
// 画像最適化ユーティリティ
// ==========================================

/**
 * WebP形式の画像URLを生成
 */
export function getOptimizedImageUrl(src: string, width?: number, height?: number, quality = 75): string {
  if (!src) return ''
  
  // 既に最適化されたURLの場合はそのまま返す
  if (src.startsWith('/_next/image')) {
    return src
  }
  
  // ローカル画像の場合はNext.js Image APIを使用
  if (src.startsWith('/')) {
    const params = new URLSearchParams()
    params.set('url', src)
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())
    
    return `/_next/image?${params.toString()}`
  }
  
  // 外部URLの場合はそのまま返す（domainの設定が必要）
  return src
}

/**
 * プレースホルダー画像のData URLを生成
 */
export function generatePlaceholderDataUrl(width: number, height: number, color = '#e5e7eb'): string {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * レスポンシブ画像のsizes属性を生成
 */
export function generateResponsiveSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([query, size]) => `${query} ${size}`)
    .join(', ')
}

/**
 * 画像サイズの組み合わせを生成
 */
export function generateImageSizes(baseWidth: number, ratios: number[] = [1, 1.5, 2, 3]): number[] {
  return ratios.map(ratio => Math.round(baseWidth * ratio))
}

/**
 * ピクセル密度対応のsrcSetを生成
 */
export function generateSrcSet(src: string, width: number, densities: number[] = [1, 2, 3]): string {
  return densities
    .map(density => {
      const optimizedSrc = getOptimizedImageUrl(src, width * density)
      return `${optimizedSrc} ${density}x`
    })
    .join(', ')
}

/**
 * ブラー用のデータURLを生成（軽量版）
 */
export function generateBlurDataUrl(width = 8, height = 8): string {
  return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`
}

/**
 * 画像ファイルサイズを最適化するための品質設定
 */
export const IMAGE_QUALITY_PRESETS = {
  low: 50,        // 軽量表示用
  medium: 75,     // 標準表示用
  high: 85,       // 高品質表示用
  lossless: 100,  // ロスレス
} as const

/**
 * デバイス別のサイズ設定
 */
export const DEVICE_SIZES = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1920,
} as const

/**
 * 一般的な画像サイズのプリセット
 */
export const IMAGE_SIZE_PRESETS = {
  avatar: { width: 40, height: 40 },
  icon: { width: 24, height: 24 },
  thumbnail: { width: 150, height: 150 },
  card: { width: 300, height: 200 },
  hero: { width: 1200, height: 800 },
  og: { width: 1200, height: 630 },
} as const

/**
 * 画像形式の優先順位
 */
export const IMAGE_FORMAT_PRIORITY = ['image/avif', 'image/webp', 'image/jpeg', 'image/png'] as const

/**
 * 画像の読み込み優先度を決定
 */
export function getImageLoadingPriority(position: 'above-fold' | 'below-fold' | 'lazy'): boolean {
  return position === 'above-fold'
}

/**
 * レスポンシブ画像のsizes属性のプリセット
 */
export const RESPONSIVE_SIZES = {
  full: '100vw',
  half: '(max-width: 768px) 100vw, 50vw',
  third: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quarter: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
  avatar: '40px',
  icon: '24px',
} as const 