# 歩行制限の検証（開発時のみ使用）
# 使い方: godot --headless --path . -s tools/test_walkbounds.gd
# 島の縁では止まり、橋・桟道は通れることをレイキャストで確認する。
extends SceneTree

var _frames := 0
var _scene: Node

func _initialize() -> void:
	_scene = (load("res://scenes/KodawariMap.tscn") as PackedScene).instantiate()
	root.add_child(_scene)

func _process(_delta: float) -> bool:
	_frames += 1
	if _frames < 10:
		return false

	var space := _scene.get_viewport().world_2d.direct_space_state
	var player := _scene.get_node("Player") as CharacterBody2D
	# [説明, 始点, 終点, 壁に当たるべきか]
	var cases: Array = [
		["島の東端で止まる",      Vector2(300, 90),    Vector2(520, 90),    true],
		["島の西端で止まる",      Vector2(-300, 90),   Vector2(-520, 90),   true],
		["島の北端で止まる",      Vector2(-300, -130), Vector2(-300, -330), true],
		["桟道の横は海（止まる）", Vector2(0, 240),     Vector2(200, 240),   true],
		["ドックの南端で止まる",  Vector2(0, 300),     Vector2(0, 370),     true],
		["石の門の道は通れる",    Vector2(0, 60),      Vector2(0, -100),    false],
		["のれんの渡しは通れる",  Vector2(-300, 60),   Vector2(-300, -100), false],
		["桟橋は通れる",          Vector2(300, 60),    Vector2(300, -100),  false],
		["丸太橋は通れる",        Vector2(-300, 90),   Vector2(0, 90),      false],
		["石橋は通れる",          Vector2(0, 90),      Vector2(300, 90),    false],
		["桟道→ドックは通れる",   Vector2(0, 90),      Vector2(0, 300),     false],
	]
	var all_ok := true
	for c: Array in cases:
		var q := PhysicsRayQueryParameters2D.create(c[1], c[2])
		q.exclude = [player.get_rid()]
		var hit := space.intersect_ray(q)
		var blocked := not hit.is_empty()
		var passed: bool = blocked == c[3]
		if not passed:
			all_ok = false
		print("%s %s | 期待: %s 実際: %s %s" % [
			"OK" if passed else "NG", c[0],
			"壁" if c[3] else "通行可", "壁" if blocked else "通行可",
			str(hit.get("position", ""))])
	print("RESULT: ", "ALL OK" if all_ok else "FAILED")
	return true
