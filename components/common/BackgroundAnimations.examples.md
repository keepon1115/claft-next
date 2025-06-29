# BackgroundAnimations コンポーネント

## 概要

`BackgroundAnimations`は、アプリケーションの背景に美しいアニメーション効果（雲の動き、都市シルエット、空のグラデーション）を提供するコンポーネントです。

## 特徴

- 🌤️ **雲のアニメーション**: 3つの異なる雲が異なる速度で流れる
- 🏙️ **都市シルエット**: 建物のシルエットをclip-pathで表現
- 🌅 **空のグラデーション**: 時間帯に応じた美しいグラデーション
- 📱 **レスポンシブ対応**: 画面サイズに応じてスケール調整
- ⚡ **パフォーマンス最適化**: CSS transforms、will-changeを使用
- ♿ **アクセシビリティ対応**: prefers-reduced-motionに対応

## Props

| プロパティ | 型 | デフォルト | 説明 |
|-----------|------|----------|------|
| `className` | `string` | `''` | 追加のCSSクラス |

## 基本的な使用方法

```tsx
import BackgroundAnimations from '@/components/common/BackgroundAnimations';

function App() {
  return (
    <div>
      {/* 固定された背景アニメーション */}
      <BackgroundAnimations />
      
      {/* メインコンテンツ */}
      <main>
        <h1>コンテンツ</h1>
      </main>
    </div>
  );
}
```

## レイアウトでの使用

```tsx
// app/layout.tsx
import BackgroundAnimations from '@/components/common/BackgroundAnimations';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <BackgroundAnimations />
        {children}
      </body>
    </html>
  );
}
```

## カスタムスタイルの適用

```tsx
function CustomBackgroundPage() {
  return (
    <div>
      <BackgroundAnimations className="custom-bg" />
      
      <style jsx>{`
        :global(.custom-bg) {
          opacity: 0.8;
          filter: hue-rotate(30deg);
        }
      `}</style>
    </div>
  );
}
```

## 複数の背景効果

```tsx
function MultiLayerBackground() {
  return (
    <div className="relative">
      {/* 基本の背景 */}
      <BackgroundAnimations />
      
      {/* 追加のオーバーレイ */}
      <div className="
        fixed inset-0 z-[-1]
        bg-gradient-to-t from-black/10 to-transparent
        pointer-events-none
      " />
      
      <main>コンテンツ</main>
    </div>
  );
}
```

## テーマ別の背景

```tsx
function ThemedBackground({ theme }: { theme: 'day' | 'sunset' | 'night' }) {
  const themeClass = {
    day: 'theme-day',
    sunset: 'theme-sunset', 
    night: 'theme-night'
  }[theme];

  return (
    <div>
      <BackgroundAnimations className={themeClass} />
      
      <style jsx>{`
        :global(.theme-day) {
          /* 昼間のテーマ - デフォルト */
        }
        
        :global(.theme-sunset) {
          filter: hue-rotate(30deg) saturate(1.2);
        }
        
        :global(.theme-night) {
          filter: brightness(0.7) hue-rotate(240deg);
        }
      `}</style>
    </div>
  );
}
```

## アニメーション制御

```tsx
function ControlledAnimation() {
  const [paused, setPaused] = useState(false);

  return (
    <div>
      <BackgroundAnimations className={paused ? 'paused' : ''} />
      
      <button onClick={() => setPaused(!paused)}>
        {paused ? '再生' : '停止'}
      </button>
      
      <style jsx>{`
        :global(.paused .cloud) {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
```

## レスポンシブカスタマイズ

```tsx
function ResponsiveBackground() {
  return (
    <div>
      <BackgroundAnimations className="responsive-bg" />
      
      <style jsx>{`
        :global(.responsive-bg) {
          /* モバイルでより控えめに */
        }
        
        @media (max-width: 480px) {
          :global(.responsive-bg .cloud) {
            opacity: 0.5;
            transform: scale(0.5);
          }
          
          :global(.responsive-bg .city-silhouette) {
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
}
```

## パフォーマンスの最適化

```tsx
function OptimizedBackground() {
  const [visible, setVisible] = useState(true);
  
  // バッテリー残量やパフォーマンス状況に応じて表示制御
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setVisible(!mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div>
      {visible && <BackgroundAnimations />}
      <main>コンテンツ</main>
    </div>
  );
}
```

## アニメーション詳細

### 雲のアニメーション
- **cloud1**: 25秒で画面を横断、遅延0秒
- **cloud2**: 30秒で画面を横断、遅延-10秒
- **cloud3**: 35秒で画面を横断、遅延-20秒

### 都市シルエット
- **clip-path**でビル群のシルエットを表現
- **height**: デスクトップ200px、タブレット150px、モバイル120px

### 空のグラデーション
- **#87CEEB** (Sky Blue) → **#F0F8FF** (Alice Blue)
- 5段階のグラデーション

## アクセシビリティ

```tsx
// prefers-reduced-motionへの対応例
function AccessibleBackground() {
  return (
    <div>
      <BackgroundAnimations />
      
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.background-wrapper .cloud) {
            animation-duration: 60s; /* より遅く */
          }
        }
        
        @media (prefers-contrast: high) {
          :global(.background-wrapper) {
            filter: contrast(1.5);
          }
        }
      `}</style>
    </div>
  );
}
```

## トラブルシューティング

### 雲が見えない場合
- z-indexの競合を確認
- parentのoverflowプロパティを確認

### パフォーマンスが悪い場合
- `will-change: transform`が適用されているか確認
- 複数の背景アニメーションが重複していないか確認

### レスポンシブで表示が崩れる場合
- CSSのmedia queryの順序を確認
- transformのscaleが適切に適用されているか確認

## 関連コンポーネント

- `Header` - ヘッダーコンポーネント
- `Sidebar` - サイドバーコンポーネント
- `HamburgerMenu` - メニューコンポーネント

## 更新履歴

- v1.0.0: 初期リリース
- v1.1.0: レスポンシブ対応強化
- v1.2.0: アクセシビリティ改善 