class_name CharacterSprites
## Ninja Adventure 形式のスプライトから SpriteFrames を組み立てる静的ヘルパー。
##
## 配置: assets/characters/<id>/Walk.png（64x64 = 4方向×4コマ）
##       assets/characters/<id>/Idle.png（64x16 = 4方向×1コマ）
## 列の並びは down / up / left / right（16px 角）。
## <id> のフォルダが無い場合は _default（汎用村人）を使うので、
## 新しい村人は JSON 追加だけでも動く。

const DIRS: Array[String] = ["down", "up", "left", "right"]
const SIZE := 16
const BASE := "res://assets/characters/%s/%s"
const WALK_FPS := 8.0

static func has_sprites(id: String) -> bool:
	return id != "" and ResourceLoader.exists(BASE % [id, "Walk.png"], "Texture2D")

## id 用の SpriteFrames を生成（無ければ _default にフォールバック）
static func build_for(id: String) -> SpriteFrames:
	var use_id := id if has_sprites(id) else "_default"
	var walk := load(BASE % [use_id, "Walk.png"]) as Texture2D
	var idle := load(BASE % [use_id, "Idle.png"]) as Texture2D
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	for d: int in DIRS.size():
		var wname := "walk_" + DIRS[d]
		frames.add_animation(wname)
		frames.set_animation_speed(wname, WALK_FPS)
		frames.set_animation_loop(wname, true)
		for f: int in 4:
			frames.add_frame(wname, _cell(walk, d * SIZE, f * SIZE))
		var iname := "idle_" + DIRS[d]
		frames.add_animation(iname)
		frames.add_frame(iname, _cell(idle, d * SIZE, 0))
	return frames

## ベクトルから向き名（"down" 等）を返す
static func dir_name(v: Vector2, fallback: String = "down") -> String:
	if v == Vector2.ZERO:
		return fallback
	if absf(v.x) > absf(v.y):
		return "right" if v.x > 0.0 else "left"
	return "down" if v.y > 0.0 else "up"

static func _cell(tex: Texture2D, x: int, y: int) -> AtlasTexture:
	var at := AtlasTexture.new()
	at.atlas  = tex
	at.region = Rect2(x, y, SIZE, SIZE)
	return at
