extends CanvasLayer
## 村人（大人NPC）との会話UI。わくは DialogueFrame、色は UIStyle を使う。

var _frame:        DialogueFrame
var _quote:        Label
var _answer_box:   HBoxContainer
var _answer_input: LineEdit
var _submit_btn:   Button
var _advance_btn:  Button
var _quit_btn:     Button
var _links_box:    HFlowContainer

const INPUT_TOP := 96.0   # 入力中のパネル上端（ソフトキーボード対策で上部固定）
const QUOTE_MAX := 38     # 返しの上に出す「きみの答え」の最大文字数

var _natural_vp_h: float = 0.0   # キーボードなし時の vp.y（縮小検知用）
var _web_inner_h:  float = 0.0   # キーボードなし時の window.innerHeight（CSS px）
var _web_kb_css:   float = 0.0   # visualViewport から検知したキーボード高さ（CSS px）
var _input_active: bool  = false # INPUT フェーズ中（ソフトキーボード表示中）

func _ready() -> void:
	layer = 10
	_build_ui()
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
	var vp := get_viewport().get_visible_rect().size

	if _input_active:
		# テキスト入力中はソフトキーボードが画面下半分を覆う。
		# キーボード高さの検知はモバイル Web で不安定なため、
		# パネルを画面上部に固定し「お題＋入力欄」が常に見えるようにする。
		_frame.place_top(INPUT_TOP)
		return

	var vp_shrank := _natural_vp_h > 0.0 and vp.y < _natural_vp_h - 10.0
	var kb_phys: int = DisplayServer.virtual_keyboard_get_height()
	if kb_phys > 0 and not vp_shrank:
		# Android ネイティブ API：物理 px → 仮想 px 変換
		var sy := get_viewport().canvas_transform.get_scale().y
		_frame.place_bottom(vp.y - float(kb_phys) / maxf(sy, 0.001) - 8.0)
	elif _web_kb_css > 1.0 and _web_inner_h > 0.0 and not vp_shrank:
		# Web / Android Chrome：visualViewport API が検知したキーボード高さ
		# CSS px → Godot 仮想 px（比率 = _natural_vp_h / window.innerHeight）
		var kb_virt := _web_kb_css * (_natural_vp_h / _web_inner_h)
		_frame.place_bottom(vp.y - kb_virt - 8.0)
	elif vp_shrank:
		# Godot 側もビューポート縮小済み（キーボード分は既に除外されている）
		_frame.place_bottom(vp.y - 8.0)
	else:
		# 通常：D-pad エリアの上に配置
		_frame.place_above_controls()

# ============================================================
# UI 構築
# ============================================================
func _build_ui() -> void:
	_frame = DialogueFrame.new()
	add_child(_frame)
	var body := _frame.body

	# きみの答えの引用（返しの上に小さく出す。見出しチップと本文のあいだ）
	_quote = _frame.make_wrap_label(18, UIStyle.C_YOU)
	body.add_child(_quote)
	body.move_child(_quote, 1)

	# 入力エリア（INPUT フェーズのみ表示）
	_answer_box = HBoxContainer.new()
	_answer_box.add_theme_constant_override("separation", 10)
	body.add_child(_answer_box)

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
	body.add_child(_links_box)

	# ボタン行（はなれる ← → つぎへ）
	var adv_row := HBoxContainer.new()
	adv_row.add_theme_constant_override("separation", 12)
	body.add_child(adv_row)

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

	_submit_btn.pressed.connect(_on_submit_pressed)
	_advance_btn.pressed.connect(_on_advance_pressed)
	_quit_btn.pressed.connect(_on_quit_pressed)
	_answer_input.text_changed.connect(_on_answer_changed)
	_answer_input.text_submitted.connect(_on_answer_submitted)

# ============================================================
# 状態表示
# ============================================================
func _on_state_changed(state: String) -> void:
	_frame.open()
	_answer_box.visible  = false
	_advance_btn.visible = true
	_advance_btn.text    = "つぎへ ▶"
	_links_box.visible   = false
	_quote.visible       = false
	_quit_btn.visible    = true
	_input_active        = (state == "INPUT")

	var npc: Dictionary  = DialogueManager.current_npc_data
	var npc_id: String   = npc.get("id", "")
	var npc_name: String = npc.get("name", "???")
	_frame.set_speaker(npc_name, npc_id)
	_frame.set_accent("", UIStyle.C_INK)

	match state:
		"APPROACH":
			# ナレーション（村人のセリフではないので色を落とす）
			_frame.set_text(npc.get("approach_text", ""), true, UIStyle.C_MUTED)

		"ODAI":
			_frame.set_accent("おだい", UIStyle.C_ODAI)
			_frame.set_text(npc.get("odai", ""))

		"INPUT":
			_frame.set_accent("おだい", UIStyle.C_ODAI)
			_frame.set_text(npc.get("odai", ""), false)   # 直前に読んだお題なので文字送りしない
			_answer_box.visible  = true
			_advance_btn.visible = false
			_answer_input.text   = ""
			_answer_input.grab_focus()
			_submit_btn.disabled = true

		"ECHO":
			_frame.set_speaker("きみ", "player")
			_frame.set_accent("きみのこたえ", UIStyle.C_YOU)
			_frame.set_text(DialogueManager.player_answer)

		"REPLY":
			# 自分の答えを上に残し、村人の答えと並べて読めるようにする
			_frame.set_accent("%sのこたえ" % npc_name, UIStyle.C_BROWN)
			_quote.text    = "きみ「%s」" % _shorten(DialogueManager.player_answer)
			_quote.visible = true
			_frame.set_text(DialogueManager.get_aizuchi() + "\n" + npc.get("reply", ""))

		"REVEAL":
			_frame.set_accent("じつは…", UIStyle.C_REVEAL)
			_frame.set_text(npc.get("reveal", ""))
			_advance_btn.text = "とじる"
			_quit_btn.visible = false   # ここまで来たら「とじる」だけ（離れると未達成扱いになるため）
			_show_links(npc.get("links", {}))
			_frame.pop_face()

	# 入力中は上部、それ以外は通常位置へ（フェーズ切替のたびに反映）
	_reposition()
	_reposition.call_deferred()   # レイアウト確定後にもう一度（高さの取りこぼし防止）

func _on_dialogue_ended() -> void:
	_input_active = false
	_frame.close()

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
	if _frame.is_typing():
		_frame.finish_typing()
		return
	DialogueManager.advance()

# Enter / Space でつぎへ、Escape / B ボタンで離れる（INPUT フェーズ以外）
func _input(event: InputEvent) -> void:
	if not _frame.visible:
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
