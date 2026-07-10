extends Area2D

@export var monster_id: String = ""

var _data: Dictionary = {}
var _player_nearby: bool = false
var _bubble: Node2D

func _ready() -> void:
	if monster_id != "":
		_data = MonsterData.get_by_id(monster_id)

	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	MonsterManager.dialogue_ended.connect(_on_dialogue_ended)

	# 外見: 精霊スプライト（歩行アニメをループさせて浮遊感を出す）
	$Sprite.sprite_frames = CharacterSprites.build_for("guardian")
	$Sprite.play("walk_down")
	# 精霊らしい淡い発光
	add_child(Atmosphere.make_glow(Color("#7FF2E0"), 45.0, 0.5))

	_setup_bubble()

# ------------------------------------
# ！吹き出し（黄色 = モンスター印）
# ------------------------------------
func _setup_bubble() -> void:
	_bubble = Node2D.new()
	_bubble.position = Vector2(12, -28)
	add_child(_bubble)

	var border := Polygon2D.new()
	border.polygon = PackedVector2Array([-16, -14, 16, -14, 16, 14, -16, 14])
	border.color   = Color("#2C2C2A")
	_bubble.add_child(border)

	var fill := Polygon2D.new()
	fill.polygon = PackedVector2Array([-14, -12, 14, -12, 14, 12, -14, 12])
	fill.color   = Color("#FFE066")   # ← 黄色で NPC と区別
	_bubble.add_child(fill)

	var lbl := Label.new()
	lbl.text     = "！"
	lbl.size     = Vector2(28, 14)
	lbl.position = Vector2(-14, -13)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 14)
	lbl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_bubble.add_child(lbl)

	var hint := Label.new()
	hint.text = "tap" if DisplayServer.is_touchscreen_available() else "Enter"
	hint.size = Vector2(28, 12)
	hint.position = Vector2(-14, 1)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.add_theme_font_size_override("font_size", 8)
	hint.add_theme_color_override("font_color", Color("#5C3A21"))
	_bubble.add_child(hint)

	_bubble.visible = false

# ------------------------------------
# 毎フレーム
# ------------------------------------
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

# ------------------------------------
# 近接判定
# ------------------------------------
func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = true
		if _can_start():
			_bubble.visible = true

func _on_body_exited(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = false
		_bubble.visible = false

func _on_dialogue_ended() -> void:
	if _player_nearby:
		_bubble.visible = true

func _start() -> void:
	if _data.is_empty():
		push_warning("Monster '%s': データが読み込まれていません" % monster_id)
		return
	_bubble.visible = false
	MonsterManager.start(_data)
