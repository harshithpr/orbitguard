import { mkdir, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function rgba(hex, alpha = 255) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, alpha];
}

function blend(pixel, color) {
  const alpha = color[3] / 255;
  pixel[0] = Math.round(color[0] * alpha + pixel[0] * (1 - alpha));
  pixel[1] = Math.round(color[1] * alpha + pixel[1] * (1 - alpha));
  pixel[2] = Math.round(color[2] * alpha + pixel[2] * (1 - alpha));
  pixel[3] = 255;
}

function drawCircle(pixels, size, cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(size, Math.ceil(cy + radius)); y += 1) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(size, Math.ceil(cx + radius)); x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) {
        blend(pixels[y * size + x], color);
      }
    }
  }
}

function drawLine(pixels, size, x1, y1, x2, y2, width, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length2 = dx * dx + dy * dy;
  const radius = width / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length2));
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      const distance = Math.hypot(x - px, y - py);
      if (distance <= radius) {
        blend(pixels[y * size + x], color);
      }
    }
  }
}

function drawOrbit(pixels, size, color) {
  const cx = size / 2;
  const cy = size / 2;
  const rx = size * 0.38;
  const ry = size * 0.14;
  const rotation = (-18 * Math.PI) / 180;

  for (let step = 0; step < 720; step += 1) {
    const a1 = (step / 720) * Math.PI * 2;
    const a2 = ((step + 1) / 720) * Math.PI * 2;
    const x1 = Math.cos(a1) * rx;
    const y1 = Math.sin(a1) * ry;
    const x2 = Math.cos(a2) * rx;
    const y2 = Math.sin(a2) * ry;
    const p1x = cx + x1 * Math.cos(rotation) - y1 * Math.sin(rotation);
    const p1y = cy + x1 * Math.sin(rotation) + y1 * Math.cos(rotation);
    const p2x = cx + x2 * Math.cos(rotation) - y2 * Math.sin(rotation);
    const p2y = cy + x2 * Math.sin(rotation) + y2 * Math.cos(rotation);
    drawLine(pixels, size, p1x, p1y, p2x, p2y, size * 0.018, color);
  }
}

function createPng(size) {
  const pixels = Array.from({ length: size * size }, () => rgba("#020617"));
  const center = size / 2;

  drawCircle(pixels, size, center, center, size * 0.42, rgba("#0f172a"));
  drawOrbit(pixels, size, rgba("#38bdf8", 230));
  drawCircle(pixels, size, center, center, size * 0.18, rgba("#38bdf8"));
  drawCircle(pixels, size, center + size * 0.025, center + size * 0.025, size * 0.16, rgba("#22c55e", 190));
  drawCircle(pixels, size, center + size * 0.245, center - size * 0.14, size * 0.035, rgba("#f8fafc"));
  drawCircle(pixels, size, center + size * 0.245, center - size * 0.14, size * 0.017, rgba("#22c55e"));

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      const source = pixels[y * size + x];
      const target = rowStart + 1 + x * 4;
      raw[target] = source[0];
      raw[target + 1] = source[1];
      raw[target + 2] = source[2];
      raw[target + 3] = source[3];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, "logo.png"), createPng(512));
await writeFile(resolve(publicDir, "favicon.png"), createPng(512));
console.log("Generated public/logo.png and public/favicon.png");
