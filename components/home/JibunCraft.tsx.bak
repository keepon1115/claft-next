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

      {/* スタイル定義（既存のCSSを完全再現） */}
      <style jsx>{`
        .jibun-craft-card {
          background: white;
          border-radius: 20px;
          padding: 35px;
          box-shadow: var(--shadow);
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .card-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .jibun-craft-card .card-title i {
          color: var(--green);
        }

        /* 5つの力メーター */
        .powers-section {
          margin-bottom: 30px;
        }

        .power-meter {
          margin-bottom: 20px;
        }

        .power-meter:last-child {
          margin-bottom: 0;
        }

        .power-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .power-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .power-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

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

        .power-level {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .power-bar-container {
          background: #E0E0E0;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }

        .power-bar {
          height: 100%;
          border-radius: 5px;
          position: relative;
          overflow: hidden;
          transition: width 0.5s ease;
        }

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

        /* スキルタブセクション */
        .skills-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-top: 20px;
        }

        .skills-tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .skill-tab {
          background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 20px 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .skill-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .skill-tab:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          border-color: var(--blue);
        }

        .skill-tab.active {
          border-color: var(--blue);
          color: white;
        }

        .skill-tab.active::before {
          opacity: 1;
        }

        .skill-tab.active i, 
        .skill-tab.active .skill-tab-label {
          color: white;
        }

        .skill-tab.locked {
          opacity: 0.6;
          cursor: not-allowed;
          background: #E0E0E0;
        }

        .skill-tab.locked i, 
        .skill-tab.locked .skill-tab-label {
          color: #999;
        }

        .skill-tab.locked:hover {
          transform: none;
          box-shadow: none;
          border-color: transparent;
        }

        .skill-tab.locked:hover::before {
          opacity: 0;
        }

        .skill-tab-content {
          position: relative;
          z-index: 1;
        }

        .skill-tab i {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
          transition: all 0.3s ease;
          color: var(--purple);
        }

        .skill-tab.active i { 
          color: white; 
        }

        .skill-tab.locked i { 
          color: #777; 
        }

        .skill-tab:hover i:not(.fa-lock) {
          transform: rotate(10deg) scale(1.1);
        }

        .skill-tab-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark);
        }

        .skill-tab.active .skill-tab-label { 
          color: white; 
        }

        .skill-tab.locked .skill-tab-label { 
          color: #777; 
        }

        .skill-tab-level {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--green);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          z-index: 2;
        }

        .skill-tab.locked .skill-tab-level {
          display: none;
        }

        /* レベルアップモーダル */
        .levelup-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .levelup-modal.active {
          opacity: 1;
          visibility: visible;
        }

        .levelup-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          position: relative;
          transform: scale(0.8) translateY(20px);
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0;
          max-width: 500px;
          width: 90%;
        }

        .levelup-modal.active .levelup-content {
          transform: scale(1) translateY(0);
          opacity: 1;
        }

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

        .levelup-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 10px;
        }

        .levelup-message {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }

        .levelup-rewards {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .reward-item {
          background: var(--gray);
          border-radius: 10px;
          padding: 15px 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reward-icon {
          font-size: 24px;
          color: var(--purple);
        }

        .reward-text {
          font-size: 16px;
          font-weight: 500;
        }

        .levelup-close {
          background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .levelup-close:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(41, 182, 246, 0.3);
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .skills-tabs {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .jibun-craft-card {
            padding: 25px;
          }
          
          .card-title {
            font-size: 22px;
          }
          
          .power-meter {
            margin-bottom: 15px;
          }
          
          .power-name {
            font-size: 14px;
          }
          
          .power-icon {
            width: 24px;
            height: 24px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .skills-tabs {
            grid-template-columns: 1fr;
          }
          
          .jibun-craft-card {
            padding: 20px;
          }
          
          .card-header {
            margin-bottom: 20px;
          }
          
          .powers-section {
            margin-bottom: 20px;
          }
          
          .skill-tab {
            padding: 15px 10px;
          }
          
          .skill-tab i {
            font-size: 24px;
          }
          
          .levelup-content {
            padding: 30px 20px;
          }
          
          .levelup-title {
            font-size: 26px;
          }
          
          .levelup-message {
            font-size: 16px;
          }
          
          .levelup-icon {
            font-size: 60px;
          }
        }
      `}</style>
    </>
  );
};

export default JibunCraft; 