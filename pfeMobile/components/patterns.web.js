function drawText(ctx, value, color, font, size, x, y) {
  if (!value) return;
  ctx.save();
  ctx.fillStyle = color || "#ffffff";
  ctx.font = `700 ${size}px ${font || "Arial"}`;
  ctx.textAlign = "center";
  ctx.fillText(String(value), x, y);
  ctx.restore();
}

function drawLogo(ctx, logo) {
  if (!logo) return;
  const img = new Image();
  img.src = logo;
  img.onload = () => {
    ctx.drawImage(img, 430, 150, 44, 44);
  };
}

export function createPatternTexture(pattern, mainColor, secondColor, size = 1024, textData = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size * 0.452;
  switch (pattern) {
    case "split":
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, half, size);
      ctx.fillStyle = secondColor;
      ctx.fillRect(half, 0, size - half, size);
      break;
    case "stripes":
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = secondColor;
      for (let x = 0; x < size; x += 80) ctx.fillRect(x, 0, 32, size);
      break;
    default:
      ctx.fillStyle = mainColor || "#111827";
      ctx.fillRect(0, 0, size, size);
      break;
  }

  drawText(ctx, textData.sponsor, textData.sponsorColor, textData.sponsorFont, 45, 460, 260);
  drawText(ctx, textData.name, textData.name_number_color, textData.textFont, 55, 460, 660);
  drawText(ctx, textData.number, textData.name_number_color, textData.textFont, 185, 460, 840);
  drawLogo(ctx, textData.logo);

  return canvas;
}
