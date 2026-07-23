'use client'

import { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { Sidebar } from '@/components/common/Sidebar'
import Plaza from '@/components/members/Plaza'
import AvatarEditorModal from '@/components/members/AvatarEditorModal'
import UserProfileModal from '@/components/yononaka/UserProfileModal'
import { useAdventurerList } from '@/hooks/useAdventurerList'
import { useMemberAvatars } from '@/hooks/useMemberAvatars'
import { useAuth } from '@/hooks/useAuth'

export default function MembersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false)

  const { adventurers, loading, error } = useAdventurerList()
  const { avatars, refetch: refetchAvatars } = useMemberAvatars()
  const { user } = useAuth()

  // 自分のアバター(未作成ならnull)。作成ボタンの文言と初期値に使う
  const myAvatar = user ? avatars.get(user.id) ?? null : null
  const myProfileNickname = user
    ? adventurers.find((a) => a.id === user.id)?.nickname ?? ''
    : ''

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const openUserProfile = (userId: string) => {
    setSelectedUserId(userId)
    setIsProfileModalOpen(true)
  }

  const closeModal = () => {
    setIsProfileModalOpen(false)
    setSelectedUserId(null)
  }

  return (
    <>
      <HamburgerMenu isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen bg-gradient-to-b from-[#aee3f5] via-[#d7f0fa] to-[#b9e29a]">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            {/* ヒーロー(村の広場) */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/70 border border-[#7ec850] rounded-full px-3 py-1 font-bold text-xs tracking-wide text-[#2f6b1a]">
                🏘 村の広場
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-black text-[#2f6b1a] tracking-wide drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
                メンバーを知る
              </h1>
              <p className="mt-2 text-[#3c5a2a] font-medium">
                みんなが住んでいる広場。アバターをタップしてプロフィールをのぞいてみよう
              </p>

              {/* じぶんアバター作成・きがえ(ログイン時のみ) */}
              {user && (
                <button
                  type="button"
                  onClick={() => setIsAvatarEditorOpen(true)}
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-black shadow-lg transition-all hover:-translate-y-0.5 ${
                    myAvatar
                      ? 'bg-white/80 border-2 border-[#7ec850] text-[#2f6b1a] hover:bg-white'
                      : 'bg-[#7ec850] text-white hover:bg-[#6cb03f] animate-bounce'
                  }`}
                >
                  {myAvatar ? '🎨 アバターをきがえる' : '✨ じぶんアバターをつくる'}
                </button>
              )}
            </div>

            {/* 広場 */}
            {loading && (
              <div className="text-center py-16 bg-white/60 rounded-3xl border-4 border-white shadow-xl">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7ec850] mx-auto mb-4"></div>
                <p className="text-[#3c5a2a] font-medium">みんなを探しています...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16 bg-white/60 rounded-3xl border-4 border-white shadow-xl">
                <div className="text-4xl mb-4">😅</div>
                <p className="text-[#3c5a2a] font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && adventurers.length === 0 && (
              <div className="text-center py-16 bg-white/60 rounded-3xl border-4 border-white shadow-xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-[#3c5a2a] text-lg font-medium">まだ誰もいません</p>
                <p className="text-[#3c5a2a]/70 text-sm mt-2">プロフィールを作成したメンバーが広場に現れます</p>
              </div>
            )}

            {!loading && !error && adventurers.length > 0 && (
              <>
                <Plaza
                  adventurers={adventurers}
                  avatars={avatars}
                  selfId={user?.id ?? null}
                  onSelectMember={openUserProfile}
                />
                <p className="mt-2 text-center text-xs text-[#3c5a2a]/70">
                  ← 横にスクロールすると広場のつづきが見えるよ →
                </p>
              </>
            )}

            {/* アントレプレナーのひろば(旧 /entrepreneur を移植) */}
            <section className="mt-14">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/70 border border-[#7ec850] rounded-full px-3 py-1 font-bold text-xs tracking-wide text-[#2f6b1a]">
                  🤝 アントレプレナーのひろば
                </div>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-[#2f6b1a]">
                  新しい冒険の準備をしています！
                </h2>
                <p className="mt-2 text-[#3c5a2a] max-w-lg mx-auto">
                  アントレプレナーシップとは世の中の課題やチャンスに気づき、自ら動いて解決や創造をしていく力のことです。
                </p>
              </div>

              <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-[#7ec850]/50">
                <ul className="space-y-6 text-left">
                  <li className="flex items-start gap-4">
                    <span className="text-2xl mt-1">🏆</span>
                    <div>
                      <h3 className="font-bold text-[#2f6b1a]">スクール生が考えた商品・サービス・会社名の紹介</h3>
                      <p className="text-sm text-[#3c5a2a]/80">
                        好きや得意を商品・サービスに進化させよう！
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-2xl mt-1">💡</span>
                    <div>
                      <h3 className="font-bold text-[#2f6b1a]">Yononakaで関わったアントレプレナーの活動紹介</h3>
                      <p className="text-sm text-[#3c5a2a]/80">
                        実際に社会で活躍している人の行動を知ろう！
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <p className="mt-8 text-center text-lg font-semibold text-[#2f6b1a]">お楽しみに！</p>
            </section>
          </div>
        </div>
      </main>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={closeModal}
      />

      {/* 開いている間だけマウント(閉じたら状態リセット) */}
      {isAvatarEditorOpen && user && (
        <AvatarEditorModal
          userId={user.id}
          defaultNickname={myProfileNickname}
          existing={myAvatar}
          onSaved={refetchAvatars}
          onClose={() => setIsAvatarEditorOpen(false)}
        />
      )}
    </>
  )
}
