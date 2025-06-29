'use client';

import React from 'react';
import { useUserProfile } from '@/stores/userStore';
import { useAuth } from '@/stores/authStore';
import OptimizedImage from '@/components/common/OptimizedImage'

// =====================================================
// 型定義
// =====================================================

interface ProfileCardProps {
  className?: string;
}

interface AbilityCardProps {
  type: 'strength' | 'weakness';
  title: string;
  icon: string;
  tags: string[];
}

interface PersonalItemProps {
  icon: string;
  label: string;
  value: string;
}

// =====================================================
// キャラクターアイコンマッピング
// =====================================================

const getCharacterIcon = (character: string): string => {
  const iconMap: Record<string, string> = {
    '勇者': 'fa-shield-alt',
    '魔法使い': 'fa-hat-wizard',
    '探検家': 'fa-compass',
    '発明家': 'fa-cog',
    '芸術家': 'fa-palette',
    '学者': 'fa-book'
  };
  
  return iconMap[character] || 'fa-user';
};

// =====================================================
// サブコンポーネント
// =====================================================

const ProfileAvatar: React.FC<{ character: string; avatarUrl?: string }> = ({ 
  character, 
  avatarUrl 
}) => {
  const iconClass = getCharacterIcon(character);
  
  return (
    <div className="profile-avatar">
      <div className="avatar-container">
        {avatarUrl ? (
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
        ) : (
          <i className={`fas ${iconClass}`}></i>
        )}
      </div>
      <div className="status-indicator"></div>
    </div>
  );
};

const ProfileCatchphrase: React.FC<{ catchphrase: string }> = ({ catchphrase }) => {
  if (!catchphrase) return null;
  
  return (
    <div className="profile-catchphrase">
      <span className="profile-catchphrase-text">{catchphrase}</span>
    </div>
  );
};

const AbilityCard: React.FC<AbilityCardProps> = ({ type, title, icon, tags }) => {
  const displayTags = tags.length > 0 ? tags : ['未設定'];
  
  return (
    <div className={`ability-card ${type}`}>
      <div className="ability-header">
        <div className="ability-icon">{icon}</div>
        <div className="ability-title">{title}</div>
      </div>
      <div className="ability-tags">
        {displayTags.map((tag, index) => (
          <span key={index} className="ability-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const PersonalItem: React.FC<PersonalItemProps> = ({ icon, label, value }) => {
  const displayValue = value || '未設定';
  
  return (
    <div className="personal-item">
      <div className="personal-label">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="personal-value">{displayValue}</div>
    </div>
  );
};

const AdventurePartner: React.FC<{ partner: string }> = ({ partner }) => {
  const displayPartner = partner || '一緒に冒険する仲間を探しています';
  
  return (
    <div className="adventure-partner">
      <div className="adventure-partner-content">
        <div className="adventure-partner-label">
          <span>🤝</span>
          <span>一緒に冒険したい人</span>
        </div>
        <div className="adventure-partner-value">{displayPartner}</div>
      </div>
    </div>
  );
};

const ProfileComment: React.FC<{ message: string }> = ({ message }) => {
  const displayMessage = message || 'ログインして、あなたの冒険の物語を始めましょう！';
  
  return (
    <div className="profile-comment">
      <div className="comment-header">
        <span>📝</span>
        <span>ひとこと</span>
      </div>
      <div className="comment-text">{displayMessage}</div>
    </div>
  );
};

const EditProfileButton: React.FC<{ isAuthenticated: boolean; onClick: () => void }> = ({ 
  isAuthenticated, 
  onClick 
}) => {
  return (
    <button className="edit-profile-btn" onClick={onClick}>
      <i className={`fas ${isAuthenticated ? 'fa-pencil-alt' : 'fa-sign-in-alt'}`}></i>
      {isAuthenticated ? ' プロフィール編集' : ' ログインして編集'}
    </button>
  );
};

// =====================================================
// メインコンポーネント
// =====================================================

const ProfileCard: React.FC<ProfileCardProps> = ({ className = '' }) => {
  const { profileData, isLoading } = useUserProfile();
  const { isAuthenticated } = useAuth();

  const handleEditClick = () => {
    if (isAuthenticated) {
      // プロフィール編集ページへ遷移
      window.location.href = '/profile';
    } else {
      // ログインページへ遷移
      window.location.href = '/profile?auth=login';
    }
  };

  if (isLoading) {
    return (
      <div className={`profile-card ${className}`}>
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-container">
              <div className="spinner"></div>
            </div>
          </div>
          <h2 className="profile-name">読み込み中...</h2>
        </div>
      </div>
    );
  }

  // デフォルトデータ（非ログイン時用）
  const defaultData = {
    nickname: isAuthenticated ? (profileData.nickname || 'ゲスト冒険者') : 'ゲスト冒険者',
    character: isAuthenticated ? (profileData.character || '冒険大好き！挑戦者タイプ') : '冒険大好き！挑戦者タイプ',
    skills: isAuthenticated ? (profileData.skills || []) : [],
    weakness: isAuthenticated ? (profileData.weakness || '') : '',
    favoritePlace: isAuthenticated ? (profileData.favoritePlace || '') : '',
    energyCharge: isAuthenticated ? (profileData.energyCharge || '') : '',
    companion: isAuthenticated ? (profileData.companion || '') : '',
    catchphrase: isAuthenticated ? (profileData.catchphrase || '「新しいことにチャレンジだ！」') : '「ログインして自分だけの物語を作ろう！」',
    message: isAuthenticated ? (profileData.message || '') : ''
  };

  const characterText = defaultData.character;

  return (
    <div className={`profile-card ${className}`}>
      {/* プロフィール基本情報エリア */}
      <div className="profile-header">
        <ProfileAvatar character={defaultData.character} avatarUrl={profileData.avatarUrl} />
        
        <h2 className="profile-name">{defaultData.nickname}</h2>
        
        <p className="profile-character">
          <span>{characterText}</span>
        </p>
        
        <ProfileCatchphrase catchphrase={defaultData.catchphrase} />
      </div>

      {/* プロフィール詳細情報エリア */}
      <div className="profile-details">
        {/* 能力・特性 */}
        <div className="profile-abilities">
          <AbilityCard
            type="strength"
            title="とくい"
            icon="💪"
            tags={defaultData.skills}
          />
          <AbilityCard
            type="weakness"
            title="よわみ"
            icon="😅"
            tags={defaultData.weakness && defaultData.weakness.length > 0 ? [defaultData.weakness] : []}
          />
        </div>

        {/* パーソナル情報 */}
        <div className="profile-personal">
          <PersonalItem
            icon="🏖️"
            label="すきな時間・場所"
            value={defaultData.favoritePlace}
          />
          <PersonalItem
            icon="⚡"
            label="エネルギーチャージ方法"
            value={defaultData.energyCharge}
          />
        </div>

        {/* 一緒に冒険したい人 */}
        <AdventurePartner partner={defaultData.companion} />

        {/* ひとこと */}
        <ProfileComment message={defaultData.message} />

        {/* 編集ボタン */}
        <EditProfileButton 
          isAuthenticated={isAuthenticated}
          onClick={handleEditClick}
        />
      </div>
      
      {/* スタイル定義（既存のCSSを完全再現） */}
      <style jsx>{`
        .profile-card {
          flex: 0 0 calc(50% - 20px);
          background: linear-gradient(145deg, #ffffff, #f0f0f0);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
        }

        .profile-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, var(--purple) 0%, transparent 70%);
          opacity: 0.05;
          animation: rotate-bg 20s linear infinite;
        }

        /* プロフィール基本情報エリア */
        .profile-header {
          text-align: center;
          padding: 35px 35px 25px;
          position: relative;
          background: linear-gradient(180deg, rgba(126, 87, 194, 0.1) 0%, transparent 100%);
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          position: relative;
          animation: float-avatar 4s ease-in-out infinite;
        }

        @keyframes float-avatar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .avatar-container {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--purple) 0%, var(--pink) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          color: white;
          box-shadow: 0 8px 30px rgba(126, 87, 194, 0.4);
          position: relative;
          overflow: hidden;
        }

        .avatar-container::after {
          content: '';
          position: absolute;
          top: 10%;
          right: 10%;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          filter: blur(10px);
        }

        .avatar-container i {
          z-index: 1;
          animation: breathe-icon 3s ease-in-out infinite;
        }

        @keyframes breathe-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .status-indicator {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 25px;
          height: 25px;
          background: var(--green);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(76, 175, 80, 0.4);
          animation: pulse-indicator 2s ease infinite;
        }

        @keyframes pulse-indicator {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 10px rgba(76, 175, 80, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.6); }
        }

        .profile-name {
          font-size: 28px;
          font-weight: 900;
          color: var(--text-dark);
          margin-bottom: 8px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .profile-character {
          color: var(--purple);
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .profile-character::before,
        .profile-character::after {
          content: '✨';
          font-size: 14px;
          animation: twinkle-emoji 2s ease infinite;
        }

        @keyframes twinkle-emoji {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .profile-catchphrase {
          background: linear-gradient(135deg, var(--yellow) 0%, var(--gold) 100%);
          color: var(--text-dark);
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 15px;
          font-weight: 700;
          margin-top: 15px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(246, 207, 63, 0.3);
          animation: glow-catchphrase 3s ease infinite alternate;
          display: inline-block;
        }

        @keyframes glow-catchphrase {
          0% { box-shadow: 0 4px 15px rgba(246, 207, 63, 0.3); }
          100% { box-shadow: 0 4px 25px rgba(246, 207, 63, 0.5), 0 0 10px var(--gold); }
        }

        .profile-catchphrase::before {
          content: '💭';
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .profile-catchphrase-text {
          margin-left: 25px;
        }

        /* プロフィール詳細情報エリア */
        .profile-details {
          padding: 0 35px 35px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* 能力・特性エリア */
        .profile-abilities {
          display: flex;
          gap: 20px;
        }

        .ability-card {
          flex: 1;
          background: white;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .ability-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, transparent 0%, rgba(41, 182, 246, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ability-card:hover::before {
          opacity: 1;
        }

        .ability-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .ability-card.strength {
          border-top: 4px solid var(--green);
        }

        .ability-card.weakness {
          border-top: 4px solid var(--pink);
        }

        .ability-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .ability-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .ability-card.strength .ability-icon {
          background: rgba(76, 175, 80, 0.2);
          color: var(--green);
        }

        .ability-card.weakness .ability-icon {
          background: rgba(255, 95, 160, 0.2);
          color: var(--pink);
        }

        .ability-title {
          font-size: 15px;
          font-weight: 700;
          color: #666;
        }

        .ability-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ability-tag {
          background: var(--gray);
          color: var(--text-dark);
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ability-card.strength .ability-tag:hover {
          background: var(--green);
          color: white;
          transform: translateY(-2px);
        }

        .ability-card.weakness .ability-tag:hover {
          background: var(--pink);
          color: white;
          transform: translateY(-2px);
        }

        /* パーソナル情報エリア */
        .profile-personal {
          background: linear-gradient(145deg, #f8f8f8, #ffffff);
          border-radius: 18px;
          padding: 20px;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .personal-item {
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .personal-item:last-child {
          border-bottom: none;
        }

        .personal-item:hover {
          padding-left: 10px;
        }

        .personal-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }

        .personal-value {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-dark);
          line-height: 1.5;
        }

        /* 一緒に冒険したい人 */
        .adventure-partner {
          background: linear-gradient(135deg, var(--purple) 0%, var(--pink) 100%);
          color: white;
          border-radius: 18px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(126, 87, 194, 0.3);
        }

        .adventure-partner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          animation: rotate-bg 15s linear infinite;
        }

        .adventure-partner-content {
          position: relative;
          z-index: 1;
        }

        .adventure-partner-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .adventure-partner-value {
          font-size: 16px;
          font-weight: 700;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* ひとことエリア */
        .profile-comment {
          background: white;
          border-radius: 18px;
          padding: 20px;
          border: 2px solid var(--gray);
          position: relative;
          transition: all 0.3s ease;
        }

        .profile-comment:hover {
          border-color: var(--blue);
          box-shadow: 0 4px 15px rgba(41, 182, 246, 0.1);
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .comment-text {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-dark);
        }

        /* 編集ボタン */
        .edit-profile-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: auto;
        }

        .edit-profile-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.5s ease;
        }

        .edit-profile-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .edit-profile-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(41, 182, 246, 0.3);
        }

        /* アニメーション定義 */
        @keyframes rotate-bg {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ローディングスピナー */
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--gray);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .profile-card {
            flex: 1;
          }
          
          .profile-header {
            padding: 25px 25px 20px;
          }
          
          .profile-details {
            padding: 0 25px 25px;
          }
          
          .profile-abilities {
            flex-direction: column;
            gap: 15px;
          }
          
          .profile-avatar {
            width: 100px;
            height: 100px;
          }
          
          .avatar-container {
            font-size: 40px;
          }
          
          .profile-name {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .profile-header {
            padding: 20px 20px 15px;
          }
          
          .profile-details {
            padding: 0 20px 20px;
            gap: 15px;
          }
          
          .profile-avatar {
            width: 80px;
            height: 80px;
          }
          
          .avatar-container {
            font-size: 32px;
          }
          
          .profile-name {
            font-size: 20px;
          }
          
          .ability-card {
            padding: 15px;
          }
          
          .profile-personal,
          .adventure-partner,
          .profile-comment {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileCard; 