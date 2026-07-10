shader_type canvas_item;
// 海シェーダー（ピクセルアート調）
// 3トーンに量子化した波 + まばらなきらめき。
// VERTEX をそのまま使うため、Ground（原点）直下の Polygon2D 用。

uniform vec4 color_deep  : source_color = vec4(0.165, 0.396, 0.576, 1.0);
uniform vec4 color_mid   : source_color = vec4(0.247, 0.502, 0.678, 1.0);
uniform vec4 color_light : source_color = vec4(0.420, 0.647, 0.788, 1.0);
uniform vec4 color_foam  : source_color = vec4(0.875, 0.949, 0.980, 1.0);
uniform float pixel_size = 2.0;  // 量子化の粗さ（ドット感）
uniform float speed = 1.0;

varying vec2 wpos;

void vertex() {
	wpos = VERTEX;
}

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void fragment() {
	vec2 p = floor(wpos / pixel_size) * pixel_size;
	float t = TIME * speed;
	float w = sin(p.x * 0.045 + t * 0.85)
	        + sin(p.y * 0.065 - t * 0.62)
	        + sin((p.x + p.y) * 0.035 + t * 0.47)
	        + sin(length(p * 0.02) * 3.0 - t * 0.30);
	w *= 0.25; // -1..1 に正規化
	vec4 col = color_deep;
	if (w > -0.08) { col = color_mid; }
	if (w >  0.46) { col = color_light; }
	// きらめき（時間で位置が変わる白い点）
	float sp = hash(p + floor(t * 2.0));
	if (sp > 0.9975 && w > 0.15) { col = color_foam; }
	COLOR = col;
}
