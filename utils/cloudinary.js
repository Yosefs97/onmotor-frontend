/**
 * פונקציה להוספת לוגו ואופטימיזציה לתמונות Cloudinary
 * @param {string} url הלינק המקורי שמגיע מסטראפי
 * @param {number} maxWidth רוחב מקסימלי לתמונה (ברירת מחדל 1200px)
 * @returns {string} הלינק המעובד עם הלוגו והגבלת המידות
 */
export function getBrandedUrl(url, maxWidth = 1200) {
  // בדיקות תקינות בסיסיות
  if (!url || typeof url !== 'string') return '';
  
  // אם הלינק הוא לא של Cloudinary, נחזיר אותו כמו שהוא
  if (!url.includes('cloudinary.com')) return url;

  // 1. הגדרת ה-ID המדויק של הלוגו שלך
  const logoId = 'Logo_for_image_web_vzv8p0';

  // 2. הגדרת המיקום והגודל (Watermark Configuration)
  const watermark = `l_${logoId},w_0.30,fl_relative,g_south_west,x_15,y_15,o_90`;

  // 3. הגדרות אופטימיזציה + הגבלת גודל!
  // w_{maxWidth} - מקטין את רוחב התמונה למקסימום המוגדר (1200)
  // c_limit - מבטיח שאם התמונה קטנה מ-1200, היא לא תוגדל ותימרח
  const optimization = `f_auto,q_auto,w_${maxWidth},c_limit`;

  // חיבור השרשרת
  const transformation = `${optimization}/${watermark}`;

  // החלפה ב-URL: מכניסים את הטרנספורמציה אחרי "/upload/"
  return url.replace('/upload/', `/upload/${transformation}/`);
}