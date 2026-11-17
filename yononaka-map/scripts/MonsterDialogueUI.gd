extends CanvasLayer
## クエスト番人（動画クエスト）との会話UI。わくは DialogueFrame、色は UIStyle を使う。

const C_QUEST := Color("#B8860B")   # 番人の色（黄金色）

var _frame:       DialogueFrame
var _video_btn:   Button
var _watched_btn: Button
var _form_btn:    Button
var _close_btn:   Button

func _ready() -> void:
	layer = 10
	_build_ui()
	MonsterManager.state_changed.connect(_on_state_changed)
	MonsterManager.dialogue_ended.connect(_on_dialogue_ended)

func _build_ui() -> void:
	_frame = DialogueFrame.new()
	add_child(_frame)

	# ボタンは縦に積む（縦画面で押しやすい幅にする）
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	_frame.body.add_child(col)

	_video_btn = _make_button(col, UIStyle.C_REVEAL)
	_watched_btn = _make_button(col, UIStyle.C_BROWN)
	_watched_btn.text = "見た！ つぎへ ▶"
	_form_btn = _make_button(col, UIStyle.C_ODAI)
	_close_btn = _make_button(col, UIStyle.C_BROWN)

	_video_btn.pressed.connect(_on_video_pressed)
	_watched_btn.pressed.connect(_on_watched_pressed)
	_form_btn.pressed.connect(_on_form_pressed)
	_close_btn.pressed.connect(_on_close_pressed)

func _make_button(parent: Control, accent: Color) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(0, 60)
	UIStyle.style_primary(b, accent)
	parent.add_child(b)
	return b

# ============================================================
# 状態表示
# ============================================================
func _on_state_changed(state: String) -> void:
	_frame.open()
	var data := MonsterManager.current_data
	_frame.set_speaker(data.get("name", "???"), "guardian")

	match state:
		"INTRO":
			_frame.set_accent("クエスト", C_QUEST)
			_frame.set_text(data.get("intro", ""))
			_video_btn.text       = "▶ 動画を見る"
			_video_btn.visible    = true
			_watched_btn.visible  = true
			_watched_btn.disabled = true
			_form_btn.visible  = false
			_close_btn.visible = false

		"ODAI":
			_frame.set_accent("おだい", UIStyle.C_ODAI)
			_frame.set_text(data.get("odai_text", ""))
			_video_btn.visible   = false
			_watched_btn.visible = false
			_form_btn.visible  = true
			_form_btn.disabled = false
			_form_btn.text     = "✏ フォームで答える"
			_close_btn.visible = true
			_close_btn.text    = "とじる"
	_place()

func _on_dialogue_ended() -> void:
	_frame.close()

func _place() -> void:
	_frame.place_above_controls()
	_frame.place_above_controls.call_deferred()   # レイアウト確定後にもう一度

# ============================================================
# ボタン操作
# ============================================================
func _on_video_pressed() -> void:
	var url: String = MonsterManager.current_data.get("video_url", "")
	if url != "":
		ClaftBridge.open_url(url)
	_video_btn.text       = "▶ 動画を見る（済）"
	_watched_btn.disabled = false

func _on_watched_pressed() -> void:
	MonsterManager.advance()

func _on_form_pressed() -> void:
	var url: String = MonsterManager.current_data.get("odai_form_url", "")
	if url != "":
		ClaftBridge.open_url(url)
	# フォームは別タブで開く。戻り道を分かりやすく示す
	_form_btn.text  = "✏ フォームをひらきました"
	_frame.set_text("フォームは新しいタブでひらきます。\n書き終えたら下の「ゲームに戻る」でマップへ戻ってね。", false)
	_close_btn.text = "▶ ゲームに戻る"
	_place()

func _on_close_pressed() -> void:
	MonsterManager.advance()

# Enter（キーボード）で「見た！」or「閉じる」。
# タッチは各ボタンが個別に処理する（ここで横取りするとフォームボタンと競合し、
# 外部フォームから戻ったあとに閉じられなくなるため）。
func _input(event: InputEvent) -> void:
	if not _frame.visible:
		return
	if not event.is_action_pressed("ui_accept"):
		return
	if _frame.is_typing():
		_frame.finish_typing()
		get_viewport().set_input_as_handled()
	elif MonsterManager.current_state == MonsterManager.State.ODAI:
		if _close_btn.visible:
			_on_close_pressed()
			get_viewport().set_input_as_handled()
	elif not _watched_btn.disabled:
		_on_watched_pressed()
		get_viewport().set_input_as_handled()
