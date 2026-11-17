class_name DialogueFrame
extends Control
## 会話パネルの共通の「わく」。村人・村長・クエスト番人の会話UIがこれを使う。
##
## 構成: 背景の薄暗がり + 紙色パネル（高さは中身で伸縮）+ 顔アイコン + 名前プレート。
## パネルの中身は body（VBoxContainer）: [見出しチップ][本文] の下に、
## 各UIが自分のボタンや入力欄を add_child していく。
##
##   var frame := DialogueFrame.new()
##   add_child(frame)                    # CanvasLayer の子にする
##   frame.body.add_child(my_button_row)
##   frame.set_speaker("むら長", "chief")
##   frame.set_accent("おだい", UIStyle.C_ODAI)
##   frame.set_text("こんにちは")
##   frame.place_above_controls()

const PANEL_X    := 10.0
const CTRL_H     := 220.0   # 画面下の操作エリア（Dパッド）の高さ
const FACE_SIZE  := 92.0    # 顔アイコン枠の一辺
const FACE_OVER  := 56.0    # 顔アイコンがパネル上にはみ出す量
const TYPE_SPEED := 45.0    # 文字送り速度（文字/秒）
const BODY_FONT  := 24

var body:      VBoxContainer
var main_text: Label

var _dim:         ColorRect
var _panel:       PanelContainer
var _panel_style: StyleBoxFlat
var _face_frame:  Panel
var _face:        TextureRect
var _name_plate:  PanelContainer
var _name_label:  Label
var _tag:         PanelContainer
var _tag_label:   Label
var _wrap_labels: Array[Label] = []
var _type_tween:  Tween
var _typing:      bool = false
var _place:       Callable   # 最後に使った配置方法（高さが変わったら置き直す）

func _init() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false

	# 背景を少し暗くして会話に集中させる
	_dim = ColorRect.new()
	_dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	_dim.color        = Color(0.10, 0.08, 0.06, 0.28)
	_dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_dim)

	# メインパネル
	_panel = PanelContainer.new()
	_panel_style = UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 4, 14, 24, 20)
	_panel_style.content_margin_top = 48     # 顔アイコンと名前プレートの下に余白
	_panel_style.shadow_color  = Color(0, 0, 0, 0.25)
	_panel_style.shadow_size   = 6
	_panel_style.shadow_offset = Vector2(0, 4)
	_panel.add_theme_stylebox_override("panel", _panel_style)
	add_child(_panel)

	body = VBoxContainer.new()
	body.add_theme_constant_override("separation", 14)
	_panel.add_child(body)

	# 見出しチップ
	_tag = PanelContainer.new()
	_tag.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	body.add_child(_tag)
	_tag_label = Label.new()
	_tag_label.add_theme_font_size_override("font_size", 18)
	_tag_label.add_theme_color_override("font_color", UIStyle.C_PAPER)
	_tag.add_child(_tag_label)

	# 本文
	main_text = make_wrap_label(BODY_FONT, UIStyle.C_INK)
	main_text.add_theme_constant_override("line_spacing", 8)
	body.add_child(main_text)

	# 顔アイコン（パネル左上に重ねる）
	_face_frame = Panel.new()
	_face_frame.size         = Vector2(FACE_SIZE, FACE_SIZE)
	_face_frame.pivot_offset = Vector2(FACE_SIZE, FACE_SIZE) * 0.5
	_face_frame.add_theme_stylebox_override("panel",
		UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 4, 12))
	add_child(_face_frame)

	_face = TextureRect.new()
	_face.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT, Control.PRESET_MODE_MINSIZE, 8)
	_face.expand_mode    = TextureRect.EXPAND_IGNORE_SIZE
	_face.stretch_mode   = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_face.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_face_frame.add_child(_face)

	# 名前プレート（顔アイコンの右）
	_name_plate = PanelContainer.new()
	_name_plate.add_theme_stylebox_override("panel",
		UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 3, 8, 16, 4))
	add_child(_name_plate)
	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 20)
	_name_label.add_theme_color_override("font_color", UIStyle.C_BROWN)
	_name_plate.add_child(_name_label)

	_panel.resized.connect(_replace)

func _ready() -> void:
	get_viewport().size_changed.connect(_replace)

# ============================================================
# 中身
# ============================================================

## 折り返すラベルを作る（幅はパネルに合わせて自動で設定される）
func make_wrap_label(font_size: int, color: Color) -> Label:
	var l := Label.new()
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", color)
	_wrap_labels.append(l)
	return l

func set_speaker(display_name: String, face_id: String) -> void:
	_name_label.text = display_name
	_face.texture    = UIStyle.face_texture(face_id)
	_name_plate.reset_size()

## 見出しチップと枠色を切り替える（text が空ならチップを隠す）
func set_accent(text: String, color: Color) -> void:
	_tag.visible    = text != ""
	_tag_label.text = text
	_tag.add_theme_stylebox_override("panel", UIStyle.box(color, color, 0, 6, 12, 2))
	_panel_style.border_color = color

## 本文を設定する。animate=true なら文字送りで出す
func set_text(text: String, animate: bool = true, color: Color = UIStyle.C_INK) -> void:
	finish_typing()
	main_text.visible = text != ""
	main_text.text    = text
	main_text.add_theme_color_override("font_color", color)
	if animate and text.length() > 0:
		_typing = true
		main_text.visible_ratio = 0.0
		_type_tween = create_tween()
		_type_tween.tween_property(main_text, "visible_ratio", 1.0, text.length() / TYPE_SPEED)
		_type_tween.finished.connect(func(): _typing = false)

func is_typing() -> bool:
	return _typing

## 文字送りを打ち切って全文を出す
func finish_typing() -> void:
	if _type_tween:
		_type_tween.kill()
		_type_tween = null
	_typing = false
	main_text.visible_ratio = 1.0

## 顔アイコンをぽんと弾ませる（種明かしなどの強調に）
func pop_face() -> void:
	_face_frame.scale = Vector2(1.3, 1.3)
	create_tween().tween_property(_face_frame, "scale", Vector2.ONE, 0.35) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func open() -> void:
	visible = true

func close() -> void:
	finish_typing()
	visible = false

# ============================================================
# 配置
# ============================================================

## 通常の位置: 画面下の操作エリアのすぐ上
func place_above_controls() -> void:
	_place = func(): _put(get_viewport().get_visible_rect().size.y - CTRL_H - fit() - 8.0)
	_replace()

## 下端を指定して置く（ソフトキーボードの上など）
func place_bottom(bottom_y: float) -> void:
	_place = func(): _put(bottom_y - fit())
	_replace()

## 上端を指定して置く（文字入力中に画面上部へ固定するとき）
func place_top(top_y: float) -> void:
	_place = func():
		fit()
		_put(top_y)
	_replace()

## 幅を画面に合わせ、高さを中身ぶんに縮める。高さを返す
func fit() -> float:
	var w := get_viewport().get_visible_rect().size.x - PANEL_X * 2
	# 折り返しラベルは幅が決まらないと高さを正しく計算できないので、先に幅を教える
	var inner_w := w - _panel_style.content_margin_left - _panel_style.content_margin_right
	for l: Label in _wrap_labels:
		l.custom_minimum_size.x = inner_w
	_panel.size = Vector2(w, 0)
	return _panel.size.y

func _put(panel_y: float) -> void:
	panel_y = maxf(panel_y, FACE_OVER + 8.0)
	_panel.position      = Vector2(PANEL_X, panel_y)
	_face_frame.position = Vector2(PANEL_X + 18, panel_y - FACE_OVER)
	_name_plate.position = Vector2(PANEL_X + 18 + FACE_SIZE + 10, panel_y - 22.0)

func _replace() -> void:
	if _place.is_valid() and is_inside_tree():
		_place.call()
