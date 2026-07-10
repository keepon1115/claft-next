extends Area2D

var _player_nearby: bool = false
var _notification: Node2D
var _field_msg: Label
var _pulse_tween: Tween

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	ChiefManager.dialogue_ended.connect(_on_dialogue_ended)
	ProgressManager.progress_changed.connect(_on_progress_changed)

	# 外見: assets/characters/chief/ のスプライト
	$Sprite.sprite_frames = CharacterSprites.build_for("chief")
	$Sprite.play("idle_down")

	_setup_notification()
	_update_notification()

# ── 通知バブル（橙・ひし形でNPC/モンスターと区別）─────
func _setup_notification() -> void:
	_notification = Node2D.new()
	_notification.position = Vector2(0, -32)
	add_child(_notification)

	# ひし形の枠（橙）
	var diamond := Polygon2D.new()
	diamond.polygon = PackedVector2Array([0, -16, 14, 0, 0, 16, -14, 0])
	diamond.color   = Color("#FF8C00")
	_notification.add_child(diamond)

	# 内側（濃橙）
	var inner := Polygon2D.new()
	inner.polygon = PackedVector2Array([0, -12, 10, 0, 0, 12, -10, 0])
	inner.color   = Color("#CC6A00")
	_notification.add_child(inner)

	# ★ マーク
	var lbl := Label.new()
	lbl.text     = "★"
	lbl.size     = Vector2(28, 24)
	lbl.position = Vector2(-14, -12)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 14)
	lbl.add_theme_color_override("font_color", Color("#FFFFFF"))
	_notification.add_child(lbl)

	# フィールドメッセージ（★の下）
	# font_size は world空間 → camera zoom=3 で3倍表示されるので小さめに
	_field_msg = Label.new()
	_field_msg.text = "村長が、なにか話したそうにこっちを見ている"
	_field_msg.size = Vector2(200, 12)
	_field_msg.position = Vector2(-100, 16)
	_field_msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_field_msg.add_theme_font_size_override("font_size", 7)
	_field_msg.add_theme_color_override("font_color", Color("#5C3A21"))
	_notification.add_child(_field_msg)

	_notification.visible = false

func _update_notification() -> void:
	var has := ChiefManager.has_pending_stage()
	_notification.visible = has

	if has:
		if not _pulse_tween or not _pulse_tween.is_running():
			_pulse_tween = create_tween().set_loops()
			_pulse_tween.tween_property(_notification, "scale", Vector2(1.12, 1.12), 0.55)
			_pulse_tween.tween_property(_notification, "scale", Vector2(1.0,  1.0),  0.55)
	else:
		if _pulse_tween:
			_pulse_tween.kill()
		_notification.scale = Vector2.ONE

# ── 毎フレーム ───────────────────────────────────
func _process(_delta: float) -> void:
	if _player_nearby and _can_start():
		if Input.is_action_just_pressed("ui_accept"):
			_start()

func _input(event: InputEvent) -> void:
	if _player_nearby and _can_start():
		if event is InputEventScreenTouch and event.pressed:
			_start()
			get_viewport().set_input_as_handled()

func _can_start() -> bool:
	return (not DialogueManager.is_active()
		and not MonsterManager.is_active()
		and not ChiefManager.is_active())

func _start() -> void:
	if not ChiefManager.has_pending_stage():
		return
	_notification.visible = false
	ChiefManager.start()

# ── 近接判定 ─────────────────────────────────────
func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = true
		# 近づいてきたプレイヤーの方を向く
		var dir := CharacterSprites.dir_name(body.global_position - global_position)
		$Sprite.play("idle_" + dir)

func _on_body_exited(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = false

func _on_dialogue_ended() -> void:
	_update_notification()

func _on_progress_changed(_total: int) -> void:
	_update_notification()
