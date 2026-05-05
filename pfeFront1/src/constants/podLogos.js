/**
 * القيمة الافتراضية لملف الشعار قبل أي تغيير من واجهة الإدخال.
 */
export const POD_LOGO_DEFAULT_FILE = 'city.png';

/** مسار الشعار للعرض والتصميم */
export function logoUrl(fileName) {
  return `/logos/${fileName}`;
}
