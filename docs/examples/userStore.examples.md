# useUserStore 使用例とドキュメント

ユーザープロフィール情報、統計情報、実績システムを管理する包括的なストアの使用例です。

## 📖 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [プロフィール管理](#プロフィール管理)
3. [統計・経験値システム](#統計経験値システム)
4. [実績・バッジシステム](#実績バッジシステム)
5. [コンポーネント統合例](#コンポーネント統合例)
6. [開発・デバッグ機能](#開発デバッグ機能)

## 基本的な使用方法

### 1. ストアの初期化

```tsx
import { useUserStore, useUserProfile, useUserStats } from '@/stores/userStore';
import { useAuth } from '@/stores/authStore';

const UserProfilePage = () => {
  const { user } = useAuth();
  const { initialize } = useUserStore();

  useEffect(() => {
    if (user?.id) {
      // ユーザーログイン時にストアを初期化
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  return (
    <div>
      <ProfileForm />
      <StatsDisplay />
      <AchievementList />
    </div>
  );
};
```

### 2. プロフィール情報の取得と表示

```tsx
import { useUserProfile } from '@/stores/userStore';

const ProfileDisplay = () => {
  const { profileData, profileCompletion, isLoading } = useUserProfile();

  if (isLoading) {
    return <div className="spinner">読み込み中...</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>{profileData.nickname}</h2>
        <p>プロフィール完成度: {profileCompletion}%</p>
      </div>
      
      <div className="profile-info">
        <div className="info-item">
          <span className="label">キャラクター</span>
          <span className="value">{profileData.character || '未設定'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">スキル</span>
          <span className="value">
            {profileData.skills.length > 0 ? profileData.skills.join(', ') : '未設定'}
          </span>
        </div>
        
        <div className="info-item">
          <span className="label">お気に入りの場所</span>
          <span className="value">{profileData.favoritePlace || '未設定'}</span>
        </div>
        
        {profileData.catchphrase && (
          <div className="catchphrase">
            <i className="fas fa-quote-left"></i>
            {profileData.catchphrase}
            <i className="fas fa-quote-right"></i>
          </div>
        )}
      </div>
    </div>
  );
};
```

## プロフィール管理

### 1. プロフィール編集フォーム

```tsx
import React, { useState } from 'react';
import { useUserProfile } from '@/stores/userStore';

const ProfileEditForm = () => {
  const { profileData, updateProfile, isSaving, error, clearError } = useUserProfile();
  const [formData, setFormData] = useState(profileData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await updateProfile(formData);
    if (result.success) {
      // 成功通知
      console.log('プロフィールが更新されました');
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      {error && (
        <div className="error-message">
          {error}
          <button type="button" onClick={clearError}>×</button>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="nickname">ニックネーム</label>
        <input
          id="nickname"
          type="text"
          value={formData.nickname}
          onChange={(e) => handleInputChange('nickname', e.target.value)}
          maxLength={20}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="character">キャラクター特性</label>
        <select
          id="character"
          value={formData.character}
          onChange={(e) => handleInputChange('character', e.target.value)}
        >
          <option value="">選択してください</option>
          <option value="勇者">勇者 ⚔️</option>
          <option value="魔法使い">魔法使い 🔮</option>
          <option value="探検家">探検家 🗺️</option>
          <option value="発明家">発明家 ⚙️</option>
          <option value="芸術家">芸術家 🎨</option>
          <option value="学者">学者 📚</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="skills">スキル（カンマ区切り）</label>
        <input
          id="skills"
          type="text"
          value={formData.skills.join(', ')}
          onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="例: プログラミング, デザイン, 音楽"
        />
        <small>最大3つまで</small>
      </div>

      <div className="form-group">
        <label htmlFor="weakness">苦手なこと</label>
        <input
          id="weakness"
          type="text"
          value={formData.weakness}
          onChange={(e) => handleInputChange('weakness', e.target.value)}
          placeholder="例: 早起き"
        />
      </div>

      <div className="form-group">
        <label htmlFor="favoritePlace">お気に入りの場所</label>
        <select
          id="favoritePlace"
          value={formData.favoritePlace}
          onChange={(e) => handleInputChange('favoritePlace', e.target.value)}
        >
          <option value="">選択してください</option>
          <option value="図書館">📚 図書館</option>
          <option value="カフェ">☕ カフェ</option>
          <option value="公園">🌳 公園</option>
          <option value="自宅">🏠 自宅</option>
          <option value="海辺">🌊 海辺</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="catchphrase">セリフ・口ぐせ</label>
        <input
          id="catchphrase"
          type="text"
          value={formData.catchphrase}
          onChange={(e) => handleInputChange('catchphrase', e.target.value)}
          maxLength={30}
          placeholder="例: よろしく！一緒に頑張ろう！"
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">ひとこと</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          maxLength={200}
          placeholder="例: プログラミングが大好きな冒険者です！"
          rows={4}
        />
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="btn btn-primary"
      >
        {isSaving ? '保存中...' : '保存する'}
      </button>
    </form>
  );
};
```

### 2. プロフィール完成度インジケーター

```tsx
import { useUserProfile } from '@/stores/userStore';

const ProfileCompletionIndicator = () => {
  const { profileCompletion } = useUserProfile();

  return (
    <div className="completion-indicator">
      <div className="completion-header">
        <span>プロフィール完成度</span>
        <span className="percentage">{profileCompletion}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${profileCompletion}%` }}
        >
          {profileCompletion === 100 && (
            <span className="completion-badge">🎉 完成！</span>
          )}
        </div>
      </div>
      
      {profileCompletion < 100 && (
        <p className="completion-tip">
          あと{100 - profileCompletion}%で完成です！
        </p>
      )}
    </div>
  );
};
```

## 統計・経験値システム

### 1. ユーザー統計表示

```tsx
import { useUserStats } from '@/stores/userStore';

const UserStatsDisplay = () => {
  const { stats, experienceProgress } = useUserStats();

  if (!stats) {
    return <div>統計データを読み込み中...</div>;
  }

  return (
    <div className="stats-dashboard">
      <div className="stat-card level-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-info">
          <h3>レベル {stats.level}</h3>
          <div className="exp-bar">
            <div 
              className="exp-fill"
              style={{ width: `${experienceProgress}%` }}
            />
          </div>
          <p>{stats.experience} / {stats.level * 100} EXP</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🎯</div>
        <div className="stat-info">
          <h3>{stats.questsCompleted}</h3>
          <p>クエスト完了</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🔥</div>
        <div className="stat-info">
          <h3>{stats.currentStreak}</h3>
          <p>連続ログイン</p>
          <small>最長: {stats.maxStreak}日</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-info">
          <h3>{stats.achievementCount}</h3>
          <p>実績解除</p>
          <div className="badge-breakdown">
            <span className="gold">🥇 {stats.goldBadges}</span>
            <span className="silver">🥈 {stats.silverBadges}</span>
            <span className="bronze">🥉 {stats.bronzeBadges}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. 経験値追加機能

```tsx
import { useUserStats } from '@/stores/userStore';

const QuestCompleteButton = ({ questId, questName, experienceReward }: {
  questId: string;
  questName: string;
  experienceReward: number;
}) => {
  const { addExperience } = useUserStats();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleQuestComplete = async () => {
    setIsCompleting(true);
    
    try {
      const result = await addExperience(
        experienceReward, 
        `「${questName}」をクリアしました`
      );
      
      if (result.success) {
        console.log('クエスト完了！');
        
        if (result.levelUp) {
          // レベルアップ演出
          showLevelUpAnimation();
        }
      }
    } catch (error) {
      console.error('クエスト完了エラー:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const showLevelUpAnimation = () => {
    // レベルアップアニメーション表示
    console.log('🎉 レベルアップ！');
  };

  return (
    <button
      onClick={handleQuestComplete}
      disabled={isCompleting}
      className="quest-complete-btn"
    >
      {isCompleting ? '完了中...' : `クエスト完了 (+${experienceReward} EXP)`}
    </button>
  );
};
```

## 実績・バッジシステム

### 1. 実績一覧表示

```tsx
import { useUserStats } from '@/stores/userStore';

const AchievementList = () => {
  const { achievements, unlockedAchievements } = useUserStats();

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>実績・バッジ</h2>
        <p>解除済み: {unlockedAchievements.length} / {achievements.length}</p>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
          >
            <div className={`achievement-icon ${achievement.type}`}>
              <i className={`fas ${achievement.iconClass}`}></i>
            </div>
            
            <div className="achievement-info">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              
              {achievement.isUnlocked && achievement.unlockedAt && (
                <small className="unlock-date">
                  {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP')} 解除
                </small>
              )}
            </div>
            
            {achievement.isUnlocked && (
              <div className="achievement-badge">
                {achievement.type === 'gold' && '🥇'}
                {achievement.type === 'silver' && '🥈'}
                {achievement.type === 'bronze' && '🥉'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. 実績解除機能

```tsx
import { useUserStats } from '@/stores/userStore';

const AchievementUnlocker = () => {
  const { unlockAchievement } = useUserStats();

  const handleUnlockAchievement = async (achievementId: string) => {
    try {
      const result = await unlockAchievement(achievementId);
      
      if (result.success) {
        // 実績解除アニメーション
        showAchievementNotification(achievementId);
      } else {
        console.error('実績解除エラー:', result.error);
      }
    } catch (error) {
      console.error('実績解除処理エラー:', error);
    }
  };

  const showAchievementNotification = (achievementId: string) => {
    // 実績解除通知を表示
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>🏆 実績解除！</h3>
        <p>新しい実績を解除しました</p>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  return (
    <div className="achievement-unlocker">
      {/* 自動実績チェックはストア内で行われるため、UIは通知のみ */}
    </div>
  );
};
```

## コンポーネント統合例

### 1. ユーザーダッシュボード

```tsx
import React from 'react';
import { useUserProfile, useUserStats } from '@/stores/userStore';
import { useResponsive } from '@/hooks/useMediaQuery';

const UserDashboard = () => {
  const { profileData, profileCompletion } = useUserProfile();
  const { stats, recentActivities } = useUserStats();
  const { isMobile } = useResponsive();

  return (
    <div className={`user-dashboard ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* ヘッダー */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar">
            {getAvatarIcon(profileData.character)}
          </div>
          <div className="user-details">
            <h1>{profileData.nickname}</h1>
            <p>レベル {stats?.level || 1}</p>
          </div>
        </div>
        
        <ProfileCompletionIndicator />
      </div>

      {/* メインコンテンツ */}
      <div className="dashboard-content">
        {isMobile ? (
          // モバイルレイアウト
          <div className="mobile-layout">
            <UserStatsDisplay />
            <RecentActivities activities={recentActivities} />
            <AchievementPreview />
          </div>
        ) : (
          // デスクトップレイアウト
          <div className="desktop-layout">
            <div className="left-panel">
              <UserStatsDisplay />
              <AchievementPreview />
            </div>
            <div className="right-panel">
              <RecentActivities activities={recentActivities} />
              <QuickActions />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getAvatarIcon = (character: string): React.ReactNode => {
  const iconMap: Record<string, string> = {
    '勇者': 'fa-shield-alt',
    '魔法使い': 'fa-hat-wizard',
    '探検家': 'fa-compass',
    '発明家': 'fa-cog',
    '芸術家': 'fa-palette',
    '学者': 'fa-book'
  };
  
  const iconClass = iconMap[character] || 'fa-user';
  return <i className={`fas ${iconClass}`}></i>;
};
```

### 2. 最近のアクティビティ

```tsx
import { UserActivity } from '@/stores/userStore';

const RecentActivities = ({ activities }: { activities: UserActivity[] }) => {
  return (
    <div className="recent-activities">
      <h3>最近のアクティビティ</h3>
      
      {activities.length === 0 ? (
        <p className="no-activities">まだアクティビティがありません</p>
      ) : (
        <div className="activity-list">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.activityType)}
              </div>
              
              <div className="activity-content">
                <p>{activity.description}</p>
                <div className="activity-meta">
                  <span className="timestamp">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  {activity.experienceGained && (
                    <span className="experience">
                      +{activity.experienceGained} EXP
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getActivityIcon = (type: UserActivity['activityType']): React.ReactNode => {
  const iconMap = {
    'login': '🔗',
    'quest_complete': '✅',
    'profile_update': '✏️',
    'level_up': '⭐'
  };
  
  return iconMap[type] || '📝';
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'たった今';
  if (diffInMinutes < 60) return `${diffInMinutes}分前`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
  return `${Math.floor(diffInMinutes / 1440)}日前`;
};
```

## 開発・デバッグ機能

### 1. 開発用デバッグコンポーネント

```tsx
import { useUserDebug } from '@/stores/userStore';

const UserStoreDebugPanel = () => {
  const debug = useUserDebug();

  // 本番環境では表示しない
  if (!debug) return null;

  return (
    <div className="debug-panel">
      <h3>🛠️ 開発用デバッグパネル</h3>
      
      <div className="debug-actions">
        <button onClick={debug.addTestExperience}>
          テスト経験値追加 (+50 EXP)
        </button>
        
        <button onClick={debug.unlockAllAchievements}>
          全実績解除
        </button>
        
        <button onClick={debug.resetAllData}>
          データリセット
        </button>
      </div>
      
      <details className="debug-state">
        <summary>現在のストア状態</summary>
        <pre>{JSON.stringify(debug.getState(), null, 2)}</pre>
      </details>
    </div>
  );
};
```

### 2. 自動保存機能の使用

```tsx
import { useEffect } from 'react';
import { useUserProfile } from '@/stores/userStore';

const AutoSaveProvider = ({ children }: { children: React.ReactNode }) => {
  const { autoSave } = useUserProfile();

  useEffect(() => {
    // 30秒ごとに自動保存
    const interval = setInterval(() => {
      autoSave();
    }, 30000);

    // ページ離脱時にも保存
    const handleBeforeUnload = () => {
      autoSave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSave]);

  return <>{children}</>;
};
```

## 使用時の注意点

### 1. 初期化タイミング
- ユーザーログイン後に必ず `initialize(userId)` を呼び出す
- 認証状態の変更を監視して適切に初期化する

### 2. エラーハンドリング
- すべてのアクションは成功/失敗の結果を返す
- エラーメッセージは `error` ステートで管理
- `clearError()` でエラーをクリアする

### 3. パフォーマンス
- 自動保存機能を適切に活用する
- 大量のデータ更新時はバッチ処理を検討
- 不要な再レンダリングを避けるためセレクターを使用

### 4. データ整合性
- Supabaseとの同期を定期的に行う
- ローカルストレージとの整合性を保つ
- 複数タブでの同時編集に注意

このuserStoreを活用して、CLAFTプロジェクトで豊富なユーザー体験を提供しましょう！ 