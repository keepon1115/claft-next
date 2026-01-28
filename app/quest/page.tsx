'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/stores/questStore'
import QuestMap from '@/components/quest/QuestMap'
import { DynamicStageModal } from '@/components/quest/DynamicStageModal'
import { DynamicAuthModal } from '@/components/auth/DynamicAuthModal'
import { Lock } from 'lucide-react'
import type { StageProgress } from '@/stores/questStore'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { AuthButton } from '@/components/auth/AuthButton'
import { ModalLoadingFallback } from '@/components/common/DynamicLoader'
import UnlockAnimation from '@/components/quest/UnlockAnimation'
import BackgroundAnimations from '@/components/common/BackgroundAnimations'
import JibunMediaLibrary from '@/components/quest/JibunMediaLibrary'

// ==========================================
// 動的インポートコンポーネント
// ==========================================
const DynamicLoginPromptModal = dynamic(
  () => import('@/components/quest/LoginPromptModal'),
  { loading: () => <ModalLoadingFallback title="ログイン案内を読み込み中..." />, ssr: false }
);

// ==========================================
// ユーティリティ関数
// ==========================================
/**
 * 9がつく日かどうかを判定する関数
 * 9日、19日、29日が対象
 */
const isQuestUpdateDay = (): boolean => {
  const today = new Date();
  const day = today.getDate();
  return day === 9 || day === 19 || day === 29;
};

/**
 * 次の9がつく日を取得する関数
 */
const getNextQuestUpdateDay = (): string => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let nextDay: number;
  let nextMonth = currentMonth;
  let nextYear = currentYear;
  
  if (currentDay < 9) {
    nextDay = 9;
  } else if (currentDay < 19) {
    nextDay = 19;
  } else if (currentDay < 29) {
    nextDay = 29;
  } else {
    // 来月の9日
    nextDay = 9;
    nextMonth += 1;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
  }
  
  const nextDate = new Date(nextYear, nextMonth, nextDay);
  return nextDate.toLocaleDateString('ja-JP', { 
    month: 'long', 
    day: 'numeric' 
  });
};

// ==========================================
// クエストページメインコンポーネント
// ==========================================

export default function QuestPage() {
  const router = useRouter()
  const { isAuthenticated, user, isInitialized: authInitialized, isLoading: authLoading } = useAuth()
  const { 
    stageDetails, 
    statistics, 
    isLoading, 
    isInitialized: questInitialized,
    currentArea,
    areas,
    showUnlockAnimation,
    unlockTargetArea,
    initialize,
    switchArea,
    checkAreaUnlock,
    dismissUnlockAnimation,
    getNextAvailableStage
  } = useQuestStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [promptStageId, setPromptStageId] = useState<number>(1)
  const [showVideoPop, setShowVideoPop] = useState(false)
  const [showQuestUpdateNotice, setShowQuestUpdateNotice] = useState(false)

  // 現在のエリアのステージのみを表示
  const currentAreaStages = areas[currentArea].stages
  const stages: StageProgress[] = Object.values(stageDetails)
    .filter(stage => currentAreaStages.includes(stage.stageId))
    .sort((a, b) => a.stageId - b.stageId)
  
  // 現在のテーマを取得
  const currentTheme = areas[currentArea].theme

  // 未ログインユーザー用のデモ統計（現在のエリアに応じて調整）
  const demoStatistics = {
    totalStages: currentAreaStages.length,
    completedStages: 0,
    currentStage: null,
    progressPercentage: 0,
    lastCompletedStage: null
  }

  // 表示用の統計（ログイン状態とエリアに応じて調整）
  // ジブンクラフトはメインクエスト全体の進捗でカテゴリ解放を判断するため、completedStagesはグローバル値を使用
  const displayStatistics = isAuthenticated ? {
    ...statistics,
    totalStages: currentAreaStages.length,
    completedStages: (currentArea === 'jibun')
      ? statistics.completedStages
      : currentAreaStages.filter(stageId => {
          const stage = Object.values(stageDetails).find(s => s.stageId === stageId)
          return stage?.status === 'completed'
        }).length
  } : demoStatistics

  // 認証完了後にデータロード
  useEffect(() => {
    // 認証が初期化済みの場合のみクエストストアを初期化
    if (authInitialized) {
      initialize(user?.id)
    }
  }, [authInitialized, user?.id, initialize])

  // ページ復帰（戻る/タブ復帰）時の再初期化（bfcache対策含む）
  useEffect(() => {
    const reinit = () => {
      if (authInitialized) {
        initialize(user?.id)
      }
    }
    window.addEventListener('pageshow', reinit)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reinit()
    })
    return () => {
      window.removeEventListener('pageshow', reinit)
      document.removeEventListener('visibilitychange', reinit as any)
    }
  }, [authInitialized, user?.id, initialize])

  // エリア解放チェック
  useEffect(() => {
    if (questInitialized) {
      checkAreaUnlock()
    }
  }, [questInitialized, checkAreaUnlock])

  // 9がつく日のクエスト更新通知
  useEffect(() => {
    if (isQuestUpdateDay()) {
      // ローカルストレージで今日の通知を既に表示したかチェック
      const today = new Date().toDateString();
      const lastNoticeDate = localStorage.getItem('questUpdateNoticeDate');
      
      if (lastNoticeDate !== today) {
        setShowQuestUpdateNotice(true);
        localStorage.setItem('questUpdateNoticeDate', today);
      }
    }
  }, [])

  // ステージクリック処理
  const handleStageClick = (stageId: number) => {
    // 未認証の場合はログイン促進モーダルを表示
    if (!isAuthenticated) {
      setPromptStageId(stageId)
      setShowLoginPrompt(true)
      return
    }
    
    // 認証済みの場合は通常通りステージモーダルを開く
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  // ログイン促進モーダルからの登録ボタンクリック
  const handleLoginFromPrompt = () => {
    setShowLoginPrompt(false)
    setShowAuthModal(true)
  }

  // ログイン促進モーダルクローズ
  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false)
  }

  // 認証モーダルクローズ
  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
  }

  // ステージモーダルクローズ処理
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedStageId(null)
    }, 300)
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // ローディング状態の改善（認証またはクエスト初期化中）
  if (authLoading || !authInitialized || (authInitialized && isLoading && !questInitialized)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">冒険の準備中...</p>
          <p className="text-white/80 text-sm mt-2">
            {!authInitialized ? '認証情報を確認中...' : 'クエストデータを読み込み中...'}
          </p>
        </div>
      </div>
    )
  }

  // メインレンダリング
  return (
    <>
      <BackgroundAnimations />
      <main className="min-h-screen quest-page">
        {/* ハンバーガーメニュー */}
        <HamburgerMenu 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
        />
        
        {/* サイドバー */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />

        {/* 認証ボタン（右上固定） */}
        <div className="quest-auth-section">
          <AuthButton 
            variant="compact"
            size="md"
            redirectTo="/quest"
            defaultTab="login"
            enableUserMenu={true}
            showAdminLink={true}
          />
        </div>

        <div className="container">
          {/* 9がつく日のクエスト更新通知 */}
          {showQuestUpdateNotice && (
            <div className="quest-update-notice">
              <div className="quest-update-content">
                <div className="quest-update-header">
                  🎉 クエスト更新日！
                </div>
                <p>
                  今日は9がつく日！新しいジブンクラフト動画が追加されました。
                  <br />
                  「どんな冒険をする？」ボタンから最新の動画をチェックしよう！
                </p>
                <div className="quest-update-actions">
                  <button 
                    onClick={() => setShowVideoPop(true)}
                    className="quest-update-btn primary"
                  >
                    🎬 新しい動画を見る
                  </button>
                  <button 
                    onClick={() => setShowQuestUpdateNotice(false)}
                    className="quest-update-btn secondary"
                  >
                    ✕ 閉じる
                  </button>
                </div>
                <div className="quest-update-next">
                  次回更新予定: {getNextQuestUpdateDay()}
                </div>
              </div>
            </div>
          )}

          <header className="map-header">
            <h1>🗺️ クエストマップ</h1>
            
            {/* エリア切り替えタブ */}
            <div className="area-tabs">
              {Object.entries(areas).map(([areaKey, areaInfo]) => (
                <button
                  key={areaKey}
                  onClick={() => switchArea(areaKey as any)}
                  className={`area-tab ${currentArea === areaKey ? 'active' : ''} ${
                    !areaInfo.isUnlocked ? 'locked' : ''
                  }`}
                  data-area={areaKey}
                  disabled={!areaInfo.isUnlocked}
                >
                  <span className="area-icon">
                    {areaInfo.theme === 'sky' ? '🌤️' : areaInfo.theme === 'twilight' ? '🌇' : '🌙'}
                  </span>
                  <span className="area-name">{areaInfo.name}</span>
                  {!areaInfo.isUnlocked && <Lock size={14} className="lock-icon" />}
                </button>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="guest-notice">
                <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
                  <Lock size={16} />
                  <span className="font-bold">ゲスト閲覧モード</span>
                </div>
                <p className="text-sm text-yellow-700">
                  クエストに挑戦するには冒険者登録が必要です
                </p>
              </div>
            )}

          </header>

          {/* クエストマップまたはジブンクラフト表示 */}
          {currentArea === 'jibun' ? (
            <JibunMediaLibrary />
          ) : (
            <QuestMap
              stages={stages}
              statistics={displayStatistics}
              onStageClick={handleStageClick}
              theme={currentTheme}
              area={currentArea as any}
            />
          )}
        </div>

        {/* 次の冒険ボタン or 吹き出しCTA（認証済みユーザーのみ） */}
        {isAuthenticated && (
          (() => {
            // ジブンクラフトエリア以外では次のステージボタンを表示
            if (currentArea !== 'jibun') {
              const nextStageId = getNextAvailableStage()
              if (nextStageId) {
                return (
                  <button
                    className="quest-button"
                    onClick={() => {
                      setSelectedStageId(nextStageId)
                      setIsModalOpen(true)
                    }}
                    aria-label="次の冒険へ進む"
                  >
                    {currentTheme === 'sky' ? '🔥 次の冒険へ進む！' : '🌇 次の冒険へ進む！'}
                  </button>
                )
              }
            }
            // 全エリアで「どんな冒険をする？」ポップアップを表示
            return (
              <div className="quest-bubble-wrapper" role="region" aria-label="次のコンテンツ案内">
                <button
                  className="quest-bubble"
                  onClick={() => setShowVideoPop((v) => !v)}
                  aria-haspopup="dialog"
                  aria-expanded={showVideoPop}
                  aria-controls="next-videos-pop"
                >
                  💬 どんな冒険をする？
                </button>
                {showVideoPop && (
                  <div id="next-videos-pop" className="quest-pop" role="dialog" aria-modal="false">
                    <div className="quest-pop-header">最新のジブンクラフト動画</div>
                    <ul className="quest-pop-list">
                      <li>
                        <button 
                          onClick={() => {
                            setShowVideoPop(false);
                            window.open('https://youtu.be/1SgQV_n6Pak', '_blank', 'noopener,noreferrer');
                          }}
                          className="quest-video-link quest-jibun-link"
                        >
                          <span className="title">ずっと続くハッピー①長く続くか短く終わるか</span>
                          <span className="badge brain-psychology">脳・心理</span>
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => {
                            setShowVideoPop(false);
                            window.open('https://youtu.be/BZ_V1F38j2s', '_blank', 'noopener,noreferrer');
                          }}
                          className="quest-video-link quest-jibun-link"
                        >
                          <span className="title">ずっと続くハッピー②幸せな人の4つの考え方</span>
                          <span className="badge brain-psychology">脳・心理</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )
          })()
        )}

        {/* 未認証ユーザー向けの登録促進ボタン（ジブンクラフトエリア以外） */}
        {!isAuthenticated && currentArea !== 'jibun' && (
          <button 
            className="quest-register-button"
            onClick={() => setShowAuthModal(true)}
          >
            {currentTheme === 'sky' ? '✨ 冒険者登録して挑戦する！' : '🌇 くれなずむ空に挑戦する！'}
          </button>
        )}
      </main>

      {/* ログイン促進モーダル */}
      <DynamicLoginPromptModal
        isOpen={showLoginPrompt}
        onClose={handleCloseLoginPrompt}
        onLoginClick={handleLoginFromPrompt}
        stageId={promptStageId}
      />

      {/* 認証モーダル */}
      {showAuthModal && (
        <DynamicAuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
          defaultTab="signup"
          redirectTo="/quest"
        />
      )}

      {/* ステージ詳細モーダル（認証済みユーザーのみ） */}
      {isModalOpen && selectedStageId && isAuthenticated && (
        <DynamicStageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          stageId={selectedStageId}
        />
      )}

      {/* エリア解放アニメーション（ステージ6→7-12解放時のみ表示） */}
      {showUnlockAnimation && unlockTargetArea === '7-12' && (
        <UnlockAnimation
          isOpen={showUnlockAnimation}
          targetArea={'7-12'}
          onClose={() => {
            dismissUnlockAnimation()
            switchArea('7-12' as any)
          }}
        />
      )}

      {/* ピクセルアート風スタイル */}
      <style jsx>{`
        .quest-page {
          font-family: var(--font-dot-gothic), var(--font-m-plus-rounded), sans-serif;
          ${currentTheme === 'sky' 
            ? 'background: radial-gradient(circle at 15% 12%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 8%, rgba(255,255,255,0) 20%), linear-gradient(to bottom, #aee8ff 0%, #c8f0ff 40%, #eaf9ff 70%, #ffffff 100%);' 
            : currentTheme === 'twilight'
            ? 'background: radial-gradient(circle at 85% 18%, rgba(255,180,80,0.9) 0%, rgba(255,180,80,0.5) 10%, rgba(255,180,80,0) 22%), linear-gradient(to bottom, #ffb36b 0%, #ff8e6b 35%, #c065b8 65%, #1f2a44 100%);'
            : 'background: radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 20%, rgba(99, 102, 241, 0) 40%), linear-gradient(to bottom, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #2e1065 100%);'
          }
          min-height: 100vh;
          position: relative;
          padding-bottom: 100px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          transition: background 0.8s ease-in-out;
        }

        .quest-auth-section {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 16px 40px;
          position: relative;
          z-index: 10;
        }

        .map-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .map-header h1 {
          font-size: 2.5rem;
          color: #FFF;
          margin-bottom: 16px;
          text-shadow: 2px 2px 0 #4DB6F7, 4px 4px 0 #3A8BC4, 6px 6px 8px rgba(0,0,0,0.3);
          letter-spacing: 2px;
          animation: float_title 3s ease-in-out infinite;
        }

        @keyframes float_title {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .map-header p {
          font-size: 1.1rem;
          color: #FFF;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          background: rgba(0,0,0,0.2);
          display: inline-block;
          padding: 4px 16px;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .area-tabs {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 20px 0 30px;
          padding: 0 20px;
        }

        .area-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 0;
          background: transparent;
          border: none;
          color: #666;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border-bottom: 3px solid transparent;
        }

        .area-tab:hover:not(.locked) {
          color: #333;
        }

        .area-tab[data-area="1-6"]:hover:not(.locked) {
          color: #1976d2;
        }

        .area-tab[data-area="7-12"]:hover:not(.locked) {
          color: #f57c00;
        }

        .area-tab[data-area="1-6"].active {
          color: #1976d2;
          border-bottom-color: #1976d2;
          font-weight: 600;
        }

        .area-tab[data-area="7-12"].active {
          color: #f57c00;
          border-bottom-color: #f57c00;
          font-weight: 600;
        }

        .area-tab.locked {
          opacity: 0.4;
          cursor: not-allowed;
          color: #999;
        }

        .area-icon {
          font-size: 16px;
        }

        .area-name {
          font-size: 14px;
        }

        .lock-icon {
          margin-left: 4px;
          font-size: 12px;
        }

        .guest-notice {
          background: rgba(255, 235, 59, 0.9);
          border: 3px solid #F57F17;
          padding: 12px 20px;
          margin: 20px auto 0;
          max-width: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }



        .quest-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 32px;
          background: #FF6B6B;
          border: 4px solid #DC143C;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 0 2px #FF8787, 6px 6px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
          animation: pulse_button 2s ease-in-out infinite;
          z-index: 900;
        }

        .quest-register-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 32px;
          background: #9C27B0;
          border: 4px solid #6A1B9A;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 0 2px #BA68C8, 6px 6px 0 0 rgba(0,0,0,0.3);
          transition: all 0.1s ease;
          animation: pulse_button 2s ease-in-out infinite;
          z-index: 900;
        }

        /* 吹き出しCTA */
        .quest-bubble-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 950;
        }
        .quest-bubble {
          background: #ffffff;
          color: #333;
          border: 4px solid #222;
          padding: 14px 18px;
          font-weight: 800;
          border-radius: 16px;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 rgba(0,0,0,0.3);
          position: relative;
          cursor: pointer;
        }
        .quest-bubble::after {
          content: '';
          position: absolute;
          bottom: -16px;
          right: 24px;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 16px solid #ffffff;
          filter: drop-shadow(0 2px 0 #222) drop-shadow(2px 2px 0 rgba(0,0,0,0.25));
        }
        .quest-pop {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 320px;
          background: #fff;
          border: 3px solid #333;
          box-shadow: 0 0 0 2px #666, 6px 6px 0 rgba(0,0,0,0.3);
          border-radius: 8px;
          overflow: hidden;
          animation: pop-in .15s ease-out;
        }
        .quest-pop-header {
          background: #FFEB3B;
          border-bottom: 2px solid #C6A700;
          padding: 10px 12px;
          font-weight: 900;
          color: #4E342E;
        }
        .quest-pop-list { list-style: none; margin: 0; padding: 8px 10px; display: grid; gap: 12px; }
        .quest-pop-list li { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .quest-video-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
        }
        .quest-video-link:hover .title {
          color: #1976d2;
        }
        .quest-jibun-link {
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quest-jibun-link:hover {
          background: rgba(25, 118, 210, 0.05);
          border-radius: 8px;
        }
        .quest-pop-list .title { flex: 1; font-weight: 700; color: #222; font-size: 14px; }
        .quest-pop-list .badge { 
          font-size: 11px; 
          font-weight: 900; 
          padding: 3px 8px; 
          border-radius: 12px; 
          letter-spacing: .5px;
          color: #fff;
        }
        .quest-pop-list .badge.anime-manga { background: #FF6B6B; }
        .quest-pop-list .badge.money { background: #4ECDC4; }
        .quest-pop-list .badge.ai-it { background: #9C27B0; }
        .quest-pop-list .badge.philosophy { background: #6366f1; }
        .quest-pop-list .badge.presentation { background: #ec4899; }
        .quest-pop-list .badge.career { background: #f59e0b; }
        .quest-form-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .quest-form-link:hover {
          background: #45a049;
          transform: translateY(-1px);
        }
        @keyframes pop-in { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* 9がつく日のクエスト更新通知 */
        .quest-update-notice {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          animation: slideDown 0.5s ease-out;
        }
        
        .quest-update-content {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border: 3px solid #FF8C00;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(255, 140, 0, 0.3);
          max-width: 400px;
          text-align: center;
          position: relative;
        }
        
        .quest-update-header {
          font-size: 20px;
          font-weight: 900;
          color: #8B4513;
          margin-bottom: 12px;
          text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
        }
        
        .quest-update-content p {
          color: #8B4513;
          font-weight: 600;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        .quest-update-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 12px;
        }
        
        .quest-update-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .quest-update-btn.primary {
          background: #FF6B6B;
          color: white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }
        
        .quest-update-btn.primary:hover {
          background: #FF5252;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }
        
        .quest-update-btn.secondary {
          background: rgba(139, 69, 19, 0.1);
          color: #8B4513;
          border: 2px solid rgba(139, 69, 19, 0.3);
        }
        
        .quest-update-btn.secondary:hover {
          background: rgba(139, 69, 19, 0.2);
        }
        
        .quest-update-next {
          font-size: 12px;
          color: #8B4513;
          opacity: 0.8;
          font-weight: 600;
        }
        
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse_button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes pulse_button_centered {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.02); }
        }

        .quest-button:hover,
        .quest-register-button:hover {
          transform: translate(-2px, -2px) scale(1.02);
          box-shadow: 0 0 0 2px #FF8787, 8px 8px 0 0 rgba(0,0,0,0.3);
          animation: none;
        }

        .quest-register-button:hover {
          box-shadow: 0 0 0 2px #BA68C8, 8px 8px 0 0 rgba(0,0,0,0.3);
        }

        .quest-button:active,
        .quest-register-button:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 2px #FF8787, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .quest-register-button:active {
          box-shadow: 0 0 0 2px #BA68C8, 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        @media (max-width: 767px) {

          .quest-button,
          .quest-register-button,
          .quest-bubble-wrapper {
            padding: 12px 24px;
            font-size: 1rem;
            bottom: 20px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
            animation-name: pulse_button_centered;
          }

          .quest-bubble-wrapper { width: auto; }

          .quest-button:hover,
          .quest-register-button:hover {
            transform: translateX(-50%) translate(-2px, -2px) scale(1.02);
          }

          .quest-button:active,
          .quest-register-button:active {
            transform: translateX(-50%) translate(2px, 2px);
          }

          /* 9がつく日通知のレスポンシブ対応 */
          .quest-update-notice {
            top: 10px;
            left: 10px;
            right: 10px;
            transform: none;
          }
          
          .quest-update-content {
            padding: 16px;
            max-width: none;
          }
          
          .quest-update-header {
            font-size: 18px;
          }
          
          .quest-update-actions {
            flex-direction: column;
            gap: 8px;
          }
          
          .quest-update-btn {
            width: 100%;
          }

          /* ポップアップのレスポンシブ対応 */
          .quest-pop {
            width: 280px;
            right: 10px;
            bottom: 80px;
          }
        }
      `}</style>
    </>
  )
} 