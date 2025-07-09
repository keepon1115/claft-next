'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore';
import { useUserStats } from '@/stores/userStore';

// =====================================================
// 型定義
// =====================================================

interface JibunCraftProps {
  className?: string;
}

interface PowerMeter {
  id: string;
  name: string;
  level: number;
  progress: number; // 0-100
  icon: string;
  color: 'tsunagu' | 'hiraku' | 'egaku' | 'narikiru' | 'makikomu';
}

interface SkillTab {
  id: string;
  label: string;
  level: number;
  icon: string;
  unlocked: boolean;
}

interface LevelUpData {
  newLevel: number;
  rewards: RewardItem[];
}

interface RewardItem {
  id: string;
  type: 'exp' | 'badge' | 'skill' | 'other';
  icon: string;
  text: string;
}

// =====================================================
// デフォルトデータ
// =====================================================

const defaultPowerMeters: PowerMeter[] = [
  {
    id: 'tsunagu',
    name: 'つなぐ力',
    level: 4,
    progress: 40,
    icon: 'fa-link',
    color: 'tsunagu'
  },
  {
    id: 'hiraku',
    name: 'ひらく力',
    level: 6,
    progress: 60,
    icon: 'fa-lightbulb',
    color: 'hiraku'
  },
  {
    id: 'egaku',
    name: 'えがく力',
    level: 6,
    progress: 60,
    icon: 'fa-pencil-ruler',
    color: 'egaku'
  },
  {
    id: 'narikiru',
    name: 'なりきる力',
    level: 4,
    progress: 40,
    icon: 'fa-theater-masks',
    color: 'narikiru'
  },
  {
    id: 'makikomu',
    name: 'まきこむ力',
    level: 4,
    progress: 40,
    icon: 'fa-users',
    color: 'makikomu'
  }
];

const defaultSkillTabs: SkillTab[] = [
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
    unlocked: false
  }
];

// =====================================================
// サブコンポーネント
// =====================================================

const CardHeader: React.FC = () => {
  return (
    <div className="card-header">
      <h3 className="card-title">
        <i className="fas fa-cogs"></i>
        ジブンクラフト
      </h3>
    </div>
  );
};

const PowerMeterComponent: React.FC<{ power: PowerMeter }> = ({ power }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(power.progress);
    }, 300);

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
        ></div>
      </div>
    </div>
  );
};

const PowersSection: React.FC<{ powers: PowerMeter[] }> = ({ powers }) => {
  return (
    <div className="powers-section">
      {powers.map((power) => (
        <PowerMeterComponent key={power.id} power={power} />
      ))}
    </div>
  );
};

const SkillTabComponent: React.FC<{ 
  skill: SkillTab; 
  isActive: boolean; 
  onClick: () => void; 
}> = ({ skill, isActive, onClick }) => {
  const getClassName = () => {
    let className = 'skill-tab';
    if (isActive && skill.unlocked) className += ' active';
    if (!skill.unlocked) className += ' locked';
    return className;
  };

  return (
    <div className={getClassName()} onClick={skill.unlocked ? onClick : undefined}>
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

const SkillsSection: React.FC<{ skills: SkillTab[] }> = ({ skills }) => {
  const [activeSkillId, setActiveSkillId] = useState('money');

  return (
    <div className="skills-section">
      <div className="skills-tabs">
        {skills.map((skill) => (
          <SkillTabComponent
            key={skill.id}
            skill={skill}
            isActive={activeSkillId === skill.id}
            onClick={() => setActiveSkillId(skill.id)}
          />
        ))}
      </div>
    </div>
  );
};

const LevelUpModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  levelUpData?: LevelUpData;
}> = ({ isOpen, onClose, levelUpData }) => {
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

// =====================================================
// メインコンポーネント
// =====================================================

const JibunCraft: React.FC<JibunCraftProps> = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { userStats } = useUserStats();
  
  // レベルアップモーダルの状態
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | undefined>();

  // デモ用のデータ（今後userStoreと連携）
  const powers = defaultPowerMeters;
  const skills = defaultSkillTabs;

  // レベルアップのデモ機能
  const handleShowLevelUp = () => {
    const demoLevelUpData: LevelUpData = {
      newLevel: (userStats?.level || 1) + 1,
      rewards: [
        { id: '1', type: 'exp', icon: 'fa-star', text: '+100 EXP' },
        { id: '2', type: 'badge', icon: 'fa-gem', text: '新しいバッジ' }
      ]
    };
    setLevelUpData(demoLevelUpData);
    setShowLevelUpModal(true);
  };

  const handleCloseLevelUp = () => {
    setShowLevelUpModal(false);
    setLevelUpData(undefined);
  };

  return (
    <>
      <div className={`jibun-craft-card ${className}`}>
        <CardHeader />
        <PowersSection powers={powers} />
        <SkillsSection skills={skills} />
        
        {/* デモ用のレベルアップボタン（開発時のテスト用） */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleShowLevelUp}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            レベルアップデモ
          </button>
        )}
      </div>

      {/* レベルアップモーダル */}
      <LevelUpModal 
        isOpen={showLevelUpModal}
        onClose={handleCloseLevelUp}
        levelUpData={levelUpData}
      />
    </>
  );
};

export default JibunCraft; 