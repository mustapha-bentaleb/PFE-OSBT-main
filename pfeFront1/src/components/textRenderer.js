import { PATTERN_CONFIG } from './patterns';

/* ─────────────────────────────
   TEXT DRAWERS (pure canvas)
───────────────────────────── */

export function drawSponsor(ctx, sponsor, color, font = 'Arial') {
  if (!sponsor) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const extra = Math.max(0, sponsor.length - 6);
  let sizeSponsor = PATTERN_CONFIG.sponsorSize - extra * 4;
  sizeSponsor = Math.max(sizeSponsor, 18);

  ctx.fillStyle = color;
  ctx.font = `bold italic ${sizeSponsor}px ${font}`;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 3;

  ctx.fillText(sponsor, PATTERN_CONFIG.centerX, PATTERN_CONFIG.sponsorY);
  ctx.restore();
}

export function drawName(ctx, name, color, font = 'Arial') {
  if (!name) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const extra = Math.max(0, name.length - 5);
  let sizeName = PATTERN_CONFIG.nameSize - extra * 5;
  sizeName = Math.max(sizeName, 20);

  ctx.fillStyle = color;
  ctx.font = `bold ${sizeName}px ${font}`;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;

  ctx.fillText(name, PATTERN_CONFIG.centerX, PATTERN_CONFIG.nameY);
  ctx.restore();
}

export function drawNumber(ctx, number, color, font = 'Arial') {
  if (!number) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const extra = Math.max(0, number.length - 3);
  let sizeNumber = PATTERN_CONFIG.numberSize - extra * 30;
  sizeNumber = Math.max(sizeNumber, 80);

  ctx.fillStyle = color;
  ctx.font = `bold ${sizeNumber}px ${font}`;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;

  ctx.fillText(
    number,
    PATTERN_CONFIG.centerX,
    PATTERN_CONFIG.nameY + PATTERN_CONFIG.spacing
  );

  ctx.restore();
}

/* ─────────────────────────────
   IMAGE CACHE (IMPORTANT FIX)
   Prevent multiple loading + flicker
───────────────────────────── */

const imageCache = {};

function getImage(src, onLoad) {
  if (imageCache[src]) {
    if (imageCache[src].loaded) {
      onLoad(imageCache[src].img);
    } else {
      imageCache[src].callbacks.push(onLoad);
    }
    return;
  }

  const img = new Image();
  img.src = src;

  imageCache[src] = {
    img,
    loaded: false,
    callbacks: [onLoad],
  };

  img.onload = () => {
    imageCache[src].loaded = true;
    imageCache[src].callbacks.forEach(cb => cb(img));
    imageCache[src].callbacks = [];
  };
}

/* ─────────────────────────────
   BRAND LOGO
───────────────────────────── */

export function drawBrand(ctx, brand, options = {}) {
  if (!brand) return;

  const {
    x = PATTERN_CONFIG.brandX,
    y = PATTERN_CONFIG.brandY,
    size = PATTERN_CONFIG.brandSize,
    rotation = 0,
    opacity = 1,
    color = "#000000"
  } = options;

  getImage(`/logos/${brand}.png`, (img) => {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = size;
    tmpCanvas.height = size;

    const tmpCtx = tmpCanvas.getContext('2d');

    tmpCtx.drawImage(img, 0, 0, size, size);
    tmpCtx.globalCompositeOperation = "source-in";
    tmpCtx.fillStyle = color;
    tmpCtx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.drawImage(tmpCanvas, -size / 2, -size / 2);
    ctx.restore();
  });
}

/* ─────────────────────────────
   CUSTOM LOGO
───────────────────────────── */

export function drawLogo(ctx, logoSrc, logoPosition = "center") {
  if (!logoSrc) return;

  const {
    logoSize,
    centerLogoX,
    centerLogoY,
    sideLogoX,
    sideLogoY,
  } = PATTERN_CONFIG;

  const cx = logoPosition === "side" ? sideLogoX : centerLogoX;
  const cy = logoPosition === "side" ? sideLogoY : centerLogoY;

  getImage(logoSrc, (img) => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    let drawW, drawH;

    if (w >= h) {
      drawW = logoSize;
      drawH = (h / w) * logoSize;
    } else {
      drawH = logoSize;
      drawW = (w / h) * logoSize;
    }

    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  });
}