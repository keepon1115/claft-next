extends CanvasLayer

# ── レイアウト定数（仮想座標 720×1280）────────────────────────────────────────
const CTRL_Y    := 1060.0   # 操作エリア開始 Y

# 十字キー（D-pad）中心・サイズ
const DPAD_CX   :=   90.0   # 十字キー中心 X
const DPAD_CY   := 1170.0   # 十字キー中心 Y
const DPAD_R    :=   30.0   # 各ボタン半径
const DPAD_STEP :=   64.0   # 中心から各ボタン中心までの距離

# A/B ボタン
const BTN_A_X := 625.0;  const BTN_A_Y := 1175.0;  const BTN_A_R := 52.0
const BTN_B_X := 500.0;  const BTN_B_Y := 1225.0;  const BTN_B_R := 42.0

# D-pad ボタン参照（会話中に半透明化するため保持）
var _dpad_btns: Array[Button] = []

# ─────────────────────────────────────────────────────────────────────────────

func _ready() -> void:
	layer   = 5
	visible = true
	_build()
	# 会話終了時にボタン長押し残りをリセット
	DialogueManager.dialogue_ended.connect(_release_dirs)
	MonsterManager.dialogue_ended.connect(_release_dirs)

func _process(_delta: float) -> void:
	var busy := DialogueManager.is_active() or MonsterManager.is_active() or ChiefManager.is_active()
	if busy:
		_release_dirs()   # 会話中は方向入力を強制解除
	# D-pad を半透明化（視覚フィードバック）
	var alpha := 0.30 if busy else 1.0
	for btn: Button in _dpad_btns:
		btn.modulate.a = alpha

# ============================================================
# UI 構築
# ============================================================
func _build() -> void:
	# フルスクリーン Control（Button の hit-test が正しく通るように必要）
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	# 操作帯の背景
	var bg := ColorRect.new()
	bg.color    = Color(0, 0, 0, 0.28)
	bg.position = Vector2(0, CTRL_Y)
	bg.size     = Vector2(720, 1280 - CTRL_Y)
	root.add_child(bg)

	# ── 十字キー ──────────────────────────────────────────────
	# 中央インジケータ（十字の交点）
	var cx_bg := ColorRect.new()
	cx_bg.color    = Color(1, 1, 1, 0.10)
	cx_bg.size     = Vector2(DPAD_R * 2, DPAD_R * 2)
	cx_bg.position = Vector2(DPAD_CX - DPAD_R, DPAD_CY - DPAD_R)
	root.add_child(cx_bg)

	_add_dpad_btn(root, "↑", "ui_up",    DPAD_CX,             DPAD_CY - DPAD_STEP)
	_add_dpad_btn(root, "↓", "ui_down",  DPAD_CX,             DPAD_CY + DPAD_STEP)
	_add_dpad_btn(root, "←", "ui_left",  DPAD_CX - DPAD_STEP, DPAD_CY)
	_add_dpad_btn(root, "→", "ui_right", DPAD_CX + DPAD_STEP, DPAD_CY)

	# ── A/B ボタン ──────────────────────────────────────────────
	_add_action_btn(root, "A", BTN_A_X, BTN_A_Y, BTN_A_R, Color("#44AA66"), "ui_accept")
	_add_action_btn(root, "B", BTN_B_X, BTN_B_Y, BTN_B_R, Color("#AA4444"), "game_cancel")

# D-pad 方向ボタン 1 個を生成して root に追加
func _add_dpad_btn(parent: Control, label: String, action: String,
				   cx: float, cy: float) -> void:
	var r   := DPAD_R
	var btn := Button.new()
	btn.text       = label
	btn.size       = Vector2(r * 2, r * 2)
	btn.position   = Vector2(cx - r, cy - r)
	btn.focus_mode = Control.FOCUS_NONE
	btn.add_theme_font_size_override("font_size", int(r * 0.85))
	btn.add_theme_color_override("font_color", Color(1, 1, 1, 0.90))

	var s := StyleBoxFlat.new()
	s.bg_color = Color(0.22, 0.22, 0.22, 0.70)
	s.corner_radius_top_left     = int(r)
	s.corner_radius_top_right    = int(r)
	s.corner_radius_bottom_left  = int(r)
	s.corner_radius_bottom_right = int(r)
	btn.add_theme_stylebox_override("normal", s)
	btn.add_theme_stylebox_override("hover",  s)

	var sp := s.duplicate() as StyleBoxFlat
	sp.bg_color = Color(0.55, 0.55, 0.55, 0.92)
	btn.add_theme_stylebox_override("pressed", sp)

	var act := action
	btn.button_down.connect(func():
		# 会話中は入力を無視
		if DialogueManager.is_active() or MonsterManager.is_active() or ChiefManager.is_active():
			return
		Input.action_press(act)
	)
	btn.button_up.connect(func():
		Input.action_release(act)
	)
	parent.add_child(btn)
	_dpad_btns.append(btn)

# A/B アクションボタン（InputEventAction を inject して _input() ハンドラーにも届ける）
func _add_action_btn(parent: Control, label: String, cx: float, cy: float, r: float,
					  col: Color, action: String) -> void:
	var btn := Button.new()
	btn.text       = label
	btn.size       = Vector2(r * 2, r * 2)
	btn.position   = Vector2(cx - r, cy - r)
	btn.focus_mode = Control.FOCUS_NONE
	btn.add_theme_font_size_override("font_size", int(r * 0.70))
	btn.add_theme_color_override("font_color", Color(1, 1, 1, 0.90))

	var s := StyleBoxFlat.new()
	s.bg_color                   = Color(col, 0.70)
	s.corner_radius_top_left     = int(r)
	s.corner_radius_top_right    = int(r)
	s.corner_radius_bottom_left  = int(r)
	s.corner_radius_bottom_right = int(r)
	btn.add_theme_stylebox_override("normal", s)
	btn.add_theme_stylebox_override("hover",  s)

	var sp := s.duplicate() as StyleBoxFlat
	sp.bg_color = Color(col.lightened(0.15), 0.92)
	btn.add_theme_stylebox_override("pressed", sp)

	var act := action
	btn.button_down.connect(func():
		# Input singleton への登録（_physics_process のポーリング用）
		Input.action_press(act)
		# InputEventAction として inject（_input() の event.is_action_pressed() 用）
		var ev := InputEventAction.new()
		ev.action  = act
		ev.pressed = true
		Input.parse_input_event(ev)
	)
	btn.button_up.connect(func():
		Input.action_release(act)
		var ev := InputEventAction.new()
		ev.action  = act
		ev.pressed = false
		Input.parse_input_event(ev)
	)
	parent.add_child(btn)

# 全方向アクションを解除
func _release_dirs() -> void:
	for a: String in ["ui_left", "ui_right", "ui_up", "ui_down"]:
		Input.action_release(a)
