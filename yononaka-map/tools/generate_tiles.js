// 地面タイル生成スクリプト（決定論的・シームレスタイリング）
// 使い方: node tools/generate_tiles.js
// 出力: assets/tiles/*.png（16x16, RGBA）
"use strict";
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const SIZE = 16;
const OUT_DIR = path.join(__dirname, "..", "assets", "tiles");

// ── PNG エンコーダ ───────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function writePng(file, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
  console.log("wrote", path.relative(process.cwd(), file));
}

// ── 色ユーティリティ ─────────────────────────────────────────
function hex(s) {
  return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
}
function shade(c, f) {
  // f > 0 で明るく、f < 0 で暗く
  return c.map((v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)))));
}

// ── 決定論ノイズ（タイル境界でラップ） ───────────────────────
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// 4x4 格子の値ノイズ（格子座標を mod してシームレス化）
function vnoise(x, y, seed) {
  const cell = SIZE / 4;
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
  const fx = (x % cell) / cell, fy = (y % cell) / cell;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const v = (ix, iy) => hash2(((ix % 4) + 4) % 4, ((iy % 4) + 4) % 4, seed);
  const a = v(gx, gy), b = v(gx + 1, gy), c = v(gx, gy + 1), d = v(gx + 1, gy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// ── タイルキャンバス ─────────────────────────────────────────
function makeImg() {
  return Buffer.alloc(SIZE * SIZE * 4);
}
function put(img, x, y, c) {
  const i = (((y % SIZE) + SIZE) % SIZE * SIZE + ((x % SIZE) + SIZE) % SIZE) * 4;
  img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2]; img[i + 3] = 255;
}

// ベース: 値ノイズ + ベイヤーディザで 4 段階の濃淡
function fillNoise(img, base, seed, contrast = 1.0) {
  const shades = [shade(base, -0.14 * contrast), base, shade(base, 0.06 * contrast), shade(base, 0.13 * contrast)];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let v = vnoise(x, y, seed) * 0.75 + hash2(x, y, seed + 7) * 0.25;
      v += (BAYER4[y % 4][x % 4] / 16 - 0.5) * 0.18;
      const idx = v < 0.32 ? 0 : v < 0.62 ? 1 : v < 0.82 ? 2 : 3;
      put(img, x, y, shades[idx]);
    }
  }
}

// ── タイル定義 ───────────────────────────────────────────────
function grassTile(baseHex, seed, blades) {
  const base = hex(baseHex);
  const img = makeImg();
  fillNoise(img, base, seed);
  const dark = shade(base, -0.28), light = shade(base, 0.22);
  for (let i = 0; i < blades; i++) {
    const x = Math.floor(hash2(i, 1, seed) * SIZE);
    const y = Math.floor(hash2(i, 2, seed) * SIZE);
    put(img, x, y, dark); put(img, x, y - 1, dark); put(img, x + 1, y - 1, light);
  }
  return img;
}

function dirtTile(baseHex, seed, pebbles) {
  const base = hex(baseHex);
  const img = makeImg();
  fillNoise(img, base, seed, 0.9);
  const stone = shade(base, 0.25), edge = shade(base, -0.3);
  for (let i = 0; i < pebbles; i++) {
    const x = Math.floor(hash2(i, 3, seed) * SIZE);
    const y = Math.floor(hash2(i, 4, seed) * SIZE);
    put(img, x, y, stone); put(img, x + 1, y, stone);
    put(img, x, y + 1, edge); put(img, x + 1, y + 1, edge);
  }
  return img;
}

// 石畳: 5/5/6px の段ごとに石をオフセット配置
function cobbleTile(baseHex, seed) {
  const base = hex(baseHex);
  const img = makeImg();
  const mortar = shade(base, -0.34);
  const rows = [
    { y0: 0, h: 5, off: 0 },
    { y0: 5, h: 5, off: 4 },
    { y0: 10, h: 6, off: 8 },
  ];
  for (const r of rows) {
    for (let sx = 0; sx < SIZE; sx += 8) {
      const f = 0.85 + hash2(sx + r.off, r.y0, seed) * 0.3; // 石ごとの明度ゆらぎ
      const stone = base.map((v) => Math.min(255, Math.round(v * f)));
      const hi = shade(stone, 0.14), lo = shade(stone, -0.16);
      for (let dy = 0; dy < r.h - 1; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          let c = stone;
          if (dy === 0) c = hi;                  // 上面ハイライト
          else if (dy === r.h - 2) c = lo;       // 下端の落ち影
          if (hash2(dx + sx, dy + r.y0, seed + 11) > 0.92) c = lo;
          put(img, sx + r.off + dx, r.y0 + dy, c);
        }
        put(img, sx + r.off + 7, r.y0 + dy, mortar); // 縦目地
      }
      for (let dx = 0; dx < 8; dx++) put(img, sx + r.off + dx, r.y0 + r.h - 1, mortar); // 横目地
    }
  }
  return img;
}

// 浅瀬ラグーン: 波の明るい筋 + きらめき
function lagoonTile(baseHex, seed) {
  const base = hex(baseHex);
  const img = makeImg();
  fillNoise(img, base, seed, 0.6);
  const ripple = shade(base, 0.3), sparkle = shade(base, 0.55);
  for (const row of [3, 11]) {
    for (let x = 0; x < SIZE; x++) {
      const y = row + Math.round(Math.sin((x / SIZE) * Math.PI * 2) * 1.5);
      if (hash2(x, row, seed + 5) > 0.35) put(img, x, y, ripple);
    }
  }
  for (let i = 0; i < 3; i++) {
    put(img, Math.floor(hash2(i, 9, seed) * SIZE), Math.floor(hash2(i, 10, seed) * SIZE), sparkle);
  }
  return img;
}

// 深い苔: 暗緑 + 苔のかたまり
function mossTile(baseHex, seed) {
  const base = hex(baseHex);
  const img = makeImg();
  fillNoise(img, base, seed, 1.1);
  const clump = shade(base, 0.2), clump2 = shade(base, 0.32);
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(hash2(i, 13, seed) * SIZE);
    const y = Math.floor(hash2(i, 14, seed) * SIZE);
    put(img, x, y, clump2);
    put(img, x + 1, y, clump); put(img, x - 1, y, clump);
    put(img, x, y + 1, clump); put(img, x, y - 1, clump);
  }
  return img;
}

// ── 生成 ─────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });
const TILES = {
  "bg_grass.png":       grassTile("#A8C49A", 101, 5),  // 広場の草地
  "platform.png":       grassTile("#C8D89E", 202, 3),  // 高台の淡い草
  "zone_challenge.png": grassTile("#7BC47B", 303, 6),  // 新緑
  "zone_power.png":     dirtTile("#E8935A", 404, 3),   // 夕日色の土
  "zone_family.png":    dirtTile("#D4B896", 505, 4),   // 木漏れ日の砂利
  "zone_craft.png":     cobbleTile("#5A8FAA", 606),    // 青い石畳
  "zone_free.png":      lagoonTile("#87CEEB", 707),    // 浅瀬
  "zone_stable.png":    mossTile("#4A7A5A", 808),      // 深い苔
};
for (const [name, img] of Object.entries(TILES)) {
  writePng(path.join(OUT_DIR, name), SIZE, SIZE, img);
}
console.log("done:", Object.keys(TILES).length, "tiles");
