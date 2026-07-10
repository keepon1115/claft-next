shader_type canvas_item;
// 画面端をうっすら暗くするビネット（フルスクリーン ColorRect 用）

uniform float intensity : hint_range(0.0, 1.0) = 0.30;
uniform vec4 tint : source_color = vec4(0.05, 0.04, 0.10, 1.0);

void fragment() {
	vec2 d = UV - vec2(0.5);
	// 横長画面に合わせて楕円形に減衰させる
	d.x *= 1.15;
	float v = smoothstep(0.30, 0.72, length(d));
	COLOR = vec4(tint.rgb, v * intensity);
}
