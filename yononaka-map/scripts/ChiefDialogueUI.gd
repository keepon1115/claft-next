extends CanvasLayer

const PANEL_X := 10.0
const PANEL_Y := 888.0   # 1280 - 220 - 164 - 8（起動時の仮値、_reposition で上書き）
const PANEL_W := 700.0   # 720 - PANEL_X * 2
const PANEL_H := 164.0
const CTRL_H  := 220.0   # 操作エリア高さ

const C_BG     := "#FBF6E9"
const C_BORDER := "#CC6A00"   # 橙枠
const C_TEXT   := "#2C2C2A"
const C_NAME   := "#7A5A3A"

# フェーズ
enum Phase { SCRIPT, QUIZ, QUIZ_RESPONSE }
var _phase: Phase = Phase.SCRIPT

var _panel:      Panel
var _name_plate: Panel
var _name_lbl:   Label
var _main_text:  Label
var _btn_row:    HBoxContainer
var _next_btn:   Button
var _video_btn:  Button
var _close_btn:  Button
var _quiz_box:   VBoxContainer   # クイズ選択肢
var _choice_btns: Array[Button] = []

func _ready() -> void:
	layer = 10
	_build_ui()
	_panel.visible      = false
	_name_plate.visible = false
	get_viewport().size_changed.connect(_reposition)
	_reposition()

	ChiefManager.stage_started.connect(_on_stage_started)
	ChiefManager.dialogue_ended.connect(_on_dialogue_ended)

func _reposition() -> void:
	var vp := get_viewport().get_visible_rect().size
	_panel.position      = Vector2(PANEL_X, vp.y - CTRL_H - PANEL_H - 8)
	_panel.size.x        = vp.x - PANEL_X * 2
	_name_plate.position = Vector2(PANEL_X + 18, vp.y - CTRL_H - PANEL_H - 22)

# ============================================================
# UI 構築
# ============================================================
func _build_ui() -> void:
	_panel = Panel.new()
	_panel.position = Vector2(PANEL_X, PANEL_Y)
	_panel.size     = Vector2(PANEL_W, PANEL_H)
	_style(_panel, 5)
	add_child(_panel)

	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left",   18)
	margin.add_theme_constant_override("margin_right",  18)
	margin.add_theme_constant_override("margin_top",    12)
	margin.add_theme_constant_override("margin_bottom",  8)
	_panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8)
	margin.add_child(vbox)

	# 本文
	_main_text = Label.new()
	_main_text.autowrap_mode       = TextServer.AUTOWRAP_WORD_SMART
	_main_text.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_main_text.add_theme_font_size_override("font_size", 14)
	_main_text.add_theme_color_override("font_color", Color(C_TEXT))
	vbox.add_child(_main_text)

	# クイズ選択肢（4ボタン縦並び）
	_quiz_box = VBoxContainer.new()
	_quiz_box.add_theme_constant_override("separation", 4)
	vbox.add_child(_quiz_box)
	for i in 4:
		var btn := Button.new()
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.add_theme_font_size_override("font_size", 13)
		var idx := i
		btn.pressed.connect(func(): _on_choice_selected(idx))
		_quiz_box.add_child(btn)
		_choice_btns.append(btn)
	_quiz_box.visible = false

	# ボタン行
	_btn_row = HBoxContainer.new()
	_btn_row.add_theme_constant_override("separation", 10)
	vbox.add_child(_btn_row)

	_next_btn = Button.new()
	_next_btn.text = "つぎへ"
	_next_btn.add_theme_font_size_override("font_size", 13)
	_btn_row.add_child(_next_btn)

	_video_btn = Button.new()
	_video_btn.text = "▶ 動画を見る"
	_video_btn.add_theme_font_size_override("font_size", 13)
	_btn_row.add_child(_video_btn)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_btn_row.add_child(spacer)

	_close_btn = Button.new()
	_close_btn.text = "閉じる"
	_close_btn.add_theme_font_size_override("font_size", 13)
	_btn_row.add_child(_close_btn)

	_next_btn.pressed.connect(_on_next_pressed)
	_video_btn.pressed.connect(_on_video_pressed)
	_close_btn.pressed.connect(_on_close_pressed)

	# 名前プレート
	_name_plate = Panel.new()
	_name_plate.position = Vector2(PANEL_X + 18, PANEL_Y - 14)
	_name_plate.size     = Vector2(140, 26)
	_style(_name_plate, 2)
	add_child(_name_plate)

	_name_lbl = Label.new()
	_name_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	_name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name_lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	_name_lbl.add_theme_font_size_override("font_size", 13)
	_name_lbl.add_theme_color_override("font_color", Color(C_NAME))
	_name_plate.add_child(_name_lbl)

func _style(p: Panel, w: int) -> void:
	var s := StyleBoxFlat.new()
	s.bg_color = Color(C_BG)
	s.border_width_left = w;  s.border_width_right  = w
	s.border_width_top  = w;  s.border_width_bottom = w
	s.border_color = Color(C_BORDER)
	s.set_corner_radius_all(4)
	p.add_theme_stylebox_override("panel", s)

# ============================================================
# ステージ表示
# ============================================================
func _on_stage_started() -> void:
	_panel.visible      = true
	_name_plate.visible = true
	_phase = Phase.SCRIPT

	var stage := ChiefManager.current_stage
	_name_lbl.text  = "むら長  〔" + stage.get("title", "") + "〕"
	_main_text.text = stage.get("script", "")
	_quiz_box.visible = false

	var has_quiz:  bool = stage.get("quiz") != null
	var has_video: bool = stage.get("video_url", "") != ""

	_next_btn.visible  = has_quiz   # クイズがあれば「つぎへ（クイズ）」
	_video_btn.visible = not has_quiz and has_video
	_close_btn.visible = not has_quiz

func _on_dialogue_ended() -> void:
	_panel.visible      = false
	_name_plate.visible = false

# ============================================================
# クイズ
# ============================================================
func _show_quiz() -> void:
	_phase = Phase.QUIZ
	var quiz: Dictionary = ChiefManager.current_stage.get("quiz", {})
	_main_text.text = ""
	_quiz_box.visible = true
	var choices: Array = quiz.get("choices", [])
	for i in _choice_btns.size():
		_choice_btns[i].text     = choices[i] if i < choices.size() else ""
		_choice_btns[i].disabled = false
	_next_btn.visible  = false
	_video_btn.visible = false
	_close_btn.visible = false

func _on_choice_selected(idx: int) -> void:
	_phase = Phase.QUIZ_RESPONSE
	var quiz: Dictionary = ChiefManager.current_stage.get("quiz", {})
	var correct: int     = quiz.get("correct_index", -1)
	var is_ok: bool      = (idx == correct)

	_quiz_box.visible   = false
	_main_text.text     = quiz.get("response_correct" if is_ok else "response_wrong", "")

	var has_video: bool = ChiefManager.current_stage.get("video_url", "") != ""
	_video_btn.visible = has_video
	_next_btn.visible  = false
	_close_btn.visible = true

# ============================================================
# ボタン操作
# ============================================================
func _on_next_pressed() -> void:
	# クイズへ
	_show_quiz()

func _on_video_pressed() -> void:
	var url: String = ChiefManager.current_stage.get("video_url", "")
	if url != "":
		OS.shell_open(url)

func _on_close_pressed() -> void:
	ChiefManager.finish()

# Enter/A ボタンで閉じる、Escape/B ボタンでも閉じる（クイズ選択中は無効）
func _input(event: InputEvent) -> void:
	if not _panel.visible or _phase == Phase.QUIZ:
		return
	if event.is_action_pressed("game_cancel"):
		_on_close_pressed()
		get_viewport().set_input_as_handled()
		return
	if _close_btn.visible or (_phase == Phase.SCRIPT and not _next_btn.visible):
		if event.is_action_pressed("ui_accept"):
			_on_close_pressed()
			get_viewport().set_input_as_handled()
