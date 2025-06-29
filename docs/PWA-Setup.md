# PWA (Progressive Web App) セットアップガイド

CLAFTアプリケーションのPWA機能について説明します。

## 概要

CLAFTはPWA（Progressive Web App）として設計されており、以下の機能を提供します：

- **インストール可能**: ホーム画面に追加してネイティブアプリのように使用
- **オフライン対応**: インターネット接続がなくても基本機能を利用可能
- **キャッシュ機能**: 高速な読み込みとデータ節約
- **プッシュ通知**: 重要な更新をリアルタイムで通知（将来実装）

## インストール済みパッケージ

```json
{
  "dependencies": {
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "@types/next-pwa": "^2.0.2"
  }
}
```

## ファイル構成

### 設定ファイル

- `next.config.ts` - next-pwaの設定
- `public/manifest.json` - PWAアプリマニフェスト
- `public/icon-192.png` - 192x192アイコン
- `public/icon-512.png` - 512x512アイコン

### コンポーネント

- `hooks/usePWA.ts` - PWA機能管理フック
- `components/common/PWAInstallPrompt.tsx` - インストールプロンプト
- `app/offline/page.tsx` - オフライン時のフォールバックページ

## PWA機能の詳細

### 1. Service Worker設定

```typescript
// next.config.ts
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Supabase APIのキャッシュ戦略
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60, // 5分
        }
      }
    }
  ]
})
```

### 2. キャッシュ戦略

| リソースタイプ | 戦略 | 説明 |
|---------------|------|------|
| Supabase API | NetworkFirst | オンライン時は最新データ、オフライン時はキャッシュ |
| 静的アセット | CacheFirst | 画像、CSS、JSファイルは長期キャッシュ |
| ページ | NetworkFirst | HTMLページはネットワーク優先 |

### 3. オフライン対応

- `/offline` ページが自動表示
- キャッシュされたページは引き続き利用可能
- 接続復旧時に自動同期

## 使用方法

### PWAフックの使用

```tsx
import { usePWA } from '@/hooks/usePWA'

function MyComponent() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isStandalone,
    install 
  } = usePWA()

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      console.log('インストール完了!')
    }
  }

  if (isInstallable) {
    return (
      <button onClick={handleInstall}>
        アプリをインストール
      </button>
    )
  }

  return null
}
```

### インストールプロンプトのカスタマイズ

```tsx
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt'

function App() {
  return (
    <div>
      {/* アプリコンテンツ */}
      <PWAInstallPrompt 
        autoShow={true}
        showDelay={5000}
      />
    </div>
  )
}
```

## 開発時の注意事項

### 1. HTTPS環境が必須

PWA機能は本番環境（HTTPS）でのみ動作します。開発時は以下のコマンドでHTTPS環境を構築できます：

```bash
# mkcertを使用してローカル証明書を作成
npm run dev:https
```

### 2. Service Workerの更新

開発中にService Workerが古い状態で残る場合：

```bash
# キャッシュクリア
npm run clear-cache

# または手動でApplication > Storage > Clear storage
```

### 3. マニフェストファイルの検証

以下のツールでマニフェストファイルを検証：

- Chrome DevTools > Application > Manifest
- [Web App Manifest Validator](https://manifest-validator.appspot.com/)

## ビルドとデプロイ

### 1. プロダクションビルド

```bash
npm run build
```

ビルド時に以下が自動生成されます：

- `public/sw.js` - Service Worker
- `public/workbox-*.js` - Workboxライブラリ
- `public/fallback-*.html` - オフライン用フォールバック

### 2. PWA機能の確認

```bash
npm run start
```

ローカルサーバーでPWA機能をテスト：

1. Chrome DevTools > Application > Service Workers
2. Network throttling で「Offline」に設定
3. インストールプロンプトの動作確認

### 3. Lighthouse監査

PWAの品質を確認：

```bash
npm run lighthouse
```

または Chrome DevTools > Lighthouse で「Progressive Web App」を選択

## トラブルシューティング

### インストールボタンが表示されない

**原因と解決策：**

1. **HTTPS環境でない**
   ```bash
   # 本番環境またはHTTPS環境で確認
   ```

2. **Service Workerが登録されていない**
   ```javascript
   // DevTools > Application > Service Workers で確認
   navigator.serviceWorker.getRegistrations()
   ```

3. **マニフェストファイルに問題**
   ```javascript
   // DevTools > Application > Manifest で確認
   ```

### オフライン機能が動作しない

**解決策：**

1. **キャッシュ戦略の確認**
   ```typescript
   // next.config.ts のruntimeCaching設定を確認
   ```

2. **Network First戦略の調整**
   ```typescript
   // networkTimeoutSecondsを調整
   networkTimeoutSeconds: 3
   ```

### Service Workerの更新ができない

**解決策：**

1. **skipWaitingオプション**
   ```typescript
   skipWaiting: true
   ```

2. **手動更新**
   ```javascript
   // PWAUtilsを使用
   await PWAUtils.checkForSWUpdate()
   ```

## パフォーマンス最適化

### 1. キャッシュサイズ管理

```typescript
expiration: {
  maxEntries: 32,        // 最大エントリ数
  maxAgeSeconds: 86400,  // 24時間
}
```

### 2. プリキャッシュ設定

```typescript
// 重要なページを事前キャッシュ
precacheEntries: [
  '/quest',
  '/profile', 
  '/offline'
]
```

### 3. Background Sync（将来実装）

```typescript
// オフライン時のデータ同期
runtimeCaching: [{
  handler: 'NetworkOnly',
  options: {
    backgroundSync: {
      name: 'quest-sync',
      options: {
        maxRetentionTime: 24 * 60 // 24時間
      }
    }
  }
}]
```

## セキュリティ考慮事項

1. **HTTPS必須**: PWAは安全な環境でのみ動作
2. **キャッシュの適切な管理**: 機密情報はキャッシュしない
3. **Service Workerの更新**: 定期的な更新でセキュリティパッチを適用

## 今後の拡張計画

1. **プッシュ通知**: クエスト完了やイベント通知
2. **Background Sync**: オフライン時のデータ同期
3. **Web Share API**: コンテンツの共有機能
4. **Payment Request API**: 決済機能（プレミアムプラン）

## 参考リンク

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Next-PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 