# 実際のプレイヤー移動で歩行制限を検証（開発時のみ使用）
# 使い方: godot --headless --path . -s tools/test_walk_sim.gd
# 入力を擬似的に押して move_and_slide の挙動を確かめる。
extends SceneTree

var _frames := 0
var _player: CharacterBody2D
var _ok := true

func _initialize() -> void:
	var scene := (load("res://scenes/KodawariMap.tscn") as PackedScene).instantiate()
	root.add_child(scene)
	_player = scene.get_node("Player") as CharacterBody2D

func _check(label: String, cond: bool, detail: String) -> void:
	if not cond:
		_ok = false
	print("%s %s | %s" % ["OK" if cond else "NG", label, detail])

func _process(_delta: float) -> bool:
	_frames += 1
	match _frames:
		5:
			Input.action_press("ui_right")   # 桟道(0,240)から右＝海へ 3 秒歩き続ける
		185:
			Input.action_release("ui_right")
			# 壁 x=30 - プレイヤー半幅 10 = x≈20 で止まるはず（素通りなら x≈470）
			_check("桟道から海へは出られない", _player.position.x < 25.0,
				"x = %.1f（期待 ≈20）" % _player.position.x)
			Input.action_press("ui_up")      # そのまま北＝島へ 4 秒
		425:
			Input.action_release("ui_up")
			# 桟道→島には入れるので y は大きく減っているはず
			_check("桟道から島へは歩ける", _player.position.y < 100.0,
				"y = %.1f（期待 < 100）" % _player.position.y)
			print("RESULT: ", "ALL OK" if _ok else "FAILED")
			return true
	return false
