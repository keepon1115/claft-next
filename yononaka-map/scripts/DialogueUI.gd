extends CanvasLayer

# ノード参照
var _dim:         ColorRect
var _panel:       PanelContainer
var _panel_style: StyleBoxFlat
var _face_frame:  Panel
var _face:        TextureRect
var _name_plate:  PanelContainer
var _npc_name:    Label
var _tag:         PanelContainer
var _tag_label:   Label
var _quote:       Label
var _main_text:   Label
var _answer_box:  HBoxContainer
var _answer_input: LineEdit
var _submit_btn:  Button
var _advance_btn: Button
var _quit_btn:    Button
var _links_box:   HFlowContainer
var _type_tween:  Tween
var _typing:      bool = false

# レイアウト（720×1280 縦画面）。色は UIStyle.gd を編集する
const PANEL_X    := 10.0
const CTRL_H     := 220.0   # 操作エリア高さ
const FACE_SIZE  := 92.0    # 顔アイコン枠の一辺
const FACE_OVER  := 56.0    # 顔アイコンがパネル上にはみ出す量
const INPUT_TOP  := 96.0    # 入力中のパネル上端（ソフトキーボード対策で上部固定）
const TYPE_SPEED := 45.0    # 文字送り速度（文字/秒）
const QUOTE_MAX  := 38      # 返しの上に出す「きみの答え」の最大文字数

var _natural_vp_h: float = 0.0   # キーボードなし時の vp.y（縮小検知用）
var _web_inner_h:  float = 0.0   # キーボードなし時の window.innerHeight（CSS px）
var _web_kb_css:   float = 0.0   # visualViewport から検知したキーボード高さ（CSS px）
var _input_active: bool  = false # INPUT フェーズ中（ソフトキーボード表示中）

func _ready() -> void:
	layer = 10
	_build_ui()
	_set_shown(false)
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

# ビューポートサイズ変化（ソフトキーボード展開など）に追従。
# パネルの高さは中身で決まる（PanelContainer）ので、下端を基準に置く。
func _reposition() -> void:
	var vp := get_viewport().get_visible_rect().size
	var w  := vp.x - PANEL_X * 2
	# 折り返しラベルは幅が決まらないと高さを正しく計算できないので、先に幅を教える
	var inner_w := w - _panel_style.content_margin_left - _panel_style.content_margin_right
	_main_text.custom_minimum_size.x = inner_w
	_quote.custom_minimum_size.x     = inner_w
	_panel.size = Vector2(w, 0)          # 幅を固定し、高さは最小サイズに縮める
	var h := _panel.size.y
	var panel_y: float

	if _input_active:
		# テキスト入力中はソフトキーボードが画面下半分を覆う。
		# キーボード高さの検知はモバイル Web で不安定なため、
		# パネルを画面上部に固定し「お題＋入力欄」が常に見えるようにする。
		panel_y = INPUT_TOP
	else:
		var vp_shrank := _natural_vp_h > 0.0 and vp.y < _natural_vp_h - 10.0
		var kb_phys: int = DisplayServer.virtual_keyboard_get_height()
		if kb_phys > 0 and not vp_shrank:
			# Android ネイティブ API：物理 px → 仮想 px 変換
			var sy := get_viewport().canvas_transform.get_scale().y
			panel_y = vp.y - float(kb_phys) / maxf(sy, 0.001) - h - 8.0
		elif _web_kb_css > 1.0 and _web_inner_h > 0.0 and not vp_shrank:
			# Web / Android Chrome：visualViewport API が検知したキーボード高さ
			# CSS px → Godot 仮想 px（比率 = _natural_vp_h / window.innerHeight）
			var kb_virt := _web_kb_css * (_natural_vp_h / _web_inner_h)
			panel_y = vp.y - kb_virt - h - 8.0
		elif vp_shrank:
			# Godot 側もビューポート縮小済み（キーボード分は既に除外されている）
			panel_y = vp.y - h - 8.0
		else:
			# 通常：D-pad エリアの上に配置
			panel_y = vp.y - CTRL_H - h - 8.0

	panel_y = maxf(panel_y, FACE_OVER + 8.0)
	_panel.position      = Vector2(PANEL_X, panel_y)
	_face_frame.position = Vector2(PANEL_X + 18, panel_y - FACE_OVER)
	_name_plate.position = Vector2(PANEL_X + 18 + FACE_SIZE + 10, panel_y - 22.0)
	_dim.size            = vp

# ============================================================
# UI 構築
# ============================================================
func _build_ui() -> void:
	# ── 背景を少し暗くして会話に集中させる ────────────
	_dim = ColorRect.new()
	_dim.color        = Color(0.10, 0.08, 0.06, 0.28)
	_dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_dim)

	# ── メインパネル（高さは中身に合わせて伸び縮み）────
	_panel = PanelContainer.new()
	_panel_style = UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 4, 14, 24, 20)
	_panel_style.content_margin_top = 48     # 顔アイコンと名前プレートの下に余白
	_panel_style.shadow_color  = Color(0, 0, 0, 0.25)
	_panel_style.shadow_size   = 6
	_panel_style.shadow_offset = Vector2(0, 4)
	_panel.add_theme_stylebox_override("panel", _panel_style)
	add_child(_panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 14)
	_panel.add_child(vbox)

	# 見出しチップ（おだい / きみのこたえ / じつは…）
	_tag = PanelContainer.new()
	_tag.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	vbox.add_child(_tag)
	_tag_label = Label.new()
	_tag_label.add_theme_font_size_override("font_size", 18)
	_tag_label.add_theme_color_override("font_color", UIStyle.C_PAPER)
	_tag.add_child(_tag_label)

	# きみの答えの引用（返しの上に小さく出す）
	_quote = Label.new()
	_quote.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_quote.add_theme_font_size_override("font_size", 18)
	_quote.add_theme_color_override("font_color", UIStyle.C_YOU)
	vbox.add_child(_quote)

	# 本文ラベル
	_main_text = Label.new()
	_main_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_main_text.add_theme_font_size_override("font_size", 24)
	_main_text.add_theme_constant_override("line_spacing", 8)
	_main_text.add_theme_color_override("font_color", UIStyle.C_INK)
	vbox.add_child(_main_text)

	# 入力エリア（INPUT フェーズのみ表示）
	_answer_box = HBoxContainer.new()
	_answer_box.add_theme_constant_override("separation", 10)
	vbox.add_child(_answer_box)

	_answer_input = LineEdit.new()
	_answer_input.placeholder_text      = "ここに書いてね…"
	_answer_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_answer_input.custom_minimum_size   = Vector2(0, 60)
	UIStyle.style_input(_answer_input)
	_answer_box.add_child(_answer_input)

	_submit_btn = Button.new()
	_submit_btn.text                = "こたえる"
	_submit_btn.disabled            = true
	_submit_btn.custom_minimum_size = Vector2(140, 60)
	UIStyle.style_primary(_submit_btn, UIStyle.C_ODAI)
	_answer_box.add_child(_submit_btn)

	# リンク群（REVEAL フェーズのみ）
	_links_box = HFlowContainer.new()
	_links_box.add_theme_constant_override("h_separation", 10)
	_links_box.add_theme_constant_override("v_separation", 10)
	vbox.add_child(_links_box)

	# ボタン行（はなれる ← → つぎへ）
	var adv_row := HBoxContainer.new()
	adv_row.add_theme_constant_override("separation", 12)
	vbox.add_child(adv_row)

	_quit_btn = Button.new()
	_quit_btn.text                = "× はなれる"
	_quit_btn.custom_minimum_size = Vector2(170, 60)
	UIStyle.style_ghost(_quit_btn)
	adv_row.add_child(_quit_btn)

	var adv_spacer := Control.new()
	adv_spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	adv_row.add_child(adv_spacer)

	_advance_btn = Button.new()
	_advance_btn.text                = "つぎへ ▶"
	_advance_btn.custom_minimum_size = Vector2(190, 60)
	UIStyle.style_primary(_advance_btn)
	adv_row.add_child(_advance_btn)

	# ── 顔アイコン（パネル左上に重ねる）──────────────
	_face_frame = Panel.new()
	_face_frame.size         = Vector2(FACE_SIZE, FACE_SIZE)
	_face_frame.pivot_offset = Vector2(FACE_SIZE, FACE_SIZE) * 0.5
	_face_frame.add_theme_stylebox_override("panel",
		UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 4, 12))
	add_child(_face_frame)   # _panel のあとに add → 前面に描画

	_face = TextureRect.new()
	_face.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT, Control.PRESET_MODE_MINSIZE, 8)
	_face.expand_mode    = TextureRect.EXPAND_IGNORE_SIZE
	_face.stretch_mode   = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_face.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_face_frame.add_child(_face)

	# ── 名前プレート（顔アイコンの右）────────────────
	_name_plate = PanelContainer.new()
	_name_plate.add_theme_stylebox_override("panel",
		UIStyle.box(UIStyle.C_PAPER, UIStyle.C_INK, 3, 8, 16, 4))
	add_child(_name_plate)

	_npc_name = Label.new()
	_npc_name.add_theme_font_size_override("font_size", 20)
	_npc_name.add_theme_color_override("font_color", UIStyle.C_BROWN)
	_name_plate.add_child(_npc_name)

	# ── シグナル ──────────────────────────────────
	_submit_btn.pressed.connect(_on_submit_pressed)
	_advance_btn.pressed.connect(_on_advance_pressed)
	_quit_btn.pressed.connect(_on_quit_pressed)
	_answer_input.text_changed.connect(_on_answer_changed)
	_answer_input.text_submitted.connect(_on_answer_submitted)
	_panel.resized.connect(_reposition)

func _set_shown(shown: bool) -> void:
	_dim.visible        = shown
	_panel.visible      = shown
	_face_frame.visible = shown
	_name_plate.visible = shown

# 見出しチップと枠色をまとめて切り替える（text が空ならチップを隠す）
func _set_accent(text: String, color: Color) -> void:
	_tag.visible    = text != ""
	_tag_label.text = text
	_tag.add_theme_stylebox_override("panel", UIStyle.box(color, color, 0, 6, 12, 2))
	_panel_style.border_color = color

func _set_speaker(display_name: String, face_id: String) -> void:
	_npc_name.text = display_name
	_face.texture  = UIStyle.face_texture(face_id)
	_name_plate.reset_size()

# ============================================================
# 状態表示
# ============================================================
func _on_state_changed(state: String) -> void:
	_set_shown(true)
	_answer_box.visible  = false
	_advance_btn.visible = true
	_advance_btn.text    = "つぎへ ▶"
	_links_box.visible   = false
	_quote.visible       = false
	_quit_btn.visible    = true
	_input_active        = (state == "INPUT")
	_main_text.add_theme_color_override("font_color", UIStyle.C_INK)

	var npc: Dictionary = DialogueManager.current_npc_data
	var npc_id: String  = npc.get("id", "")
	var npc_name: String = npc.get("name", "???")
	_set_speaker(npc_name, npc_id)
	_set_accent("", UIStyle.C_INK)
	var animate := true

	match state:
		"APPROACH":
			# ナレーション（村人のセリフではないので色を落とす）
			_main_text.text = npc.get("approach_text", "")
			_main_text.add_theme_color_override("font_color", UIStyle.C_MUTED)

		"ODAI":
			_set_accent("おだい", UIStyle.C_ODAI)
			_main_text.text = npc.get("odai", "")

		"INPUT":
			_set_accent("おだい", UIStyle.C_ODAI)
			_main_text.text      = npc.get("odai", "")
			_answer_box.visible  = true
			_advance_btn.visible = false
			_answer_input.text   = ""
			_answer_input.grab_focus()
			_submit_btn.disabled = true
			animate = false   # 直前に読んだお題なので文字送りしない

		"ECHO":
			_set_speaker("きみ", "player")
			_set_accent("きみのこたえ", UIStyle.C_YOU)
			_main_text.text = DialogueManager.player_answer

		"REPLY":
			# 自分の答えを上に残し、村人の答えと並べて読めるようにする
			_set_accent("%sのこたえ" % npc_name, UIStyle.C_BROWN)
			_quote.text    = "きみ「%s」" % _shorten(DialogueManager.player_answer)
			_quote.visible = true
			_main_text.text = DialogueManager.get_aizuchi() \
				+ "\n" + npc.get("reply", "")

		"REVEAL":
			_set_accent("じつは…", UIStyle.C_REVEAL)
			_main_text.text   = npc.get("reveal", "")
			_advance_btn.text = "とじる"
			_quit_btn.visible = false   # ここまで来たら「とじる」だけ（離れると未達成扱いになるため）
			_show_links(npc.get("links", {}))
			_pop_face()

	if animate:
		_start_typing()
	else:
		_finish_typing()

	# 入力中は上部、それ以外は通常位置へ（フェーズ切替のたびに反映）
	_reposition()
	_reposition.call_deferred()   # レイアウト確定後にもう一度（高さの取りこぼし防止）

func _on_dialogue_ended() -> void:
	_input_active = false
	_finish_typing()
	_set_shown(false)

func _shorten(text: String) -> String:
	if text.length() <= QUOTE_MAX:
		return text
	return text.substr(0, QUOTE_MAX) + "…"

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
	# 文字送りの途中なら、まず全文を出す（もう一度押すと次へ）
	if _typing:
		_finish_typing()
		return
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
		_links_box.remove_child(c)
		c.queue_free()
	for label_text in links:
		var btn := Button.new()
		btn.text = "%s を見る ↗" % label_text
		btn.custom_minimum_size = Vector2(0, 56)
		UIStyle.style_primary(btn, UIStyle.C_REVEAL, 20)
		var url: String = links[label_text]
		btn.pressed.connect(func(): ClaftBridge.open_url(url))
		_links_box.add_child(btn)
	_links_box.visible = not links.is_empty()

# ============================================================
# 文字送り / 種明かしの演出
# ============================================================
func _start_typing() -> void:
	_finish_typing()
	var n := _main_text.text.length()
	if n == 0:
		return
	_typing = true
	_main_text.visible_ratio = 0.0
	_type_tween = create_tween()
	_type_tween.tween_property(_main_text, "visible_ratio", 1.0, n / TYPE_SPEED)
	_type_tween.finished.connect(func(): _typing = false)

func _finish_typing() -> void:
	if _type_tween:
		_type_tween.kill()
		_type_tween = null
	_typing = false
	_main_text.visible_ratio = 1.0

# 種明かしの瞬間に顔アイコンをぽんと弾ませる
func _pop_face() -> void:
	_face_frame.scale = Vector2(1.3, 1.3)
	create_tween().tween_property(_face_frame, "scale", Vector2.ONE, 0.35) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
