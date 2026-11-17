class_name Waypost
extends Node2D
## V8: 分岐点の方向看板（道しるべ）。飾りなので当たり判定は持たない。
## 見た目はデータ（pos + arms）だけで組み立てる:
##   Waypost.make(Vector2(0, 250), [
##     {"dir": "up",   "text": "こだわりの里"},
##     {"dir": "down", "text": "広場へもどる"},
##   ])

const ARROWS: Dictionary = {"up": "↑", "down": "↓", "left": "←", "right": "→"}

const BOARD_W    := 100.0
const BOARD_H    := 16.0
const BOARD_GAP  :=  2.0
const POST_COL   := Color("#8B6347")
const BOARD_COL  := Color("#F3E4C0")   # 明るい板（文字とのコントラスト確保）
const EDGE_COL   := Color("#8B6347")
const TEXT_COL   := Color("#3A2616")
# 文字は大きく描いてから縮小する（カメラの拡大でぼやけないように）
const TEXT_RES   := 4.0
const TEXT_SIZE  := 10.0

# scale: カメラズームが大きいマップ（広場 zoom=3）では 0.8 程度に縮める
static func make(pos: Vector2, arms: Array, post_scale: float = 1.0) -> Waypost:
	var w := Waypost.new()
	w.position = pos
	w.scale    = Vector2(post_scale, post_scale)
	w._build(arms)
	return w

func _build(arms: Array) -> void:
	# 接地影
	var shadow := Polygon2D.new()
	var pts := PackedVector2Array()
	for i: int in 12:
		var a := float(i) * TAU / 12.0
		pts.append(Vector2(cos(a) * 10.0, sin(a) * 3.0))
	shadow.polygon = pts
	shadow.color   = Color(0.08, 0.07, 0.05, 0.22)
	add_child(shadow)

	# 柱（板の枚数に応じて高くなる）
	var h := 12.0 + float(arms.size()) * (BOARD_H + BOARD_GAP)
	_rect(-2.0, -h, 4.0, h, POST_COL)
	_rect(-3.0, -h, 6.0, 2.0, POST_COL.darkened(0.2))   # 笠木

	# 矢印板（上から順に積む。左右向きの板は少しその方向に張り出す）
	for i: int in arms.size():
		var arm: Dictionary = arms[i]
		var dir  := str(arm.get("dir", "up"))
		var y    := -h + 3.0 + float(i) * (BOARD_H + BOARD_GAP)
		var bx   := -BOARD_W / 2.0
		if dir == "left":
			bx -= 8.0
		elif dir == "right":
			bx += 8.0
		_rect(bx - 1.0, y - 1.0, BOARD_W + 2.0, BOARD_H + 2.0, EDGE_COL)   # ふち
		_rect(bx, y, BOARD_W, BOARD_H, BOARD_COL)
		var l := Label.new()
		l.text                 = "%s %s" % [ARROWS.get(dir, "・"), str(arm.get("text", ""))]
		l.position             = Vector2(bx, y)
		l.size                 = Vector2(BOARD_W, BOARD_H) * TEXT_RES
		l.scale                = Vector2.ONE / TEXT_RES
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
		l.add_theme_font_size_override("font_size", int(TEXT_SIZE * TEXT_RES))
		l.add_theme_color_override("font_color", TEXT_COL)
		add_child(l)

func _rect(x: float, y: float, w: float, h: float, col: Color) -> void:
	var p := Polygon2D.new()
	p.polygon = PackedVector2Array([
		Vector2(x, y), Vector2(x + w, y), Vector2(x + w, y + h), Vector2(x, y + h),
	])
	p.color = col
	add_child(p)
