'use client';

import { useState, useEffect } from 'react';
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
      // SupabaseのUUID形式に一致するかチェック
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (user?.id && uuidRegex.test(user.id)) {
        await initialize(user.id);
      }
    };
    initStore();
  }, [user?.id, initialize]);

  // モーダル表示時の背景スクロール防止
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showAuthModal]);

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
    character: '',
    skills: '',
    weakness: '',
    favoritePlace: '',
    energyCharge: '',
    companion: '',
    catchphrase: '',
    message: '',
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
              {displayData.avatarUrl ? (
                <img 
                  src={displayData.avatarUrl} 
                  alt={`${displayData.nickname}のアバター`}
                  className="avatar-image"
                  onLoad={() => {
                    console.log('✅ アバター画像読み込み成功:', displayData.avatarUrl)
                  }}
                  onError={(e) => {
                    console.warn('⚠️ アバター画像読み込み失敗:', displayData.avatarUrl)
                    // 画像読み込みエラー時はデフォルトアイコンを表示
                    e.currentTarget.style.display = 'none'
                    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallbackIcon) fallbackIcon.style.display = 'block'
                  }}
                />
              ) : null}
              <i 
                className="fas fa-user-astronaut" 
                style={{ display: displayData.avatarUrl ? 'none' : 'block' }}
              />
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

      {/* 認証モーダル（高いz-indexで確実に最前面表示） */}
      {showAuthModal && !isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center relative"
            style={{
              zIndex: 1000000,
              WebkitTransform: 'translate3d(0, 0, 0)',
              transform: 'translate3d(0, 0, 0)',
              animation: 'modalSlideIn 0.3s ease-out forwards'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-xl"
            >
              ×
            </button>

            {/* モーダル内容 */}
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