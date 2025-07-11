'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthButton } from '@/components/auth/AuthButton'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const { profileData, updateProfile, initialize } = useUserStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saving' | 'saved' | 'error'
  const [localChanges, setLocalChanges] = useState(false)
  const supabase = createBrowserSupabaseClient()
  
  // ローカルプロフィールデータの状態（編集用）
  const [localProfileData, setLocalProfileData] = useState(profileData)

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

  // userStore初期化
  useEffect(() => {
    const initStore = async () => {
      // SupabaseのUUID形式に一致するかチェック
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (user?.id && uuidRegex.test(user.id)) {
        await initialize(user.id);
      }
    }
    initStore()
  }, [user?.id, initialize])

  // プロフィールデータの同期
  useEffect(() => {
    setLocalProfileData(profileData)
  }, [profileData])

  // フォーム更新処理（ローカル）
  const handleInputChange = (field: string, value: string) => {
    if (field === 'skills') {
      // スキルは文字列をカンマ区切りで配列に変換
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
      setLocalProfileData(prev => ({ ...prev, skills: skillsArray }))
    } else {
      setLocalProfileData(prev => ({ ...prev, [field]: value }))
    }
    setLocalChanges(true)
    // 自動保存を無効化（保存ボタンを押したときのみ保存）
    // setSaveStatus('saving')
  }

  // Supabaseに保存
  const handleSaveProfile = async () => {
    if (!user?.id) return

    setSaveStatus('saving')
    try {
      // userStoreを更新
      const result = await updateProfile(localProfileData)
      
      if (result.success) {
        // Supabaseにも保存
        const { error } = await supabase
          .from('users_profile')
          .upsert({
            id: user.id,
            email: user.email,
            nickname: localProfileData.nickname,
            character_type: localProfileData.character,
            skills: localProfileData.skills,
            weakness: localProfileData.weakness,
            favorite_place: localProfileData.favoritePlace,
            energy_charge: localProfileData.energyCharge,
            companion: localProfileData.companion,
            catchphrase: localProfileData.catchphrase,
            message: localProfileData.message,
            updated_at: new Date().toISOString()
          })

        if (error) throw error

        setSaveStatus('saved')
        setLocalChanges(false)
        console.log('✅ プロフィール保存完了')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ プロフィール保存エラー:', error)
      setSaveStatus('error')
    }
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
        {/* RGBライトストリップ */}
        <div className="rgb-lights"></div>

        {/* ゲーミングデスク */}
        <div className="gaming-desk">
          <div className="desk-surface"></div>
          <div className="monitor monitor-left"></div>
          <div className="monitor monitor-center"></div>
          <div className="monitor monitor-right"></div>
          <div className="gaming-chair">
            <div className="chair-back"></div>
            <div className="chair-seat"></div>
          </div>
        </div>

        {/* 魔法の道具エリア */}
        <div className="magic-area">
          <div className="crystal-ball"></div>
          <div className="crystal-stand"></div>
          <div className="magic-wand"></div>
          <div className="potion-shelf">
            <div className="potion potion1"></div>
            <div className="potion potion2"></div>
            <div className="potion potion3"></div>
            <div className="potion potion4"></div>
          </div>
        </div>

        {/* ペットエリア */}
        <div className="pet-area">
          <div className="pet-slime"></div>
          <div className="pet-bed"></div>
        </div>

        {/* 窓 */}
        <div className="window">
          <div className="city-silhouette"></div>
          <div className="flying-vehicle"></div>
        </div>

        {/* フィギュア棚 */}
        <div className="figure-shelf">
          <div className="figure figure1"></div>
          <div className="figure figure2"></div>
          <div className="figure figure3"></div>
        </div>

        {/* 床 */}
        <div className="room-floor"></div>
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
                  {localProfileData.catchphrase}
                </div>
              </div>
              
              <h2 className="character-name">{localProfileData.nickname}</h2>
              
              <div className="character-stats">
                <div className="stat-item">
                  <div className="stat-label">キャラクター</div>
                  <div className="stat-value">{localProfileData.character}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">レベル</div>
                  <div className="stat-value">Lv. 3</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">スキル数</div>
                  <div className="stat-value">
                    {Array.isArray(localProfileData.skills) 
                      ? localProfileData.skills.length 
                      : 0
                    }個
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">経験値</div>
                  <div className="stat-value">250 XP</div>
                </div>
              </div>
              
              <div className="completion-bar">
                <div 
                  className="completion-fill" 
                  style={{ width: `${localProfileData.profileCompletion}%` }}
                ></div>
                <div className="completion-text">
                  プロフィール完成度 {localProfileData.profileCompletion}%
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
                スキル
              </button>
              <button 
                className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fas fa-heart"></i>
                大切なこと
              </button>
            </div>

            {/* 保存ボタンエリア */}
            <div className="save-buttons">
              <button
                onClick={handleSaveProfile}
                disabled={!localChanges || saveStatus === 'saving'}
                className={`save-btn ${!localChanges ? 'disabled' : ''} ${saveStatus === 'saving' ? 'saving' : ''}`}
              >
                <i className={`fas ${saveStatus === 'saving' ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                {saveStatus === 'saving' ? '保存中...' : 'プロフィールを保存する'}
              </button>
              
              {localChanges && (
                <button
                  onClick={() => {
                    setLocalProfileData(profileData)
                    setLocalChanges(false)
                    setSaveStatus('saved')
                  }}
                  className="cancel-btn"
                >
                  <i className="fas fa-undo"></i>
                  変更を取り消す
                </button>
              )}
              
              {saveStatus === 'error' && (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  保存に失敗しました。もう一度お試しください。
                </div>
              )}
            </div>

            {/* タブコンテンツ */}
            <div className="tab-content">
              {/* 基本情報タブ */}
              {activeTab === 'basic' && (
                <div className="form-section">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-signature"></i>
                      なまえ（ニックネーム）
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localProfileData.nickname || ''}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      placeholder="あなたの冒険者名"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-mask"></i>
                      キャラ（特性）
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localProfileData.character || ''}
                      onChange={(e) => handleInputChange('character', e.target.value)}
                      placeholder="例: 勇者, 魔法使い, 探検家, 発明家"
                    />
                    <div className="form-hint">
                      💡 その他自由に表現OK！
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-comment"></i>
                      セリフ（口ぐせ）
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localProfileData.catchphrase || ''}
                      onChange={(e) => handleInputChange('catchphrase', e.target.value)}
                      placeholder="例: 「やってみよう！」「面白そう！」"
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
                      とくい（スキル）
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={(Array.isArray(localProfileData.skills) ? localProfileData.skills.join(', ') : localProfileData.skills) || ''}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="例: プログラミング, 走る, 絵を描く"
                    />
                    <div className="form-hint">
                      💡 得意なことを「,」で区切って入力してください（例: デザイン, プログラミング, 企画）
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-grimace"></i>
                      よわみ（苦手）
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localProfileData.weakness || ''}
                      onChange={(e) => handleInputChange('weakness', e.target.value)}
                      placeholder="例: 寒がり, 寝坊ぐせ"
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
                      すきな時間・場所
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localProfileData.favoritePlace || ''}
                      onChange={(e) => handleInputChange('favoritePlace', e.target.value)}
                      placeholder="例: カフェでゆっくり, 公園で遊ぶ"
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
                      value={localProfileData.energyCharge || ''}
                      onChange={(e) => handleInputChange('energyCharge', e.target.value)}
                      placeholder="例: 音楽を聴く, 温泉に行く"
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
                      value={localProfileData.companion || ''}
                      onChange={(e) => handleInputChange('companion', e.target.value)}
                      placeholder="例: リーダー, ムードメーカー, アイデアマン"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-message"></i>
                      ひとこと
                    </label>
                    <textarea
                      className="form-textarea"
                      value={localProfileData.message || ''}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="なかまへのメッセージ"
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
        /* 部屋の背景 - ゲーマー×魔法使いのハイブリッド空間 */
        .room-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: #2a2a3e;
          overflow: hidden;
          perspective: 1000px;
        }

        /* 部屋の壁と床 */
        .room-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(to bottom, #1a1a2e 0%, #16213e 25%),
            linear-gradient(to bottom, #f5f5dc 25%, #f5f5dc 75%);
          background-size: 100% 25%, 100% 100%;
          background-position: 0 0, 0 0;
          background-repeat: no-repeat;
        }

        /* 床 */
        .room-floor {
          position: absolute;
          bottom: 0;
          left: -50%;
          right: -50%;
          height: 40%;
          background: 
            repeating-linear-gradient(
              90deg,
              #8B7355 0px,
              #8B7355 100px,
              #A0826D 100px,
              #A0826D 200px
            );
          transform: rotateX(70deg) translateZ(-100px);
          transform-origin: bottom;
        }

        /* RGBライトストリップ（天井） */
        .rgb-lights {
          position: absolute;
          top: 24%;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(
            90deg,
            #ff0080 0%,
            #ff8c00 20%,
            #ffd700 40%,
            #00ff00 60%,
            #00ffff 80%,
            #ff0080 100%
          );
          box-shadow: 
            0 0 20px rgba(255, 0, 128, 0.5),
            0 0 40px rgba(255, 0, 128, 0.3);
          filter: blur(2px);
        }

        /* ゲーミングデスクセットアップ */
        .gaming-desk {
          position: absolute;
          left: 3%;
          bottom: 15%;
          width: 350px;
          height: 280px;
        }

        /* L字型デスク */
        .desk-surface {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 120px;
          background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%);
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .desk-surface::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(
            90deg,
            #ff0080 0%,
            #00ffff 50%,
            #ff0080 100%
          );
          border-radius: 10px 10px 0 0;
        }

        /* トリプルモニター */
        .monitor {
          position: absolute;
          bottom: 120px;
          background: #000;
          border: 3px solid #333;
          border-radius: 10px;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
        }

        .monitor-center {
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 90px;
        }

        .monitor-left {
          left: 10px;
          width: 120px;
          height: 80px;
          transform: rotate(-15deg);
        }

        .monitor-right {
          right: 10px;
          width: 120px;
          height: 80px;
          transform: rotate(15deg);
        }

        .monitor::before {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          background: linear-gradient(
            135deg,
            #1e3c72 0%,
            #2a5298 50%,
            #7e22ce 100%
          );
          border-radius: 5px;
          opacity: 0.9;
        }

        /* ゲーミングチェア */
        .gaming-chair {
          position: absolute;
          left: 120px;
          bottom: -20px;
          width: 80px;
          height: 140px;
        }

        .chair-back {
          position: absolute;
          top: 0;
          left: 10px;
          width: 60px;
          height: 90px;
          background: linear-gradient(to bottom, #ff0080 0%, #8b008b 100%);
          border-radius: 10px 10px 0 0;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.3);
        }

        .chair-seat {
          position: absolute;
          bottom: 30px;
          left: 5px;
          width: 70px;
          height: 20px;
          background: #8b008b;
          border-radius: 5px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        /* 魔法の道具エリア */
        .magic-area {
          position: absolute;
          right: 5%;
          bottom: 25%;
          width: 300px;
          height: 350px;
        }

        /* 浮遊する水晶玉 */
        .crystal-ball {
          position: absolute;
          top: 20px;
          right: 50px;
          width: 80px;
          height: 80px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(138, 43, 226, 0.6) 30%,
            rgba(75, 0, 130, 0.8) 60%,
            rgba(138, 43, 226, 0.9) 100%
          );
          border-radius: 50%;
          box-shadow: 
            0 0 50px rgba(138, 43, 226, 0.8),
            inset 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .crystal-ball::before {
          content: '';
          position: absolute;
          top: 10%;
          left: 20%;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          filter: blur(10px);
        }

        .crystal-stand {
          position: absolute;
          top: 90px;
          right: 60px;
          width: 60px;
          height: 30px;
          background: linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 100%);
          clip-path: polygon(20% 0%, 80% 0%, 90% 100%, 10% 100%);
        }

        /* 魔法の杖（壁掛け） */
        .magic-wand {
          position: absolute;
          top: 150px;
          right: 20px;
          width: 150px;
          height: 8px;
          background: linear-gradient(
            90deg,
            #8b4513 0%,
            #d2691e 40%,
            #ffd700 50%,
            #d2691e 60%,
            #8b4513 100%
          );
          border-radius: 4px;
          transform: rotate(-30deg);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .magic-wand::before {
          content: '';
          position: absolute;
          right: -20px;
          top: -15px;
          width: 40px;
          height: 40px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 215, 0, 0.6) 40%,
            transparent 70%
          );
          border-radius: 50%;
        }

        /* ポーション棚 */
        .potion-shelf {
          position: absolute;
          top: 200px;
          right: 40px;
          width: 200px;
          height: 15px;
          background: #8b4513;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
        }

        .potion {
          position: absolute;
          bottom: 15px;
          width: 25px;
          height: 40px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          box-shadow: 0 0 15px currentColor;
        }

        .potion1 {
          left: 20px;
          background: rgba(255, 0, 0, 0.7);
          color: #ff0000;
        }

        .potion2 {
          left: 60px;
          background: rgba(0, 255, 0, 0.7);
          color: #00ff00;
        }

        .potion3 {
          left: 100px;
          background: rgba(0, 100, 255, 0.7);
          color: #0064ff;
        }

        .potion4 {
          left: 140px;
          background: rgba(255, 0, 255, 0.7);
          color: #ff00ff;
        }

        /* ペットエリア */
        .pet-area {
          position: absolute;
          right: 10%;
          bottom: 5%;
          width: 150px;
          height: 120px;
        }

        /* かわいいスライムペット */
        .pet-slime {
          position: absolute;
          bottom: 20px;
          left: 30px;
          width: 60px;
          height: 50px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 255, 170, 0.8) 0%,
            rgba(0, 200, 140, 0.9) 60%,
            rgba(0, 150, 100, 1) 100%
          );
          border-radius: 50% 50% 45% 45% / 60% 60% 40% 40%;
          box-shadow: 
            0 0 30px rgba(0, 255, 170, 0.6),
            inset 0 -5px 10px rgba(0, 0, 0, 0.1);
        }

        .pet-slime::before,
        .pet-slime::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
          top: 35%;
        }

        .pet-slime::before {
          left: 25%;
        }

        .pet-slime::after {
          right: 25%;
        }

        .pet-bed {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100px;
          height: 20px;
          background: #8b4513;
          border-radius: 50%;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .pet-bed::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 10px;
          right: 10px;
          height: 15px;
          background: #ff6b6b;
          border-radius: 50%;
        }

        /* 窓は既存の要素を使用するため削除 */
        .window {
          position: absolute;
          top: 8%;
          right: 15%;
          width: 250px;
          height: 300px;
          background: linear-gradient(
            to bottom,
            #1e3c72 0%,
            #2a5298 40%,
            #ff6b6b 70%,
            #feca57 100%
          );
          border: 10px solid #4a4a4a;
          border-radius: 10px;
          box-shadow: 
            inset 0 0 30px rgba(0, 0, 0, 0.3),
            0 0 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        /* 窓枠 */
        .window::before,
        .window::after {
          content: '';
          position: absolute;
          background: #4a4a4a;
        }

        .window::before {
          top: 50%;
          left: 0;
          right: 0;
          height: 10px;
          transform: translateY(-50%);
        }

        .window::after {
          left: 50%;
          top: 0;
          bottom: 0;
          width: 10px;
          transform: translateX(-50%);
        }

        /* 元のwindow内の要素は削除 */
        .sun,
        .cloud {
          display: none;
        }

        /* 既存の要素も削除 */
        .floor,
        .bookshelf,
        .book,
        .plant,
        .pot,
        .leaf {
          display: none;
        }

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

        .form-hint {
          font-size: 14px;
          color: #6B7280;
          margin-top: 8px;
          padding: 8px 12px;
          background: #F3F4F6;
          border-radius: 8px;
          border-left: 3px solid #3B82F6;
        }

        /* 保存ボタンエリア */
        .save-buttons {
          background: white;
          padding: 24px;
          border-radius: 15px;
          box-shadow: var(--shadow-md);
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .save-btn {
          background: linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(126, 87, 194, 0.3);
        }

        .save-btn:hover:not(.disabled):not(.saving) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(126, 87, 194, 0.4);
        }

        .save-btn.disabled {
          background: #D1D5DB;
          color: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }

        .save-btn.saving {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: transparent;
          color: #6B7280;
          border: 2px solid #D1D5DB;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cancel-btn:hover {
          background: #F3F4F6;
          border-color: #9CA3AF;
          color: #374151;
        }

        .error-message {
          color: #DC2626;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FEF2F2;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #FECACA;
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

          .gaming-desk {
            transform: scale(0.7);
            left: -5%;
          }
          
          .magic-area {
            transform: scale(0.8);
            right: 0;
          }
          
          .window {
            width: 180px;
            height: 220px;
            right: 5%;
          }
          
          .neon-sign {
            font-size: 18px;
            left: 10%;
          }
        }
      `}</style>

      {/* 部屋の背景要素をJSXで追加 */}
      <div className="room-background">
        <div className="room-floor"></div>
        <div className="rgb-lights"></div>
        
        {/* ゲーミングデスクエリア */}
        <div className="gaming-desk">
          <div className="desk-surface"></div>
          <div className="monitor monitor-left"></div>
          <div className="monitor monitor-center"></div>
          <div className="monitor monitor-right"></div>
          <div className="gaming-chair">
            <div className="chair-back"></div>
            <div className="chair-seat"></div>
          </div>
        </div>
        
        {/* 魔法の道具エリア */}
        <div className="magic-area">
          <div className="crystal-ball"></div>
          <div className="crystal-stand"></div>
          <div className="magic-wand"></div>
          <div className="potion-shelf">
            <div className="potion potion1"></div>
            <div className="potion potion2"></div>
            <div className="potion potion3"></div>
            <div className="potion potion4"></div>
          </div>
        </div>
        
        {/* ペットエリア */}
        <div className="pet-area">
          <div className="pet-bed"></div>
          <div className="pet-slime"></div>
        </div>
        
        {/* 新しい窓 */}
        <div className="window">
          <div className="city-silhouette"></div>
          <div className="flying-vehicle"></div>
        </div>
        
        {/* ネオンサイン */}
        <div className="neon-sign">PLAYER ONE</div>
        
        {/* フィギュア棚 */}
        <div className="figure-shelf">
          <div className="figure figure1"></div>
          <div className="figure figure2"></div>
          <div className="figure figure3"></div>
        </div>
      </div>
      </>
  )
} 