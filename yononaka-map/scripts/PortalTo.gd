extends Area2D

@export var target_scene: String = ""

var _triggered := false

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if _triggered:
		return
	if body.is_in_group("player") and target_scene != "":
		_triggered = true
		get_tree().change_scene_to_file.call_deferred(target_scene)
