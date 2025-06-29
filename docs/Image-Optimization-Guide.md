# CLAFT 画像最適化ガイド

## 概要

CLAFTプロジェクトでは、Next.js 15のImage最適化機能を活用して、パフォーマンスとユーザー体験を向上させています。

## 実装内容

### 1. next.config.ts 最適化設定

```typescript
images: {
  // 画像最適化設定
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  domains: [
    'localhost',
    'laqvpxecqvlufboquffe.supabase.co', // Supabase Storage
    'images.unsplash.com', // Unsplash
    'cdn.pixabay.com', // Pixabay
    'res.cloudinary.com', // Cloudinary
  ],
  // セキュリティ設定
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  // キャッシュ設定
  minimumCacheTTL: 60,
  unoptimized: false,
}
```

### 2. OptimizedImageコンポーネント

再利用可能な画像最適化コンポーネントを作成：

- `components/common/OptimizedImage.tsx`
- 自動フォールバック機能
- ブラープレースホルダー
- エラーハンドリング

### 3. 画像ユーティリティ

`lib/utils/imageUtils.ts`で画像処理関連のユーティリティ関数を提供：

- プレースホルダー生成
- レスポンシブサイズ計算
- 品質プリセット

## 最適化のメリット

### パフォーマンス向上

1. **自動WebP/AVIF変換**
   - 従来のJPEG/PNGから25-35%のファイルサイズ削減
   - 読み込み時間の短縮

2. **レスポンシブ画像**
   - デバイスに応じた最適なサイズ配信
   - 帯域幅の節約

3. **遅延読み込み**
   - 画面外の画像は必要時まで読み込みを遅延
   - 初回ページ読み込み時間の短縮

### UX向上

1. **プレースホルダー**
   - ブラー効果付きプレースホルダーでレイアウトシフト防止
   - スムーズな読み込み体験

2. **フォールバック**
   - 画像読み込み失敗時の代替画像表示
   - エラー時の一貫したUX

3. **優先読み込み**
   - 重要な画像（ファーストビュー）の優先読み込み
   - LCP（Largest Contentful Paint）スコア改善

## 実装例

### StageNode.tsx

```tsx
// Before: 従来のimg要素
<img src={stage.iconImage} alt="アイコン" width={64} height={64} />

// After: 最適化されたImage
<OptimizedImage
  src={stage.iconImage}
  alt={`ステージ${stage.stageId}アイコン`}
  width={64}
  height={64}
  priority={stage.stageId <= 3} // 最初の3ステージは優先読み込み
  enableBlur={true}
  fallbackSrc="/icon-192.png"
  quality={90}
/>
```

### ProfileCard.tsx

```tsx
// アバター画像の最適化
<OptimizedImage
  src={avatarUrl}
  alt={`${character}のアバター`}
  width={120}
  height={120}
  className="rounded-full object-cover"
  fallbackSrc="/icon-192.png"
  priority={true}
  quality={90}
/>
```

## PWAキャッシュ統合

画像最適化はPWAキャッシュとも連携：

```typescript
// 画像キャッシュ（最適化済み）
{
  urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*\.(png|jpg|jpeg|webp|avif|gif|svg)$/i,
  handler: "CacheFirst",
  options: {
    cacheName: "supabase-images-cache",
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
    },
  },
},

// Next.js Image最適化キャッシュ
{
  urlPattern: /\/_next\/image\?url=.*$/,
  handler: "CacheFirst",
  options: {
    cacheName: "next-image-cache",
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
    },
  },
}
```

## パフォーマンス指標の改善予測

### Before（最適化前）

- **画像サイズ**: 平均 150KB/画像
- **読み込み時間**: 500ms-1s/画像
- **LCP**: 2.5秒
- **CLS**: 0.1

### After（最適化後）

- **画像サイズ**: 平均 50KB/画像（WebP変換）
- **読み込み時間**: 150ms-300ms/画像
- **LCP**: 1.2秒
- **CLS**: 0.05

### 具体的な改善

1. **ファイルサイズ削減**: 66%削減
2. **読み込み時間短縮**: 70%短縮
3. **LCP改善**: 52%改善
4. **CLS改善**: 50%改善

## ベストプラクティス

### 1. 優先度の設定

```tsx
// ファーストビューの画像
<OptimizedImage priority={true} />

// 下部コンテンツの画像
<OptimizedImage priority={false} />
```

### 2. 品質の調整

```tsx
// サムネイル・アイコン
<OptimizedImage quality={70} />

// メイン画像
<OptimizedImage quality={85} />

// 高品質が必要な画像
<OptimizedImage quality={95} />
```

### 3. サイズ設定

```tsx
// レスポンシブ画像
<OptimizedImage
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// 固定サイズ画像
<OptimizedImage width={400} height={300} />
```

## 監視とメンテナンス

### Core Web Vitals監視

```bash
# Lighthouse CLI
npx lighthouse http://localhost:3000 --view

# PageSpeed Insights API
curl "https://www.googleapis.com/pagespeed/v5/runPagespeed?url=https://your-domain.com&key=YOUR_API_KEY"
```

### 画像最適化の確認

1. **Network タブ**でWebP/AVIF配信を確認
2. **Performance タブ**でLCP改善を確認
3. **画像サイズ**の削減を確認

## トラブルシューティング

### よくある問題と解決法

1. **画像が表示されない**
   - `next.config.ts`のdomain設定を確認
   - 画像パスの確認
   - フォールバック画像の設定

2. **最適化が効かない**
   - `unoptimized: false`の確認
   - 開発環境では最適化が制限される場合がある
   - 本番環境でテスト

3. **パフォーマンスが悪い**
   - `priority`設定の見直し
   - `quality`の調整
   - `sizes`属性の最適化

## 今後の拡張計画

1. **画像CDN統合**
   - Cloudinary/ImageKitとの連携
   - 動的な画像変換

2. **AI画像最適化**
   - 自動品質調整
   - コンテンツ認識による最適化

3. **Progressive JPEG**
   - 段階的読み込み
   - UX向上

## 関連ファイル

- `next.config.ts` - 基本設定
- `components/common/OptimizedImage.tsx` - メインコンポーネント
- `lib/utils/imageUtils.ts` - ユーティリティ関数
- `components/common/OptimizedImage.examples.md` - 使用例 