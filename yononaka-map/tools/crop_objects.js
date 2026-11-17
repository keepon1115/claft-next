// Ninja Adventure タイルセットから小道具スプライトを切り出すツール
// 使い方:
//   node tools/crop_objects.js preview  → %TEMP%/objects_preview.png に3倍モンタージュ
//   node tools/crop_objects.js emit     → assets/objects/<name>.png に書き出し
// 各クロップは透明余白を自動トリミングする（座標はコンソールに出る）。
"use strict";
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const PACK = path.join(__dirname, "..", "assets", "raw", "NinjaAdventure", "Ninja Adventure - Asset Pack");
const TH = path.join(PACK, "Backgrounds", "Tilesets", "TilesetHouse.png");
const TN = path.join(PACK, "Backgrounds", "Tilesets", "TilesetNature.png");
const TC = path.join(PACK, "Backgrounds", "Tilesets", "tileset_camp.png");
const TD = path.join(PACK, "Backgrounds", "Tilesets", "TilesetDesert.png");
const OUT_DIR = path.join(__dirname, "..", "assets", "objects");

// name, src, [x, y, w, h]（トリム前の領域）
const CROPS = [
  ["house",         TH, [0, 0, 64, 48]],     // 茅葺きの家（zone_family）
  ["torii",         TH, [12, 84, 42, 28]],   // 鳥居（入口ゲート）
  ["kamado",        TH, [0, 96, 50, 64]],    // オレンジのドーム窯（zone_power）
  ["workbench",     TH, [464, 120, 48, 40]], // 道具つき作業台（zone_craft）
  ["statue_oneeye", TH, [16, 305, 35, 47]],  // 苔むした一つ目像（zone_stable）
  ["statue_frog",   TH, [48, 340, 32, 28]],  // 苔むしたカエル像
  ["tree_trio",     TN, [258, 36, 62, 44]],  // 三つ葉の大木（広場）
  ["tree_sakura",   TN, [0, 288, 48, 48]],   // 桜の大木
  ["tree_green",    TN, [48, 288, 48, 48]],  // 緑の大木
  ["bench",         TC, [2, 113, 52, 14]],   // 丸太ベンチ（広場）
  ["firepit",       TC, [160, 48, 32, 32]],  // 石の火床
  ["palm",          TD, [160, 56, 48, 56]],  // ヤシの木（zone_free）
];

// ── PNG 読み書き ─────────────────────────────────────────────
function readPng(f) {
  const b = fs.readFileSync(f);
  let pos = 8, w, h; const idat = [];
  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString("ascii", pos + 4, pos + 8);
    if (type === "IHDR") { w = b.readUInt32BE(pos + 8); h = b.readUInt32BE(pos + 12); }
    if (type === "IDAT") idat.push(b.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * 4;
  const px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const filt = raw[y * (1 + stride)];
    const line = raw.slice(y * (1 + stride) + 1, (y + 1) * (1 + stride));
    const out = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? out[i - 4] : 0, up = prev[i], c = i >= 4 ? prev[i - 4] : 0;
      let v = line[i];
      if (filt === 1) v = (v + a) & 255;
      else if (filt === 2) v = (v + up) & 255;
      else if (filt === 3) v = (v + ((a + up) >> 1)) & 255;
      else if (filt === 4) {
        const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? up : c)) & 255;
      }
      out[i] = v;
    }
    out.copy(px, y * stride);
    prev = out;
  }
  return { w, h, px };
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const body = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(body)); return Buffer.concat([l, body, c]); }
function writePng(file, w, h, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) { raw[y * (1 + w * 4)] = 0; px.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4); }
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0)),
  ]));
}

// 透明余白の自動トリム
function cropTrim(img, x0, y0, cw, ch) {
  let minX = cw, minY = ch, maxX = -1, maxY = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const sx = x0 + x, sy = y0 + y;
    if (sx >= img.w || sy >= img.h) continue;
    if (img.px[(sy * img.w + sx) * 4 + 3] > 10) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const si = ((y0 + minY + y) * img.w + (x0 + minX + x)) * 4;
    img.px.copy(out, (y * w + x) * 4, si, si + 4);
  }
  return { w, h, px: out, rect: [x0 + minX, y0 + minY, w, h] };
}

// ── 実行 ─────────────────────────────────────────────────────
const mode = process.argv[2] || "preview";
const cache = new Map();
const results = [];
for (const [name, src, [x, y, w, h]] of CROPS) {
  if (!cache.has(src)) cache.set(src, readPng(src));
  const c = cropTrim(cache.get(src), x, y, w, h);
  if (!c) { console.log(name, ": EMPTY"); continue; }
  console.log(`${name}: trimmed ${c.w}x${c.h} at [${c.rect}] (from ${path.basename(src)})`);
  results.push([name, c]);
}

if (mode === "emit") {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, c] of results) writePng(path.join(OUT_DIR, name + ".png"), c.w, c.h, c.px);
  console.log("emitted", results.length, "files to assets/objects/");
} else {
  // 3倍スケールのモンタージュ
  const SC = 3, PAD = 8, COLS = 5;
  const cellW = Math.max(...results.map(([, c]) => c.w)) * SC + PAD;
  const cellH = Math.max(...results.map(([, c]) => c.h)) * SC + PAD;
  const W = COLS * cellW + PAD, H = Math.ceil(results.length / COLS) * cellH + PAD;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < out.length; i += 4) { out[i] = 45; out[i + 1] = 45; out[i + 2] = 60; out[i + 3] = 255; }
  results.forEach(([name, c], idx) => {
    const ox = PAD + (idx % COLS) * cellW, oy = PAD + Math.floor(idx / COLS) * cellH;
    for (let y = 0; y < c.h * SC; y++) for (let x = 0; x < c.w * SC; x++) {
      const si = ((y / SC | 0) * c.w + (x / SC | 0)) * 4;
      if (c.px[si + 3] > 10) c.px.copy(out, ((oy + y) * W + ox + x) * 4, si, si + 4);
    }
  });
  const outFile = path.join(process.env.TEMP || "/tmp", "objects_preview.png");
  writePng(outFile, W, H, out);
  console.log("preview:", outFile);
}
