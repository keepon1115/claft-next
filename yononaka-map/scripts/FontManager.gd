extends Node

# 日本語フォント適用。
# メイン手段: assets/fonts/default_theme.tres をプロジェクトテーマに登録（project.godot）。
# サブ手段: ThemeDB.fallback_font / fallback_font_size を同時に設定（二重保険）。
#
# default_theme.tres → project.godot [gui] theme/custom が正規の Godot 方式。
# これにより Label/Button 等すべての Control（Node2D 子含む）に確実に適用される。

func _ready() -> void:
	_register_actions()

	if not ResourceLoader.exists("res://assets/fonts/Japanese.ttf", "FontFile"):
		push_warning("FontManager: assets/fonts/Japanese.ttf が見つかりません")
		return

	var font := load("res://assets/fonts/Japanese.ttf") as FontFile
	ThemeDB.fallback_font      = font
	ThemeDB.fallback_font_size = 16
	print("[FontManager] 日本語フォントを適用しました")

# game_cancel をコードで登録（project.godot が上書きされても消えない）
func _register_actions() -> void:
	if not InputMap.has_action("game_cancel"):
		InputMap.add_action("game_cancel", 0.5)
		var ev := InputEventKey.new()
		ev.keycode = KEY_ESCAPE
		InputMap.action_add_event("game_cancel", ev)
