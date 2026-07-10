extends CanvasLayer

# NPC ダイアログと同じ位置・サイズ（同時に表示されないので問題なし）
const PANEL_X := 10.0
const PANEL_Y := 564.0
const PANEL_W := 1260.0
const PANEL_H := 148.0

const C_BG     := "#FBF6E9"
const C_BORDER := "#E8B800"   # ← 黄金色の枠でモンスター感
const C_TEXT   := "#2C2C2A"
const C_NAME   := "#7A5A00"   # ← 濃い黄色でNPCと区別

var _panel:       Panel
var _name_plate:  Panel
var _name_lbl:    Label
var _main_text:   Label
var _video_btn:   Button
var _watched_btn: Button
var _form_btn:    Button
var _close_btn:   Button
var _video_opened: bool = false

func _ready() -> void:
	layer = 10
	_build_ui()
	_panel.visible      = false
	_name_plate.visible = false

	MonsterManager.state_changed.connect(_on_state_changed)
	MonsterManager.dialogue_ended.connect(_on_dialogue_ended)

func _build_ui() -> void:
	# ── メインパネル ──────────────────────────────
	_panel = Panel.new()
	_panel.position = Vector2(PANEL_X, PANEL_Y)
	_panel.size     = Vector2(PANEL_W, PANEL_H)
	_style(_panel, C_BORDER, 5)
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
	_main_text.add_theme_font_size_override("font_size", 15)
	_main_text.add_theme_color_override("font_color", Color(C_TEXT))
	vbox.add_child(_main_text)

	# ボタン行
	var btn_row := HBoxContainer.new()
	btn_row.add_theme_constant_override("separation", 10)
	vbox.add_child(btn_row)

	# [動画を見る] ― INTRO フェーズ
	_video_btn = Button.new()
	_video_btn.text = "▶ 動画を見る"
	_video_btn.add_theme_font_size_override("font_size", 13)
	btn_row.add_child(_video_btn)

	# [見た！] ― 動画クリック後に有効化
	_watched_btn = Button.new()
	_watched_btn.text     = "見た！"
	_watched_btn.disabled = true
	_watched_btn.add_theme_font_size_override("font_size", 13)
	btn_row.add_child(_watched_btn)

	# [フォームで答える] ― ODAI フェーズ
	_form_btn = Button.new()
	_form_btn.text = "✏ フォームで答える"
	_form_btn.add_theme_font_size_override("font_size", 13)
	btn_row.add_child(_form_btn)

	# [閉じる]
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn_row.add_child(spacer)

	_close_btn = Button.new()
	_close_btn.text = "閉じる"
	_close_btn.add_theme_font_size_override("font_size", 13)
	btn_row.add_child(_close_btn)

	# シグナル
	_video_btn.pressed.connect(_on_video_pressed)
	_watched_btn.pressed.connect(_on_watched_pressed)
	_form_btn.pressed.connect(_on_form_pressed)
	_close_btn.pressed.connect(_on_close_pressed)

	# ── 名前プレート ──────────────────────────────
	_name_plate = Panel.new()
	_name_plate.position = Vector2(PANEL_X + 18, PANEL_Y - 14)
	_name_plate.size     = Vector2(160, 26)
	_style(_name_plate, C_BORDER, 2)
	add_child(_name_plate)

	_name_lbl = Label.new()
	_name_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	_name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name_lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	_name_lbl.add_theme_font_size_override("font_size", 13)
	_name_lbl.add_theme_color_override("font_color", Color(C_NAME))
	_name_plate.add_child(_name_lbl)

func _style(p: Panel, border_hex: String, w: int) -> void:
	var s := StyleBoxFlat.new()
	s.bg_color = Color(C_BG)
	s.border_width_left   = w
	s.border_width_right  = w
	s.border_width_top    = w
	s.border_width_bottom = w
	s.border_color             = Color(border_hex)
	s.corner_radius_top_left   = 4
	s.corner_radius_top_right  = 4
	s.corner_radius_bottom_left  = 4
	s.corner_radius_bottom_right = 4
	p.add_theme_stylebox_override("panel", s)

# ============================================================
# 状態表示
# ============================================================
func _on_state_changed(state: String) -> void:
	_panel.visible      = true
	_name_plate.visible = true
	var data := MonsterManager.current_data
	_name_lbl.text = data.get("name", "???")

	match state:
		"INTRO":
			_video_opened = false
			_main_text.text  = data.get("intro", "")
			_video_btn.visible   = true
			_watched_btn.visible = true
			_watched_btn.disabled = true
			_form_btn.visible  = false
			_close_btn.visible = false

		"ODAI":
			_main_text.text = data.get("odai_text", "")
			_video_btn.visible   = false
			_watched_btn.visible = false
			_form_btn.visible  = true
			_form_btn.disabled = false
			_form_btn.text     = "✏ フォームで答える"
			_close_btn.visible = true
			_close_btn.text    = "閉じる"

func _on_dialogue_ended() -> void:
	_panel.visible      = false
	_name_plate.visible = false

# ============================================================
# ボタン操作
# ============================================================
func _on_video_pressed() -> void:
	var url: String = MonsterManager.current_data.get("video_url", "")
	if url != "":
		OS.shell_open(url)
	_video_btn.text       = "▶ 動画を見る（済）"
	_watched_btn.disabled = false

func _on_watched_pressed() -> void:
	MonsterManager.advance()

func _on_form_pressed() -> void:
	var url: String = MonsterManager.current_data.get("odai_form_url", "")
	if url != "":
		OS.shell_open(url)
	# フォームは別タブで開く。戻り道を分かりやすく示す
	_form_btn.text  = "✏ フォームをひらきました"
	_main_text.text = "フォームは新しいタブでひらきます。\n書き終えたら下の「ゲームに戻る」でマップへ戻ってね。"
	_close_btn.text = "▶ ゲームに戻る"

func _on_close_pressed() -> void:
	MonsterManager.advance()

# Enter（キーボード）で「見た！」or「閉じる」。
# タッチは各ボタンが個別に処理する（ここで横取りするとフォームボタンと競合し、
# 外部フォームから戻ったあとに閉じられなくなるため）。
func _input(event: InputEvent) -> void:
	if not _panel.visible:
		return
	if not event.is_action_pressed("ui_accept"):
		return
	if MonsterManager.current_state == MonsterManager.State.ODAI:
		if _close_btn.visible:
			_on_close_pressed()
			get_viewport().set_input_as_handled()
	elif not _watched_btn.disabled:
		_on_watched_pressed()
		get_viewport().set_input_as_handled()
