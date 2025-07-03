'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthButton } from '@/components/auth/AuthButton'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saving' | 'saved'
  
  // プロフィールデータの状態
  const [profileData, setProfileData] = useState({
    nickname: 'クラフター',
    character: '創造型冒険者',
    skills: ['プログラミング', 'デザイン', '企画'],
    weakness: '早起き',
    favoritePlace: 'カフェ',
    energyCharge: 'コーヒーを飲む',
    companion: 'クリエイティブな仲間',
    catchphrase: '毎日少しずつ成長していこう！',
    message: '新しい挑戦をしながら、自分らしいキャリアを築いていきたいです。',
    profileCompletion: 85
  })

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 未認証の場合、3秒後にホームページにリダイレクト
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, router])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // フォーム更新処理
  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setSaveStatus('saving')
    
    // デモ：2秒後に保存完了
    setTimeout(() => {
      setSaveStatus('saved')
    }, 2000)
  }

  const handleSkillsChange = (skills: string[]) => {
    setProfileData(prev => ({ ...prev, skills }))
    setSaveStatus('saving')
    setTimeout(() => setSaveStatus('saved'), 2000)
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">認証確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🚪 ログインが必要です
            </h1>
            <p className="text-gray-600">
              プロフィール編集は冒険者登録済みの方のみご利用いただけます。
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
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            3秒後に自動的にホームページに移動します...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 部屋の背景 */}
      <div className="room-background">
        <div className="window">
          <div className="sun"></div>
          <div className="cloud cloud1"></div>
        </div>
        <div className="floor"></div>
        <div className="bookshelf">
          <div className="book"></div>
          <div className="book"></div>
          <div className="book"></div>
          <div className="book"></div>
          <div className="book"></div>
        </div>
        <div className="plant">
          <div className="pot"></div>
          <div className="leaf"></div>
          <div className="leaf"></div>
          <div className="leaf"></div>
        </div>
      </div>

      <main className="min-h-screen relative">
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

        {/* ヘッダー */}
        <header className="header">
          <div className="header-content">
            <button 
              className="back-button"
              onClick={() => router.push('/')}
            >
              <i className="fas fa-arrow-left"></i>
              ホームに戻る
            </button>
            
            <div className="header-title">
              <h1>🧙‍♀️ 冒険者プロフィール編集</h1>
              <p>あなたの冒険者としての情報を設定しましょう</p>
            </div>
            
            <div className={`save-indicator ${saveStatus === 'saving' ? 'saving' : ''}`}>
              <i className={`fas ${saveStatus === 'saving' ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
              {saveStatus === 'saving' ? '保存中...' : '保存済み'}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="main-container">
          {/* キャラクタープレビュー */}
          <div className="character-preview">
            <div className="preview-card">
              <div className="character-avatar">
                <div className="avatar-circle">
                  <i className="fas fa-user-astronaut"></i>
                </div>
                <div className="character-speech active">
                  {profileData.catchphrase}
                </div>
              </div>
              
              <h2 className="character-name">{profileData.nickname}</h2>
              
              <div className="character-stats">
                <div className="stat-item">
                  <div className="stat-label">キャラクター</div>
                  <div className="stat-value">{profileData.character}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">レベル</div>
                  <div className="stat-value">Lv. 3</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">スキル数</div>
                  <div className="stat-value">{profileData.skills.length}個</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">経験値</div>
                  <div className="stat-value">250 XP</div>
                </div>
              </div>
              
              <div className="completion-bar">
                <div 
                  className="completion-fill" 
                  style={{ width: `${profileData.profileCompletion}%` }}
                ></div>
                <div className="completion-text">
                  プロフィール完成度 {profileData.profileCompletion}%
                </div>
              </div>
            </div>
          </div>

          {/* 編集フォーム */}
          <div className="edit-form">
            {/* タブ */}
            <div className="form-tabs">
              <button 
                className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fas fa-user"></i>
                基本情報
              </button>
              <button 
                className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                <i className="fas fa-star"></i>
                スキル・特性
              </button>
              <button 
                className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fas fa-heart"></i>
                パーソナル
              </button>
            </div>

            {/* タブコンテンツ */}
            <div className="tab-content">
              {/* 基本情報タブ */}
              {activeTab === 'basic' && (
                <div className="form-section">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-signature"></i>
                      ニックネーム
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      placeholder="あなたの冒険者名"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-mask"></i>
                      キャラクタータイプ
                    </label>
                    <select
                      className="form-input"
                      value={profileData.character}
                      onChange={(e) => handleInputChange('character', e.target.value)}
                    >
                      <option value="創造型冒険者">創造型冒険者</option>
                      <option value="探求型冒険者">探求型冒険者</option>
                      <option value="社交型冒険者">社交型冒険者</option>
                      <option value="分析型冒険者">分析型冒険者</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-comment"></i>
                      キャッチフレーズ
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.catchphrase}
                      onChange={(e) => handleInputChange('catchphrase', e.target.value)}
                      placeholder="あなたの座右の銘"
                    />
                  </div>
                </div>
              )}

              {/* スキル・特性タブ */}
              {activeTab === 'skills' && (
                <div className="form-section">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-star"></i>
                      得意なこと（スキル）
                    </label>
                    <div className="skills-input">
                      {profileData.skills.map((skill, index) => (
                        <div key={index} className="skill-tag">
                          {skill}
                          <button 
                            onClick={() => {
                              const newSkills = profileData.skills.filter((_, i) => i !== index)
                              handleSkillsChange(newSkills)
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button className="add-skill-btn">+ スキル追加</button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-grimace"></i>
                      ちょっと苦手なこと
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.weakness}
                      onChange={(e) => handleInputChange('weakness', e.target.value)}
                      placeholder="苦手なことを正直に"
                    />
                  </div>
                </div>
              )}

              {/* パーソナルタブ */}
              {activeTab === 'personal' && (
                <div className="form-section">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-map-marker-alt"></i>
                      好きな場所・時間
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.favoritePlace}
                      onChange={(e) => handleInputChange('favoritePlace', e.target.value)}
                      placeholder="集中できる場所や時間"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-battery-full"></i>
                      エネルギーチャージ方法
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.energyCharge}
                      onChange={(e) => handleInputChange('energyCharge', e.target.value)}
                      placeholder="元気になる方法"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-users"></i>
                      一緒に冒険したい人
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.companion}
                      onChange={(e) => handleInputChange('companion', e.target.value)}
                      placeholder="どんな人と働きたい？"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-message"></i>
                      ひとこと
                    </label>
                    <textarea
                      className="form-textarea"
                      value={profileData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="自分についてのメッセージ"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* プロフィール編集専用スタイル */}
      <style jsx>{`
        /* 部屋の背景 */
        .room-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: linear-gradient(to bottom, #87CEEB 0%, #87CEEB 40%, var(--cream-bg) 40%);
          overflow: hidden;
        }

        .window {
          position: absolute;
          top: 10%;
          right: 20%;
          width: 200px;
          height: 250px;
          background: linear-gradient(to bottom, #87CEEB, #FFE4B5);
          border: 8px solid #8B6E47;
          border-radius: 5px 5px 0 0;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .window::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -8px;
          right: -8px;
          height: 8px;
          background: #8B6E47;
        }

        .window::after {
          content: '';
          position: absolute;
          top: -8px;
          bottom: -8px;
          left: 50%;
          width: 8px;
          background: #8B6E47;
          transform: translateX(-50%);
        }

        .sun {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 40px;
          height: 40px;
          background: #FFD700;
          border-radius: 50%;
          box-shadow: 0 0 40px #FFD700;
          animation: float 6s ease-in-out infinite;
        }

        .cloud1 {
          position: absolute;
          top: 20px;
          left: -100px;
          width: 80px;
          height: 30px;
          background: white;
          border-radius: 100px;
          opacity: 0.7;
          animation: drift 20s infinite linear;
        }

        .cloud1::before {
          content: '';
          position: absolute;
          width: 50px;
          height: 50px;
          top: -25px;
          left: 10px;
          background: white;
          border-radius: 100px;
        }

        .floor {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: repeating-linear-gradient(
            90deg,
            #D2691E,
            #D2691E 80px,
            #CD853F 80px,
            #CD853F 160px
          );
          transform: perspective(200px) rotateX(30deg);
          transform-origin: bottom;
        }

        .bookshelf {
          position: absolute;
          left: 5%;
          bottom: 30%;
          width: 150px;
          height: 200px;
          background: #8B6E47;
          border-radius: 5px;
          box-shadow: var(--shadow-md);
        }

        .book {
          position: absolute;
          bottom: 10px;
          width: 20px;
          height: 140px;
          border-radius: 2px;
          transform-origin: bottom;
        }

        .book:nth-child(1) { left: 10px; background: #E74C3C; transform: rotate(-2deg); }
        .book:nth-child(2) { left: 35px; background: #3498DB; height: 130px; }
        .book:nth-child(3) { left: 60px; background: #2ECC71; transform: rotate(2deg); }
        .book:nth-child(4) { left: 85px; background: #F39C12; height: 135px; }
        .book:nth-child(5) { left: 110px; background: #9B59B6; transform: rotate(-1deg); }

        .plant {
          position: absolute;
          right: 10%;
          bottom: 25%;
          width: 80px;
          height: 100px;
        }

        .pot {
          position: absolute;
          bottom: 0;
          width: 80px;
          height: 40px;
          background: #8B4513;
          border-radius: 0 0 10px 10px;
          box-shadow: var(--shadow-md);
        }

        .leaf {
          position: absolute;
          bottom: 30px;
          left: 50%;
          width: 30px;
          height: 50px;
          background: #228B22;
          border-radius: 0 100% 0 100%;
          transform-origin: bottom;
          animation: sway 3s ease-in-out infinite;
        }

        .leaf:nth-child(2) { transform: rotate(-30deg) translateX(-20px); animation-delay: 0.5s; }
        .leaf:nth-child(3) { transform: rotate(30deg) translateX(20px); animation-delay: 1s; }

        /* ヘッダー */
        .header {
          background: linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%);
          color: white;
          padding: 20px 30px;
          box-shadow: var(--shadow-lg);
          position: relative;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-button:hover {
          background: white;
          color: var(--purple);
          transform: translateY(-2px);
        }

        .header-title {
          text-align: center;
          flex: 1;
        }

        .header-title h1 {
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-title p {
          font-size: 14px;
          opacity: 0.9;
        }

        .save-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 14px;
        }

        .save-indicator.saving {
          animation: pulse 1s infinite;
        }

        /* メインコンテンツ */
        .main-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 40px;
          position: relative;
          z-index: 10;
        }

        /* キャラクタープレビュー */
        .character-preview {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .preview-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 30px;
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
        }

        .preview-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, var(--yellow) 0%, transparent 70%);
          opacity: 0.1;
          animation: rotate-bg 20s linear infinite;
        }

        .character-avatar {
          width: 180px;
          height: 180px;
          margin: 0 auto 20px;
          position: relative;
          animation: float-avatar 4s ease-in-out infinite;
        }

        .avatar-circle {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--purple) 0%, var(--pink) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: white;
          box-shadow: 0 10px 30px rgba(126, 87, 194, 0.3);
          position: relative;
          overflow: hidden;
        }

        .avatar-circle::after {
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

        .character-speech {
          position: absolute;
          top: -20px;
          right: -20px;
          background: white;
          padding: 10px 15px;
          border-radius: 20px;
          box-shadow: var(--shadow-md);
          max-width: 150px;
          font-size: 14px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }

        .character-speech.active {
          opacity: 1;
          transform: scale(1);
        }

        .character-speech::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 20px;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid white;
        }

        .character-name {
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--purple);
        }

        .character-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }

        .stat-item {
          background: #FFF4E6;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-dark);
          min-height: 20px;
        }

        .completion-bar {
          margin-top: 20px;
          background: #E0E0E0;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .completion-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green) 0%, var(--yellow) 100%);
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .completion-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }

        .completion-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dark);
        }

        /* 編集フォーム */
        .edit-form {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--shadow-md);
        }

        .form-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .tab-button {
          padding: 12px 24px;
          background: #E0E0E0;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: var(--blue);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }

        .tab-button.active {
          background: var(--blue);
          color: white;
        }

        .tab-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-dark);
          font-size: 16px;
        }

        .form-input,
        .form-textarea {
          padding: 15px;
          border: 2px solid #E0E0E0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(41, 182, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .skills-input {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .skill-tag {
          background: var(--blue);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .skill-tag button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skill-tag button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .add-skill-btn {
          background: #E0E0E0;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .add-skill-btn:hover {
          background: var(--blue);
          color: white;
        }

        /* アニメーション */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes drift {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes rotate-bg {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float-avatar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        /* レスポンシブ */
        @media (max-width: 768px) {
          .main-container {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 15px;
          }

          .character-preview {
            position: static;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .form-tabs {
            justify-content: center;
          }

          .tab-button {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  )
} 