import { drawName, drawNumber, drawSponsor, drawBrand, drawLogo } from './textRenderer';
export let redrawSignal = 0;

export function triggerRedraw() {
  redrawSignal++;
}
export const FONTS = [
  { label: "Arial", value: "Arial" },
  { label: "Impact", value: "Impact" },
  { label: "Courier New", value: "'Courier New'" },
  { label: "Times New Roman", value: "'Times New Roman'" },
];

export const SPONSOR_FONTS = [...FONTS];

export const BRANDS = {
  ADIDAS: "adidas",
  NIKE: "nike",
  PUMA: "puma",
};

export const PATTERN_CONFIG = {
  half: 0.452,
  nameSize: 55,
  numberSize: 185,
  nameY: 660,
  spacing: 130,
  centerX: 460,

  bandWidth: 0.07,
  stripeWidth: 0.04,
  transitionWidth: 0.05,

  sponsorSize: 45,
  sponsorY: 260,

  brandSize: 40,
  brandX: 378,
  brandY: 150,

  // Adidas V stripes
  adidasStripeCount: 3,
  adidasStripeThickness: 0.005,
  adidasStripeSpacing: 0.006,
  adidasStripeAngle: 20,
  adidasStripeLength: 0.23,
  adidasStripeY: 0.042,
  adidasStripeColor: "#ffffff",

  // === LOGO CONFIG ===
  // Taille maximale du cadre (largeur = hauteur) — l'image ne dépassera jamais ce carré
  logoSize: 44,

  // Position "center" : centré sur le torse (sous le sponsor)
  centerLogoX: 460,
  centerLogoY: 200,

  // Position "side" : côté gauche (poitrine)
  sideLogoX: 515,
  sideLogoY: 174,
};

export const PATTERNS = {
  PLAIN: 'plain',
  SPLIT: 'split',
  STRIPES: 'stripes',
  GRADIENT_V: 'gradient_V',
  SASH: 'sash',
  CENTER_STRIPE: 'center_stripe',
  DOUBLE_CENTER_STRIPES: 'double_center_stripes',
};

export function createPatternTexture(
  pattern,
  mainColor,
  secondColor,
  size = 1024,
  textData = {}
) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  const half = size * PATTERN_CONFIG.half;

  switch (pattern) {
    case PATTERNS.SASH:
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, size, size);

      const bandWidth = size * PATTERN_CONFIG.bandWidth;

      ctx.fillStyle = secondColor;

      const drawSash = (centerX) => {
        ctx.save();
        ctx.translate(centerX, size / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-size, -bandWidth / 2, size * 2, bandWidth);
        ctx.restore();
      };

      drawSash(half * 0.5);
      drawSash(half + (size - half) * 0.5);
      break;

    case PATTERNS.SPLIT:
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, half, size);

      ctx.fillStyle = secondColor;
      ctx.fillRect(half, 0, half, size);
      break;

    case PATTERNS.STRIPES:
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, size, size);

      const stripeWidth = Math.max(10, size * PATTERN_CONFIG.stripeWidth);
      const spacing = stripeWidth * 2;

      ctx.fillStyle = secondColor;

      for (let x = 0; x < size; x += spacing) {
        ctx.fillRect(x, 0, stripeWidth, size);
      }
      break;

    case PATTERNS.GRADIENT_V:
      const gradient = ctx.createLinearGradient(0, 0, size, 0);
      const tW = PATTERN_CONFIG.transitionWidth;

      gradient.addColorStop(0, mainColor);
      gradient.addColorStop(PATTERN_CONFIG.half - tW, mainColor);
      gradient.addColorStop(PATTERN_CONFIG.half + tW, secondColor);
      gradient.addColorStop(1, secondColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      break;
case PATTERNS.CENTER_STRIPE:

  // Fond avec secondColor
  ctx.fillStyle = secondColor;
  ctx.fillRect(0, 0, size, size);

  // largeur de la ligne
  const brandWidth = size * 0.46;

  // position X (milieu)
  const stripeX = (size - brandWidth-98) / 2;

  // Ligne centrale
  ctx.fillStyle = mainColor;
  ctx.fillRect(stripeX, 0, brandWidth, size);

  break;

  case PATTERNS.DOUBLE_CENTER_STRIPES:

  // Fond avec mainColor
  ctx.fillStyle = mainColor;
  ctx.fillRect(0, 0, size, size);

  // largeur totale centrale (même que ton brandWidth)
  const Width = size * 0.202;

  // position X du bloc central (même calcul)
  const centerX = (size - Width - 98) / 2;

  // largeur des 2 lignes
  const lineWidth = Width * 0.35;

  // Ligne gauche
  ctx.fillStyle = secondColor;
  ctx.fillRect(centerX, 0, lineWidth, size);

  // Ligne droite
  ctx.fillStyle = secondColor;
  ctx.fillRect(
    centerX + Width - lineWidth,
    0,
    lineWidth,
    size
  );

  break;
    default:
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, size, size);
  }

  // Adidas stripes
  if (textData.brand === "adidas") {
    const centerX = size * PATTERN_CONFIG.half;
    const startY = size * PATTERN_CONFIG.adidasStripeY;

    const thickness = size * PATTERN_CONFIG.adidasStripeThickness;
    const spacing = size * PATTERN_CONFIG.adidasStripeSpacing;
    const length = size * PATTERN_CONFIG.adidasStripeLength;
    const angle = PATTERN_CONFIG.adidasStripeAngle * Math.PI / 180;

    ctx.fillStyle = textData.collarColor;

    for (let i = 0; i < PATTERN_CONFIG.adidasStripeCount; i++) {
      const y = startY + i * (thickness + spacing);

      ctx.save();
      ctx.translate(centerX, y);
      ctx.rotate(-angle);
      ctx.fillRect(-length, 0, length, thickness);
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, y);
      ctx.rotate(angle);
      ctx.fillRect(0, 0, length, thickness);
      ctx.restore();
      triggerRedraw();
    }
    triggerRedraw();
  }
  triggerRedraw();

  drawSponsor(ctx, textData.sponsor, textData.sponsorColor, textData.sponsorFont);
  drawLogo(ctx, textData.logo, textData.logoPosition);
  drawName(ctx, textData.name, textData.name_number_color, textData.textFont);
  drawNumber(ctx, textData.number, textData.name_number_color, textData.textFont);
  drawBrand(ctx, textData.brand, { color: textData.collarColor });

  return canvas;
}