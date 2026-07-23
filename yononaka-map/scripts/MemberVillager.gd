class_name MemberVillager
extends Area2D
## メンバー村人(9b)。member_avatars の1行をマップ上の村人として表示する。
## 話しかけると「{nickname}: {message}」のひとことを吹き出しパネルで返す。
## パネル本体は VillagerSpawner が1つだけ持ち、全村人で共用する。

var sprite_id: String = ""
var nickname: String = ""
var message: String = ""
var is_me: bool = false          # 自分の村人(11-C: 常に表示+「じぶん」マーク)
var speech_ui: Node = null       # VillagerSpawner の共用パネル

var _player_nearby: bool = false
var _cooldown: float = 0.0       # パネルを閉じた直後の誤再オープン防止
var _bubble: Node2D
var _sprite: AnimatedSprite2D

func _ready() -> void:
	var col := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 20.0
	col.shape = shape
	add_child(col)

	# 外見: assets/characters/<sprite_id>/ (未知IDは _default にフォールバック)
	_sprite = AnimatedSprite2D.new()
	_sprite.sprite_frames = CharacterSprites.build_for(sprite_id)
	_sprite.play("idle_down")
	add_child(_sprite)

	_setup_bubble()
	if is_me:
		_setup_me_badge()

	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

# 「…」吹き出し(NPCの「！」と区別して、メンバーのひとことであることを示す)
func _setup_bubble() -> void:
	_bubble = Node2D.new()
	_bubble.position = Vector2(12, -30)
	_bubble.visible = false
	add_child(_bubble)

	var border := Polygon2D.new()
	border.polygon = PackedVector2Array([-16, -14, 16, -14, 16, 14, -16, 14])
	border.color = Color("#2C2C2A")
	_bubble.add_child(border)

	var fill := Polygon2D.new()
	fill.polygon = PackedVector2Array([-14, -12, 14, -12, 14, 12, -14, 12])
	fill.color = Color("#FFFFFF")
	_bubble.add_child(fill)

	var lbl := Label.new()
	lbl.text = "…"
	lbl.size = Vector2(28, 24)
	lbl.position = Vector2(-14, -14)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 16)
	lbl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_bubble.add_child(lbl)

# 頭上の「じぶん」マーク(11-C)
func _setup_me_badge() -> void:
	var badge := Node2D.new()
	badge.position = Vector2(0, -22)
	add_child(badge)

	var board := Polygon2D.new()
	board.polygon = PackedVector2Array([-16, -7, 16, -7, 16, 7, -16, 7])
	board.color = Color("#F5C518")
	badge.add_child(board)

	var lbl := Label.new()
	lbl.text = "じぶん"
	lbl.position = Vector2(-16, -7)
	lbl.size = Vector2(32, 14)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 7)
	lbl.add_theme_color_override("font_color", Color("#5C3A21"))
	badge.add_child(lbl)

func _process(delta: float) -> void:
	if _cooldown > 0.0:
		_cooldown -= delta
		return
	if _player_nearby and _can_talk() and Input.is_action_just_pressed("ui_accept"):
		_bubble.visible = false
		_cooldown = 0.25
		if speech_ui:
			speech_ui.open_speech(nickname, message)

func _can_talk() -> bool:
	return (not DialogueManager.is_active()
		and not MonsterManager.is_active()
		and not ChiefManager.is_active()
		and not (speech_ui and speech_ui.is_open()))

func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = true
		_sprite.play("idle_" + CharacterSprites.dir_name(body.global_position - global_position))
		if _can_talk():
			_bubble.visible = true

func _on_body_exited(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = false
		_bubble.visible = false
