# OptimizedImage コンポーネント使用例

## 概要

`OptimizedImage`コンポーネントは、Next.js 15の`Image`コンポーネントをベースにした画像最適化コンポーネントです。

## 主な機能

- **自動最適化**: WebP/AVIF形式への自動変換
- **レスポンシブ対応**: デバイスサイズに応じた最適な画像サイズ
- **プレースホルダー**: ブラー効果付きプレースホルダー
- **フォールバック**: 画像読み込みエラー時の代替画像
- **遅延読み込み**: 画面外の画像の遅延読み込み
- **優先読み込み**: 重要な画像の優先読み込み

## 基本的な使用方法

```tsx
import OptimizedImage from '@/components/common/OptimizedImage'

// 基本的な使用法
<OptimizedImage
  src="/images/hero-image.jpg"
  alt="ヒーロー画像"
  width={800}
  height={600}
  priority={true}
/>

// フォールバック付き
<OptimizedImage
  src="/images/user-avatar.jpg"
  alt="ユーザーアバター"
  width={120}
  height={120}
  fallbackSrc="/default-avatar.png"
  enableBlur={true}
/>
```

## アバター画像の例

```tsx
// ProfileCard.tsx での使用例
const ProfileAvatar: React.FC<{ avatarUrl?: string; name: string }> = ({ 
  avatarUrl, 
  name 
}) => {
  return (
    <div className="profile-avatar">
      {avatarUrl ? (
        <OptimizedImage
          src={avatarUrl}
          alt={`${name}のアバター`}
          width={120}
          height={120}
          className="rounded-full"
          fallbackSrc="/default-avatar.png"
          priority={true}
          quality={90}
        />
      ) : (
        <div className="avatar-placeholder">
          <i className="fas fa-user"></i>
        </div>
      )}
    </div>
  )
}
```

## アイコン画像の例

```tsx
// StageNode.tsx での改良版
<OptimizedImage
  src={stage.iconImage}
  alt={`ステージ${stage.stageId}アイコン`}
  width={64}
  height={64}
  className="icon-image"
  onError={handleImageError}
  priority={stage.stageId <= 3}
  enableBlur={true}
  fallbackSrc="/icon-192.png"
  quality={90}
/>
```

## 背景画像の例

```tsx
// 背景画像として使用
<div className="hero-section">
  <OptimizedImage
    src="/images/hero-background.jpg"
    alt="ヒーロー背景"
    fill={true}
    className="absolute inset-0 object-cover"
    priority={true}
    quality={80}
    sizes="100vw"
  />
  <div className="relative z-10">
    <h1>コンテンツ</h1>
  </div>
</div>
```

## レスポンシブ画像の例

```tsx
// デバイスサイズに応じた画像
<OptimizedImage
  src="/images/responsive-image.jpg"
  alt="レスポンシブ画像"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
/>
```

## 画像ギャラリーの例

```tsx
// 画像ギャラリー
const ImageGallery: React.FC<{ images: Array<{src: string, alt: string}> }> = ({ 
  images 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={300}
          height={200}
          className="rounded-lg"
          priority={index < 4} // 最初の4枚のみ優先読み込み
          quality={75}
        />
      ))}
    </div>
  )
}
```

## カードコンポーネントでの使用

```tsx
// カード内の画像
const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
  return (
    <div className="quest-card">
      <div className="quest-image">
        <OptimizedImage
          src={quest.imageUrl}
          alt={quest.title}
          width={400}
          height={250}
          className="rounded-t-lg"
          fallbackSrc="/quest-placeholder.png"
          quality={80}
        />
      </div>
      <div className="quest-content">
        <h3>{quest.title}</h3>
        <p>{quest.description}</p>
      </div>
    </div>
  )
}
```

## エラーハンドリングの例

```tsx
// カスタムエラーハンドリング
const [imageError, setImageError] = useState(false)

<OptimizedImage
  src={user.profileImage}
  alt="プロフィール画像"
  width={100}
  height={100}
  onError={() => {
    setImageError(true)
    console.log('画像の読み込みに失敗しました')
  }}
  fallbackSrc="/default-profile.png"
/>

{imageError && (
  <p className="text-red-500 text-sm">
    画像を読み込めませんでした
  </p>
)}
```

## パフォーマンス最適化

### 優先度の設定

```tsx
// ファーストビューの画像は priority=true
<OptimizedImage
  src="/hero-image.jpg"
  alt="メイン画像"
  width={1200}
  height={800}
  priority={true} // 優先読み込み
  quality={90}
/>

// 下部の画像は遅延読み込み
<OptimizedImage
  src="/footer-image.jpg"
  alt="フッター画像"
  width={800}
  height={400}
  priority={false} // 遅延読み込み（デフォルト）
  quality={75}
/>
```

### 品質の調整

```tsx
// 用途に応じた品質設定
<OptimizedImage
  src="/thumbnail.jpg"
  alt="サムネイル"
  width={150}
  height={150}
  quality={70} // サムネイルは低品質
/>

<OptimizedImage
  src="/hero-image.jpg"
  alt="メイン画像"
  width={1200}
  height={800}
  quality={90} // メイン画像は高品質
/>
```

## 既存のimg要素からの移行

### Before (従来のimg要素)

```tsx
<img
  src="/images/example.jpg"
  alt="例の画像"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### After (OptimizedImage)

```tsx
<OptimizedImage
  src="/images/example.jpg"
  alt="例の画像"
  width={400}
  height={300}
  className="rounded-lg"
  enableBlur={true}
  quality={80}
/>
```

## 外部画像の使用

```tsx
// Supabase Storage
<OptimizedImage
  src="https://laqvpxecqvlufboquffe.supabase.co/storage/v1/object/public/images/example.jpg"
  alt="Supabase画像"
  width={400}
  height={300}
/>

// CDN画像
<OptimizedImage
  src="https://images.unsplash.com/photo-1234567890"
  alt="Unsplash画像"
  width={600}
  height={400}
/>
```

## トラブルシューティング

### 画像が表示されない場合

1. **next.config.ts**の`domains`または`remotePatterns`を確認
2. 画像パスが正しいか確認
3. `fallbackSrc`が設定されているか確認

### パフォーマンスが悪い場合

1. `priority={true}`を必要な画像のみに設定
2. `quality`を適切に調整（70-90推奨）
3. `sizes`属性を適切に設定

### ビルドエラーが発生する場合

1. `width`と`height`が数値型で設定されているか確認
2. `alt`属性が設定されているか確認
3. 画像ファイルが存在するか確認

## 関連ファイル

- `lib/utils/imageUtils.ts` - 画像ユーティリティ関数
- `next.config.ts` - 画像最適化設定
- `components/common/OptimizedImage.tsx` - メインコンポーネント 