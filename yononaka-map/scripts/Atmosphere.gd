class_name Atmosphere
## マップに「光と空気」を足す静的ユーティリティ。
## - add_vignette(map): 画面端を暗くするビネット（UI の CanvasLayer より下に入る）
## - make_glow(): 放射グラデーションの PointLight2D（テクスチャは実行時生成）
## - make_fireflies(): 蛍のパーティクル

const VIGNETTE_SHADER := "res://shaders/vignette.gdshader"

static var _glow_tex: GradientTexture2D
static var _dot_tex: GradientTexture2D

## 放射グラデーション（中心白 → 端で透明）を生成。ライトとパーティクルで共用
static func _radial_tex(size: int) -> GradientTexture2D:
	var grad := Gradient.new()
	grad.set_color(0, Color(1, 1, 1, 1))
	grad.set_color(1, Color(1, 1, 1, 0))
	var tex := GradientTexture2D.new()
	tex.gradient  = grad
	tex.fill      = GradientTexture2D.FILL_RADIAL
	tex.fill_from = Vector2(0.5, 0.5)
	tex.fill_to   = Vector2(0.5, 0.0)
	tex.width     = size
	tex.height    = size
	return tex

## 灯り。radius_px はおおよその光の半径（ワールド px）
static func make_glow(color: Color, radius_px: float, energy: float) -> PointLight2D:
	if _glow_tex == null:
		_glow_tex = _radial_tex(256)
	var light := PointLight2D.new()
	light.texture       = _glow_tex
	light.color         = color
	light.energy        = energy
	light.texture_scale = radius_px / 128.0
	light.blend_mode    = Light2D.BLEND_MODE_ADD
	return light

## ビネット（CanvasLayer layer=0 → UI の layer=1 より下、ワールドより上）
static func add_vignette(map: Node) -> void:
	if not ResourceLoader.exists(VIGNETTE_SHADER, "Shader"):
		return
	var layer := CanvasLayer.new()
	layer.layer = 0
	var rect := ColorRect.new()
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mat := ShaderMaterial.new()
	mat.shader    = load(VIGNETTE_SHADER) as Shader
	rect.material = mat
	layer.add_child(rect)
	map.add_child(layer)

## 蛍。extents の矩形内をただよい、明滅しながら消えていく
static func make_fireflies(center: Vector2, extents: Vector2, amount: int) -> CPUParticles2D:
	if _dot_tex == null:
		_dot_tex = _radial_tex(32)
	var p := CPUParticles2D.new()
	p.position             = center
	p.amount               = amount
	p.lifetime             = 7.0
	p.preprocess           = 7.0   # 起動直後から舞っている
	p.texture              = _dot_tex
	p.emission_shape       = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.emission_rect_extents = extents
	p.gravity              = Vector2.ZERO
	p.direction            = Vector2(0, -1)
	p.spread               = 180.0
	p.initial_velocity_min = 3.0
	p.initial_velocity_max = 10.0
	p.scale_amount_min     = 0.10   # 32px テクスチャ → 3〜6px の光点
	p.scale_amount_max     = 0.20
	# 明滅（出現 → ふわっと光って消える）
	var ramp := Gradient.new()
	ramp.set_color(0, Color(1.0, 0.95, 0.55, 0.0))
	ramp.set_color(1, Color(1.0, 0.85, 0.40, 0.0))
	ramp.add_point(0.25, Color(1.0, 0.95, 0.60, 0.9))
	ramp.add_point(0.5,  Color(1.0, 0.92, 0.50, 0.25))
	ramp.add_point(0.75, Color(1.0, 0.95, 0.60, 0.85))
	p.color_ramp = ramp
	# 加算ブレンドで「発光」させる
	var mat := CanvasItemMaterial.new()
	mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	p.material = mat
	return p
