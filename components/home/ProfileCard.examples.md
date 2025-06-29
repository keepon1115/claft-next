# ProfileCard コンポーネント

## 概要

`index.html` の `.profile-card` セクションを完全にReactコンポーネント化したものです。アバター、名前、キャラクター特性、能力・特性（とくい/よわみ）、パーソナル情報を美しくアニメーション付きで表示します。

## 主な機能

- ✅ **アバター表示** - キャラクタータイプに応じたアイコン表示とfloat効果
- ✅ **プロフィール情報** - 名前、キャラクター、セリフの表示
- ✅ **能力・特性** - とくい・よわみのタグ表示
- ✅ **パーソナル情報** - 好きな場所、エネルギーチャージ方法
- ✅ **冒険パートナー** - 一緒に冒険したい人の情報
- ✅ **ひとこと** - ユーザーメッセージ
- ✅ **編集ボタン** - ログイン状態に応じた適切な遷移
- ✅ **アニメーション** - float、glow、rotate、pulseなどの効果
- ✅ **レスポンシブ対応** - モバイル、タブレット、デスクトップ
- ✅ **ユーザーストア連携** - リアルタイムデータ更新

## 基本的な使用方法

```tsx
import ProfileCard from '@/components/home/ProfileCard';

export default function HomePage() {
  return (
    <div className="main-content">
      <ProfileCard />
      {/* 他のコンテンツ */}
    </div>
  );
}
```

## カスタムスタイル適用

```tsx
import ProfileCard from '@/components/home/ProfileCard';

export default function DashboardPage() {
  return (
    <div className="dashboard-layout">
      <ProfileCard className="custom-profile-card shadow-lg" />
    </div>
  );
}
```

## データ構造

コンポーネントは `userStore` から以下のデータを取得します：

```tsx
interface ProfileData {
  nickname: string;           // ユーザー名（例：いちろう）
  character: string;          // キャラクタータイプ（例：冒険大好き！挑戦者タイプ）
  skills: string[];           // とくい（例：['プログラミング', 'デザイン']）
  weakness: string;           // よわみ（例：時間管理）
  favoritePlace: string;     // 好きな場所（例：河川敷で友だちとキャッチボール）
  energyCharge: string;      // エネルギーチャージ方法（例：ヘッドホンで音楽を聴く）
  companion: string;         // 冒険パートナー（例：新しいアイデアを共有しあえる仲間）
  catchphrase: string;       // セリフ（例：「新しいことにチャレンジだ！」）
  message: string;           // ひとこと（例：毎日が新しい冒険！...）
}
```

## 認証状態による表示

### ログイン時
- 実際のユーザーデータを表示
- 「プロフィール編集」ボタン → `/profile` へ遷移
- データが未設定の場合はデフォルト値を表示

### 非ログイン時
- ゲスト用のデータを表示
- 「ログインして編集」ボタン → `/profile?auth=login` へ遷移
- 冒険への誘導メッセージを表示

## キャラクターアイコンマッピング

```tsx
const iconMap = {
  '勇者': 'fa-shield-alt',
  '魔法使い': 'fa-hat-wizard',
  '探検家': 'fa-compass',
  '発明家': 'fa-cog',
  '芸術家': 'fa-palette',
  '学者': 'fa-book'
};
```

新しいキャラクタータイプを追加する場合は、このマッピングを更新してください。

## アニメーション効果

### 1. フロートアバター（float-avatar）
```css
@keyframes float-avatar {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### 2. アイコン呼吸（breathe-icon）
```css
@keyframes breathe-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 3. ステータス点滅（pulse-indicator）
```css
@keyframes pulse-indicator {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### 4. セリフの光る効果（glow-catchphrase）
```css
@keyframes glow-catchphrase {
  0% { box-shadow: 0 4px 15px rgba(246, 207, 63, 0.3); }
  100% { box-shadow: 0 4px 25px rgba(246, 207, 63, 0.5); }
}
```

### 5. 背景回転（rotate-bg）
```css
@keyframes rotate-bg {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## レスポンシブブレークポイント

| デバイス | 幅 | 調整内容 |
|----------|-----|----------|
| デスクトップ | > 768px | フル機能 |
| タブレット | ≤ 768px | 能力カードを縦積み |
| モバイル | ≤ 480px | パディング調整、アバターサイズ縮小 |

## 高度な使用例

### 1. カスタムローディング

```tsx
import ProfileCard from '@/components/home/ProfileCard';
import { useUserProfile } from '@/stores/userStore';

export default function CustomProfilePage() {
  const { isLoading } = useUserProfile();
  
  if (isLoading) {
    return <div className="custom-loader">プロフィール読み込み中...</div>;
  }
  
  return <ProfileCard className="premium-profile" />;
}
```

### 2. プロフィール表示モード

```tsx
import ProfileCard from '@/components/home/ProfileCard';

// 読み取り専用モード（例：他のユーザーのプロフィール表示）
export default function UserProfileView({ userId }: { userId: string }) {
  // 特定のユーザーのデータを取得するカスタムフック
  const { userData, isLoading } = useUserProfileById(userId);
  
  return (
    <div className="profile-view-mode">
      <ProfileCard className="read-only" />
      {/* 編集ボタンは表示されない */}
    </div>
  );
}
```

### 3. プロフィール完成度インジケーター

```tsx
import ProfileCard from '@/components/home/ProfileCard';
import { useUserProfile } from '@/stores/userStore';

export default function ProfileWithCompletion() {
  const { profileData } = useUserProfile();
  
  const completionPercentage = useMemo(() => {
    const fields = [
      profileData.nickname,
      profileData.character,
      profileData.skills?.length > 0,
      profileData.favoritePlace,
      profileData.energyCharge,
      profileData.companion,
      profileData.catchphrase,
      profileData.message
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profileData]);
  
  return (
    <div className="profile-with-completion">
      <div className="completion-badge">
        プロフィール完成度: {completionPercentage}%
      </div>
      <ProfileCard />
    </div>
  );
}
```

## スタイリングの注意点

### CSS変数の使用
コンポーネントは `globals.css` で定義されたCSS変数を使用します：

```css
/* 使用されるCSS変数 */
--purple: #7E57C2
--pink: #FF5FA0
--blue: #29B6F6
--green: #4CAF50
--yellow: #F6CF3F
--gold: #FFD700
--gray: #E0E0E0
--text-dark: #333333
```

### スタイルの優先順位
1. インラインstyles（styled-jsx）
2. `globals.css`のクラス
3. Tailwind CSS
4. ブラウザデフォルト

## パフォーマンス最適化

### 1. メモ化の活用
```tsx
import React, { memo } from 'react';

const ProfileCard = memo(({ className }) => {
  // コンポーネントロジック
});
```

### 2. 画像の遅延読み込み
```tsx
// アバター画像を使用する場合
<img 
  src={avatarUrl} 
  loading="lazy" 
  alt="プロフィールアバター"
/>
```

### 3. アニメーションの制御
```css
/* アニメーションを無効にしたいユーザー向け */
@media (prefers-reduced-motion: reduce) {
  .profile-avatar,
  .status-indicator,
  .profile-catchphrase {
    animation: none;
  }
}
```

## デバッグとテスト

### 開発者ツール
```tsx
// デバッグ用のログ出力
if (process.env.NODE_ENV === 'development') {
  console.log('ProfileCard data:', defaultData);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Is loading:', isLoading);
}
```

### テスト例
```tsx
import { render, screen } from '@testing-library/react';
import ProfileCard from '@/components/home/ProfileCard';

test('ゲストユーザーの表示', () => {
  render(<ProfileCard />);
  expect(screen.getByText('ゲスト冒険者')).toBeInTheDocument();
  expect(screen.getByText('ログインして編集')).toBeInTheDocument();
});

test('認証済みユーザーの表示', () => {
  // モックデータとストアのセットアップ
  render(<ProfileCard />);
  expect(screen.getByText('プロフィール編集')).toBeInTheDocument();
});
```

## 既知の制限事項

1. **アバター画像**: 現在はアイコンフォントのみ対応、カスタム画像は非対応
2. **リアルタイム更新**: WebSocketは未実装、ページ更新が必要
3. **国際化**: 日本語のみ対応、多言語対応は今後の課題

## 今後の拡張予定

- [ ] アバター画像のアップロード機能
- [ ] プロフィールのリアルタイム更新
- [ ] ソーシャルリンクの表示
- [ ] スキルレベルの視覚的表示
- [ ] プロフィールの共有機能
- [ ] テーマのカスタマイズ機能 