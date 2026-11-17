extends Area2D
## ラジオ塔・展望台(11-E)。調べると選択肢UIが開き、外部リンクを新規タブで開く。
## リンクは data/radio_tower.json で管理(Godot再書き出しなしで増やせる…はJSONの性質上
## 書き出しに含まれるため厳密には再書き出しが必要だが、コード変更なしで済む)。
## URL自体は /perspectives と同じ出典(TBD-2確定後に両方へ反映)。

const DATA_PATH := "res://data/radio_tower.json"
const PANEL_X := 20.0
const CTRL_H := 220.0   # 操作エリア高さ(SignPost と同じ配置基準)

var _title: String = "ラジオ塔"
var _intro: String = ""
var _links: Array = []   # [{label, url}]

var _nearby: bool = false
var _open: bool = false
var _bubble: Node2D
var _layer: CanvasLayer
var _panel: Panel
var _blink_light: Polygon2D
var _blink_t: float = 0.0

func _ready() -> void:
	_load_data()
	_build_collision()
	_build_visual()
	_build_bubble()
	_build_panel()
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	get_viewport().size_changed.connect(_reposition)
	_reposition()

func _load_data() -> void:
	var file := FileAccess.open(DATA_PATH, FileAccess.READ)
	if file == null:
		push_warning("RadioTower: %s を開けませんでした" % DATA_PATH)
		return
	var data: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if not (data is Dictionary):
		push_warning("RadioTower: radio_tower.json のパースに失敗")
		return
	_title = str(data.get("title", _title))
	_intro = str(data.get("intro", ""))
	_links = data.get("links", [])

func _build_collision() -> void:
	var col := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 46.0
	col.shape = shape
	add_child(col)

# 鉄塔(トラス構造)+ アンテナ + 明滅する赤ランプ
func _build_visual() -> void:
	# 接地影
	var shadow := Polygon2D.new()
	var pts := PackedVector2Array()
	for i: int in 12:
		var a := float(i) * TAU / 12.0
		pts.append(Vector2(cos(a) * 22.0, sin(a) * 6.0))
	shadow.polygon = pts
	shadow.color = Color(0.08, 0.07, 0.05, 0.22)
	add_child(shadow)

	var steel := Color("#8A8A92")
	var dark := Color("#6A6A72")
	# 脚(左右のテーパー柱)
	_add_poly(PackedVector2Array([-16, 0, -12, 0, -3, -56, -6, -56]), steel)
	_add_poly(PackedVector2Array([12, 0, 16, 0, 6, -56, 3, -56]), steel)
	# 横桁
	_add_poly(PackedVector2Array([-13, -12, 13, -12, 13, -9, -13, -9]), dark)
	_add_poly(PackedVector2Array([-10, -28, 10, -28, 10, -25, -10, -25]), dark)
	_add_poly(PackedVector2Array([-7, -44, 7, -44, 7, -41, -7, -41]), dark)
	# 筋交い(X)
	_add_poly(PackedVector2Array([-13, -12, 10, -26, 10, -23, -13, -9]), dark)
	_add_poly(PackedVector2Array([13, -12, -10, -26, -10, -23, 13, -9]), dark)
	# 展望デッキ
	_add_poly(PackedVector2Array([-10, -60, 10, -60, 10, -54, -10, -54]), Color("#C8A46E"))
	_add_poly(PackedVector2Array([-10, -60, 10, -60, 10, -58, -10, -58]), Color("#8B6347"))
	# アンテナ
	_add_poly(PackedVector2Array([-1, -78, 1, -78, 1, -60, -1, -60]), dark)
	# 赤ランプ(明滅)
	_blink_light = Polygon2D.new()
	var lpts := PackedVector2Array()
	for i: int in 8:
		var a := float(i) * TAU / 8.0
		lpts.append(Vector2(cos(a), sin(a)) * 3.0)
	_blink_light.polygon = lpts
	_blink_light.color = Color("#FF4A4A")
	_blink_light.position = Vector2(0, -79)
	add_child(_blink_light)
	# 音符マーク(電波のかわりに音が流れているイメージ)
	var note := Label.new()
	note.text = "♪"
	note.position = Vector2(6, -76)
	note.size = Vector2(16, 16)
	note.add_theme_font_size_override("font_size", 11)
	note.add_theme_color_override("font_color", Color("#5C3A21"))
	add_child(note)

func _add_poly(pts: PackedVector2Array, col: Color) -> void:
	var p := Polygon2D.new()
	p.polygon = pts
	p.color = col
	add_child(p)

func _build_bubble() -> void:
	_bubble = Node2D.new()
	_bubble.position = Vector2(20, -92)
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

	var excl := Label.new()
	excl.text = "！"
	excl.size = Vector2(28, 24)
	excl.position = Vector2(-14, -12)
	excl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	excl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	excl.add_theme_font_size_override("font_size", 16)
	excl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_bubble.add_child(excl)

# 選択肢パネル(タイトル + リンクボタン + とじる)
func _build_panel() -> void:
	_layer = CanvasLayer.new()
	_layer.layer = 15
	_layer.visible = false
	add_child(_layer)

	_panel = Panel.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#FBF6E9")
	style.border_width_left = 3
	style.border_width_right = 3
	style.border_width_top = 3
	style.border_width_bottom = 3
	style.border_color = Color("#2C2C2A")
	style.corner_radius_top_left = 4
	style.corner_radius_top_right = 4
	style.corner_radius_bottom_left = 4
	style.corner_radius_bottom_right = 4
	_panel.add_theme_stylebox_override("panel", style)
	_layer.add_child(_panel)

	var vbox := VBoxContainer.new()
	vbox.name = "VBox"
	vbox.position = Vector2(16, 12)
	vbox.add_theme_constant_override("separation", 8)
	_panel.add_child(vbox)

	var title := Label.new()
	title.text = "📡 " + _title
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color("#2C2C2A"))
	vbox.add_child(title)

	if _intro != "":
		var intro := Label.new()
		intro.text = _intro
		intro.add_theme_font_size_override("font_size", 12)
		intro.add_theme_color_override("font_color", Color("#9A8A7A"))
		vbox.add_child(intro)

	for link: Variant in _links:
		if not (link is Dictionary):
			continue
		var url := str(link.get("url", ""))
		var btn := _make_button(str(link.get("label", url)))
		btn.pressed.connect(func() -> void:
			ClaftBridge.open_url(url)
			_close_panel())
		vbox.add_child(btn)

	var close_btn := _make_button("✖ とじる")
	close_btn.pressed.connect(_close_panel)
	vbox.add_child(close_btn)

func _make_button(text: String) -> Button:
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(0, 40)   # タップしやすい高さ
	btn.add_theme_font_size_override("font_size", 15)
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#FFFFFF")
	normal.border_width_left = 2
	normal.border_width_right = 2
	normal.border_width_top = 2
	normal.border_width_bottom = 2
	normal.border_color = Color("#2C2C2A")
	normal.corner_radius_top_left = 4
	normal.corner_radius_top_right = 4
	normal.corner_radius_bottom_left = 4
	normal.corner_radius_bottom_right = 4
	btn.add_theme_stylebox_override("normal", normal)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#F0E6CE")
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", hover)
	btn.add_theme_color_override("font_color", Color("#2C2C2A"))
	btn.add_theme_color_override("font_hover_color", Color("#2C2C2A"))
	btn.add_theme_color_override("font_pressed_color", Color("#2C2C2A"))
	return btn

func _reposition() -> void:
	var vp := get_viewport().get_visible_rect().size
	# ボタン数に応じた高さ(タイトル+intro+ボタン群+余白)
	var h := 60.0 + float(_links.size() + 1) * 48.0
	_panel.size = Vector2(vp.x - PANEL_X * 2, h)
	_panel.position = Vector2(PANEL_X, vp.y - CTRL_H - h - 8)
	var vbox := _panel.get_node("VBox") as VBoxContainer
	vbox.size = Vector2(_panel.size.x - 32, h - 24)

func _process(delta: float) -> void:
	# 赤ランプの明滅
	_blink_t += delta
	_blink_light.color.a = 0.35 + 0.65 * (0.5 + 0.5 * sin(_blink_t * 3.0))

	if Input.is_action_just_pressed("game_cancel") and _open:
		_close_panel()
		return
	if not Input.is_action_just_pressed("ui_accept"):
		return
	if not _open and _nearby and not DialogueManager.is_active() \
			and not MonsterManager.is_active() and not ChiefManager.is_active():
		_open_panel()

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("player"):
		_nearby = true
		if not _open:
			_bubble.visible = true

func _on_body_exited(body: Node) -> void:
	if body.is_in_group("player"):
		_nearby = false
		_bubble.visible = false

func _open_panel() -> void:
	_layer.visible = true
	_open = true
	_bubble.visible = false

func _close_panel() -> void:
	_layer.visible = false
	_open = false
	_bubble.visible = _nearby
