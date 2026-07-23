extends Node2D

const NPCScene     := preload("res://scenes/NPC.tscn")
const MonsterScene := preload("res://scenes/Monster.tscn")

# ── アセットパス（assets/tiles/ に PNG を置くと自動適用）────────────────────
const PLATFORM_TILE := "res://assets/tiles/platform.png"
const WATER_SHADER  := "res://shaders/water.gdshader"
const SEA_FALLBACK  := Color("#3F80AD")
const CLIFF_H       := 18.0   # 島の崖側面の高さ（浮島の立体感）

# ── 島定義 ────────────────────────────────────────────────────────────────────
#
#  y=-330  背景上端
#  │  Zone4(-300,-130) Zone6(0,-130) Zone5(300,-130)  ← ROW2
#  │  │のれん           │石の門        │桟橋
#  │  Zone1(-300, 90)  Zone3(0, 90)  Zone2(300, 90)  ← ROW1
#  │        └── 木の渡り廊下 ──┴─── 石橋 ───┘
#  │  [案内看板]  [入口 y=310]
#  y=370  背景下端
#
const IW    := 200.0   # 島の幅
const IH    := 140.0   # 島の高さ
const ICH   := 18.0    # 角チャンファ
const ROW1Y :=  90.0   # 下段の島の y 中心
const ROW2Y := -130.0  # 上段の島の y 中心
const COL_L := -300.0  # 左列の x 中心
const COL_C :=    0.0  # 中列
const COL_R :=  300.0  # 右列

const ZONE_DEFS: Dictionary = {
	"zone_power": {
		"name": "だれかの力に",   "color": Color("#E8935A"),
		"cx": COL_L, "cy": ROW1Y, "npc_pos": Vector2(COL_L, ROW1Y),
		"label_col": Color("#2C2C2A"), "deco": "kamado",
		"tile": "res://assets/tiles/zone_power.png",
	},
	"zone_craft": {
		"name": "技を極める職人", "color": Color("#5A8FAA"),
		"cx": COL_R, "cy": ROW1Y, "npc_pos": Vector2(COL_R, ROW1Y),
		"label_col": Color("#FFFFFF"), "deco": "workbench",
		"tile": "res://assets/tiles/zone_craft.png",
	},
	"zone_challenge": {
		"name": "あたらしいこと挑戦", "color": Color("#7BC47B"),
		"cx": COL_C, "cy": ROW1Y, "npc_pos": Vector2(COL_C, ROW1Y),
		"label_col": Color("#2C2C2A"), "deco": "flag",
		"tile": "res://assets/tiles/zone_challenge.png",
	},
	"zone_family": {
		"name": "家族・地元",     "color": Color("#D4B896"),
		"cx": COL_L, "cy": ROW2Y, "npc_pos": Vector2(COL_L, ROW2Y),
		"label_col": Color("#2C2C2A"), "deco": "house",
		"tile": "res://assets/tiles/zone_family.png",
	},
	"zone_free": {
		"name": "自由なくらし",   "color": Color("#87CEEB"),
		"cx": COL_R, "cy": ROW2Y, "npc_pos": Vector2(COL_R, ROW2Y),
		"label_col": Color("#2C2C2A"), "deco": "palm",
		"tile": "res://assets/tiles/zone_free.png",
	},
	"zone_stable": {
		"name": "安定",           "color": Color("#4A7A5A"),
		"cx": COL_C, "cy": ROW2Y, "npc_pos": Vector2(COL_C, ROW2Y),
		"label_col": Color("#E8F0E8"), "deco": "stone",
		"tile": "res://assets/tiles/zone_stable.png",
	},
}

# ── NPC ───────────────────────────────────────────────────────────────────────
# 外見は assets/characters/<npc_id>/ のスプライトを NPC.gd が自動で読む
# （フォルダが無い村人は汎用村人 _default になる）
const NPC_ZONE_CANDIDATES: Dictionary = {
	"zeroichi": ["zone_power",     "zone_family"   ],
	"takeshi":  ["zone_craft",     "zone_challenge"],
	"takuya":   ["zone_challenge", "zone_craft"    ],
	"tsukasa":  ["zone_craft",     "zone_power"    ],
	"nanae":    ["zone_craft",     "zone_power"    ],
	"yusuke":   ["zone_challenge", "zone_power"    ],
}
const NPC_ORDER: Array = ["zeroichi", "takeshi", "takuya", "tsukasa", "nanae", "yusuke"]
const ALL_ZONES: Array = ["zone_power", "zone_craft", "zone_challenge",
                           "zone_family", "zone_free", "zone_stable"]

# ── アニメーション ─────────────────────────────────────────────────────────────
var _anim_t:    float = 0.0
var _steam_data: Array = []  # {nodes, times, base}
var _grass_data: Array = []  # {node, phase}
var _light_data: Array = []  # {node, base, phase} 灯りのゆらぎ

# ─────────────────────────────────────────────────────────────────────────────

func _ready() -> void:
	var cam := get_node_or_null("Player/Camera2D")
	if cam:
		cam.zoom         = Vector2(2.0, 2.0)
		cam.limit_left   = -520
		cam.limit_right  =  520
		cam.limit_top    = -330
		cam.limit_bottom =  370
	_draw_terrain()
	_draw_decorations()
	_place_wayposts()
	_build_walk_bounds()
	_spawn_actors()
	# 光と空気
	Atmosphere.add_vignette(self)
	add_child(Atmosphere.make_fireflies(Vector2(0, 20), Vector2(500, 330), 24))
	# V8: M キー / MAP ボタンの簡易全体マップ
	OverviewMap.attach(self, _build_map_spec())

func _process(delta: float) -> void:
	_anim_t += delta
	# 灯りのゆらぎ（周波数の違う2つの sin を重ねて炎らしく）
	for d: Dictionary in _light_data:
		var l := d["node"] as PointLight2D
		l.energy = float(d["base"]) * (1.0
			+ 0.08 * sin(_anim_t * 9.0 + float(d["phase"]))
			+ 0.05 * sin(_anim_t * 23.0 + float(d["phase"]) * 1.7))
	for d: Dictionary in _grass_data:
		d["node"].rotation = sin(_anim_t * 1.8 + float(d["phase"])) * 0.06
	const PERIOD := 2.2
	for d: Dictionary in _steam_data:
		var ns: Array  = d["nodes"]
		var ts: Array  = d["times"]
		var bs: Array  = d["base"]
		for i: int in ns.size():
			ts[i] = fmod(float(ts[i]) + delta, PERIOD)
			var t: float = float(ts[i]) / PERIOD
			ns[i].position.y = float(bs[i].y) - t * 12.0
			ns[i].color      = Color(1.0, 1.0, 1.0, 0.5 * (1.0 - t))

# ============================================================
# 描画ヘルパー
# ============================================================
func _load_tex(path: String) -> Texture2D:
	if path != "" and ResourceLoader.exists(path, "Texture2D"):
		return load(path) as Texture2D
	return null

func _poly(parent: Node2D, pts: PackedVector2Array, col: Color) -> Polygon2D:
	var p := Polygon2D.new()
	p.polygon = pts
	p.color   = col
	parent.add_child(p)
	return p

func _rect(parent: Node2D, x: float, y: float, w: float, h: float, col: Color) -> void:
	_poly(parent, PackedVector2Array([
		Vector2(x, y), Vector2(x+w, y), Vector2(x+w, y+h), Vector2(x, y+h)
	]), col)

func _lbl(parent: Node2D, text: String, pos: Vector2, fsize: int, col: Color, w: float = 220) -> void:
	var l := Label.new()
	l.text     = text
	l.position = pos
	l.size     = Vector2(w, 22)
	l.add_theme_font_size_override("font_size", fsize)
	l.add_theme_color_override("font_color", col)
	parent.add_child(l)

# 8角形（島の形）
func _octagon(cx: float, cy: float, w: float, h: float, ch: float) -> PackedVector2Array:
	var hw := w / 2.0
	var hh := h / 2.0
	return PackedVector2Array([
		Vector2(cx - hw + ch, cy - hh), Vector2(cx + hw - ch, cy - hh),
		Vector2(cx + hw, cy - hh + ch), Vector2(cx + hw, cy + hh - ch),
		Vector2(cx + hw - ch, cy + hh), Vector2(cx - hw + ch, cy + hh),
		Vector2(cx - hw, cy + hh - ch), Vector2(cx - hw, cy - hh + ch),
	])

# 浮島を描く: 水面の影 → 崖側面（地層の縞つき）→ 縁取り → 上面 → 上縁ハイライト
func _island_base(parent: Node2D, cx: float, cy: float, w: float, h: float,
		ch: float, cliff_h: float, tex_path: String, fallback: Color) -> void:
	var hw := w / 2.0
	var hh := h / 2.0
	# 水面に落ちる影
	_poly(parent, _octagon(cx + 5, cy + cliff_h + 7, w + 8, h + 8, ch + 2),
		Color(0.04, 0.13, 0.22, 0.28))
	# 崖の側面（下半分の輪郭を下方向に押し出す）
	var p_r  := Vector2(cx + hw, cy + hh - ch)
	var p_br := Vector2(cx + hw - ch, cy + hh)
	var p_bl := Vector2(cx - hw + ch, cy + hh)
	var p_l  := Vector2(cx - hw, cy + hh - ch)
	var dn   := Vector2(0, cliff_h)
	_poly(parent, PackedVector2Array([
		p_l, p_bl, p_br, p_r, p_r + dn, p_br + dn, p_bl + dn, p_l + dn,
	]), Color("#8A6248"))
	# 地層の縞
	if cliff_h >= 12.0:
		for o: float in [6.0, 11.0]:
			var d1 := Vector2(0, o)
			var d2 := Vector2(0, o + 1.5)
			_poly(parent, PackedVector2Array([
				p_l + d1, p_bl + d1, p_br + d1, p_r + d1,
				p_r + d2, p_br + d2, p_bl + d2, p_l + d2,
			]), Color("#75503A"))
	# 崖下端の暗いリム
	var rim := Vector2(0, cliff_h - 3.0)
	_poly(parent, PackedVector2Array([
		p_l + rim, p_bl + rim, p_br + rim, p_r + rim,
		p_r + dn, p_br + dn, p_bl + dn, p_l + dn,
	]), Color("#5E3F2D"))
	# 上面の縁取り
	_poly(parent, _octagon(cx, cy, w + 4, h + 4, ch + 1), fallback.darkened(0.22))
	# 上面（テクスチャ or 単色）
	var pts := _octagon(cx, cy, w, h, ch)
	var p   := Polygon2D.new()
	p.polygon = pts
	var tex  := _load_tex(tex_path)
	if tex:
		p.texture        = tex
		p.uv             = pts
		p.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	else:
		p.color = fallback
	parent.add_child(p)
	# 奥側の上縁にうっすらハイライト（日の当たる縁）
	_poly(parent, PackedVector2Array([
		Vector2(cx - hw, cy - hh + ch), Vector2(cx - hw + ch, cy - hh),
		Vector2(cx + hw - ch, cy - hh), Vector2(cx + hw, cy - hh + ch),
		Vector2(cx + hw, cy - hh + ch + 2), Vector2(cx + hw - ch, cy - hh + 2),
		Vector2(cx - hw + ch, cy - hh + 2), Vector2(cx - hw, cy - hh + ch + 2),
	]), Color(1, 1, 1, 0.14))

func _island(parent: Node2D, cx: float, cy: float, tex_path: String, fallback: Color) -> void:
	_island_base(parent, cx, cy, IW, IH, ICH, CLIFF_H, tex_path, fallback)

# 海に点在する小島（草を1株のせる土台）
func _islet(parent: Node2D, x: float, y: float) -> void:
	_island_base(parent, x, y, 34.0, 22.0, 6.0, 8.0, "", Color("#8FBF7E"))

# 海全体（シェーダーでアニメする水面）
func _draw_sea(parent: Node2D) -> void:
	var pts := PackedVector2Array([
		Vector2(-520, -330), Vector2(520, -330),
		Vector2(520, 370),   Vector2(-520, 370),
	])
	var sea := Polygon2D.new()
	sea.polygon = pts
	sea.color   = SEA_FALLBACK
	if ResourceLoader.exists(WATER_SHADER, "Shader"):
		var mat := ShaderMaterial.new()
		mat.shader   = load(WATER_SHADER) as Shader
		sea.material = mat
	parent.add_child(sea)

# 木の桟道（落ち影つき・横板張り）
func _plank_path(parent: Node2D, x: float, y: float, w: float, h: float) -> void:
	_rect(parent, x + 4, y + 6, w, h, Color(0.04, 0.13, 0.22, 0.20))
	_rect(parent, x, y, w, h, Color("#9B7A55"))
	for i: int in int(h / 7.0):
		_rect(parent, x, y + float(i) * 7.0 + 5.0, w, 1.5, Color("#7A5A3A"))
	_rect(parent, x, y, 2, h, Color("#7A5A3A"))
	_rect(parent, x + w - 2, y, 2, h, Color("#7A5A3A"))

# ============================================================
# 歩行制限（海に出られないようにする）
# ============================================================
# 歩ける領域（島・橋・桟道・ドック）のポリゴンを 1 つに結合し、
# その輪郭を Segments モードの CollisionPolygon2D にして壁にする。
# 通路の当たり判定は見た目より広め（プレイヤー幅 20px が引っかからないように）。

func _build_walk_bounds() -> void:
	# つながる順に並べる（各要素は必ずそれまでの結合領域と重なること）
	var parts: Array = [
		_octagon(COL_L, ROW1Y, IW, IH, ICH),     # zone_power
		_rect_pts(COL_L - 20, -64, 40, 88),      # のれんの渡し
		_octagon(COL_L, ROW2Y, IW, IH, ICH),     # zone_family
		_rect_pts(-208, 70, 116, 40),            # 丸太橋
		_octagon(COL_C, ROW1Y, IW, IH, ICH),     # zone_challenge
		_rect_pts(COL_C - 20, -64, 40, 88),      # 石の門の道
		_octagon(COL_C, ROW2Y, IW, IH, ICH),     # zone_stable
		_rect_pts(92, 70, 116, 40),              # 石橋
		_octagon(COL_R, ROW1Y, IW, IH, ICH),     # zone_craft
		_rect_pts(COL_R - 20, -64, 40, 88),      # 桟橋
		_octagon(COL_R, ROW2Y, IW, IH, ICH),     # zone_free
		_rect_pts(-30, 156, 60, 98),             # 入口の桟道
		_octagon(0.0, 285.0, 150.0, 86.0, 14.0), # 入口ドック
	]

	var outer: PackedVector2Array = parts[0]
	var holes: Array = []
	for i: int in range(1, parts.size()):
		var res := Geometry2D.merge_polygons(outer, parts[i])
		var outers: Array = []
		for loop: PackedVector2Array in res:
			if Geometry2D.is_polygon_clockwise(loop):
				holes.append(loop)   # 時計回り = 囲まれた穴（そこも壁にする）
			else:
				outers.append(loop)
		if outers.size() != 1:
			# 領域がつながっていない＝レイアウト変更時の入れ忘れ。大きい輪郭で続行
			push_warning("WalkBounds: parts[%d] が他の領域と接続していません" % i)
			outers.sort_custom(func(a: PackedVector2Array, b: PackedVector2Array) -> bool:
				return a.size() > b.size())
		outer = outers[0]

	var body := StaticBody2D.new()
	body.name = "WalkBounds"
	add_child(body)
	for loop: PackedVector2Array in [outer] + holes:
		var col := CollisionPolygon2D.new()
		col.build_mode = CollisionPolygon2D.BUILD_SEGMENTS
		col.polygon    = loop
		body.add_child(col)

func _rect_pts(x: float, y: float, w: float, h: float) -> PackedVector2Array:
	return PackedVector2Array([
		Vector2(x, y), Vector2(x + w, y), Vector2(x + w, y + h), Vector2(x, y + h),
	])

# 島の入口看板（島の下端）
func _island_sign(parent: Node2D, cx: float, bottom_y: float,
                  name_text: String, label_col: Color) -> void:
	# 柱
	_rect(parent, cx - 2, bottom_y - 14, 4, 14, Color("#8B6347"))
	# 板（広め・フォント大きく鮮明に）
	_rect(parent, cx - 66, bottom_y - 42, 132, 30, Color("#C8A46E"))
	_rect(parent, cx - 66, bottom_y - 42, 132,  3, Color("#8B6347"))
	# テキスト中央寄せ
	var l := Label.new()
	l.text                 = name_text
	l.position             = Vector2(cx - 65, bottom_y - 40)
	l.size                 = Vector2(130, 26)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	l.add_theme_font_size_override("font_size", 13)
	l.add_theme_color_override("font_color", label_col)
	parent.add_child(l)

# ============================================================
# 地形描画
# ============================================================
func _draw_terrain() -> void:
	var g := $Ground

	# 海（最背面）。奥の島 → 手前の島の順で重ねる
	_draw_sea(g)

	# ── ROW2 の島（奥の段）──────────────────────────────────────────
	for zone_key: String in ["zone_family", "zone_stable", "zone_free"]:
		var d: Dictionary = ZONE_DEFS[zone_key]
		var cx := float(d["cx"])
		var cy := float(d["cy"])
		_island(g, cx, cy, str(d["tile"]), d["color"] as Color)
		_island_sign(g, cx, cy + IH / 2.0, str(d["name"]), d["label_col"] as Color)

	# ── 縦コネクタ（ROW2 の崖の手前に架かる渡し）────────────────────
	# のれん（Zone1→Zone4）: 木の渡し板 + 赤い布を3枚吊るす
	_plank_path(g, COL_L - 12, -60, 24, 80)
	_rect(g, COL_L - 30, -60, 60,  4, Color("#5C3A21"))
	for i: int in 3:
		var sx := COL_L - 24.0 + float(i) * 20.0
		_rect(g, sx,     -56, 15, 56, Color("#C44A4A"))
		_rect(g, sx + 6, -56,  3, 56, Color("#A03838"))
		_rect(g, sx,       0, 15,  4, Color("#A03838"))
	# 石の門（Zone3→Zone6）: 石板の道 + 左右の門柱＋冠石
	_rect(g, COL_C - 8, -54, 16, 74, Color(0.04, 0.13, 0.22, 0.20))
	_rect(g, COL_C - 12, -60, 24, 80, Color("#9E9E9E"))
	for i: int in 11:
		_rect(g, COL_C - 12, -60.0 + float(i) * 7.0, 24, 1.5, Color("#7E7E7E"))
	_rect(g, COL_C - 30, -60, 10, 80, Color("#888888"))
	_rect(g, COL_C + 20, -60, 10, 80, Color("#888888"))
	for i: int in 4:
		_rect(g, COL_C - 30, -60.0 + float(i) * 20.0, 10, 2, Color("#666666"))
		_rect(g, COL_C + 20, -60.0 + float(i) * 20.0, 10, 2, Color("#666666"))
	_rect(g, COL_C - 34, -68, 68, 12, Color("#7A7A7A"))
	_rect(g, COL_C - 34, -68, 68,  3, Color("#AAAAAA"))
	# 桟橋（Zone2→Zone5）: 横板＋左右支柱
	_plank_path(g, COL_R - 10, -60, 20, 80)
	_rect(g, COL_R - 14, -40, 4, 60, Color("#6B4A30"))
	_rect(g, COL_R + 10, -40, 4, 60, Color("#6B4A30"))

	# ── ROW1 の島（手前の段）────────────────────────────────────────
	for zone_key: String in ["zone_power", "zone_challenge", "zone_craft"]:
		var d: Dictionary = ZONE_DEFS[zone_key]
		var cx := float(d["cx"])
		var cy := float(d["cy"])
		_island(g, cx, cy, str(d["tile"]), d["color"] as Color)
		_island_sign(g, cx, cy + IH / 2.0, str(d["name"]), d["label_col"] as Color)

	# ── ROW1 横コネクタ（島と島をつなぐ橋）──────────────────────────
	# 木の渡り廊下（丸太橋）
	_rect(g, -196, 76, 100, 40, Color(0.04, 0.13, 0.22, 0.20))
	_rect(g, -200, 70, 100, 40, Color("#8B6347"))
	for i: int in 11:
		_rect(g, -200.0 + float(i) * 10.0, 70, 1.5, 40, Color("#6B4A30"))
	_rect(g, -200, 70,  100, 3, Color("#6B4A30"))
	_rect(g, -200, 107, 100, 3, Color("#6B4A30"))
	# 石橋（石畳）
	_rect(g, 104, 76, 100, 40, Color(0.04, 0.13, 0.22, 0.20))
	_rect(g, 100, 70, 100, 40, Color("#9A9A9A"))
	for i: int in 7:
		_rect(g, 100.0 + float(i) * 16.0, 70, 2, 40, Color("#777777"))
	_rect(g, 100, 89,  100, 2, Color("#777777"))
	_rect(g, 100, 70,  100, 2, Color("#CCCCCC"))
	_rect(g, 100, 108, 100, 2, Color("#CCCCCC"))

	# ── 入口ドック（小島）と桟道 ─────────────────────────────────────
	_island_base(g, 0.0, 285.0, 150.0, 86.0, 14.0, 14.0, PLATFORM_TILE, Color("#C8D89E"))
	_plank_path(g, -30, 160, 60, 90)   # zone_challenge 南端 → ドック
	# 鳥居（入口ゲート）+ 灯り
	_deco_shadow(g, Vector2(0, 254), 30, 6)
	var torii := _deco_sprite(g, "torii", Vector2(0, 254))
	if torii:
		torii.scale = Vector2(2, 2)   # 16px 世界に合わせて整数倍拡大
	var gate_glow := Atmosphere.make_glow(Color("#FFC070"), 60.0, 0.65)
	gate_glow.position = Vector2(0, 232)
	g.add_child(gate_glow)
	_light_data.append({"node": gate_glow, "base": 0.65, "phase": 2.1})
	# 案内板は V8 の道しるべ（_place_wayposts）に統合

	# ── 海に点在する小島＋揺れる草 ───────────────────────────────────
	var islet_spots: Array = [
		Vector2(-430, 200), Vector2(-450, 140), Vector2(-410, 260),
		Vector2( 420, 200), Vector2( 440, 140), Vector2( 410, 260),
		Vector2(-430,  30), Vector2( 430,  30), Vector2(-430, -30),
		Vector2( 430, -30), Vector2(-430,-270), Vector2( 430,-270),
		Vector2(-150, 220), Vector2( 160, 225), Vector2(  95, 232),
		Vector2(-200,-280), Vector2( 200,-280), Vector2(  50,-280),
	]
	for sp: Vector2 in islet_spots:
		_islet(g, sp.x, sp.y)
		_add_swaying_grass(g, sp.x, sp.y)

# ============================================================
# 飾り物（島ごとの造形・Ninja Adventure のスプライト）
# ============================================================
const OBJ_DIR := "res://assets/objects/"

func _draw_decorations() -> void:
	var g := $Ground
	for zone_key: String in ZONE_DEFS:
		var d: Dictionary = ZONE_DEFS[zone_key]
		var cx := float(d["cx"])
		var cy := float(d["cy"])
		match str(d["deco"]):
			"kamado":    _deco_kamado(g,    Vector2(cx + 52, cy + 26))
			"workbench": _deco_workbench(g, Vector2(cx - 52, cy - 14))
			"flag":      _deco_flag(g,      Vector2(cx + 62, cy - 14))
			"house":     _deco_house(g,     Vector2(cx + 46, cy + 4))
			"palm":      _deco_palm(g,      Vector2(cx - 50, cy + 34))
			"stone":     _deco_stone(g,     Vector2(cx + 52, cy + 2))

# 接地点 pos に底辺中央を合わせてスプライトを置く
func _deco_sprite(parent: Node2D, sprite_name: String, pos: Vector2) -> Sprite2D:
	var tex := _load_tex(OBJ_DIR + sprite_name + ".png")
	if tex == null:
		push_warning("deco '%s' のテクスチャがありません" % sprite_name)
		return null
	var spr := Sprite2D.new()
	spr.texture  = tex
	spr.position = pos
	spr.offset   = Vector2(0, -tex.get_height() / 2.0)
	parent.add_child(spr)
	return spr

# 接地点の楕円影
func _deco_shadow(parent: Node2D, pos: Vector2, rx: float, ry: float) -> void:
	var pts := PackedVector2Array()
	for i: int in 12:
		var a := float(i) * TAU / 12.0
		pts.append(Vector2(cos(a) * rx, sin(a) * ry))
	var p := Polygon2D.new()
	p.polygon  = pts
	p.color    = Color(0.08, 0.07, 0.05, 0.22)
	p.position = pos - Vector2(0, 1)
	parent.add_child(p)

# かまど（Zone1 だれかの力に）: ドーム窯 + 煙突の湯気 + 炎の灯り
func _deco_kamado(parent: Node2D, pos: Vector2) -> void:
	_deco_shadow(parent, pos, 24, 6)
	_deco_sprite(parent, "kamado", pos)
	var glow := Atmosphere.make_glow(Color("#FF9A50"), 70.0, 0.9)
	glow.position = pos + Vector2(0, -16)
	parent.add_child(glow)
	_light_data.append({"node": glow, "base": 0.9, "phase": 0.0})
	var steam_base: Array = [
		Vector2(pos.x - 3, pos.y - 62),
		Vector2(pos.x + 2, pos.y - 64),
		Vector2(pos.x - 1, pos.y - 60),
	]
	var nodes: Array = []
	var times: Array = [0.0, 0.8, 1.5]
	for i: int in 3:
		var c := Polygon2D.new()
		c.polygon  = _circle_pts(3.5, 8)
		c.color    = Color(1, 1, 1, 0.5)
		c.position = steam_base[i]
		parent.add_child(c)
		nodes.append(c)
	_steam_data.append({"nodes": nodes, "times": times, "base": steam_base})

# 作業台（Zone2 技を極める職人）: 道具つきテーブル
func _deco_workbench(parent: Node2D, pos: Vector2) -> void:
	_deco_shadow(parent, pos, 24, 6)
	_deco_sprite(parent, "workbench", pos)

# 旗（Zone3 あたらしいこと挑戦）: ポール + はためく旗（4コマアニメ）
func _deco_flag(parent: Node2D, pos: Vector2) -> void:
	_rect(parent, pos.x - 1.5, pos.y - 38, 3, 38, Color("#8B8B8B"))
	_poly(parent, _circle_pts(2.5, 8), Color("#F5C518"))
	var tip := parent.get_child(parent.get_child_count() - 1) as Polygon2D
	tip.position = Vector2(pos.x, pos.y - 38)
	var tex := _load_tex(OBJ_DIR + "flag_red.png")
	if tex == null:
		return
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("wave")
	frames.set_animation_speed("wave", 6.0)
	frames.set_animation_loop("wave", true)
	for i: int in int(tex.get_width() / 16.0):
		var at := AtlasTexture.new()
		at.atlas  = tex
		at.region = Rect2(i * 16, 0, 16, 16)
		frames.add_frame("wave", at)
	var spr := AnimatedSprite2D.new()
	spr.sprite_frames = frames
	spr.position      = Vector2(pos.x + 9, pos.y - 30)
	spr.play("wave")
	parent.add_child(spr)

# 小屋（Zone4 家族・地元）: 茅葺きの家
func _deco_house(parent: Node2D, pos: Vector2) -> void:
	_deco_shadow(parent, pos, 32, 7)
	_deco_sprite(parent, "house", pos)

# ヤシの木（Zone5 自由なくらし）
func _deco_palm(parent: Node2D, pos: Vector2) -> void:
	_deco_shadow(parent, pos, 22, 6)
	_deco_sprite(parent, "palm", pos)

# 石像（Zone6 安定）: 苔むした一つ目像 + カエル
func _deco_stone(parent: Node2D, pos: Vector2) -> void:
	_deco_shadow(parent, pos, 16, 5)
	_deco_sprite(parent, "statue_oneeye", pos)
	_deco_shadow(parent, pos + Vector2(-30, 4), 13, 4)
	_deco_sprite(parent, "statue_frog", pos + Vector2(-30, 4))

# ============================================================
# V8: 道しるべ（分岐点の方向看板）と簡易全体マップ
# ============================================================
# 分岐点に置く道しるべ。文言・位置はここを編集するだけでよい
# （矢印は実際に歩ける方向だけを指す: ROW2 の島同士は直接つながっていない）
const WAYPOST_DEFS: Array = [
	# 入口ドック（鳥居の下、島に上がる前に全体の向きが分かる）
	{"pos": Vector2(-40, 305), "arms": [
		{"dir": "up",   "text": "こだわりの里"},
		{"dir": "down", "text": "広場へもどる"},
	]},
	# 挑戦の島・左手の空き地（里の十字路。石の門を隠さない位置）
	{"pos": Vector2(-48, 104), "arms": [
		{"dir": "up",    "text": "安定"},
		{"dir": "left",  "text": "だれかの力に"},
		{"dir": "right", "text": "技を極める職人"},
	]},
	# だれかの力に・のれんの渡しの前
	{"pos": Vector2(COL_L + 56, 36), "arms": [
		{"dir": "up", "text": "家族・地元"},
	]},
	# 技を極める職人・桟橋の前
	{"pos": Vector2(COL_R - 56, 36), "arms": [
		{"dir": "up", "text": "自由なくらし"},
	]},
]

func _place_wayposts() -> void:
	var g := $Ground
	for d: Dictionary in WAYPOST_DEFS:
		g.add_child(Waypost.make(d["pos"] as Vector2, d["arms"] as Array))

# 全体マップの内容は島定義（ZONE_DEFS）から組み立てる。NPC の位置は載せない
func _build_map_spec() -> Dictionary:
	var areas: Array = []
	# 橋・渡し・桟道（先に描き、島の縁で上書きされる）
	for r: Array in [
		[COL_L - 20.0, -64.0, 40.0, 88.0],
		[COL_C - 20.0, -64.0, 40.0, 88.0],
		[COL_R - 20.0, -64.0, 40.0, 88.0],
		[-208.0, 70.0, 116.0, 40.0],
		[92.0, 70.0, 116.0, 40.0],
		[-30.0, 156.0, 60.0, 98.0],
	]:
		areas.append({
			"points": _rect_pts(float(r[0]), float(r[1]), float(r[2]), float(r[3])),
			"color":  Color("#C8A46E"),
		})
	# 6 つの島
	for zone_key: String in ALL_ZONES:
		var d: Dictionary = ZONE_DEFS[zone_key]
		var cx := float(d["cx"])
		var cy := float(d["cy"])
		areas.append({
			"points":    _octagon(cx, cy, IW, IH, ICH),
			"color":     d["color"],
			"label":     d["name"],
			"label_pos": Vector2(cx, cy),
			"label_col": d["label_col"],
		})
	# 入口ドック
	areas.append({
		"points":    _octagon(0.0, 285.0, 150.0, 86.0, 14.0),
		"color":     Color("#C8D89E"),
		"label":     "入口",
		"label_pos": Vector2(0, 285),
	})
	return {
		"title":      "こだわりの里",
		"world_rect": Rect2(-520, -330, 1040, 700),
		"bg_color":   SEA_FALLBACK,
		"areas":      areas,
		"marks":      [{"pos": Vector2(0, 348), "text": "↓ 広場へもどる"}],
	}

# ── 共通ヘルパー ──────────────────────────────────────────────────────────────
func _add_swaying_grass(parent: Node2D, x: float, y: float) -> void:
	var g := Polygon2D.new()
	g.polygon  = PackedVector2Array([
		Vector2(-1.5, 0), Vector2(1.5, 0),
		Vector2(2.5, -8), Vector2(0, -10), Vector2(-2.5, -8)
	])
	g.color    = Color("#7AAF5E")
	g.position = Vector2(x, y)
	parent.add_child(g)
	_grass_data.append({"node": g, "phase": fmod(x * 0.37 + y * 0.71, TAU)})

func _circle_pts(r: float, n: int) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i: int in n:
		var a := float(i) * TAU / float(n)
		pts.append(Vector2(cos(a), sin(a)) * r)
	return pts

# ============================================================
# NPC / モンスター配置
# ============================================================
func _spawn_actors() -> void:
	var assignments := _assign_npc_zones()
	var npc_layer   := $NPCLayer
	var mon_layer   := $MonsterLayer
	var occupied    := {}

	for npc_id: String in assignments:
		var zone_key: String     = assignments[npc_id]
		var zone_def: Dictionary = ZONE_DEFS[zone_key]
		var npc := NPCScene.instantiate()
		npc.npc_id   = npc_id
		npc.position = zone_def["npc_pos"]
		npc_layer.add_child(npc)
		occupied[zone_key] = true

	for zone_key: String in ALL_ZONES:
		if not occupied.has(zone_key):
			var zone_def: Dictionary = ZONE_DEFS[zone_key]
			var mon := MonsterScene.instantiate()
			mon.monster_id = "guardian_yononaka"
			mon.position   = zone_def["npc_pos"] as Vector2
			mon_layer.add_child(mon)

func _assign_npc_zones() -> Dictionary:
	var date     := Time.get_date_dict_from_system()
	var day_seed: int = int(date["year"]) * 10000 + int(date["month"]) * 100 + int(date["day"])
	var assignments: Dictionary = {}
	var occupied:    Dictionary = {}
	for i: int in NPC_ORDER.size():
		var npc_id:     String = NPC_ORDER[i]
		var candidates: Array  = NPC_ZONE_CANDIDATES[npc_id]
		var idx    := (day_seed + i * 37) % candidates.size()
		var chosen: String = candidates[idx]
		if occupied.has(chosen):
			for j: int in candidates.size():
				var alt: String = candidates[(idx + j + 1) % candidates.size()]
				if not occupied.has(alt):
					chosen = alt
					break
		if occupied.has(chosen):
			for zone_key: String in ALL_ZONES:
				if not occupied.has(zone_key):
					chosen = zone_key
					break
		assignments[npc_id] = chosen
		occupied[chosen]    = true
	return assignments
