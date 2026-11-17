# 撮影用ユーティリティ（開発時のみ使用）
# 使い方:
#   godot --path . -s tools/screenshot.gd                    → KodawariMap を撮影
#   godot --path . -s tools/screenshot.gd -- main            → Main を撮影
#   godot --path . -s tools/screenshot.gd -- main at=-300,-40 → プレイヤーを指定位置に置いて撮影
#   godot --path . -s tools/screenshot.gd -- map             → 全体マップ（V8）を開いて撮影
# 出力: exports/shot_<scene>_near.png / _far.png
# OS ウィンドウのサイズに左右されないよう、オフスクリーンの SubViewport に描画する。
extends SceneTree

const SIZE := Vector2i(720, 1280)

var _frames := 0
var _scene_name := "kodawari"
var _at := Vector2.INF   # INF = 移動しない
var _open_map := false
var _vp: SubViewport

func _initialize() -> void:
	for a: String in OS.get_cmdline_user_args():
		if a == "main":
			_scene_name = "main"
		elif a == "map":
			_open_map = true
		elif a.begins_with("at="):
			var p := a.substr(3).split(",")
			if p.size() == 2:
				_at = Vector2(float(p[0]), float(p[1]))
	_vp = SubViewport.new()
	_vp.size = SIZE
	_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(_vp)
	var path := "res://scenes/Main.tscn" if _scene_name == "main" else "res://scenes/KodawariMap.tscn"
	var scene := (load(path) as PackedScene).instantiate()
	_vp.add_child(scene)

func _process(_delta: float) -> bool:
	_frames += 1
	if _frames == 5 and _at != Vector2.INF:
		var cam := _vp.get_camera_2d()
		if cam:
			(cam.get_parent() as Node2D).position = _at
			cam.reset_smoothing()   # カメラを即座に追従させる
	if _frames == 10 and _open_map:
		for c: Node in _vp.get_child(0).get_children():
			if c is OverviewMap:
				(c as OverviewMap)._toggle()
	if _frames == 30:
		_save("near")
		var cam := _vp.get_camera_2d()
		if cam:
			cam.zoom = Vector2(1.4, 1.4)
			cam.position_smoothing_enabled = false
	if _frames == 45:
		_save("far")
		return true
	return false

func _save(suffix: String) -> void:
	var img := _vp.get_texture().get_image()
	var out := "res://exports/shot_%s_%s.png" % [_scene_name, suffix]
	img.save_png(ProjectSettings.globalize_path(out))
	print("saved: ", out)
