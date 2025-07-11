'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthButton } from '@/components/auth/AuthButton';
import { useUserStore, useUserProfile, useUserStats } from '@/stores/userStore';

interface ProfileCardProps {
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ className = '' }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { initialize, addExperience } = useUserStore();
  const { profileData, isLoading, error } = useUserProfile();
  const { userStats } = useUserStats();
  const { achievements } = useUserStore();
  
  // userStore初期化
  useEffect(() => {
    const initStore = async () => {
      // ログインしている場合のみ、実際のユーザーIDで初期化
      if (isAuthenticated && user?.id) {
        // SupabaseのUUID形式に一致するかチェック
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(user.id)) {
          await initialize(user.id);
        }
      }
    };
    initStore();
  }, [initialize, user?.id, isAuthenticated]);

  const handleEditClick = async () => {
    if (isAuthenticated) {
      // 認証済み：プロフィールページに移動
      router.push('/profile');
      
      // デモ：経験値追加機能をテスト
      const result = await addExperience(10, 'プロフィール編集アクセス');
      if (result.success) {
        console.log('経験値追加成功！', result.levelUp ? '(レベルアップ!)' : '');
      }
    } else {
      // 未認証：ログインモーダル表示
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // 認証成功後：モーダルを閉じてプロフィールページに移動
    setShowAuthModal(false);
    router.push('/profile');
  };

  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="profile-header">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-card">
        <div className="profile-header">
          <div className="text-center text-red-600">
            <i className="fas fa-exclamation-triangle text-2xl mb-4"></i>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // userStore拡張版のデータを使用
  const displayData = profileData || {
    nickname: isAuthenticated ? (user?.email?.split('@')[0] || 'CLAFT冒険者') : 'CLAFT冒険者',
    character: 'チャレンジャー',
    skills: '挑戦',
    weakness: 'ついつい夜更かし',
    favoritePlace: '公園で散歩',
    energyCharge: 'すきな音楽を聴く',
    companion: 'アイデア豊富なヒト',
    catchphrase: '今日も新しいことにチャレンジ！',
    message: '新しいものを創るために、挑戦し続けたいです！',
    profileCompletion: 85
  };

  const stats = userStats || {
    level: 3,
    experience: 250,
    experienceToNext: 150
  };

  return (
    <>
      <div className={`profile-card ${className}`}>
        {/* プロフィール基本情報エリア */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-container">
              <i className="fas fa-user-astronaut"></i>
            </div>
            <div className="status-indicator"></div>
          </div>
          
          <h2 className="profile-name">{displayData.nickname}</h2>
          <p className="profile-character">
            <span>{displayData.character}</span>
          </p>
          
          {displayData.catchphrase && (
            <div className="profile-catchphrase">
              <span className="profile-catchphrase-text">{displayData.catchphrase}</span>
            </div>
          )}
        </div>

        {/* プロフィール詳細情報エリア */}
        <div className="profile-details">
          {/* 能力・特性エリア */}
          <div className="profile-abilities">
            <div className="ability-card strength">
              <div className="ability-header">
                <div className="ability-icon">💪</div>
                <div className="ability-title">とくい</div>
              </div>
              <div className="ability-tags">
                {Array.isArray(displayData.skills) 
                  ? displayData.skills.map((skill, index) => (
                      <span key={index} className="ability-tag">{skill}</span>
                    ))
                  : <span className="ability-tag">{displayData.skills}</span>
                }
              </div>
            </div>
            
            <div className="ability-card weakness">
              <div className="ability-header">
                <div className="ability-icon">😅</div>
                <div className="ability-title">よわみ</div>
              </div>
              <div className="ability-tags">
                <span className="ability-tag">{displayData.weakness}</span>
              </div>
            </div>
          </div>

          {/* パーソナル情報エリア */}
          <div className="profile-personal">
            <div className="personal-item">
              <div className="personal-label">
                <span>🏖️</span>
                <span>すきな時間・場所</span>
              </div>
              <div className="personal-value">{displayData.favoritePlace}</div>
            </div>
            
            <div className="personal-item">
              <div className="personal-label">
                <span>⚡</span>
                <span>エネルギーチャージ方法</span>
              </div>
              <div className="personal-value">{displayData.energyCharge}</div>
            </div>
          </div>

          {/* 一緒に冒険したい人 */}
          <div className="adventure-partner">
            <div className="adventure-partner-content">
              <div className="adventure-partner-label">
                <span>🤝</span>
                <span>一緒に冒険したい人</span>
              </div>
              <div className="adventure-partner-value">{displayData.companion}</div>
            </div>
          </div>

          {/* ひとことエリア */}
          <div className="profile-comment">
            <div className="comment-header">
              <span>📝</span>
              <span>ひとこと</span>
            </div>
            <div className="comment-text">{displayData.message}</div>
          </div>

          {/* 編集ボタン - 認証ガード付き */}
          <button onClick={handleEditClick} className="edit-profile-btn">
            <i className={`fas ${isAuthenticated ? 'fa-pencil-alt' : 'fa-sign-in-alt'}`}></i>
            {isAuthenticated ? 'プロフィール編集' : 'ログインして編集'}
          </button>
        </div>
      </div>

      {/* 認証モーダル（未認証時のみ表示） */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99998]"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99998,
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
            style={{
              position: 'relative',
              zIndex: 99999,
              WebkitTransform: 'translate3d(0, 0, 0)',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🚪 ログインが必要です
              </h2>
              <p className="text-gray-600">
                プロフィール編集には冒険者登録が必要です。
              </p>
            </div>
            
            <div className="space-y-4">
              <AuthButton 
                variant="default"
                size="lg"
                redirectTo="/profile"
                defaultTab="login"
                className="w-full"
              />
              
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;