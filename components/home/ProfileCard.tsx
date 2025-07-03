'use client';

import React, { useState } from 'react';

// =====================================================
// 型定義
// =====================================================

interface ProfileCardProps {
  className?: string;
}

// =====================================================
// 一時的なモックデータ
// =====================================================

const mockProfileData = {
  nickname: 'CLAFT冒険者',
  character: '創造的チャレンジャー',
  skills: ['創造力', '挑戦', '学習'],
  weakness: 'ついつい夜更かし',
  favoritePlace: '静かなカフェ',
  energyCharge: '好きな音楽を聴くこと',
  companion: '一緒に成長できる仲間',
  catchphrase: '「今日も新しいことにチャレンジ！」',
  message: 'CLAFTで自分らしい成長の物語を作っています！',
  avatarUrl: '',
  level: 5,
  experience: 420,
  experienceToNext: 80
};

// =====================================================
// サブコンポーネント
// =====================================================

const ProfileAvatar: React.FC<{ character: string }> = ({ character }) => {
  const getCharacterIcon = (char: string): string => {
    if (char.includes('創造') || char.includes('クリエイティブ')) return 'fa-palette';
    if (char.includes('冒険') || char.includes('チャレンジ')) return 'fa-compass';
    if (char.includes('学習') || char.includes('学者')) return 'fa-book';
    return 'fa-user';
  };

  const iconClass = getCharacterIcon(character);
  
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
        <i className={`fas ${iconClass} text-white text-2xl`}></i>
      </div>
      <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
    </div>
  );
};

const SkillTag: React.FC<{ skill: string }> = ({ skill }) => {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
      {skill}
    </span>
  );
};

const ProfileSection: React.FC<{ icon: string; label: string; value: string }> = ({ 
  icon, 
  label, 
  value 
}) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="text-gray-800">{value || '未設定'}</div>
      </div>
    </div>
  );
};

const ExperienceBar: React.FC<{ level: number; experience: number; experienceToNext: number }> = ({
  level,
  experience,
  experienceToNext
}) => {
  const progress = (experience / (experience + experienceToNext)) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">レベル {level}</span>
        <span className="text-xs text-gray-500">次のレベルまで {experienceToNext}XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// =====================================================
// メインコンポーネント
// =====================================================

const ProfileCard: React.FC<ProfileCardProps> = ({ className = '' }) => {
  const [isLoading] = useState(false);
  const profileData = mockProfileData;

  const handleEditClick = () => {
    // 将来的にプロフィール編集機能を実装
    console.log('プロフィール編集機能（将来実装予定）');
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 text-center">
        <ProfileAvatar character={profileData.character} />
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {profileData.nickname}
        </h2>
        
        <p className="text-purple-600 font-medium mb-3">
          {profileData.character}
        </p>

        {profileData.catchphrase && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
            💭 {profileData.catchphrase}
          </div>
        )}
      </div>

      {/* コンテンツ部分 */}
      <div className="p-6 space-y-6">
        {/* レベル・経験値 */}
        <ExperienceBar 
          level={profileData.level}
          experience={profileData.experience}
          experienceToNext={profileData.experienceToNext}
        />

        {/* スキル */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💪 とくいなこと
          </h3>
          <div className="flex flex-wrap">
            {profileData.skills.map((skill, index) => (
              <SkillTag key={index} skill={skill} />
            ))}
          </div>
        </div>

        {/* プロフィール詳細 */}
        <div className="space-y-3">
          <ProfileSection
            icon="😅"
            label="ちょっと苦手"
            value={profileData.weakness}
          />
          
          <ProfileSection
            icon="🏖️"
            label="好きな場所・時間"
            value={profileData.favoritePlace}
          />
          
          <ProfileSection
            icon="⚡"
            label="エネルギーチャージ方法"
            value={profileData.energyCharge}
          />
          
          <ProfileSection
            icon="🤝"
            label="一緒に冒険したい人"
            value={profileData.companion}
          />
        </div>

        {/* メッセージ */}
        {profileData.message && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📝 ひとこと</h4>
            <p className="text-blue-700 text-sm">{profileData.message}</p>
          </div>
        )}

        {/* 編集ボタン */}
        <button 
          onClick={handleEditClick}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i className="fas fa-pencil-alt"></i>
          プロフィール編集
        </button>

        {/* 開発モード表示 */}
        <div className="text-xs text-gray-400 text-center border-t pt-4">
          <i className="fas fa-info-circle mr-1"></i>
          Phase 2: ProfileCard基本版動作中
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 