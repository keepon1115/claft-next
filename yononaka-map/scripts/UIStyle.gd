class_name UIStyle
## 会話UIの共通スタイル（色・パネル・ボタン・顔アイコン）。
## 見た目を変えたいときは、まずここの色定数を編集する。

const C_PAPER  := Color("#FBF6E9")   # 紙色（パネル地）
const C_INK    := Color("#2C2C2A")   # 文字・枠
const C_BROWN  := Color("#8B5E3C")   # 主ボタン・名前
const C_MUTED  := Color("#7A6A58")   # ナレーション・補足
const C_ODAI   := Color("#D9772E")   # お題のアクセント
const C_REVEAL := Color("#3F6FA0")   # 種明かしのアクセント
const C_YOU    := Color("#4E8A5A")   # プレイヤーの答え

const FACE_BASE := "res://assets/characters/%s/Faceset.png"

## 角丸・枠つきの StyleBoxFlat
static func box(bg: Color, border: Color, border_w: int = 3, radius: int = 8,
		pad_h: int = 0, pad_v: int = 0) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(border_w)
	s.set_corner_radius_all(radius)
	s.content_margin_left   = pad_h
	s.content_margin_right  = pad_h
	s.content_margin_top    = pad_v
	s.content_margin_bottom = pad_v
	return s

## 主ボタン（塗り）。accent で色を変えられる
static func style_primary(btn: Button, accent: Color = C_BROWN, font_size: int = 22) -> void:
	_apply_button(btn, accent, accent.darkened(0.25), C_PAPER, font_size)

## 副ボタン（線だけ）
static func style_ghost(btn: Button, font_size: int = 20) -> void:
	_apply_button(btn, Color(C_PAPER, 0.0), Color(C_BROWN, 0.55), C_BROWN, font_size)

static func _apply_button(btn: Button, bg: Color, border: Color, fg: Color, font_size: int) -> void:
	var normal := box(bg, border, 3, 10, 18, 10)
	var hover  := box(bg.lightened(0.08) if bg.a > 0.0 else Color(C_BROWN, 0.10), border, 3, 10, 18, 10)
	var down   := box(bg.darkened(0.12) if bg.a > 0.0 else Color(C_BROWN, 0.20), border, 3, 10, 18, 10)
	var off    := box(Color(C_MUTED, 0.25), Color(C_MUTED, 0.35), 3, 10, 18, 10)
	btn.add_theme_stylebox_override("normal",   normal)
	btn.add_theme_stylebox_override("hover",    hover)
	btn.add_theme_stylebox_override("pressed",  down)
	btn.add_theme_stylebox_override("focus",    StyleBoxEmpty.new())
	btn.add_theme_stylebox_override("disabled", off)
	btn.add_theme_color_override("font_color",          fg)
	btn.add_theme_color_override("font_hover_color",    fg)
	btn.add_theme_color_override("font_pressed_color",  fg)
	btn.add_theme_color_override("font_focus_color",    fg)
	btn.add_theme_color_override("font_disabled_color", Color(C_PAPER, 0.9))
	btn.add_theme_font_size_override("font_size", font_size)

## 入力欄
static func style_input(le: LineEdit, font_size: int = 22) -> void:
	le.add_theme_stylebox_override("normal", box(Color.WHITE, Color(C_BROWN, 0.6), 3, 10, 14, 8))
	le.add_theme_stylebox_override("focus",  box(Color.WHITE, C_ODAI, 3, 10, 14, 8))
	le.add_theme_color_override("font_color", C_INK)
	le.add_theme_color_override("font_placeholder_color", Color(C_MUTED, 0.7))
	le.add_theme_color_override("caret_color", C_INK)
	le.add_theme_font_size_override("font_size", font_size)

## 顔アイコン（assets/characters/<id>/Faceset.png。無ければ _default）
static func face_texture(id: String) -> Texture2D:
	var path := FACE_BASE % id
	if id == "" or not ResourceLoader.exists(path, "Texture2D"):
		path = FACE_BASE % "_default"
	if not ResourceLoader.exists(path, "Texture2D"):
		return null
	return load(path) as Texture2D
