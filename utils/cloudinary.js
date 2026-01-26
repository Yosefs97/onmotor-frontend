/**
 * פונקציה להוספת לוגו ואופטימיזציה לתמונות Cloudinary
 * @param {string} url - הלינק המקורי שמגיע מסטראפי
 * @returns {string} - הלינק המעובד עם הלוגו
 */
export function getBrandedUrl(url) {
  // בדיקות תקינות בסיסיות
  if (!url || typeof url !== 'string') return '';
  
  // אם הלינק הוא לא של Cloudinary, נחזיר אותו כמו שהוא
  if (!url.includes('cloudinary.com')) return url;

  // 1. הגדרת ה-ID המדויק של הלוגו שלך
  const logoId = 'Logo_for_image_web_vzv8p0';

  // 2. הגדרת המיקום והגודל (Watermark Configuration)
  // l_ : שכבת הלוגו
  // w_0.30,fl_relative : רוחב הלוגו יהיה 30% מרוחב התמונה (מתאים ללוגו רחב)
  // g_south_east : מיקום פינה ימנית תחתונה
  // x_15,y_15 : מרווח מהשוליים
  // o_90 : שקיפות 90%
  const watermark = `l_${logoId},w_0.30,fl_relative,g_south_east,x_15,y_15,o_90`;

  // 3. הגדרות אופטימיזציה (דחיסה ופורמט אוטומטי)
  const optimization = 'f_auto,q_auto';

  // חיבור השרשרת
  const transformation = `${optimization}/${watermark}`;

  // החלפה ב-URL: מכניסים את הטרנספורמציה אחרי "/upload/"
  return url.replace('/upload/', `/upload/${transformation}/`);
}