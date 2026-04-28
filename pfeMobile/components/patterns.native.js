import * as THREE from "three";

function hexToRgb(hex) {
  const value = (hex || "#000000").replace("#", "");
  const safe = value.length === 6 ? value : "000000";
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16)
  };
}

function setPixel(data, width, x, y, color) {
  const i = (y * width + x) * 4;
  data[i] = color.r;
  data[i + 1] = color.g;
  data[i + 2] = color.b;
  data[i + 3] = 255;
}

function buildBasePixels(size, pattern, mainRgb, secondRgb) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let c = mainRgb;
      if (pattern === "split") {
        c = x < size * 0.452 ? mainRgb : secondRgb;
      } else if (pattern === "stripes") {
        c = x % 80 < 32 ? secondRgb : mainRgb;
      } else if (pattern === "gradient_V") {
        const t = x / size;
        c = {
          r: Math.round(mainRgb.r + (secondRgb.r - mainRgb.r) * t),
          g: Math.round(mainRgb.g + (secondRgb.g - mainRgb.g) * t),
          b: Math.round(mainRgb.b + (secondRgb.b - mainRgb.b) * t)
        };
      } else if (pattern === "center_stripe") {
        const stripeW = Math.floor(size * 0.36);
        const startX = Math.floor((size - stripeW) / 2);
        c = x >= startX && x <= startX + stripeW ? mainRgb : secondRgb;
      } else if (pattern === "double_center_stripes") {
        const stripeW = Math.floor(size * 0.09);
        const center = Math.floor(size / 2);
        const gap = Math.floor(size * 0.08);
        const leftStart = center - gap - stripeW;
        const rightStart = center + gap;
        c = (x >= leftStart && x <= leftStart + stripeW) || (x >= rightStart && x <= rightStart + stripeW)
          ? secondRgb
          : mainRgb;
      }
      setPixel(data, size, x, y, c);
    }
  }
  return data;
}

// Native-friendly texture generator (pixel-based).
// It reproduces the same jersey pattern logic structure as web.
export function buildJerseyTexture({
  pattern = "plain",
  mainColor = "#111827",
  secondColor = "#334155"
}) {
  const size = 512;
  const mainRgb = hexToRgb(mainColor);
  const secondRgb = hexToRgb(secondColor);
  const data = buildBasePixels(size, pattern, mainRgb, secondRgb);

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.flipY = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
