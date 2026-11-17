extends CharacterBody2D

const SPEED := 150.0

@onready var _sprite: AnimatedSprite2D = $Sprite

var _facing := "down"

func _ready() -> void:
	_sprite.sprite_frames = CharacterSprites.build_for("player")
	_sprite.play("idle_down")

func _physics_process(_delta: float) -> void:
	if DialogueManager.is_active() or MonsterManager.is_active() or ChiefManager.is_active():
		velocity = Vector2.ZERO
		move_and_slide()
		_sprite.play("idle_" + _facing)
		return

	var dir := Vector2.ZERO
	if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		dir.x += 1.0
	if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		dir.x -= 1.0
	if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		dir.y += 1.0
	if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		dir.y -= 1.0

	if dir != Vector2.ZERO:
		dir = dir.normalized()

	velocity = dir * SPEED
	move_and_slide()

	if dir == Vector2.ZERO:
		_sprite.play("idle_" + _facing)
	else:
		_facing = CharacterSprites.dir_name(dir, _facing)
		_sprite.play("walk_" + _facing)
