extends Area2D

@export var npc_id: String = ""

var _npc_data: Dictionary = {}
var _player_nearby: bool  = false
var _cooldown: float      = 0.0   # 会話終了直後の誤起動防止クールダウン
const _COOLDOWN_SEC := 0.25

var _bubble: Node2D

@onready var _sprite: AnimatedSprite2D = $Sprite

func _ready() -> void:
	if npc_id != "":
		_npc_data = NPCData.get_npc_by_id(npc_id)

	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	DialogueManager.dialogue_ended.connect(_on_dialogue_ended)

	# 外見: assets/characters/<npc_id>/ のスプライト（無ければ汎用村人）
	_sprite.sprite_frames = CharacterSprites.build_for(npc_id)
	_sprite.play("idle_down")

	_setup_bubble()

# ============================================================
# ！吹き出し
# ============================================================
func _setup_bubble() -> void:
	_bubble = Node2D.new()
	_bubble.position = Vector2(12, -30)
	add_child(_bubble)

	var border := Polygon2D.new()
	border.polygon = PackedVector2Array([-16, -14, 16, -14, 16, 14, -16, 14])
	border.color   = Color("#2C2C2A")
	_bubble.add_child(border)

	var fill := Polygon2D.new()
	fill.polygon = PackedVector2Array([-14, -12, 14, -12, 14, 12, -14, 12])
	fill.color   = Color("#FFFFFF")
	_bubble.add_child(fill)

	var lbl := Label.new()
	lbl.text                 = "！"
	lbl.size                 = Vector2(28, 24)
	lbl.position             = Vector2(-14, -12)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 16)
	lbl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_bubble.add_child(lbl)

	_bubble.visible = false

# ============================================================
# 毎フレーム
# ============================================================
func _process(delta: float) -> void:
	if _cooldown > 0.0:
		_cooldown -= delta
		return   # クールダウン中は話しかけ判定をスキップ

	if _player_nearby and _can_start():
		if Input.is_action_just_pressed("ui_accept"):
			_start_dialogue()

# ============================================================
# 近接判定
# ============================================================
func _can_start() -> bool:
	return (not DialogueManager.is_active()
		and not MonsterManager.is_active()
		and not ChiefManager.is_active())

func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = true
		_face_toward(body)
		if _can_start():
			_bubble.visible = true

func _on_body_exited(body: Node2D) -> void:
	if body.is_in_group("player"):
		_player_nearby = false
		_bubble.visible = false

func _on_dialogue_ended() -> void:
	if _player_nearby:
		_bubble.visible = true
	_cooldown = _COOLDOWN_SEC   # 会話終了直後は短時間話しかけ不可

# 近づいてきたプレイヤーの方を向く
func _face_toward(body: Node2D) -> void:
	var dir := CharacterSprites.dir_name(body.global_position - global_position)
	_sprite.play("idle_" + dir)

func _start_dialogue() -> void:
	if _npc_data.is_empty():
		push_warning("NPC '%s': データが読み込まれていません" % npc_id)
		return
	_bubble.visible = false
	DialogueManager.start_dialogue(_npc_data)
