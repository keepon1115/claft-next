import { create } from 'zustand'

interface UserProfile {
  id: string
  nickname: string
  character: string
  skills: string[]
  weakness: string
  favoritePlace: string
  energyCharge: string
  companion: string
  catchphrase: string
  message: string
  avatarUrl?: string
  level: number
  exp: number
  achievements: string[]
}

interface UserStore {
  profile: UserProfile | null
  isLoading: boolean
  setProfile: (profile: UserProfile | null) => void
  updateExp: (exp: number) => void
  initialize: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  updateExp: (exp) => set((state) => ({
    profile: state.profile ? { ...state.profile, exp } : null
  })),
  initialize: () => {
    // 開発モック用のデフォルトプロフィール
    const mockProfile: UserProfile = {
      id: 'mock-user-id',
      nickname: 'テスト冒険者',
      character: '冒険大好き！チャレンジャータイプ',
      skills: ['問題解決', 'コミュニケーション'],
      weakness: '朝が苦手',
      favoritePlace: 'カフェでコーディング',
      energyCharge: 'コーヒーを飲む',
      companion: '一緒に学び合える仲間',
      catchphrase: '「今日も新しいことを学ぼう！」',
      message: 'よろしくお願いします！',
      avatarUrl: '',
      level: 1,
      exp: 0,
      achievements: ['初回ログイン']
    }
    
    set({ 
      profile: mockProfile, 
      isLoading: false 
    })
    
    console.log('🔧 userStore: モックプロフィールで初期化完了')
  }
}))

// 利便性のためのフック
export const useUserProfile = () => {
  const { profile, isLoading } = useUserStore()
  return {
    profileData: profile,
    isLoading
  }
} 