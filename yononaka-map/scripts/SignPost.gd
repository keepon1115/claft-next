extends Area2D

const PANEL_X := 20.0
const PANEL_H := 120.0
const CTRL_H  := 220.0   # 操作エリア高さ

@export var message: String = ""

var _nearby:      bool = false
var _open:        bool = false
var _bubble:      Node2D
var _layer:       CanvasLayer
var _msg_lbl:     Label
var _sign_panel:  Panel
var _close_hint:  Label

func _ready() -> void:
	_build_collision()
	_build_visual()
	_build_bubble()
	_build_panel()
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	get_viewport().size_changed.connect(_reposition)
	_reposition()

func _reposition() -> void:
	var vp := get_viewport().get_visible_rect().size
	_sign_panel.position   = Vector2(PANEL_X, vp.y - CTRL_H - PANEL_H - 8)
	_sign_panel.size.x     = vp.x - PANEL_X * 2
	_close_hint.position.x = _sign_panel.size.x - 180

func _build_collision() -> void:
	var col   := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 44.0
	col.shape    = shape
	add_child(col)

func _build_visual() -> void:
	# 柱
	var post := Polygon2D.new()
	post.polygon = PackedVector2Array([-2, 0, 2, 0, 2, 22, -2, 22])
	post.color   = Color("#8B6347")
	add_child(post)
	# 板
	var board := Polygon2D.new()
	board.polygon = PackedVector2Array([-28, -24, 28, -24, 28, -2, -28, -2])
	board.color   = Color("#C8A46E")
	add_child(board)
	# 板の上縁
	var edge := Polygon2D.new()
	edge.polygon = PackedVector2Array([-28, -24, 28, -24, 28, -22, -28, -22])
	edge.color   = Color("#8B6347")
	add_child(edge)
	# 「？」マーク
	var lbl := Label.new()
	lbl.text     = "？"
	lbl.position = Vector2(-10, -22)
	lbl.size     = Vector2(20, 20)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", Color("#5C3A21"))
	add_child(lbl)

func _build_bubble() -> void:
	_bubble          = Node2D.new()
	_bubble.position = Vector2(18, -48)
	_bubble.visible  = false
	add_child(_bubble)

	var border := Polygon2D.new()
	border.polygon = PackedVector2Array([-16, -14, 16, -14, 16, 14, -16, 14])
	border.color   = Color("#2C2C2A")
	_bubble.add_child(border)

	var fill := Polygon2D.new()
	fill.polygon = PackedVector2Array([-14, -12, 14, -12, 14, 12, -14, 12])
	fill.color   = Color("#FFFFFF")
	_bubble.add_child(fill)

	var excl := Label.new()
	excl.text                 = "！"
	excl.size                 = Vector2(28, 24)
	excl.position             = Vector2(-14, -12)
	excl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	excl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	excl.add_theme_font_size_override("font_size", 16)
	excl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_bubble.add_child(excl)

func _build_panel() -> void:
	_layer       = CanvasLayer.new()
	_layer.layer  = 15
	_layer.visible = false
	add_child(_layer)

	_sign_panel          = Panel.new()
	var panel            := _sign_panel
	panel.position = Vector2(PANEL_X, 932)   # 仮値、_reposition で上書き
	panel.size     = Vector2(680, PANEL_H)
	var style      := StyleBoxFlat.new()
	style.bg_color                = Color("#FBF6E9")
	style.border_width_left       = 3
	style.border_width_right      = 3
	style.border_width_top        = 3
	style.border_width_bottom     = 3
	style.border_color            = Color("#2C2C2A")
	style.corner_radius_top_left     = 4
	style.corner_radius_top_right    = 4
	style.corner_radius_bottom_left  = 4
	style.corner_radius_bottom_right = 4
	panel.add_theme_stylebox_override("panel", style)
	_layer.add_child(panel)

	_msg_lbl                       = Label.new()
	_msg_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	_msg_lbl.horizontal_alignment  = HORIZONTAL_ALIGNMENT_CENTER
	_msg_lbl.vertical_alignment    = VERTICAL_ALIGNMENT_CENTER
	_msg_lbl.autowrap_mode         = TextServer.AUTOWRAP_WORD_SMART
	_msg_lbl.add_theme_font_size_override("font_size", 17)
	_msg_lbl.add_theme_color_override("font_color", Color("#2C2C2A"))
	panel.add_child(_msg_lbl)

	_close_hint               = Label.new()
	_close_hint.text          = "Enter で閉じる"
	_close_hint.position      = Vector2(500, 88)   # x は _reposition で上書き
	_close_hint.size          = Vector2(160, 20)
	_close_hint.add_theme_font_size_override("font_size", 11)
	_close_hint.add_theme_color_override("font_color", Color("#9A8A7A"))
	panel.add_child(_close_hint)

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("player"):
		_nearby = true
		if not _open:
			_bubble.visible = true

func _on_body_exited(body: Node) -> void:
	if body.is_in_group("player"):
		_nearby = false
		_bubble.visible = false

# キーボード処理は Input シングルトン経由（NPC.gd と同パターン）
func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("game_cancel") and _open:
		_close_panel()
		return
	if not Input.is_action_just_pressed("ui_accept"):
		return
	if _open:
		_close_panel()
	elif _nearby and not DialogueManager.is_active() and not MonsterManager.is_active():
		_open_panel()

func _open_panel() -> void:
	_msg_lbl.text   = message
	_layer.visible  = true
	_open           = true
	_bubble.visible = false

func _close_panel() -> void:
	_layer.visible  = false
	_open           = false
	_bubble.visible = _nearby
