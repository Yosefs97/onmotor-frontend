/**
 * פונקציה להוספת לוגו ואופטימיזציה לתמונות Cloudinary
 * @param {string} url - הלינק המקורי שמגיע מסטראפי
 * @returns {string} - הלינק המעובד עם הלוגו והדחיסה
 */
export function getBrandedUrl(url) {
  // בדיקות תקינות
  if (!url || typeof url !== 'string') return '';
  
  // אם הלינק הוא לא של Cloudinary, נחזיר אותו כמו שהוא
  if (!url.includes('cloudinary.com')) return url;

  // 1. ה-ID של הלוגו שלך (כפי שמופיע בקוד שלך)
  const logoId = 'Logo_for_image_web_vzv8p0';

  // 2. הגדרת הלוגו + תיקון חשוב: fl_layer_apply
  // התיקון הזה אומר ל-Cloudinary "לשטח" את הלוגו על התמונה לפני שממשיכים
  // זה מונע באגים שקורים לפעמים ב-JPG
  const watermark = `l_${logoId},w_0.30,fl_relative,g_south_west,x_15,y_15,o_90,fl_layer_apply`;

  // 3. אופטימיזציה: דחיסה חכמה + שינוי פורמט אוטומטי (למשל ל-WebP)
  // זה מה שיוריד את המשקל מ-MB ל-KB
  const optimization = 'f_auto,q_auto';

  // חיבור השרשרת: קודם אופטימיזציה ואז לוגו (או להפך, הסדר פה פחות קריטי כי שמנו layer_apply)
  // הערה: עדיף לשים את האופטימיזציה לפני הלוגו ב-URL כדי שהבסיס יטופל
  const transformation = `${optimization}/${watermark}`;

  // ביצוע ההחלפה ב-URL
  // מחפשים את /upload/ ומזריקים אחריו את ההגדרות
  return url.replace('/upload/', `/upload/${transformation}/`);
}