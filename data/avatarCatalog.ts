// アバターカタログ(sprite_idの正)。Web広場とGodotマップの両方がこのIDを使う。
// - プレビュー画像: public/avatars/{sprite_id}.png (Idle正面16x16の切り出し)
// - Godot側アセット: yononaka-map/assets/characters/{sprite_id}/ (Idle/Walk/Faceset)
// - Godot側は未知のsprite_idを _default にフォールバックするので、カタログのズレで壊れない
// 出典: Ninja Adventure Pack (CC0)。追加するときは両方のアセット配置も忘れずに。
// 詳細仕様: docs/renovation/09-avatar-sync.md

export interface AvatarSprite {
  spriteId: string
  name: string // 選択UIに出す表示名
}

export const AVATAR_CATALOG: AvatarSprite[] = [
  { spriteId: 'villager_01', name: 'たんけんボーイ' },
  { spriteId: 'villager_02', name: 'プリンセス' },
  { spriteId: 'villager_03', name: 'ほのおのせいれい' },
  { spriteId: 'villager_04', name: 'おねえさん' },
  { spriteId: 'villager_05', name: 'ナイト' },
  { spriteId: 'villager_06', name: 'サムライ' },
  { spriteId: 'villager_07', name: 'あおニンジャ' },
  { spriteId: 'villager_08', name: 'あかニンジャ' },
  { spriteId: 'villager_09', name: 'みどりニンジャ' },
  { spriteId: 'villager_10', name: 'おぼうさん' },
  { spriteId: 'villager_11', name: 'ハンター' },
  { spriteId: 'villager_12', name: 'たまごボーイ' },
  { spriteId: 'villager_13', name: 'たまごガール' },
  { spriteId: 'villager_14', name: 'カエルマスク' },
  { spriteId: 'villager_15', name: 'おさるさん' },
  { spriteId: 'villager_16', name: 'ライオンボーイ' },
]

export const DEFAULT_SPRITE_ID = 'villager_01'

export function avatarImageUrl(spriteId: string): string {
  // カタログ外のIDでも画像パスは組み立てられる(404時はブラウザ側でalt表示)
  return `/avatars/${spriteId}.png`
}
