'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface UserProfileData {
  id: string
  email: string
  nickname: string
  character_type?: string
  skills?: string[]
  weakness?: string
  favorite_place?: string
  energy_charge?: string
  companion?: string
  catchphrase?: string
  message?: string
  avatar_url?: string
  favorite_now_image_url?: string
  profile_completion?: number
  created_at?: string
  // 統計データ
  quest_clear_count?: number
  total_exp?: number
  last_login_date?: string
  login_count?: number
}

// 非認知能力の公開情報(強みTOP3・偉人見立て)。
// member_traits_public ビューは11-Fで作成予定のため、存在しない間は非表示スキップ
interface PublicTraits {
  strengths: string[]
  heroTitle: string | null
}

interface UserProfileModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

// =====================================================
// ユーザープロフィールモーダルコンポーネント
// =====================================================

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [traits, setTraits] = useState<PublicTraits | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()

  // ユーザーデータ取得
  const fetchUserData = async (targetUserId: string) => {
    try {
      setLoading(true)
      setError(null)

      // プロフィールデータを取得
      const { data: profileData, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // 統計データを取得
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('quest_clear_count, total_exp, last_login_date, login_count')
        .eq('user_id', targetUserId)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        console.warn('統計データ取得エラー:', statsError)
      }

      // フォールバック: クエスト完了ステージ数を quest_progress から集計
      let completedStagesFallback = 0
      try {
        const { count } = await supabase
          .from('quest_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .in('status', ['completed', 'approved'])
        completedStagesFallback = count || 0
      } catch (e) {
        console.warn('quest_progress 集計に失敗:', e)
      }

      // データを結合
      const combinedData: UserProfileData = {
        id: targetUserId,
        email: profileData?.email || `user-${targetUserId.substring(0, 8)}@example.com`,
        nickname: profileData?.nickname || '冒険者',
        character_type: profileData?.character_type || '',
        skills: profileData?.skills || [],
        weakness: profileData?.weakness || '',
        favorite_place: profileData?.favorite_place || '',
        energy_charge: profileData?.energy_charge || '',
        companion: profileData?.companion || '',
        catchphrase: profileData?.catchphrase || '',
        message: profileData?.message || '',
        avatar_url: profileData?.avatar_url || '',
        favorite_now_image_url: (profileData as any)?.favorite_now_image_url || '',
        profile_completion: profileData?.profile_completion || 0,
        created_at: profileData?.created_at,
        quest_clear_count: (statsData?.quest_clear_count ?? completedStagesFallback) || 0,
        total_exp: statsData?.total_exp || 0,
        last_login_date: statsData?.last_login_date,
        login_count: statsData?.login_count || 0
      }

      setUserData(combinedData)

      // 強みTOP3・偉人バッジ(ビュー未作成・データなしなら黙ってスキップ)
      const { data: traitsRow, error: traitsError } = await supabase
        .from('member_traits_public')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle()
      if (!traitsError && traitsRow) {
        const row = traitsRow as Record<string, unknown>
        setTraits({
          strengths: Array.isArray(row.strengths) ? (row.strengths as string[]) : [],
          heroTitle:
            typeof row.hero_title === 'string' && row.hero_title
              ? row.hero_title
              : typeof row.hero_name === 'string' && row.hero_name
                ? row.hero_name
                : null,
        })
      }

    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // モーダルが開かれたときにデータを取得
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData(userId)
    }
  }, [isOpen, userId])

  // モーダルが閉じられたときにデータをクリア
  useEffect(() => {
    if (!isOpen) {
      setUserData(null)
      setTraits(null)
      setError(null)
    }
  }, [isOpen])

  // キーボードイベント（Escキーでモーダルを閉じる）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // スクロール無効化
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = '' // スクロール復元
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // レベル計算: ステージ6完了でLv.2、それ以外はLv.1
  const completedStages = userData?.quest_clear_count || 0
  const level = completedStages >= 6 ? 2 : 1
  const currentLevelExp = 0

  // 総経験値（表示用）
  // ルール: ログイン数×5 + クリア数×10 + レベルアップ(100) + プロフ完成100%で20(1回)
  const calcTotalExp = (loginCount: number, clearCount: number, profileCompletion: number, lvl: number) => {
    const base = (loginCount * 5) + (clearCount * 10)
    const levelBonus = lvl > 1 ? 100 : 0
    const profileBonus = profileCompletion >= 100 ? 20 : 0
    return base + levelBonus + profileBonus
  }
  const displayTotalExp = calcTotalExp(
    userData?.login_count || 0,
    completedStages,
    userData?.profile_completion || 0,
    level
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-pink-400 rounded-t-3xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200"
          >
            <X size="1em" className="text-lg" />
          </button>
          
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">🧙‍♀️ 冒険者プロフィール</h2>
            <p className="text-amber-100">CLAFT 冒険者の詳細情報</p>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                閉じる
              </button>
            </div>
          )}

          {userData && !loading && !error && (
            <div className="space-y-6">
              {/* プロフィール基本情報 */}
              <div className="flex items-center gap-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                  {userData.avatar_url ? (
                    <img 
                      src={userData.avatar_url} 
                      alt={`${userData.nickname}のアバター`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center text-white text-2xl"
                    style={{ display: userData.avatar_url ? 'none' : 'flex' }}
                  >
                    👨‍🎓
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{userData.nickname}</h3>
                  <p className="text-purple-600 font-medium mb-1">
                    {userData.character_type || '冒険者'}
                  </p>
                  {userData.catchphrase && (
                    <p className="text-gray-600 italic">「{userData.catchphrase}」</p>
                  )}
                  {/* 強みTOP3・偉人バッジ(member_traits_publicがある場合のみ) */}
                  {traits && (traits.strengths.length > 0 || traits.heroTitle) && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {traits.heroTitle && (
                        <span className="bg-gradient-to-r from-amber-200 to-yellow-100 border border-amber-400 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                          🏅 {traits.heroTitle}
                        </span>
                      )}
                      {traits.strengths.slice(0, 3).map((strength, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          💎 {strength}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* バッジ表示エリア */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* ログイン系 */}
                    {(() => {
                      const login = userData.login_count || 0
                      const tier = login >= 50 ? 'gold' : login >= 10 ? 'silver' : login > 0 ? 'bronze' : null
                      const title = login >= 50 ? 'ログイン50回' : login >= 10 ? 'ログイン10回' : login > 0 ? '初回ログイン' : ''
                      return tier ? (
                        <span className={`achievement-badge ${tier}`} title={title}>🏆</span>
                      ) : null
                    })()}
                    {/* プロフィール系 */}
                    {(() => {
                      const completion = userData.profile_completion || 0
                      const tier = completion >= 100 ? 'gold' : (userData.nickname ? 'silver' : null)
                      const title = completion >= 100 ? 'プロフィール100%' : userData.nickname ? 'プロフィール参加' : ''
                      return tier ? (
                        <span className={`achievement-badge ${tier}`} title={title}>⭐</span>
                      ) : null
                    })()}
                    {/* クエスト系 */}
                    {(() => {
                      const clears = userData.quest_clear_count || 0
                      const tier = clears >= 12 ? 'gold' : clears >= 6 ? 'silver' : clears >= 1 ? 'bronze' : null
                      const title = clears >= 12 ? 'くれなずむ空クリア' : clears >= 6 ? 'はじまりの空クリア' : clears >= 1 ? 'クエスト参加' : ''
                      return tier ? (
                        <span className={`achievement-badge ${tier}`} title={title}>🎯</span>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">Lv.{level}</div>
                  <div className="text-sm text-blue-500">レベル</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{displayTotalExp}</div>
                  <div className="text-sm text-green-500">総経験値</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{userData.quest_clear_count || 0}</div>
                  <div className="text-sm text-purple-500">クエスト完了</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{userData.login_count || 0}</div>
                  <div className="text-sm text-orange-500">ログイン数</div>
                </div>
              </div>

              {/* スキル・特性 */}
              {(userData.skills && userData.skills.length > 0) || userData.weakness && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b-2 border-amber-200 pb-2">💪 能力・特性</h4>
                  
                  {userData.skills && userData.skills.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold text-green-800">とくい</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userData.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userData.weakness && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">😅</span>
                        <span className="font-semibold text-red-800">よわみ</span>
                      </div>
                      <p className="text-red-700">{userData.weakness}</p>
                    </div>
                  )}
                </div>
              )}

              {/* パーソナル情報 */}
              {(userData.favorite_place || userData.energy_charge || userData.companion) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b-2 border-amber-200 pb-2">🌟 パーソナル情報</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userData.favorite_place && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🏖️</span>
                          <span className="font-semibold text-blue-800">すきな時間・場所</span>
                        </div>
                        <p className="text-blue-700">{userData.favorite_place}</p>
                      </div>
                    )}

                    {userData.energy_charge && (
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">⚡</span>
                          <span className="font-semibold text-yellow-800">エネルギーチャージ</span>
                        </div>
                        <p className="text-yellow-700">{userData.energy_charge}</p>
                      </div>
                    )}

                    {userData.companion && (
                      <div className="bg-purple-50 rounded-xl p-4 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🤝</span>
                          <span className="font-semibold text-purple-800">一緒に冒険したい人</span>
                        </div>
                        <p className="text-purple-700">{userData.companion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ひとこと */}
              {userData.message && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💬</span>
                    <span className="font-semibold text-purple-800">ひとこと</span>
                  </div>
                  <p className="text-purple-700 text-lg leading-relaxed">{userData.message}</p>
                </div>
              )}

              {/* 今ハマっていること・見てほしいモノなど（画像） */}
              {userData.favorite_now_image_url && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📸</span>
                    <span className="font-semibold text-gray-800">今ハマっていること・見てほしいモノなど</span>
                  </div>
                  <img
                    src={userData.favorite_now_image_url}
                    alt="今ハマっていること・見てほしいモノなど"
                    className="w-full h-auto rounded-lg object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}

              {/* 作品(将来枠: ひらめきポストは投稿者非公開のため当面は準備中表示) */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 border-b-2 border-amber-200 pb-2">🎨 作品</h4>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🚧</div>
                  <p className="text-gray-500">作品はまだ準備中</p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
