extends Node2D
## 広場（Main）の空気: ビネット + 桜の木から舞う花びら
## + V8: 道しるべと簡易全体マップ（M キー / MAP ボタン）

# 道しるべ（分岐点の方向看板）。文言・位置はここを編集するだけでよい
const WAYPOST_DEFS: Array = [
	{"pos": Vector2(56, 60), "arms": [
		{"dir": "up",   "text": "こだわりの里"},
		{"dir": "left", "text": "ラジオ塔"},
	]},
]

# 全体マップに描く内容。NPC・村人の位置は載せない
const MAP_MARKS: Array = [
	{"pos": Vector2(0, -370),    "text": "こだわりの里へ"},
	{"pos": Vector2(-330, 150),  "text": "ラジオ塔"},
	{"pos": Vector2(-200, -150), "text": "大きな木"},
]

func _ready() -> void:
	Atmosphere.add_vignette(self)

	for d: Dictionary in WAYPOST_DEFS:
		$Ground.add_child(Waypost.make(d["pos"] as Vector2, d["arms"] as Array, 0.8))
	OverviewMap.attach(self, _build_map_spec())

	# 桜の花びら（Sakura ノードの位置から舞い落ちる）
	var petals := CPUParticles2D.new()
	petals.position             = Vector2(-350, -85)
	petals.amount               = 10
	petals.lifetime             = 6.0
	petals.preprocess           = 6.0
	petals.emission_shape       = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	petals.emission_rect_extents = Vector2(26, 14)
	petals.direction            = Vector2(0.4, 1.0)
	petals.spread               = 30.0
	petals.gravity              = Vector2(6, 14)
	petals.initial_velocity_min = 4.0
	petals.initial_velocity_max = 10.0
	petals.scale_amount_min     = 1.0
	petals.scale_amount_max     = 2.0
	petals.color                = Color("#F4B8C8")
	# ひらひら感（ゆっくり回転 + 終端で薄く消える）
	petals.angular_velocity_min = -90.0
	petals.angular_velocity_max = 90.0
	var ramp := Gradient.new()
	ramp.set_color(0, Color("#F4B8C8"))
	ramp.set_color(1, Color(0.96, 0.72, 0.78, 0.0))
	petals.color_ramp = ramp
	add_child(petals)

func _build_map_spec() -> Dictionary:
	return {
		"title":      "ひろば",
		"world_rect": Rect2(-520, -420, 1040, 1040),
		"bg_color":   Color("#8FBF7E"),
		"areas": [
			# 中央の道
			{"points": PackedVector2Array([
				Vector2(-40, -400), Vector2(40, -400), Vector2(40, 400), Vector2(-40, 400),
			]), "color": Color("#D4B896")},
			# 北の門（こだわりの里への入口）
			{"points": PackedVector2Array([
				Vector2(-46, -401), Vector2(46, -401), Vector2(46, -365), Vector2(-46, -365),
			]), "color": Color("#C8A46E")},
		],
		"marks": MAP_MARKS,
	}
