extends Node2D
## メンバー村人スポナー(9b) + 日替わりのにぎわい(11-C)。Main(広場)の「CLAFT村」エリア担当。
## - 起動時に Supabase の member_avatars を取得して村人を生成(取得失敗時は村人なしで正常動作)
## - 11-C: 日替わりseedで約7割だけ表示(残りは「おでかけ中」)。位置も日替わりで微変動
## - 自分の村人(ClaftBridge.user_id 一致)は常に表示+「じぶん」マーク
## - ひとこと表示パネルは全村人で1つを共用(open_speech / is_open)

# CLAFT村エリア(広場の右手前)。4x4=16スロットに hash(user_id) で定位置を割り当てる
const SLOT_ORIGIN := Vector2(230, -150)
const SLOT_STEP := Vector2(62, 58)
const SLOT_COLS := 4
const SLOT_ROWS := 4

const PANEL_X := 20.0
const PANEL_H := 120.0
const CTRL_H := 220.0   # 操作エリア高さ(SignPost と同じ配置基準)

var _rows: Array = []           # member_avatars の取得結果
var _villagers: Node2D
var _layer: CanvasLayer
var _panel: Panel
var _name_lbl: Label
var _msg_lbl: Label
var _open: bool = false

func _ready() -> void:
	_villagers = Node2D.new()
	add_child(_villagers)
	_build_sign()
	_build_panel()
	get_viewport().size_changed.connect(_reposition)
	_reposition()
	ClaftBridge.auth_changed.connect(_rebuild)
	_fetch()

func _fetch() -> void:
	var res: Dictionary = await ClaftBridge.api(
		"GET", "/member_avatars?select=user_id,sprite_id,nickname,message")
	if not res["ok"] or not (res["data"] is Array):
		print("[VillagerSpawner] member_avatars取得失敗(村人なしで続行)")
		return
	_rows = res["data"]
	print("[VillagerSpawner] %d 人のメンバーを読み込みました" % _rows.size())
	_rebuild()

# 日替わりseed(KodawariMap の日付seed配置ロジックと同じ流儀)
func _day_seed() -> int:
	var date := Time.get_date_dict_from_system()
	return int(date["year"]) * 10000 + int(date["month"]) * 100 + int(date["day"])

func _rebuild() -> void:
	for c in _villagers.get_children():
		c.queue_free()
	var day := _day_seed()
	var occupied: Dictionary = {}
	for row: Variant in _rows:
		if not (row is Dictionary):
			continue
		var uid := str(row.get("user_id", ""))
		var h := absi(hash(uid))
		var is_me := ClaftBridge.user_id != "" and uid == ClaftBridge.user_id
		# 11-C: 約3割は日替わりで「おでかけ中」。自分は常にいる
		if not is_me and posmod(h * 31 + day * 17, 10) >= 7:
			continue
		var slot := _pick_slot(h, occupied)
		occupied[slot] = true
		var v := MemberVillager.new()
		v.sprite_id = str(row.get("sprite_id", ""))
		v.nickname = str(row.get("nickname", ""))
		v.message = str(row.get("message", ""))
		v.is_me = is_me
		v.speech_ui = self
		# 定位置(hash) + 日替わりの微変動(±8px)
		var jitter := Vector2(
			posmod(h ^ (day * 73), 17) - 8,
			posmod((h >> 3) ^ (day * 131), 15) - 7)
		v.position = _slot_pos(slot) + jitter
		_villagers.add_child(v)

# hash から定位置スロットを選ぶ(埋まっていたら次を探す)
func _pick_slot(h: int, occupied: Dictionary) -> int:
	var total := SLOT_COLS * SLOT_ROWS
	var slot := posmod(h, total)
	for _i: int in total:
		if not occupied.has(slot):
			return slot
		slot = posmod(slot + 1, total)
	return slot   # 全スロット使用済み(17人目以降)は重なりを許容

func _slot_pos(slot: int) -> Vector2:
	var col := slot % SLOT_COLS
	var row := floori(float(slot) / float(SLOT_COLS))
	return SLOT_ORIGIN + Vector2(SLOT_STEP.x * float(col), SLOT_STEP.y * float(row))

# 「CLAFT村」の立て看板
func _build_sign() -> void:
	var sign_pos := SLOT_ORIGIN + Vector2(SLOT_STEP.x * 1.5, -52)
	var post := Polygon2D.new()
	post.polygon = PackedVector2Array([-2, 0, 2, 0, 2, 18, -2, 18])
	post.color = Color("#8B6347")
	post.position = sign_pos
	add_child(post)
	var board := Polygon2D.new()
	board.polygon = PackedVector2Array([-34, -22, 34, -22, 34, -2, -34, -2])
	board.color = Color("#C8A46E")
	board.position = sign_pos
	add_child(board)
	var edge := Polygon2D.new()
	edge.polygon = PackedVector2Array([-34, -22, 34, -22, 34, -20, -34, -20])
	edge.color = Color("#8B6347")
	edge.position = sign_pos
	add_child(edge)
	var lbl := Label.new()
	lbl.text = "CLAFT村"
	lbl.position = sign_pos + Vector2(-33, -21)
	lbl.size = Vector2(66, 18)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 10)
	lbl.add_theme_color_override("font_color", Color("#5C3A21"))
	add_child(lbl)

# ============================================================
# ひとこと表示パネル(全村人で共用。SignPost と同じ配置・様式)
# ============================================================
func _build_panel() -> void:
	_layer = CanvasLayer.new()
	_layer.layer = 15
	_layer.visible = false
	add_child(_layer)

	_panel = Panel.new()
	_panel.size = Vector2(680, PANEL_H)
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

	_name_lbl = Label.new()
	_name_lbl.position = Vector2(16, 10)
	_name_lbl.size = Vector2(400, 20)
	_name_lbl.add_theme_font_size_override("font_size", 13)
	_name_lbl.add_theme_color_override("font_color", Color("#8B6347"))
	_panel.add_child(_name_lbl)

	_msg_lbl = Label.new()
	_msg_lbl.position = Vector2(16, 32)
	_msg_lbl.size = Vector2(648, 76)
	_msg_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_msg_lbl.add_theme_font_size_override("font_size", 17)
	_msg_lbl.add_theme_color_override("font_color", Color("#2C2C2A"))
	_panel.add_child(_msg_lbl)

	var hint := Label.new()
	hint.name = "CloseHint"
	hint.text = "Enter で閉じる"
	hint.position = Vector2(500, PANEL_H - 26)
	hint.size = Vector2(160, 20)
	hint.add_theme_font_size_override("font_size", 11)
	hint.add_theme_color_override("font_color", Color("#9A8A7A"))
	_panel.add_child(hint)

func _reposition() -> void:
	var vp := get_viewport().get_visible_rect().size
	_panel.position = Vector2(PANEL_X, vp.y - CTRL_H - PANEL_H - 8)
	_panel.size.x = vp.x - PANEL_X * 2
	(_panel.get_node("CloseHint") as Label).position.x = _panel.size.x - 180
	_msg_lbl.size.x = _panel.size.x - 32

# 閉じた直後の再オープン防止(村人側の_processとの実行順に依存しないようにする)
var _reopen_block: float = 0.0

func is_open() -> bool:
	return _open or _reopen_block > 0.0

func open_speech(nickname: String, message: String) -> void:
	_name_lbl.text = nickname
	_msg_lbl.text = message if message != "" else "……(なにか考えごとをしているみたい)"
	_layer.visible = true
	_open = true

func _process(delta: float) -> void:
	if _reopen_block > 0.0:
		_reopen_block -= delta
	if _open and (Input.is_action_just_pressed("ui_accept")
			or Input.is_action_just_pressed("game_cancel")):
		_layer.visible = false
		_open = false
		_reopen_block = 0.25
