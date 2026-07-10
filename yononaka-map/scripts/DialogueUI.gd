extends CanvasLayer

# ノード参照
var _panel:       Panel
var _name_plate:  Panel
var _npc_name:    Label
var _main_text:   Label
var _answer_box:  HBoxContainer
var _answer_input: LineEdit
var _submit_btn:  Button
var _advance_btn: Button
var _quit_btn:    Button
var _links_box:   VBoxContainer
var _blink_label: Label
var _blink_tween: Tween

# カラー定数（HTML モックに準拠）
const C_BG     := "#FBF6E9"
const C_BORDER := "#2C2C2A"
const C_TEXT   := "#2C2C2A"
const C_NAME   := "#5C3A21"

# パネル位置（720×1280 縦画面）
const PANEL_X  := 10.0
const PANEL_Y  := 822.0   # 1280 - 220 - 230 - 8（起動時の仮値、_reposition で上書き）
const PANEL_W  := 700.0   # 720 - PANEL_X * 2
const PANEL_H  := 230.0   # 210 → 230（フォント拡大分）
const CTRL_H   := 220.0   # 操作エリア高さ

var _natural_vp_h: float = 0.0   # キーボードなし時の vp.y（縮小検知用）
var _web_inner_h:  float = 0.0   # キーボードなし時の window.innerHeight（CSS px）
var _web_kb_css:   float = 0.0   # visualViewport から検知したキーボード高さ（CSS px）
var _input_active: bool  = false # INPUT フェーズ中（ソフトキーボード表示中）

func _ready() -> void:
	layer = 10
	_build_ui()
	_panel.visible      = false
	_name_plate.visible = false
	_natural_vp_h = get_viewport().get_visible_rect().size.y
	if OS.has_feature("web"):
		_setup_web_keyboard_listener()
	get_viewport().size_changed.connect(_reposition)
	_reposition()

	DialogueManager.state_changed.connect(_on_state_changed)
	DialogueManager.dialogue_ended.connect(_on_dialogue_ended)

func _setup_web_keyboard_listener() -> void:
	var r = JavaScriptBridge.eval("window.innerHeight || 0", true)
	_web_inner_h = float(r) if (r is float or r is int) else 0.0
	JavaScriptBridge.eval("""
		window._godotDlgKbH = 0;
		if (window.visualViewport) {
			var _upd = function() {
				window._godotDlgKbH = Math.max(0,
					window.innerHeight - window.visualViewport.height);
			};
			window.visualViewport.addEventListener('resize', _upd);
			window.visualViewport.addEventListener('scroll', _upd);
		}
	""")

func _process(_delta: float) -> void:
	if not OS.has_feature("web"):
		return
	var r = JavaScriptBridge.eval("window._godotDlgKbH || 0", true)
	var kb: float = 0.0
	if r is float: kb = r
	elif r is int: kb = float(r)
	if abs(kb - _web_kb_css) > 2.0:
		_web_kb_css = kb
		_reposition()

# ビューポートサイズ変化（ソフトキーボード展開など）に追従
func _reposition() -> void:
	var vp        := get_viewport().get_visible_rect().size
	var panel_y: float

	if _input_active:
		# テキスト入力中はソフトキーボードが画面下半分を覆う。
		# キーボード高さの検知はモバイル Web で不安定なため、
		# パネルを画面上部に固定し「お題（会話）＋入力欄」が常に見えるようにする。
		panel_y = 96.0
	else:
		var vp_shrank := _natural_vp_h > 0.0 and vp.y < _natural_vp_h - 10.0
		var kb_phys: int = DisplayServer.virtual_keyboard_get_height()
		if kb_phys > 0 and not vp_shrank:
			# Android ネイティブ API：物理 px → 仮想 px 変換
			var sy := get_viewport().canvas_transform.get_scale().y
			panel_y = vp.y - float(kb_phys) / maxf(sy, 0.001) - PANEL_H - 8.0
		elif _web_kb_css > 1.0 and _web_inner_h > 0.0 and not vp_shrank:
			# Web / Android Chrome：visualViewport API が検知したキーボード高さ
			# CSS px → Godot 仮想 px（比率 = _natural_vp_h / window.innerHeight）
			var kb_virt := _web_kb_css * (_natural_vp_h / _web_inner_h)
			panel_y = vp.y - kb_virt - PANEL_H - 8.0
		elif vp_shrank:
			# Godot 側もビューポート縮小済み（キーボード分は既に除外されている）
			panel_y = vp.y - PANEL_H - 8.0
		else:
			# 通常：D-pad エリアの上に配置
			panel_y = vp.y - CTRL_H - PANEL_H - 8.0

	panel_y = maxf(panel_y, 8.0)
	_panel.position      = Vector2(PANEL_X, panel_y)
	_panel.size.x        = vp.x - PANEL_X * 2
	_name_plate.position = Vector2(PANEL_X + 18, panel_y - 14.0)

# ============================================================
# UI 構築
# ============================================================
func _build_ui() -> void:
	# ── メインパネル ──────────────────────────────
	_panel = Panel.new()
	_panel.position = Vector2(PANEL_X, PANEL_Y)
	_panel.size     = Vector2(PANEL_W, PANEL_H)
	_style_panel(_panel, 5)
	add_child(_panel)

	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left",   18)
	margin.add_theme_constant_override("margin_right",  18)
	margin.add_theme_constant_override("margin_top",    18)
	margin.add_theme_constant_override("margin_bottom", 18)
	_panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 12)
	margin.add_child(vbox)

	# 本文ラベル
	_main_text = Label.new()
	_main_text.autowrap_mode        = TextServer.AUTOWRAP_WORD_SMART
	_main_text.size_flags_vertical  = Control.SIZE_EXPAND_FILL
	_main_text.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	_main_text.add_theme_font_size_override("font_size", 20)
	_main_text.add_theme_color_override("font_color", Color(C_TEXT))
	vbox.add_child(_main_text)

	# 入力エリア（INPUT フェーズのみ表示）
	_answer_box = HBoxContainer.new()
	_answer_box.add_theme_constant_override("separation", 10)
	vbox.add_child(_answer_box)

	_answer_input = LineEdit.new()
	_answer_input.placeholder_text      = "ここに書いてね…"
	_answer_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_answer_input.custom_minimum_size   = Vector2(0, 56)
	_answer_input.add_theme_font_size_override("font_size", 18)
	_answer_box.add_child(_answer_input)

	_submit_btn = Button.new()
	_submit_btn.text                = "送信（A）"
	_submit_btn.disabled            = true
	_submit_btn.custom_minimum_size = Vector2(120, 56)
	_submit_btn.add_theme_font_size_override("font_size", 17)
	_answer_box.add_child(_submit_btn)

	# ボタン行（離れる ← → つぎへ）
	var adv_row := HBoxContainer.new()
	adv_row.add_theme_constant_override("separation", 12)
	vbox.add_child(adv_row)

	_quit_btn = Button.new()
	_quit_btn.text                = "× 離れる（B）"
	_quit_btn.custom_minimum_size = Vector2(170, 56)
	_quit_btn.add_theme_font_size_override("font_size", 16)
	adv_row.add_child(_quit_btn)

	var adv_spacer := Control.new()
	adv_spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	adv_row.add_child(adv_spacer)

	_advance_btn = Button.new()
	_advance_btn.text                = "つぎへ（A）"
	_advance_btn.custom_minimum_size = Vector2(170, 56)
	_advance_btn.add_theme_font_size_override("font_size", 18)
	adv_row.add_child(_advance_btn)

	# リンク群（REVEAL フェーズのみ）
	_links_box = VBoxContainer.new()
	_links_box.add_theme_constant_override("separation", 6)
	vbox.add_child(_links_box)

	# 点滅 ▼ インジケータ（パネル右下に絶対配置）
	_blink_label = Label.new()
	_blink_label.text     = "▼"
	_blink_label.size     = Vector2(22, 22)
	_blink_label.position = Vector2(PANEL_W - 30, PANEL_H - 30)
	_blink_label.add_theme_font_size_override("font_size", 15)
	_blink_label.add_theme_color_override("font_color", Color(C_BORDER))
	_blink_label.visible = false
	_panel.add_child(_blink_label)

	# ── 名前プレート（メインパネル上枠に重ねる）────────
	_name_plate = Panel.new()
	_name_plate.position = Vector2(PANEL_X + 18, PANEL_Y - 18)
	_name_plate.size     = Vector2(200, 32)
	_style_panel(_name_plate, 2)
	add_child(_name_plate)   # _panel のあとに add → 前面に描画

	_npc_name = Label.new()
	_npc_name.set_anchors_preset(Control.PRESET_FULL_RECT)
	_npc_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_npc_name.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	_npc_name.add_theme_font_size_override("font_size", 16)
	_npc_name.add_theme_color_override("font_color", Color(C_NAME))
	_name_plate.add_child(_npc_name)

	# ── シグナル ──────────────────────────────────
	_submit_btn.pressed.connect(_on_submit_pressed)
	_advance_btn.pressed.connect(_on_advance_pressed)
	_quit_btn.pressed.connect(_on_quit_pressed)
	_answer_input.text_changed.connect(_on_answer_changed)
	_answer_input.text_submitted.connect(_on_answer_submitted)

# StyleBoxFlat をパネルに適用
func _style_panel(p: Panel, border: int) -> void:
	var s := StyleBoxFlat.new()
	s.bg_color = Color(C_BG)
	s.border_width_left   = border
	s.border_width_right  = border
	s.border_width_top    = border
	s.border_width_bottom = border
	s.border_color             = Color(C_BORDER)
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
	_answer_box.visible = false
	_advance_btn.visible = true
	_advance_btn.text    = "つぎへ（A）"
	_links_box.visible  = false
	_input_active       = (state == "INPUT")
	_stop_blink()

	var npc: Dictionary = DialogueManager.current_npc_data
	_npc_name.text = npc.get("name", "???")

	match state:
		"APPROACH":
			_main_text.text = npc.get("approach_text", "")
			_start_blink()

		"ODAI":
			_main_text.text = npc.get("odai", "")
			_start_blink()

		"INPUT":
			_main_text.text      = npc.get("odai", "")
			_answer_box.visible  = true
			_advance_btn.visible = false
			_answer_input.text   = ""
			_answer_input.grab_focus()
			_submit_btn.disabled = true

		"ECHO":
			_main_text.text = "きみ：" + DialogueManager.player_answer
			_start_blink()

		"REPLY":
			_main_text.text = DialogueManager.get_aizuchi() \
				+ "\n\n" + npc.get("reply", "")
			_start_blink()

		"REVEAL":
			_main_text.text  = npc.get("reveal", "")
			_advance_btn.text = "閉じる（A）"
			_show_links(npc.get("links", {}))
			_start_blink()

	# 入力中は上部、それ以外は通常位置へ（フェーズ切替のたびに反映）
	_reposition()

func _on_dialogue_ended() -> void:
	_input_active       = false
	_panel.visible      = false
	_name_plate.visible = false
	_stop_blink()

# ============================================================
# 入力 / ボタン
# ============================================================
func _on_answer_changed(txt: String) -> void:
	_submit_btn.disabled = txt.strip_edges().length() == 0

func _on_answer_submitted(_txt: String) -> void:
	if not _submit_btn.disabled:
		_on_submit_pressed()

func _on_quit_pressed() -> void:
	DialogueManager.quit_dialogue()

func _on_submit_pressed() -> void:
	DialogueManager.submit_answer(_answer_input.text)

func _on_advance_pressed() -> void:
	DialogueManager.advance()

# Enter / Space でつぎへ、Escape / B ボタンで離れる（INPUT フェーズ以外）
func _input(event: InputEvent) -> void:
	if not _panel.visible:
		return
	# B ボタン / Escape → 離れる（どのフェーズでも有効）
	if event.is_action_pressed("game_cancel"):
		_on_quit_pressed()
		get_viewport().set_input_as_handled()
		return
	if not _advance_btn.visible:
		return
	# キーボード（Enter / Space）または VirtualDPad A から inject された InputEventAction
	if event.is_action_pressed("ui_accept"):
		_on_advance_pressed()
		get_viewport().set_input_as_handled()

# ============================================================
# リンクボタン生成
# ============================================================
func _show_links(links: Dictionary) -> void:
	for c in _links_box.get_children():
		c.queue_free()
	for label_text in links:
		var btn := Button.new()
		btn.text = "→ " + label_text
		var url: String = links[label_text]
		btn.pressed.connect(func(): OS.shell_open(url))
		_links_box.add_child(btn)
	_links_box.visible = not links.is_empty()

# ============================================================
# 点滅 ▼
# ============================================================
func _start_blink() -> void:
	_stop_blink()
	_blink_label.visible = true
	_blink_tween = create_tween().set_loops()
	_blink_tween.tween_callback(
		func(): _blink_label.visible = not _blink_label.visible
	).set_delay(0.5)

func _stop_blink() -> void:
	if _blink_tween:
		_blink_tween.kill()
		_blink_tween = null
	_blink_label.visible = false
