# CraftStory コンポーネント

## 概要

`index.html` の `.craft-story-card` セクションを完全にReactコンポーネント化したものです。ユーザーの目標（短期・長期）の表示とアクションリンク（つくったもの・はなしたこと）を美しくアニメーション付きで表示します。

## 主な機能

- ✅ **目標セクション** - 短期目標と長期目標をカード形式で表示
- ✅ **プログレスバー** - 進捗率をアニメーション付きで視覚化
- ✅ **shimmerエフェクト** - プログレスバーの光沢アニメーション
- ✅ **アクションリンク** - つくったもの・はなしたことへのナビゲーション
- ✅ **ホバーエフェクト** - アイコン回転、カード浮上、矢印移動
- ✅ **レスポンシブ対応** - モバイル、タブレット、デスクトップ
- ✅ **認証状態対応** - ログイン・非ログイン状態の適切な表示

## 基本的な使用方法

```tsx
import CraftStory from '@/components/home/CraftStory';

export default function HomePage() {
  return (
    <div className="content-area">
      <CraftStory />
      {/* 他のコンテンツ */}
    </div>
  );
}
```

## カスタムスタイル適用

```tsx
import CraftStory from '@/components/home/CraftStory';

export default function DashboardPage() {
  return (
    <div className="dashboard-layout">
      <CraftStory className="custom-craft-story shadow-lg" />
    </div>
  );
}
```

## データ構造

### Goal（目標）インターフェイス

```tsx
interface Goal {
  id: string;            // ユニークID（例：'short-goal'）
  type: 'short' | 'long'; // 目標タイプ
  label: string;         // ラベル（例：'短期目標'）
  text: string;          // 目標内容（例：'夏休み中に...'）
  progress: number;      // 進捗率（0-100）
  icon: string;          // FontAwesomeアイコンクラス
}
```

### ActionItem（アクション）インターフェイス

```tsx
interface ActionItem {
  id: string;                        // ユニークID
  title: string;                     // タイトル（例：'つくったもの'）
  description: string;               // 説明（例：'作品ギャラリーを見る'）
  icon: string;                      // FontAwesomeアイコンクラス
  href: string;                      // リンク先URL
  color: 'primary' | 'secondary';    // 色テーマ（将来の拡張用）
}
```

## デフォルトデータ

### 目標の例

```tsx
const defaultGoals = [
  {
    id: 'short-goal',
    type: 'short',
    label: '短期目標',
    text: '夏休み中に「学校の不便を解決するミニサービス」を3つ考えてメモする',
    progress: 75,
    icon: 'fa-flag-checkered'
  },
  {
    id: 'long-goal',
    type: 'long',
    label: '長期目標',
    text: 'アイデアコンテストで優勝する',
    progress: 30,
    icon: 'fa-mountain'
  }
];
```

### アクションの例

```tsx
const defaultActions = [
  {
    id: 'created',
    title: 'つくったもの',
    description: '作品ギャラリーを見る',
    icon: 'fa-palette',
    href: '#created',
    color: 'primary'
  },
  {
    id: 'talked',
    title: 'はなしたこと', 
    description: '会話の記録を見る',
    icon: 'fa-comments',
    href: '#talked',
    color: 'secondary'
  }
];
```

## アニメーション効果

### 1. プログレスバーアニメーション

```tsx
const ProgressBar = ({ progress }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 500); // 0.5秒遅延でアニメーション開始

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="goal-progress-bar" 
         style={{ width: `${animatedProgress}%` }} />
  );
};
```

### 2. Shimmerエフェクト（光沢アニメーション）

```css
.goal-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
```

### 3. アイコンホバーエフェクト

```css
.goal-card:hover .goal-icon {
  transform: rotate(10deg) scale(1.1);
}

.action-link:hover .action-icon {
  transform: rotate(360deg);
  background: rgba(255, 255, 255, 0.3);
}
```

### 4. カードホバーエフェクト

```css
.goal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--orange);
}

.action-link:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 188, 212, 0.4);
}
```

## 高度な使用例

### 1. カスタム目標データ

```tsx
import CraftStory from '@/components/home/CraftStory';
import { useUserGoals } from '@/stores/userStore';

export default function CustomGoalsPage() {
  const { goals, isLoading, updateGoalProgress } = useUserGoals();
  
  if (isLoading) {
    return <div className="loading">目標データ読み込み中...</div>;
  }
  
  return (
    <div className="goals-dashboard">
      <CraftStory goals={goals} onGoalUpdate={updateGoalProgress} />
    </div>
  );
}
```

### 2. 動的なアクションリンク

```tsx
import CraftStory from '@/components/home/CraftStory';
import { useRouter } from 'next/navigation';

export default function InteractiveStoryPage() {
  const router = useRouter();
  
  const customActions = [
    {
      id: 'gallery',
      title: 'ポートフォリオ',
      description: '最新の作品を見る',
      icon: 'fa-images',
      href: '/portfolio',
      color: 'primary'
    },
    {
      id: 'blog',
      title: 'ブログ',
      description: '学習記録を見る',
      icon: 'fa-blog',
      href: '/blog',
      color: 'secondary'
    }
  ];
  
  const handleActionClick = (actionId: string, href: string) => {
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      window.open(href, '_blank');
    }
  };
  
  return (
    <CraftStory 
      actions={customActions}
      onActionClick={handleActionClick}
    />
  );
}
```

### 3. リアルタイム進捗更新

```tsx
import CraftStory from '@/components/home/CraftStory';
import { useGoalProgress } from '@/hooks/useGoalProgress';

export default function ProgressTrackingPage() {
  const { goals, updateProgress, isUpdating } = useGoalProgress();
  
  const handleProgressUpdate = async (goalId: string, newProgress: number) => {
    try {
      await updateProgress(goalId, newProgress);
      // 成功時の処理
      console.log('Progress updated successfully');
    } catch (error) {
      // エラー処理
      console.error('Failed to update progress:', error);
    }
  };
  
  return (
    <div className="progress-tracker">
      {isUpdating && <div className="updating-indicator">更新中...</div>}
      <CraftStory 
        goals={goals}
        onProgressUpdate={handleProgressUpdate}
        className="live-updating"
      />
    </div>
  );
}
```

## CSS変数の使用

### カラーパレット

```css
/* 目標カードの色 */
--orange: #FF9800
--pink: #FF5FA0

/* アクションリンクの色 */
--cyan: #00BCD4
--teal: #009688

/* 基本色 */
--purple: #7E57C2
--yellow: #F6CF3F
--text-dark: #333333
```

### シャドウとエフェクト

```css
--shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
```

## レスポンシブブレークポイント

| デバイス | 幅 | 調整内容 |
|----------|-----|----------|
| デスクトップ | > 768px | 2列グリッド表示 |
| タブレット | ≤ 768px | 1列に縦積み、パディング調整 |
| モバイル | ≤ 480px | さらなるパディング縮小、アイコンサイズ調整 |

## ナビゲーション処理

### 内部リンク処理

```tsx
const ActionLink = ({ action }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (action.href.startsWith('#')) {
      e.preventDefault();
      // アンカーリンクの処理
      const element = document.getElementById(action.href.substring(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    } else if (action.href.startsWith('/')) {
      e.preventDefault();
      // Next.js内部ナビゲーション
      router.push(action.href);
    }
    // 外部リンクは通常の動作
  };

  return (
    <a href={action.href} onClick={handleClick}>
      {/* アクションリンクの内容 */}
    </a>
  );
};
```

## カスタマイズ例

### 1. 目標タイプの拡張

```tsx
interface ExtendedGoal extends Goal {
  category: 'personal' | 'professional' | 'educational';
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
}

const GoalCard = ({ goal }: { goal: ExtendedGoal }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--red)';
      case 'medium': return 'var(--orange)';
      case 'low': return 'var(--green)';
      default: return 'var(--gray)';
    }
  };

  return (
    <div className="goal-card" style={{ borderColor: getPriorityColor(goal.priority) }}>
      {/* カード内容 */}
    </div>
  );
};
```

### 2. アニメーション速度のカスタマイズ

```css
/* 高速アニメーション */
.fast-animations .goal-progress-bar {
  transition: width 0.4s ease-out;
}

.fast-animations .goal-progress-bar::after {
  animation: shimmer 1s infinite;
}

/* 低速アニメーション */
.slow-animations .goal-progress-bar {
  transition: width 1.2s ease-out;
}

.slow-animations .goal-progress-bar::after {
  animation: shimmer 3s infinite;
}
```

### 3. テーマ切り替え

```tsx
const CraftStoryThemed = ({ theme = 'default', ...props }) => {
  const themeClasses = {
    default: 'craft-story-default',
    dark: 'craft-story-dark',
    colorful: 'craft-story-colorful',
    minimal: 'craft-story-minimal'
  };

  return (
    <div className={`craft-story-card ${themeClasses[theme]}`}>
      {/* コンポーネント内容 */}
      
      <style jsx>{`
        .craft-story-dark {
          background: var(--dark-bg);
          color: var(--dark-text);
        }
        
        .craft-story-colorful .goal-icon {
          background: linear-gradient(135deg, var(--rainbow-start) 0%, var(--rainbow-end) 100%);
        }
        
        .craft-story-minimal {
          box-shadow: none;
          border: 1px solid var(--gray-300);
        }
      `}</style>
    </div>
  );
};
```

## パフォーマンス最適化

### 1. メモ化による最適化

```tsx
import React, { memo } from 'react';

const GoalCard = memo(({ goal }: { goal: Goal }) => {
  // コンポーネントロジック
});

const ActionLink = memo(({ action }: { action: ActionItem }) => {
  // コンポーネントロジック
});
```

### 2. 遅延アニメーション

```tsx
const ProgressBar = ({ progress, delay = 0 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 500 + delay); // 遅延時間を調整可能

    return () => clearTimeout(timer);
  }, [progress, delay]);

  // 残りのコンポーネント
};
```

### 3. Intersection Observer による表示制御

```tsx
import { useInView } from 'react-intersection-observer';

const CraftStory = (props) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={ref} className="craft-story-card">
      {inView && (
        <>
          <GoalsSection goals={goals} />
          <ActionsSection actions={actions} />
        </>
      )}
    </div>
  );
};
```

## アクセシビリティ

### 1. キーボードナビゲーション

```tsx
const ActionLink = ({ action }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <a 
      href={action.href}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${action.title}: ${action.description}`}
    >
      {/* リンク内容 */}
    </a>
  );
};
```

### 2. スクリーンリーダー対応

```tsx
const ProgressBar = ({ progress, label }) => {
  return (
    <div className="goal-progress" role="progressbar" 
         aria-valuenow={progress} 
         aria-valuemin={0} 
         aria-valuemax={100}
         aria-label={`${label}の進捗: ${progress}%`}>
      <div 
        className="goal-progress-bar" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
```

## 既知の制限事項

1. **プログレスバー更新**: リアルタイム更新は手動実装が必要
2. **外部リンク処理**: 新しいタブで開く制御は追加実装が必要
3. **進捗データ永続化**: ローカルストレージ・サーバー同期は別途実装

## 今後の拡張予定

- [ ] 目標の追加・編集・削除機能
- [ ] 進捗データのリアルタイム同期
- [ ] より豊富なアニメーション効果
- [ ] 目標達成時の報酬システム
- [ ] ソーシャル共有機能
- [ ] 目標テンプレート機能 