extends CanvasLayer
## 村長との会話UI（お話 → クイズ → 返事）。わくは DialogueFrame、色は UIStyle を使う。

# フェーズ
enum Phase { SCRIPT, QUIZ, QUIZ_RESPONSE }
var _phase: Phase = Phase.SCRIPT

var _frame:      DialogueFrame
var _next_btn:   Button
var _video_btn:  Button
var _close_btn:  Button
var _quiz_box:   VBoxContainer   # クイズ選択肢
var _choice_btns: Array[Button] = []

func _ready() -> void:
	layer = 10
	_build_ui()
	ChiefManager.stage_started.connect(_on_stage_started)
	ChiefManager.dialogue_ended.connect(_on_dialogue_ended)

# ============================================================
# UI 構築
# ============================================================
func _build_ui() -> void:
	_frame = DialogueFrame.new()
	add_child(_frame)
	var body := _frame.body

	# クイズ選択肢（4ボタン縦並び）
	_quiz_box = VBoxContainer.new()
	_quiz_box.add_theme_constant_override("separation", 8)
	body.add_child(_quiz_box)
	for i in 4:
		var btn := Button.new()
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.custom_minimum_size   = Vector2(0, 56)
		btn.autowrap_mode         = TextServer.AUTOWRAP_WORD_SMART
		UIStyle.style_ghost(btn, 20)
		var idx := i
		btn.pressed.connect(func(): _on_choice_selected(idx))
		_quiz_box.add_child(btn)
		_choice_btns.append(btn)
	_quiz_box.visible = false

	# ボタン行
	var btn_row := HBoxContainer.new()
	btn_row.add_theme_constant_override("separation", 12)
	body.add_child(btn_row)

	_video_btn = Button.new()
	_video_btn.text = "▶ 動画を見る"
	_video_btn.custom_minimum_size = Vector2(190, 60)
	UIStyle.style_primary(_video_btn, UIStyle.C_REVEAL)
	btn_row.add_child(_video_btn)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn_row.add_child(spacer)

	_close_btn = Button.new()
	_close_btn.text = "とじる"
	_close_btn.custom_minimum_size = Vector2(170, 60)
	UIStyle.style_primary(_close_btn)
	btn_row.add_child(_close_btn)

	_next_btn = Button.new()
	_next_btn.text = "つぎへ ▶"
	_next_btn.custom_minimum_size = Vector2(190, 60)
	UIStyle.style_primary(_next_btn)
	btn_row.add_child(_next_btn)

	_next_btn.pressed.connect(_on_next_pressed)
	_video_btn.pressed.connect(_on_video_pressed)
	_close_btn.pressed.connect(_on_close_pressed)

# ============================================================
# ステージ表示
# ============================================================
func _on_stage_started() -> void:
	_frame.open()
	_phase = Phase.SCRIPT

	var stage := ChiefManager.current_stage
	_frame.set_speaker("むら長", "chief")
	_frame.set_accent(stage.get("title", ""), UIStyle.C_ODAI)
	_frame.set_text(stage.get("script", ""))
	_quiz_box.visible = false

	var has_quiz:  bool = stage.get("quiz") != null
	var has_video: bool = _video_url() != ""

	_next_btn.visible  = has_quiz   # クイズがあれば「つぎへ（クイズ）」
	_video_btn.visible = not has_quiz and has_video
	_close_btn.visible = not has_quiz
	_place()

func _on_dialogue_ended() -> void:
	_frame.close()

func _place() -> void:
	_frame.place_above_controls()
	_frame.place_above_controls.call_deferred()   # レイアウト確定後にもう一度

# ============================================================
# クイズ
# ============================================================
func _show_quiz() -> void:
	_phase = Phase.QUIZ
	var quiz: Dictionary = ChiefManager.current_stage.get("quiz", {})
	_frame.set_accent("クイズ", UIStyle.C_ODAI)
	_frame.set_text(quiz.get("question", ""), false)
	_quiz_box.visible = true
	var choices: Array = quiz.get("choices", [])
	for i in _choice_btns.size():
		_choice_btns[i].visible  = i < choices.size()
		_choice_btns[i].text     = choices[i] if i < choices.size() else ""
		_choice_btns[i].disabled = false
	_next_btn.visible  = false
	_video_btn.visible = false
	_close_btn.visible = false
	_place()

func _on_choice_selected(idx: int) -> void:
	_phase = Phase.QUIZ_RESPONSE
	var quiz: Dictionary = ChiefManager.current_stage.get("quiz", {})
	var correct: int     = quiz.get("correct_index", -1)
	var is_ok: bool      = (idx == correct)

	_quiz_box.visible = false
	_frame.set_accent(ChiefManager.current_stage.get("title", ""), UIStyle.C_ODAI)
	_frame.set_text(quiz.get("response_correct" if is_ok else "response_wrong", ""))

	var has_video: bool = _video_url() != ""
	_video_btn.visible = has_video
	_next_btn.visible  = false
	_close_btn.visible = true
	_place()

# ============================================================
# ボタン操作
# ============================================================
func _on_next_pressed() -> void:
	# 文字送りの途中なら、まず全文を出す
	if _frame.is_typing():
		_frame.finish_typing()
		return
	_show_quiz()

func _on_video_pressed() -> void:
	var url := _video_url()
	if url != "":
		ClaftBridge.open_url(url)

func _on_close_pressed() -> void:
	ChiefManager.finish()

# 動画URL（JSON で null のステージは空文字として扱う）
func _video_url() -> String:
	var v = ChiefManager.current_stage.get("video_url")
	return v if v is String else ""

# Enter/A ボタンで閉じる、Escape/B ボタンでも閉じる（クイズ選択中は無効）
func _input(event: InputEvent) -> void:
	if not _frame.visible or _phase == Phase.QUIZ:
		return
	if event.is_action_pressed("game_cancel"):
		_on_close_pressed()
		get_viewport().set_input_as_handled()
		return
	if event.is_action_pressed("ui_accept"):
		# 文字送りの途中なら、まず全文を出す（読み飛ばし防止）
		if _frame.is_typing():
			_frame.finish_typing()
			get_viewport().set_input_as_handled()
		elif _close_btn.visible:
			_on_close_pressed()
			get_viewport().set_input_as_handled()
