/**
 * قائمة احتياطية إذا تعذر تحميل public/logos/manifest.json
 * أضف أي ملف جديد تحت public/logos/ ثم حدّث manifest.json
 */
export const POD_LOGO_FALLBACK_FILES = ['city.svg'];

/** مسار الشعار للعرض والتصميم */
export function logoUrl(fileName) {
  return `/logos/${fileName}`;
}
