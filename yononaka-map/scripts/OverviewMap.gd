class_name OverviewMap
extends CanvasLayer
## V8: 簡易全体マップ。M キー / MAP ボタンで開閉。
## 現在地の点だけを表示し、NPC・村人の位置は載せない
## （「ぶらぶら歩いて偶然出会う」哲学を壊さないため）。
## 描く内容はマップシーン側が渡す spec（データ）で決まる:
##   {
##     "title":      String,
##     "world_rect": Rect2,               # ワールド座標の全体範囲
##     "bg_color":   Color,               # 地図の下地（海・芝生など）
##     "areas":      [ {"points": PackedVector2Array, "color": Color,
##                      "label": String?, "label_pos": Vector2?, "label_col": Color?} ],
##     "marks":      [ {"pos": Vector2, "text": String} ],   # 出入口・ランドマークの文字
##   }

const VIEW_W  := 720.0
const VIEW_H  := 1280.0
const MAP_W   := 640.0   # 地図描画部の最大幅
const MAP_H   := 900.0   # 地図描画部の最大高さ
const PAD     := 26.0
const HEADER  := 56.0
const FOOTER  := 34.0

const FRAME_BG     := Color("#F4E8D0")   # 羊皮紙
const FRAME_EDGE   := Color("#8B5E3C")   # 土色
const TEXT_COL     := Color("#5C3A21")

var _spec:    Dictionary
var _open:    bool = false
var _dim:     ColorRect
var _canvas:  MapCanvas
var _btn:     Button
var _blink_t: float = 0.0

static func attach(host: Node, spec: Dictionary) -> OverviewMap:
	var m := OverviewMap.new()
	m._spec = spec
	host.add_child(m)
	return m

func _ready() -> void:
	layer = 8   # 会話 UI（10/15）より下

	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	# 背景の暗転（開いている間だけ）
	_dim = ColorRect.new()
	_dim.color        = Color(0, 0, 0, 0.45)
	_dim.position     = Vector2.ZERO
	_dim.size         = Vector2(VIEW_W, VIEW_H)
	_dim.visible      = false
	_dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_dim)

	# 地図パネル（world_rect のアスペクト比を保って中央に置く）
	var wr: Rect2 = _spec["world_rect"]
	var s := minf(MAP_W / wr.size.x, MAP_H / wr.size.y)
	_canvas       = MapCanvas.new()
	_canvas.spec  = _spec
	_canvas.map_scale = s
	_canvas.size  = Vector2(wr.size.x * s + PAD * 2.0, wr.size.y * s + HEADER + FOOTER)
	_canvas.position = Vector2((VIEW_W - _canvas.size.x) / 2.0,
	                           (VIEW_H - _canvas.size.y) / 2.0 - 80.0)
	_canvas.visible      = false
	_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_canvas)

	_build_button(root)

func _build_button(parent: Control) -> void:
	_btn = Button.new()
	_btn.text       = "MAP"
	_btn.size       = Vector2(72, 44)
	_btn.position   = Vector2(VIEW_W - 72.0 - 24.0, 24.0)
	_btn.focus_mode = Control.FOCUS_NONE
	_btn.add_theme_font_size_override("font_size", 16)
	_btn.add_theme_color_override("font_color", TEXT_COL)
	var s := StyleBoxFlat.new()
	s.bg_color            = Color(FRAME_BG, 0.88)
	s.border_color        = FRAME_EDGE
	s.border_width_left   = 2
	s.border_width_right  = 2
	s.border_width_top    = 2
	s.border_width_bottom = 2
	s.corner_radius_top_left     = 8
	s.corner_radius_top_right    = 8
	s.corner_radius_bottom_left  = 8
	s.corner_radius_bottom_right = 8
	_btn.add_theme_stylebox_override("normal", s)
	_btn.add_theme_stylebox_override("hover",  s)
	var sp := s.duplicate() as StyleBoxFlat
	sp.bg_color = Color(FRAME_BG.darkened(0.12), 0.95)
	_btn.add_theme_stylebox_override("pressed", sp)
	_btn.pressed.connect(_toggle)
	parent.add_child(_btn)

# autoload をグローバル識別子で参照すると screenshot.gd などの -s 実行時に
# コンパイルできないため、実行時にノードとして引く
func _busy() -> bool:
	for n: String in ["DialogueManager", "MonsterManager", "ChiefManager"]:
		var mgr := get_tree().root.get_node_or_null(n)
		if mgr and mgr.has_method("is_active") and mgr.is_active():
			return true
	return false

func _process(delta: float) -> void:
	var busy := _busy()
	_btn.visible = not busy
	if busy:
		if _open:
			_close()   # 会話が始まったら地図は引っ込める
		return
	if Input.is_action_just_pressed("toggle_map"):
		_toggle()
	elif _open and Input.is_action_just_pressed("game_cancel"):
		_close()
	if _open:
		_blink_t += delta
		_canvas.blink = 0.55 + 0.45 * (0.5 + 0.5 * sin(_blink_t * 5.0))
		_canvas.queue_redraw()

func _toggle() -> void:
	if _open:
		_close()
	elif not _busy():
		_open           = true
		_blink_t        = 0.0
		_dim.visible    = true
		_canvas.visible = true
		_btn.text       = "とじる"

func _close() -> void:
	_open           = false
	_dim.visible    = false
	_canvas.visible = false
	_btn.text       = "MAP"

# ============================================================
# 地図の描画（羊皮紙の枠 + エリア + マーク + 現在地の点）
# ============================================================
class MapCanvas extends Control:
	var spec:      Dictionary
	var map_scale: float = 1.0
	var blink:     float = 1.0

	func _to_map(p: Vector2) -> Vector2:
		var wr: Rect2 = spec["world_rect"]
		return Vector2(OverviewMap.PAD, OverviewMap.HEADER) + (p - wr.position) * map_scale

	func _draw() -> void:
		var font := get_theme_default_font()
		var wr: Rect2 = spec["world_rect"]

		# 羊皮紙の枠
		draw_rect(Rect2(Vector2.ZERO, size), OverviewMap.FRAME_BG)
		draw_rect(Rect2(Vector2.ZERO, size), OverviewMap.FRAME_EDGE, false, 3.0)

		# タイトル
		draw_string(font, Vector2(0, 36), str(spec.get("title", "ちず")),
			HORIZONTAL_ALIGNMENT_CENTER, size.x, 22, OverviewMap.TEXT_COL)

		# 地図の下地（海・芝生など）
		var map_rect := Rect2(_to_map(wr.position), wr.size * map_scale)
		draw_rect(map_rect, spec.get("bg_color", Color("#3F80AD")) as Color)

		# エリア（島・道・橋）
		for a: Dictionary in spec.get("areas", []) as Array:
			var pts: PackedVector2Array = a["points"]
			var mpts := PackedVector2Array()
			for p: Vector2 in pts:
				mpts.append(_to_map(p))
			draw_colored_polygon(mpts, a["color"] as Color)

		# エリア名（塗りの上にまとめて描く）
		for a: Dictionary in spec.get("areas", []) as Array:
			if not a.has("label"):
				continue
			var lp := _to_map(a.get("label_pos", Vector2.ZERO) as Vector2)
			var col: Color = a.get("label_col", OverviewMap.TEXT_COL)
			draw_string(font, lp + Vector2(-90, 4), str(a["label"]),
				HORIZONTAL_ALIGNMENT_CENTER, 180, 11, col)

		# マーク（出入口・ランドマーク）。影付きで海の上でも読めるように
		for m: Dictionary in spec.get("marks", []) as Array:
			var mp := _to_map(m["pos"] as Vector2)
			draw_string(font, mp + Vector2(-89, 5), str(m["text"]),
				HORIZONTAL_ALIGNMENT_CENTER, 180, 11, Color(0, 0, 0, 0.55))
			draw_string(font, mp + Vector2(-90, 4), str(m["text"]),
				HORIZONTAL_ALIGNMENT_CENTER, 180, 11, Color("#FFF6E0"))

		# 地図の縁取り
		draw_rect(map_rect, OverviewMap.FRAME_EDGE, false, 2.0)

		# 現在地（点滅する点）。NPC の位置は描かない
		var player := get_tree().get_first_node_in_group("player") as Node2D
		if player:
			var pp := _to_map(player.global_position)
			draw_circle(pp, 6.0, Color(1, 1, 1, blink))
			draw_circle(pp, 4.0, Color(0.90, 0.28, 0.30, blink))

		# 操作ヒント
		draw_string(font, Vector2(0, size.y - 12), "M キー / ボタンで とじる",
			HORIZONTAL_ALIGNMENT_CENTER, size.x, 11, Color(OverviewMap.TEXT_COL, 0.7))
