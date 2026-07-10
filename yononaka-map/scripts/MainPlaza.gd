extends Node2D
## 広場（Main）の空気: ビネット + 桜の木から舞う花びら

func _ready() -> void:
	Atmosphere.add_vignette(self)

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
