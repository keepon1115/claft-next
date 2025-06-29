const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const fs = require('fs')
const path = require('path')

// ==========================================
// 設定
// ==========================================

const config = {
  // 監査対象URL
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/quest',
    'http://localhost:3000/profile',
  ],
  // Lighthouse設定
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36',
    },
  },
  // 目標スコア
  thresholds: {
    performance: 90,
    accessibility: 100,
    'best-practices': 100,
    seo: 100,
    pwa: 80,
  },
}

// ==========================================
// Chrome起動とLighthouse実行
// ==========================================

async function runLighthouse(url) {
  console.log(`🚀 Lighthouse監査開始: ${url}`)
  
  const chrome = await chromeLauncher.launch({ 
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] 
  })
  
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      ...config.lighthouseConfig,
    })
    
    return result
  } finally {
    await chrome.kill()
  }
}

// ==========================================
// 結果分析
// ==========================================

function analyzeResults(results) {
  const analysis = {
    overall: { passed: 0, failed: 0 },
    categories: {},
    recommendations: [],
    criticalIssues: [],
  }

  results.forEach(({ url, result }) => {
    console.log(`\n📊 ${url} の結果:`)
    
    Object.entries(result.lhr.categories).forEach(([categoryId, category]) => {
      const score = Math.round(category.score * 100)
      const threshold = config.thresholds[categoryId] || 90
      const passed = score >= threshold
      
      if (!analysis.categories[categoryId]) {
        analysis.categories[categoryId] = { scores: [], passed: 0, failed: 0 }
      }
      
      analysis.categories[categoryId].scores.push({ url, score })
      
      if (passed) {
        analysis.categories[categoryId].passed++
        analysis.overall.passed++
        console.log(`  ✅ ${category.title}: ${score}/100`)
      } else {
        analysis.categories[categoryId].failed++
        analysis.overall.failed++
        console.log(`  ❌ ${category.title}: ${score}/100 (目標: ${threshold})`)
      }
    })

    // パフォーマンス最適化の推奨事項
    const audits = result.lhr.audits
    const performanceRecommendations = [
      'largest-contentful-paint',
      'first-input-delay',
      'cumulative-layout-shift',
      'speed-index',
      'total-blocking-time',
    ]

    performanceRecommendations.forEach(auditId => {
      const audit = audits[auditId]
      if (audit && audit.score < 0.9) {
        analysis.recommendations.push({
          url,
          category: 'Performance',
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
        })
      }
    })

    // 重要な問題を特定
    Object.values(audits).forEach(audit => {
      if (audit.score !== null && audit.score < 0.5 && audit.scoreDisplayMode !== 'informative') {
        analysis.criticalIssues.push({
          url,
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
        })
      }
    })
  })

  return analysis
}

// ==========================================
// レポート生成
// ==========================================

function generateReport(results, analysis) {
  const timestamp = new Date().toISOString()
  const reportDir = path.join(__dirname, '../lighthouse-reports')
  
  // ディレクトリ作成
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  // HTML レポート保存
  results.forEach(({ url, result }, index) => {
    const filename = `report-${index + 1}-${timestamp.split('T')[0]}.html`
    const filepath = path.join(reportDir, filename)
    fs.writeFileSync(filepath, result.report)
    console.log(`💾 HTMLレポート保存: ${filepath}`)
  })

  // JSON サマリー作成
  const summary = {
    timestamp,
    overall: analysis.overall,
    categories: Object.entries(analysis.categories).map(([id, data]) => ({
      id,
      averageScore: Math.round(data.scores.reduce((sum, s) => sum + s.score, 0) / data.scores.length),
      passed: data.passed,
      failed: data.failed,
      scores: data.scores,
    })),
    recommendations: analysis.recommendations,
    criticalIssues: analysis.criticalIssues,
  }

  const summaryPath = path.join(reportDir, `summary-${timestamp.split('T')[0]}.json`)
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
  console.log(`💾 サマリー保存: ${summaryPath}`)

  return summary
}

// ==========================================
// 最適化提案
// ==========================================

function generateOptimizationSuggestions(analysis) {
  console.log('\n🔧 最適化提案:')
  
  const suggestions = new Set()

  analysis.recommendations.forEach(rec => {
    if (rec.category === 'Performance') {
      if (rec.title.includes('Largest Contentful Paint')) {
        suggestions.add('- 画像最適化: next/imageでWebP/AVIF使用、適切なサイズ設定')
        suggestions.add('- CSS最適化: クリティカルCSSのインライン化')
      }
      if (rec.title.includes('First Input Delay') || rec.title.includes('Total Blocking Time')) {
        suggestions.add('- JavaScript最適化: コード分割、動的インポート活用')
        suggestions.add('- メインスレッド最適化: 長時間実行タスクの分割')
      }
      if (rec.title.includes('Cumulative Layout Shift')) {
        suggestions.add('- レイアウト安定化: 画像・動画のサイズ指定')
        suggestions.add('- フォント最適化: font-display設定')
      }
    }
  })

  // カテゴリ別の低スコア対応
  Object.entries(analysis.categories).forEach(([categoryId, data]) => {
    const avgScore = data.scores.reduce((sum, s) => sum + s.score, 0) / data.scores.length
    if (avgScore < 90) {
      switch (categoryId) {
        case 'performance':
          suggestions.add('- バンドルサイズ削減: webpack-bundle-analyzerで分析')
          suggestions.add('- キャッシュ戦略最適化: Service Worker活用')
          break
        case 'accessibility':
          suggestions.add('- アクセシビリティ改善: alt属性、ARIA対応')
          break
        case 'best-practices':
          suggestions.add('- セキュリティヘッダー設定')
          suggestions.add('- HTTPS使用、Content Security Policy設定')
          break
        case 'seo':
          suggestions.add('- メタタグ最適化: title, description設定')
          suggestions.add('- 構造化データ追加')
          break
      }
    }
  })

  Array.from(suggestions).forEach(suggestion => {
    console.log(suggestion)
  })
}

// ==========================================
// メイン実行
// ==========================================

async function main() {
  console.log('🚦 Lighthouse パフォーマンス監査開始\n')
  
  try {
    // 全URLで監査実行
    const results = []
    for (const url of config.urls) {
      const result = await runLighthouse(url)
      results.push({ url, result })
    }

    // 結果分析
    const analysis = analyzeResults(results)
    
    // レポート生成
    const summary = generateReport(results, analysis)
    
    // 最適化提案
    generateOptimizationSuggestions(analysis)
    
    // 総合結果
    console.log('\n📈 総合結果:')
    console.log(`  ✅ 合格: ${analysis.overall.passed}`)
    console.log(`  ❌ 不合格: ${analysis.overall.failed}`)
    
    const overallScore = Math.round(
      (analysis.overall.passed / (analysis.overall.passed + analysis.overall.failed)) * 100
    )
    console.log(`  🎯 総合スコア: ${overallScore}%`)
    
    if (overallScore >= 90) {
      console.log('  🎉 目標達成！優秀なパフォーマンスです')
      process.exit(0)
    } else {
      console.log('  ⚠️ 改善が必要です')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  }
}

// CLI実行時
if (require.main === module) {
  main()
}

module.exports = { runLighthouse, analyzeResults, generateReport } 