import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals'

// ==========================================
// パフォーマンス測定設定
// ==========================================

export interface PerformanceConfig {
  enableAnalytics: boolean
  enableConsoleLog: boolean
  enableLocalStorage: boolean
  analyticsEndpoint?: string
  debug: boolean
}

const config: PerformanceConfig = {
  enableAnalytics: process.env.NODE_ENV === 'production',
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  analyticsEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  debug: process.env.NODE_ENV === 'development',
}

// ==========================================
// Web Vitals データ型定義
// ==========================================

export interface WebVitalsData {
  id: string
  name: string
  value: number
  delta: number
  entries: PerformanceEntry[]
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  userAgent: string
  connection?: NetworkInformation['effectiveType']
}

export interface PerformanceSummary {
  lcp: WebVitalsData | null
  fid: WebVitalsData | null
  cls: WebVitalsData | null
  fcp: WebVitalsData | null
  ttfb: WebVitalsData | null
  timestamp: number
  url: string
  loadTime: number
  deviceInfo: {
    userAgent: string
    screenResolution: string
    connection: string
    memory?: number
  }
}

// ==========================================
// メトリクス評価基準
// ==========================================

const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const

// ==========================================
// メトリクス評価関数
// ==========================================

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = METRIC_THRESHOLDS[name as keyof typeof METRIC_THRESHOLDS]
  if (!thresholds) return 'good'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// ==========================================
// デバイス情報取得
// ==========================================

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    memory: (navigator as any).deviceMemory || undefined,
  }
}

// ==========================================
// データ保存・送信
// ==========================================

async function sendToAnalytics(data: WebVitalsData) {
  if (!config.enableAnalytics) return

  try {
    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Web Vitals', {
        metric: data.name,
        value: data.value,
        rating: data.rating,
        url: data.url,
      })
    }

    // カスタム分析エンドポイント
    if (config.analyticsEndpoint) {
      await fetch(config.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    }

    // ローカルストレージに保存
    if (config.enableLocalStorage) {
      const existing = JSON.parse(localStorage.getItem('webVitals') || '[]')
      existing.push(data)
      // 最新100件のみ保持
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100)
      }
      localStorage.setItem('webVitals', JSON.stringify(existing))
    }

  } catch (error) {
    console.warn('Analytics送信エラー:', error)
  }
}

function logToConsole(data: WebVitalsData) {
  if (!config.enableConsoleLog) return

  const emoji = data.rating === 'good' ? '🟢' : data.rating === 'needs-improvement' ? '🟡' : '🔴'
  console.log(
    `${emoji} ${data.name}: ${data.value.toFixed(2)}ms (${data.rating})`,
    {
      value: data.value,
      delta: data.delta,
      rating: data.rating,
      entries: data.entries,
    }
  )
}

// ==========================================
// メトリクスハンドラー
// ==========================================

function handleMetric(metric: Metric) {
  const data: WebVitalsData = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    entries: metric.entries as PerformanceEntry[],
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType,
  }

  logToConsole(data)
  sendToAnalytics(data)

  // カスタムイベント発火
  window.dispatchEvent(new CustomEvent('webVitalsMetric', { detail: data }))
}

// ==========================================
// Web Vitals測定開始
// ==========================================

export function startWebVitalsTracking() {
  try {
    getCLS(handleMetric)
    getFID(handleMetric)
    getFCP(handleMetric)
    getLCP(handleMetric)
    getTTFB(handleMetric)

    if (config.debug) {
      console.log('🚀 Web Vitals測定を開始しました')
    }
  } catch (error) {
    console.error('Web Vitals測定エラー:', error)
  }
}

// ==========================================
// パフォーマンス概要取得
// ==========================================

export function getPerformanceSummary(): PerformanceSummary | null {
  if (typeof window === 'undefined') return null

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const vitalsData = JSON.parse(localStorage.getItem('webVitals') || '[]') as WebVitalsData[]
    const currentUrl = window.location.href

    // 現在のページの最新メトリクスを取得
    const latest = vitalsData
      .filter(d => d.url === currentUrl)
      .reduce((acc, current) => {
        if (!acc[current.name] || current.timestamp > acc[current.name].timestamp) {
          acc[current.name] = current
        }
        return acc
      }, {} as Record<string, WebVitalsData>)

    return {
      lcp: latest.LCP || null,
      fid: latest.FID || null,
      cls: latest.CLS || null,
      fcp: latest.FCP || null,
      ttfb: latest.TTFB || null,
      timestamp: Date.now(),
      url: currentUrl,
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      deviceInfo: getDeviceInfo(),
    }
  } catch (error) {
    console.error('パフォーマンス概要取得エラー:', error)
    return null
  }
}

// ==========================================
// パフォーマンス分析
// ==========================================

export interface PerformanceAnalysis {
  overallScore: number
  scores: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
  recommendations: string[]
  trends: {
    metric: string
    trend: 'improving' | 'stable' | 'degrading'
    change: number
  }[]
}

export function analyzePerformance(): PerformanceAnalysis | null {
  if (typeof window === 'undefined') return null

  try {
    const vitalsData = JSON.parse(localStorage.getItem('webVitals') || '[]') as WebVitalsData[]
    const recentData = vitalsData.filter(d => Date.now() - d.timestamp < 7 * 24 * 60 * 60 * 1000) // 過去7日

    if (recentData.length === 0) return null

    // メトリクス別スコア計算
    const scores = {
      lcp: calculateScore(recentData.filter(d => d.name === 'LCP'), 'LCP'),
      fid: calculateScore(recentData.filter(d => d.name === 'FID'), 'FID'),
      cls: calculateScore(recentData.filter(d => d.name === 'CLS'), 'CLS'),
      fcp: calculateScore(recentData.filter(d => d.name === 'FCP'), 'FCP'),
      ttfb: calculateScore(recentData.filter(d => d.name === 'TTFB'), 'TTFB'),
    }

    // 総合スコア計算（LCP, FID, CLSを重視）
    const overallScore = Math.round(
      (scores.lcp * 0.25) +
      (scores.fid * 0.25) +
      (scores.cls * 0.25) +
      (scores.fcp * 0.15) +
      (scores.ttfb * 0.10)
    )

    // 推奨事項生成
    const recommendations = generateRecommendations(scores)

    // トレンド分析
    const trends = analyzeTrends(recentData)

    return {
      overallScore,
      scores,
      recommendations,
      trends,
    }
  } catch (error) {
    console.error('パフォーマンス分析エラー:', error)
    return null
  }
}

// ==========================================
// ヘルパー関数
// ==========================================

function calculateScore(data: WebVitalsData[], metricName: string): number {
  if (data.length === 0) return 0

  const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length
  const thresholds = METRIC_THRESHOLDS[metricName as keyof typeof METRIC_THRESHOLDS]
  
  if (!thresholds) return 50

  if (avg <= thresholds.good) return 100
  if (avg <= thresholds.poor) {
    // 線形補間で50-90点
    const ratio = (thresholds.poor - avg) / (thresholds.poor - thresholds.good)
    return Math.round(50 + (ratio * 40))
  }
  
  // Poor範囲で0-50点
  const maxPoor = thresholds.poor * 2 // Poor基準の2倍を最悪値と仮定
  const ratio = Math.max(0, (maxPoor - avg) / (maxPoor - thresholds.poor))
  return Math.round(ratio * 50)
}

function generateRecommendations(scores: PerformanceAnalysis['scores']): string[] {
  const recommendations: string[] = []

  if (scores.lcp < 70) {
    recommendations.push('画像最適化: WebP/AVIF形式の使用、適切なサイズ設定')
    recommendations.push('CSS最適化: クリティカルCSSのインライン化')
  }

  if (scores.fid < 70) {
    recommendations.push('JavaScript最適化: コード分割、不要なライブラリの削除')
    recommendations.push('メインスレッド最適化: 長時間実行タスクの分割')
  }

  if (scores.cls < 70) {
    recommendations.push('レイアウト安定化: 画像・動画のサイズ指定')
    recommendations.push('フォント最適化: font-displayの設定、Webフォント最適化')
  }

  if (scores.fcp < 70) {
    recommendations.push('リソース優先度最適化: 重要リソースのプリロード')
    recommendations.push('レンダリング最適化: Server-Side Renderingの活用')
  }

  if (scores.ttfb < 70) {
    recommendations.push('サーバー最適化: CDN活用、キャッシュ戦略見直し')
    recommendations.push('API最適化: レスポンス時間短縮、データ圧縮')
  }

  return recommendations
}

function analyzeTrends(data: WebVitalsData[]): PerformanceAnalysis['trends'] {
  const metrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB']
  const trends: PerformanceAnalysis['trends'] = []

  metrics.forEach(metric => {
    const metricData = data
      .filter(d => d.name === metric)
      .sort((a, b) => a.timestamp - b.timestamp)

    if (metricData.length < 2) return

    const recent = metricData.slice(-5) // 最新5件
    const older = metricData.slice(-10, -5) // その前の5件

    if (older.length === 0) return

    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length
    const change = ((recentAvg - olderAvg) / olderAvg) * 100

    let trend: 'improving' | 'stable' | 'degrading'
    if (Math.abs(change) < 5) {
      trend = 'stable'
    } else if (change < 0) {
      trend = 'improving' // 値が小さくなるのは改善
    } else {
      trend = 'degrading'
    }

    trends.push({
      metric,
      trend,
      change: Math.abs(change),
    })
  })

  return trends
}

// ==========================================
// リアルタイム監視
// ==========================================

export function startRealTimeMonitoring() {
  if (typeof window === 'undefined') return

  // パフォーマンスオブザーバー
  if ('PerformanceObserver' in window) {
    // Long Tasks 監視
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 50ms以上のタスク
            console.warn('⚠️ Long Task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            })
          }
        })
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long Tasks API非対応ブラウザでは無視
    }

    // Layout Shift 監視
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let cumulativeScore = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cumulativeScore += entry.value
          }
        })

        if (cumulativeScore > 0.1) {
          console.warn('⚠️ Layout Shift detected:', {
            cumulativeScore,
            entries: list.getEntries(),
          })
        }
      })
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // Layout Shift API非対応ブラウザでは無視
    }
  }

  // メモリ使用量監視
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
        console.warn('⚠️ High memory usage:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
          usage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`,
        })
      }
    }, 30000) // 30秒間隔
  }
}

// ==========================================
// パフォーマンス测试
// ==========================================

export async function runPerformanceAudit(): Promise<{
  score: number
  metrics: Record<string, number>
  recommendations: string[]
}> {
  return new Promise((resolve) => {
    // 簡易的なパフォーマンステスト
    const startTime = performance.now()
    
    // DOM操作テスト
    const testElement = document.createElement('div')
    testElement.innerHTML = '<p>Performance Test</p>'.repeat(1000)
    document.body.appendChild(testElement)
    
    requestAnimationFrame(() => {
      const domTime = performance.now() - startTime
      document.body.removeChild(testElement)
      
      // JavaScript実行速度テスト
      const jsStartTime = performance.now()
      let sum = 0
      for (let i = 0; i < 100000; i++) {
        sum += Math.random()
      }
      const jsTime = performance.now() - jsStartTime
      
      // メモリ使用量
      const memory = (performance as any).memory?.usedJSHeapSize || 0
      
      const metrics = {
        domManipulation: domTime,
        jsExecution: jsTime,
        memoryUsage: memory / 1024 / 1024, // MB
      }
      
      // スコア計算（簡易版）
      let score = 100
      if (domTime > 100) score -= 20
      if (jsTime > 50) score -= 20
      if (memory > 50 * 1024 * 1024) score -= 10 // 50MB超過で減点
      
      const recommendations = []
      if (domTime > 100) recommendations.push('DOM操作の最適化が必要')
      if (jsTime > 50) recommendations.push('JavaScript実行速度の改善が必要')
      if (memory > 50 * 1024 * 1024) recommendations.push('メモリ使用量の削減が必要')
      
      resolve({
        score: Math.max(0, score),
        metrics,
        recommendations,
      })
    })
  })
}

export default {
  startWebVitalsTracking,
  getPerformanceSummary,
  analyzePerformance,
  startRealTimeMonitoring,
  runPerformanceAudit,
} 