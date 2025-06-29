# JibunCraft コンポーネント

## 概要

`index.html` の `.jibun-craft-card` セクションとレベルアップモーダルを完全にReactコンポーネント化したものです。5つの力メーター、スキルタブ、レベルアップモーダルを美しくアニメーション付きで表示します。

## 主な機能

- ✅ **5つの力メーター** - つなぐ力、ひらく力、えがく力、なりきる力、まきこむ力
- ✅ **PowerMeterサブコンポーネント** - 各力の個別表示とアニメーション
- ✅ **スキルタブ** - お金、技術、対話力、？？？（ロック済み）
- ✅ **レベルアップモーダル** - 報酬表示とアニメーション
- ✅ **Shimmerエフェクト** - パワーバーの光沢アニメーション
- ✅ **アクティブ状態管理** - スキルタブの切り替え
- ✅ **レスポンシブ対応** - モバイル、タブレット、デスクトップ
- ✅ **ユーザーストア連携** - 認証状態に応じた表示

## 基本的な使用方法

```tsx
import JibunCraft from '@/components/home/JibunCraft';

export default function HomePage() {
  return (
    <div className="content-area">
      <JibunCraft />
      {/* 他のコンテンツ */}
    </div>
  );
}
```

## カスタムスタイル適用

```tsx
import JibunCraft from '@/components/home/JibunCraft';

export default function DashboardPage() {
  return (
    <div className="dashboard-layout">
      <JibunCraft className="custom-jibun-craft shadow-lg" />
    </div>
  );
}
```

## データ構造

### PowerMeter（力メーター）インターフェイス

```tsx
interface PowerMeter {
  id: string;                                      // ユニークID
  name: string;                                    // 力の名前（例：'つなぐ力'）
  level: number;                                   // レベル（例：4）
  progress: number;                                // 進捗率（0-100）
  icon: string;                                    // FontAwesomeアイコンクラス
  color: 'tsunagu' | 'hiraku' | 'egaku' | 'narikiru' | 'makikomu'; // 色テーマ
}
```

### SkillTab（スキルタブ）インターフェイス

```tsx
interface SkillTab {
  id: string;           // ユニークID
  label: string;        // ラベル（例：'お金'）
  level: number;        // レベル（例：5）
  icon: string;         // FontAwesomeアイコンクラス
  unlocked: boolean;    // ロック状態
}
```

### LevelUpData（レベルアップ）インターフェイス

```tsx
interface LevelUpData {
  newLevel: number;           // 新しいレベル
  rewards: RewardItem[];      // 報酬リスト
}

interface RewardItem {
  id: string;                              // ユニークID
  type: 'exp' | 'badge' | 'skill' | 'other'; // 報酬タイプ
  icon: string;                            // FontAwesomeアイコンクラス
  text: string;                            // 表示テキスト
}
```

## デフォルトデータ

### 5つの力メーター

```tsx
const defaultPowerMeters = [
  {
    id: 'tsunagu',
    name: 'つなぐ力',
    level: 4,
    progress: 40,
    icon: 'fa-link',
    color: 'tsunagu' // ブルー系
  },
  {
    id: 'hiraku',
    name: 'ひらく力',
    level: 6,
    progress: 60,
    icon: 'fa-lightbulb',
    color: 'hiraku' // パープル系
  },
  {
    id: 'egaku',
    name: 'えがく力',
    level: 6,
    progress: 60,
    icon: 'fa-pencil-ruler',
    color: 'egaku' // オレンジ系
  },
  {
    id: 'narikiru',
    name: 'なりきる力',
    level: 4,
    progress: 40,
    icon: 'fa-theater-masks',
    color: 'narikiru' // ピンク系
  },
  {
    id: 'makikomu',
    name: 'まきこむ力',
    level: 4,
    progress: 40,
    icon: 'fa-users',
    color: 'makikomu' // グリーン系
  }
];
```

### スキルタブ

```tsx
const defaultSkillTabs = [
  {
    id: 'money',
    label: 'お金',
    level: 5,
    icon: 'fa-yen-sign',
    unlocked: true
  },
  {
    id: 'technology',
    label: '技術',
    level: 3,
    icon: 'fa-laptop-code',
    unlocked: true
  },
  {
    id: 'communication',
    label: '対話力',
    level: 4,
    icon: 'fa-comments',
    unlocked: true
  },
  {
    id: 'mystery',
    label: '？？？',
    level: 0,
    icon: 'fa-lock',
    unlocked: false // ロック状態
  }
];
```

## コンポーネント構造

### PowerMeterComponent（個別力メーター）

```tsx
const PowerMeterComponent = ({ power }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(power.progress);
    }, 300); // 0.3秒遅延でアニメーション開始

    return () => clearTimeout(timer);
  }, [power.progress]);

  return (
    <div className="power-meter">
      <div className="power-header">
        <span className="power-name">
          <span className={`power-icon ${power.color}`}>
            <i className={`fas ${power.icon}`}></i>
          </span>
          {power.name}
        </span>
        <span className="power-level">Lv. {power.level}</span>
      </div>
      <div className="power-bar-container">
        <div 
          className={`power-bar ${power.color}`} 
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};
```

### SkillTabComponent（個別スキル）

```tsx
const SkillTabComponent = ({ skill, isActive, onClick }) => {
  const getClassName = () => {
    let className = 'skill-tab';
    if (isActive && skill.unlocked) className += ' active';
    if (!skill.unlocked) className += ' locked';
    return className;
  };

  return (
    <div 
      className={getClassName()} 
      onClick={skill.unlocked ? onClick : undefined}
    >
      <div className="skill-tab-content">
        <i className={`fas ${skill.icon}`}></i>
        <div className="skill-tab-label">{skill.label}</div>
      </div>
      {skill.unlocked && (
        <span className="skill-tab-level">Lv.{skill.level}</span>
      )}
    </div>
  );
};
```

### LevelUpModal（レベルアップモーダル）

```tsx
const LevelUpModal = ({ isOpen, onClose, levelUpData }) => {
  if (!isOpen || !levelUpData) return null;

  return (
    <div className={`levelup-modal ${isOpen ? 'active' : ''}`}>
      <div className="levelup-content">
        <div className="levelup-icon">🎉</div>
        <h3 className="levelup-title">レベルアップ！</h3>
        <p className="levelup-message">新しいスキルと報酬を獲得しました！</p>
        <div className="levelup-rewards">
          {levelUpData.rewards.map((reward, index) => (
            <div key={index} className="reward-item">
              <span className="reward-icon">
                <i className={`fas ${reward.icon}`}></i>
              </span>
              <span className="reward-text">{reward.text}</span>
            </div>
          ))}
        </div>
        <button className="levelup-close" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};
```

## アニメーション効果

### 1. パワーバーアニメーション

```css
.power-bar {
  height: 100%;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  transition: width 0.5s ease; /* 滑らかな進捗アニメーション */
}
```

### 2. Shimmerエフェクト（光沢アニメーション）

```css
.power-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
```

### 3. スキルタブホバーエフェクト

```css
.skill-tab:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--blue);
}

.skill-tab:hover i:not(.fa-lock) {
  transform: rotate(10deg) scale(1.1);
}
```

### 4. レベルアップモーダルアニメーション

```css
.levelup-icon {
  font-size: 80px;
  color: var(--gold);
  margin-bottom: 20px;
  animation: bounce-levelup-icon 0.8s ease;
}

@keyframes bounce-levelup-icon {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  80% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
```

## 高度な使用例

### 1. カスタムパワーメーターデータ

```tsx
import JibunCraft from '@/components/home/JibunCraft';
import { useUserPowers } from '@/stores/userStore';

export default function CustomPowersPage() {
  const { powers, isLoading, updatePowerProgress } = useUserPowers();
  
  if (isLoading) {
    return <div className="loading">パワーデータ読み込み中...</div>;
  }
  
  return (
    <div className="powers-dashboard">
      <JibunCraft 
        powers={powers} 
        onPowerUpdate={updatePowerProgress} 
      />
    </div>
  );
}
```

### 2. レベルアップイベント処理

```tsx
import JibunCraft from '@/components/home/JibunCraft';
import { useLevelUpEvents } from '@/hooks/useLevelUpEvents';

export default function LevelUpTrackingPage() {
  const { 
    showLevelUpModal, 
    levelUpData, 
    handleLevelUp, 
    handleCloseLevelUp 
  } = useLevelUpEvents();
  
  const handlePowerIncrease = async (powerId: string, amount: number) => {
    try {
      const result = await updatePowerLevel(powerId, amount);
      if (result.leveledUp) {
        handleLevelUp(result.levelUpData);
      }
    } catch (error) {
      console.error('Failed to update power:', error);
    }
  };
  
  return (
    <JibunCraft 
      onPowerIncrease={handlePowerIncrease}
      showLevelUpModal={showLevelUpModal}
      levelUpData={levelUpData}
      onCloseLevelUp={handleCloseLevelUp}
    />
  );
}
```

### 3. スキルロック解除システム

```tsx
import JibunCraft from '@/components/home/JibunCraft';
import { useSkillUnlocking } from '@/hooks/useSkillUnlocking';

export default function SkillProgressPage() {
  const { 
    skills, 
    unlockSkill, 
    isUnlocking 
  } = useSkillUnlocking();
  
  const handleSkillInteraction = async (skillId: string) => {
    if (skills.find(s => s.id === skillId)?.unlocked) {
      // 既にアンロック済みのスキルの詳細を表示
      showSkillDetails(skillId);
    } else {
      // アンロック条件をチェック
      const canUnlock = await checkUnlockConditions(skillId);
      if (canUnlock) {
        await unlockSkill(skillId);
      } else {
        showUnlockRequirements(skillId);
      }
    }
  };
  
  return (
    <div className="skill-progression">
      {isUnlocking && <div className="unlocking-indicator">スキル解除中...</div>}
      <JibunCraft 
        skills={skills}
        onSkillClick={handleSkillInteraction}
      />
    </div>
  );
}
```

## CSS変数の使用

### パワーバーカラーパレット

```css
/* 各力に対応する色定義 */
.power-bar.tsunagu {
  background: linear-gradient(90deg, var(--blue) 0%, #03A9F4 100%);
}

.power-bar.hiraku {
  background: linear-gradient(90deg, var(--purple) 0%, #5E35B1 100%);
}

.power-bar.egaku {
  background: linear-gradient(90deg, var(--orange) 0%, #FB8C00 100%);
}

.power-bar.narikiru {
  background: linear-gradient(90deg, var(--pink) 0%, #F06292 100%);
}

.power-bar.makikomu {
  background: linear-gradient(90deg, var(--green) 0%, #43A047 100%);
}
```

### パワーアイコンカラー

```css
.power-icon.tsunagu {
  background: rgba(41, 182, 246, 0.2);
  color: var(--blue);
}

.power-icon.hiraku {
  background: rgba(126, 87, 194, 0.2);
  color: var(--purple);
}

.power-icon.egaku {
  background: rgba(255, 152, 0, 0.2);
  color: var(--orange);
}

.power-icon.narikiru {
  background: rgba(255, 95, 160, 0.2);
  color: var(--pink);
}

.power-icon.makikomu {
  background: rgba(76, 175, 80, 0.2);
  color: var(--green);
}
```

## レスポンシブブレークポイント

| デバイス | 幅 | 調整内容 |
|----------|-----|----------|
| デスクトップ | > 768px | 4列スキルタブ表示 |
| タブレット | ≤ 768px | 2列スキルタブ表示 |
| モバイル | ≤ 480px | 1列スキルタブ表示 |

## レベルアップシステム

### 基本的なレベルアップ処理

```tsx
const handleLevelUp = (newLevel: number, rewards: RewardItem[]) => {
  const levelUpData: LevelUpData = {
    newLevel,
    rewards
  };
  
  setLevelUpData(levelUpData);
  setShowLevelUpModal(true);
  
  // レベルアップエフェクトの表示
  showLevelUpEffects();
  
  // 統計の更新
  updateUserStats({ level: newLevel });
};
```

### 報酬システム

```tsx
const generateRewards = (newLevel: number): RewardItem[] => {
  const baseRewards: RewardItem[] = [
    { 
      id: 'exp', 
      type: 'exp', 
      icon: 'fa-star', 
      text: `+${newLevel * 100} EXP` 
    }
  ];
  
  // レベルに応じた特別報酬
  if (newLevel % 5 === 0) {
    baseRewards.push({
      id: 'badge',
      type: 'badge',
      icon: 'fa-gem',
      text: '新しいバッジ'
    });
  }
  
  if (newLevel % 10 === 0) {
    baseRewards.push({
      id: 'skill',
      type: 'skill',
      icon: 'fa-unlock',
      text: '新しいスキル解除'
    });
  }
  
  return baseRewards;
};
```

## カスタマイズ例

### 1. カスタムパワーカラーテーマ

```tsx
interface CustomPowerMeter extends PowerMeter {
  customColor?: string;
  glowEffect?: boolean;
}

const CustomPowerBar = ({ power }: { power: CustomPowerMeter }) => {
  const customStyle = power.customColor ? {
    background: `linear-gradient(90deg, ${power.customColor} 0%, ${power.customColor}88 100%)`
  } : undefined;

  return (
    <div 
      className={`power-bar ${power.color} ${power.glowEffect ? 'glow-effect' : ''}`}
      style={customStyle}
    />
  );
};
```

### 2. アニメーション速度の調整

```css
/* 高速アニメーション */
.fast-animations .power-bar {
  transition: width 0.3s ease;
}

.fast-animations .power-bar::after {
  animation: shimmer 1s infinite;
}

/* 低速アニメーション */
.slow-animations .power-bar {
  transition: width 1s ease;
}

.slow-animations .power-bar::after {
  animation: shimmer 3s infinite;
}
```

### 3. カスタムスキルタブレイアウト

```tsx
const CustomSkillsSection = ({ skills, layout = 'grid' }) => {
  const layoutClass = {
    grid: 'skills-tabs',
    vertical: 'skills-vertical',
    carousel: 'skills-carousel'
  }[layout];

  return (
    <div className="skills-section">
      <div className={layoutClass}>
        {skills.map((skill) => (
          <SkillTabComponent key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};
```

## パフォーマンス最適化

### 1. メモ化による最適化

```tsx
import React, { memo } from 'react';

const PowerMeterComponent = memo(({ power }: { power: PowerMeter }) => {
  // コンポーネントロジック
});

const SkillTabComponent = memo(({ skill, isActive, onClick }) => {
  // コンポーネントロジック
});
```

### 2. 仮想化によるスキルリスト最適化

```tsx
import { FixedSizeGrid as Grid } from 'react-window';

const VirtualizedSkillsGrid = ({ skills }) => {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const skillIndex = rowIndex * 4 + columnIndex;
    const skill = skills[skillIndex];
    
    if (!skill) return null;
    
    return (
      <div style={style}>
        <SkillTabComponent skill={skill} />
      </div>
    );
  };

  return (
    <Grid
      columnCount={4}
      columnWidth={100}
      height={400}
      rowCount={Math.ceil(skills.length / 4)}
      rowHeight={120}
      width="100%"
    >
      {Cell}
    </Grid>
  );
};
```

### 3. アニメーション最適化

```tsx
const useOptimizedAnimation = (progress: number) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // requestAnimationFrameを使用した最適化
    let animationId: number;
    
    const animate = () => {
      setAnimatedProgress(prev => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.1) {
          return progress;
        }
        return prev + diff * 0.1;
      });
      
      if (animatedProgress !== progress) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [progress, animatedProgress]);
  
  return animatedProgress;
};
```

## アクセシビリティ

### 1. キーボードナビゲーション

```tsx
const SkillTabComponent = ({ skill, isActive, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (skill.unlocked) {
        onClick();
      }
    }
  };

  return (
    <div 
      className={getClassName()}
      onClick={skill.unlocked ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={skill.unlocked ? 0 : -1}
      role="tab"
      aria-selected={isActive}
      aria-disabled={!skill.unlocked}
      aria-label={`${skill.label}, レベル ${skill.level}, ${skill.unlocked ? 'アンロック済み' : 'ロック中'}`}
    >
      {/* スキルタブ内容 */}
    </div>
  );
};
```

### 2. スクリーンリーダー対応

```tsx
const PowerMeterComponent = ({ power }) => {
  return (
    <div className="power-meter">
      <div className="power-header">
        <span className="power-name" aria-label={`${power.name}, レベル ${power.level}`}>
          {/* 力の名前とアイコン */}
        </span>
      </div>
      <div 
        className="power-bar-container" 
        role="progressbar"
        aria-valuenow={power.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${power.name}の進捗: ${power.progress}%`}
      >
        <div className={`power-bar ${power.color}`} />
      </div>
    </div>
  );
};
```

## 既知の制限事項

1. **パワーデータ永続化**: ローカルストレージ・サーバー同期は別途実装が必要
2. **リアルタイム更新**: WebSocket等のリアルタイム機能は未実装
3. **スキル詳細表示**: スキルタブクリック時の詳細ページ遷移は別途実装
4. **報酬アニメーション**: より高度なパーティクルエフェクトは追加実装が必要

## 今後の拡張予定

- [ ] パワーメーターのリアルタイム同期
- [ ] より豊富なスキルタブアニメーション
- [ ] カスタム報酬システム
- [ ] パワー成長履歴の可視化
- [ ] スキル間の相互作用システム
- [ ] ソーシャル機能（パワー比較）
- [ ] AIによる成長提案機能 