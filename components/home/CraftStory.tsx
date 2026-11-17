'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestStore } from '@/stores/questStore';
import { useUserGoals } from '@/hooks/useUserGoals';
import { BookOpen, Flag, Mountain, Palette, MessagesSquare, ChevronRight } from 'lucide-react';

// =====================================================
// 型定義
// =====================================================

interface CraftStoryProps {
  className?: string;
}

interface Goal { id: string; type: 'short' | 'long'; label: string; text: string; icon: React.ElementType; }

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: 'primary' | 'secondary';
}

// =====================================================
// デフォルトデータ
// =====================================================

const defaultGoals: Goal[] = [
  { id: 'short-goal', type: 'short', label: '短期目標', text: '', icon: Flag },
  { id: 'long-goal', type: 'long', label: '長期目標', text: '', icon: Mountain }
];

const defaultActions: ActionItem[] = [
  {
    id: 'created',
    title: 'つくったもの',
    description: '作品ギャラリーを見る',
    icon: Palette,
    href: 'https://jet-vinyl-ae2.notion.site/d1c14aebdb6747b794d15100958c9d96?source=copy_link',
    color: 'primary'
  },
  {
    id: 'talked',
    title: 'はなしたこと',
    description: '会話の記録を見る',
    icon: MessagesSquare,
    href: 'https://jet-vinyl-ae2.notion.site/d1c14aebdb6747b794d15100958c9d96?source=copy_link',
    color: 'secondary'
  }
];

// =====================================================
// サブコンポーネント
// =====================================================

const CardHeader: React.FC = () => {
  return (
    <div className="card-header">
      <h3 className="card-title">
        <BookOpen size="1em" />
        クラフトストーリー
      </h3>
    </div>
  );
};

// ProgressBar（メーター）は廃止

const GoalCard: React.FC<{ goal: Goal; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ goal, value, onChange, disabled }) => {
  return (
    <div className="goal-card">
      <div className="goal-content">
        <div className="goal-icon"><goal.icon size="1em" /></div>
        <div className="goal-label">{goal.label}</div>
        <textarea
          className="goal-textarea"
          placeholder={`${goal.label} を入力しよう`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={300}
          rows={3}
        />
      </div>
    </div>
  );
};

const GoalsSection: React.FC<{ goals: Goal[]; shortValue: string; longValue: string; onShort: (v: string) => void; onLong: (v: string) => void; disabled?: boolean }> = ({ goals, shortValue, longValue, onShort, onLong, disabled }) => (
  <div className="goals-section">
    <GoalCard goal={goals[0]} value={shortValue} onChange={onShort} disabled={disabled} />
    <GoalCard goal={goals[1]} value={longValue} onChange={onLong} disabled={disabled} />
  </div>
);

const ActionLink: React.FC<{ action: ActionItem }> = ({ action }) => {
  const handleClick = (e: React.MouseEvent) => {
    // 外部リンクのみ。内部アンカー時の特別処理は不要
  };

  return (
    <a 
      href={action.href} 
      className="action-link"
      onClick={handleClick}
      target="_blank" rel="noopener noreferrer"
    >
      <div className="action-icon">
        <action.icon size="1em" />
      </div>
      <div className="action-content">
        <div className="action-title">{action.title}</div>
        <div className="action-desc">{action.description}</div>
      </div>
      <div className="action-arrow">
        <ChevronRight size="1em" />
      </div>
    </a>
  );
};

const ActionsSection: React.FC<{ actions: ActionItem[] }> = ({ actions }) => {
  return (
    <div className="actions-section">
      {actions.map((action) => (
        <ActionLink key={action.id} action={action} />
      ))}
    </div>
  );
};

// =====================================================
// メインコンポーネント
// =====================================================

const CraftStory: React.FC<CraftStoryProps> = ({ className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const { userProgress } = useQuestStore();
  const stage6Cleared = userProgress[6] === 'completed';
  const { shortTermGoal, longTermGoal, setShortTermGoal, setLongTermGoal, isSaving } = useUserGoals(user?.id);
  const goals = defaultGoals;
  const actions = defaultActions;

  return (
    <div className={`craft-story-card ${className}`}>
      <CardHeader />
      <GoalsSection
        goals={goals}
        shortValue={shortTermGoal}
        longValue={longTermGoal}
        onShort={setShortTermGoal}
        onLong={setLongTermGoal}
        disabled={!isAuthenticated}
      />
      <ActionsSection actions={actions} />
      
      {/* スタイル定義（既存のCSSを完全再現） */}
      <style jsx>{`
        .craft-story-card {
          background: white;
          border-radius: 20px;
          padding: 35px;
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .craft-story-card::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, var(--yellow) 0%, transparent 70%);
          opacity: 0.1;
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

        .card-title i {
          color: var(--purple);
        }

        /* 目標セクション */
        .goals-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .goal-card {
          background: linear-gradient(145deg, #f8f8f8, #ffffff);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .goal-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--orange) 0%, var(--pink) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .goal-card:hover::before {
          opacity: 0.1;
        }

        .goal-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--orange);
        }

        .goal-content {
          position: relative;
          z-index: 2;
        }

        .goal-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--pink) 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
          transition: all 0.3s ease;
        }

        .goal-card:hover .goal-icon {
          transform: rotate(10deg) scale(1.1);
        }

        .goal-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .goal-label::after {
          content: '🎯';
          font-size: 16px;
        }

        .goal-textarea { width: 100%; resize: vertical; background:#fff; border:2px solid #eee; border-radius:10px; padding:12px; font-size:16px; color:var(--text-dark); }

        .goal-progress {
          margin-top: 12px;
          background: rgba(0, 0, 0, 0.05);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .goal-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--orange) 0%, var(--pink) 100%);
          width: 0%;
          transition: width 0.8s ease-out;
          position: relative;
          overflow: hidden;
        }

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

        /* アクションセクション */
        .actions-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .action-link {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 188, 212, 0.3);
        }

        .action-link::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          transform: rotate(0deg);
          transition: transform 0.5s ease;
        }

        .action-link:hover::before {
          transform: rotate(90deg);
        }

        .action-link:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0, 188, 212, 0.4);
        }

        .action-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .action-link:hover .action-icon {
          transform: rotate(360deg);
          background: rgba(255, 255, 255, 0.3);
        }

        .action-content {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .action-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .action-desc {
          font-size: 14px;
          opacity: 0.9;
        }

        .action-arrow {
          position: relative;
          z-index: 1;
          font-size: 20px;
          transition: all 0.3s ease;
        }

        .action-link:hover .action-arrow {
          transform: translateX(5px);
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .goals-section {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .actions-section {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .craft-story-card {
            padding: 25px;
          }
          
          .card-title {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .craft-story-card {
            padding: 20px;
          }
          
          .card-header {
            margin-bottom: 20px;
          }
          
          .goals-section {
            margin-bottom: 20px;
          }
          
          .goal-card {
            padding: 15px;
          }
          
          .action-link {
            padding: 20px;
          }
          
          .goal-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          
          .action-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CraftStory; 