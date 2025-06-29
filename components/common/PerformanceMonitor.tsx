'use client'

import { useEffect, useState } from 'react'
import {
  startWebVitalsTracking,
  startRealTimeMonitoring,
  getPerformanceSummary,
  analyzePerformance,
  runPerformanceAudit,
  type PerformanceSummary,
  type PerformanceAnalysis,
} from '@/lib/utils/performance'

// ==========================================
// 型定義
// ==========================================

interface PerformanceAuditResult {
  score: number
  metrics: Record<string, number>
  recommendations: string[]
}

// ==========================================
// パフォーマンス監視プロバイダー
// ==========================================

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 本番環境でのみWeb Vitals測定を開始
    if (process.env.NODE_ENV === 'production') {
      startWebVitalsTracking()
      startRealTimeMonitoring()
    }
    
    // 開発環境では軽量版のみ
    if (process.env.NODE_ENV === 'development') {
      startWebVitalsTracking()
    }
    
    return () => {
      // クリーンアップは不要（ブラウザAPIのため）
    }
  }, [])
  
  return <>{children}</>
}

// ==========================================
// パフォーマンスダッシュボード
// ==========================================

export function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [auditResult, setAuditResult] = useState<PerformanceAuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 開発環境でのみ表示
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const refreshData = async () => {
    setIsLoading(true)
    
    try {
      const [summaryData, analysisData, auditData] = await Promise.all([
        Promise.resolve(getPerformanceSummary()),
        Promise.resolve(analyzePerformance()),
        runPerformanceAudit(),
      ])
      
      setSummary(summaryData)
      setAnalysis(analysisData)
      setAuditResult(auditData)
    } catch (error) {
      console.error('パフォーマンスデータ取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      refreshData()
    }
  }, [isOpen])

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="performance-trigger"
        title="パフォーマンス監視"
      >
        📊
      </button>

      {/* ダッシュボードモーダル */}
      {isOpen && (
        <div className="performance-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="performance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="performance-header">
              <h2>🚀 パフォーマンス監視</h2>
              <div className="performance-actions">
                <button onClick={refreshData} disabled={isLoading} className="refresh-btn">
                  {isLoading ? '⏳' : '🔄'} 更新
                </button>
                <button onClick={() => setIsOpen(false)} className="close-btn">
                  ✕
                </button>
              </div>
            </div>

            <div className="performance-content">
              {/* Web Vitals概要 */}
              {summary && (
                <div className="vitals-section">
                  <h3>Web Vitals</h3>
                  <div className="vitals-grid">
                    <MetricCard
                      name="LCP"
                      label="Largest Contentful Paint"
                      value={summary.lcp?.value}
                      unit="ms"
                      rating={summary.lcp?.rating}
                      threshold={{ good: 2500, poor: 4000 }}
                    />
                    <MetricCard
                      name="FID"
                      label="First Input Delay"
                      value={summary.fid?.value}
                      unit="ms"
                      rating={summary.fid?.rating}
                      threshold={{ good: 100, poor: 300 }}
                    />
                    <MetricCard
                      name="CLS"
                      label="Cumulative Layout Shift"
                      value={summary.cls?.value}
                      unit=""
                      rating={summary.cls?.rating}
                      threshold={{ good: 0.1, poor: 0.25 }}
                    />
                    <MetricCard
                      name="FCP"
                      label="First Contentful Paint"
                      value={summary.fcp?.value}
                      unit="ms"
                      rating={summary.fcp?.rating}
                      threshold={{ good: 1800, poor: 3000 }}
                    />
                    <MetricCard
                      name="TTFB"
                      label="Time to First Byte"
                      value={summary.ttfb?.value}
                      unit="ms"
                      rating={summary.ttfb?.rating}
                      threshold={{ good: 800, poor: 1800 }}
                    />
                  </div>
                </div>
              )}

              {/* 分析結果 */}
              {analysis && (
                <div className="analysis-section">
                  <h3>パフォーマンス分析</h3>
                  <div className="overall-score">
                    <span className="score-label">総合スコア:</span>
                    <span className={`score-value ${getScoreClass(analysis.overallScore)}`}>
                      {analysis.overallScore}/100
                    </span>
                  </div>

                  {/* 推奨事項 */}
                  {analysis.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h4>🔧 改善提案</h4>
                      <ul>
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* トレンド */}
                  {analysis.trends.length > 0 && (
                    <div className="trends">
                      <h4>📈 トレンド分析</h4>
                      <div className="trend-grid">
                        {analysis.trends.map((trend, index) => (
                          <div key={index} className="trend-item">
                            <span className="trend-metric">{trend.metric}</span>
                            <span className={`trend-indicator ${trend.trend}`}>
                              {trend.trend === 'improving' ? '📈' : 
                               trend.trend === 'stable' ? '➡️' : '📉'}
                              {trend.change.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 監査結果 */}
              {auditResult && (
                <div className="audit-section">
                  <h3>簡易監査結果</h3>
                  <div className="audit-score">
                    スコア: <span className={getScoreClass(auditResult.score)}>
                      {auditResult.score}/100
                    </span>
                  </div>
                  <div className="audit-metrics">
                    <div>DOM操作: {auditResult.metrics.domManipulation?.toFixed(2)}ms</div>
                    <div>JS実行: {auditResult.metrics.jsExecution?.toFixed(2)}ms</div>
                    <div>メモリ使用量: {auditResult.metrics.memoryUsage?.toFixed(2)}MB</div>
                  </div>
                  {auditResult.recommendations.length > 0 && (
                    <div className="audit-recommendations">
                      <strong>推奨事項:</strong>
                      <ul>
                        {auditResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* デバイス情報 */}
              {summary?.deviceInfo && (
                <div className="device-section">
                  <h3>デバイス情報</h3>
                  <div className="device-info">
                    <div>画面解像度: {summary.deviceInfo.screenResolution}</div>
                    <div>接続タイプ: {summary.deviceInfo.connection}</div>
                    {summary.deviceInfo.memory && (
                      <div>デバイスメモリ: {summary.deviceInfo.memory}GB</div>
                    )}
                    <div>読み込み時間: {summary.loadTime}ms</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .performance-trigger {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          transition: transform 0.2s ease;
        }

        .performance-trigger:hover {
          transform: scale(1.1);
        }

        .performance-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .performance-modal {
          background: white;
          border-radius: 12px;
          max-width: 1000px;
          max-height: 80vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .performance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .performance-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .performance-actions {
          display: flex;
          gap: 10px;
        }

        .refresh-btn, .close-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .refresh-btn {
          background: #007bff;
          color: white;
        }

        .refresh-btn:hover {
          background: #0056b3;
        }

        .refresh-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .close-btn {
          background: #dc3545;
          color: white;
        }

        .close-btn:hover {
          background: #c82333;
        }

        .performance-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .vitals-section,
        .analysis-section,
        .audit-section,
        .device-section {
          margin-bottom: 30px;
        }

        .vitals-section h3,
        .analysis-section h3,
        .audit-section h3,
        .device-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.25rem;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .overall-score {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          font-size: 1.2rem;
        }

        .score-value {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 6px;
        }

        .score-value.good {
          background: #d4edda;
          color: #155724;
        }

        .score-value.needs-improvement {
          background: #fff3cd;
          color: #856404;
        }

        .score-value.poor {
          background: #f8d7da;
          color: #721c24;
        }

        .recommendations {
          margin-bottom: 20px;
        }

        .recommendations h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }

        .recommendations li {
          margin-bottom: 5px;
          color: #6c757d;
        }

        .trends h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .trend-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .trend-indicator.improving {
          color: #28a745;
        }

        .trend-indicator.stable {
          color: #6c757d;
        }

        .trend-indicator.degrading {
          color: #dc3545;
        }

        .audit-section .audit-score {
          font-size: 1.1rem;
          margin-bottom: 15px;
        }

        .audit-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }

        .audit-metrics div {
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .device-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .device-info div {
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .performance-modal {
            margin: 10px;
            max-height: 90vh;
          }

          .vitals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

// ==========================================
// メトリクスカードコンポーネント
// ==========================================

interface MetricCardProps {
  name: string
  label: string
  value?: number
  unit: string
  rating?: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
}

function MetricCard({ name, label, value, unit, rating, threshold }: MetricCardProps) {
  const displayValue = value !== undefined ? value.toFixed(name === 'CLS' ? 3 : 0) : '-'
  
  return (
    <div className={`metric-card ${rating || 'unknown'}`}>
      <div className="metric-name">{name}</div>
      <div className="metric-value">
        {displayValue}{unit}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-threshold">
        Good: &lt;{threshold.good}{unit} | Poor: &gt;{threshold.poor}{unit}
      </div>
      
      <style jsx>{`
        .metric-card {
          padding: 15px;
          border-radius: 8px;
          border: 2px solid;
          text-align: center;
        }

        .metric-card.good {
          border-color: #28a745;
          background: #d4edda;
        }

        .metric-card.needs-improvement {
          border-color: #ffc107;
          background: #fff3cd;
        }

        .metric-card.poor {
          border-color: #dc3545;
          background: #f8d7da;
        }

        .metric-card.unknown {
          border-color: #6c757d;
          background: #f8f9fa;
        }

        .metric-name {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 8px;
        }

        .metric-threshold {
          font-size: 0.7rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  )
}

// ==========================================
// ヘルパー関数
// ==========================================

function getScoreClass(score: number): string {
  if (score >= 90) return 'good'
  if (score >= 70) return 'needs-improvement'
  return 'poor'
}

export default {
  PerformanceProvider,
  PerformanceDashboard,
} 