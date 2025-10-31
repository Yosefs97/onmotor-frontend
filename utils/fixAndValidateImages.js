// utils/fixAndValidateImages.js
const API_URL = process.env.STRAPI_API_URL || "https://onmotor-strapi.onrender.com";
const PLACEHOLDER_IMG = "https://www.onmotormedia.com/default-image.jpg"; // 🔁 תחליף כרצונך

// פונקציה שבודקת אם קובץ קיים בשרת
async function isImageAvailable(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// פונקציה שמתקנת נתיבים יחסיים ומחזירה HTML תקין עם בדיקת זמינות
export async function fixRelativeImages(html) {
  if (!html) return html;

  // שלב 1: תיקון נתיבים יחסיים
  let fixedHtml = html.replace(
    /<img\s+[^>]*src=["'](?!https?:\/\/)([^"']+)["'][^>]*>/g,
    (match, src) => {
      let fullSrc = src.startsWith("/")
        ? `${API_URL}${src}`
        : `${API_URL}/uploads/${src}`;
      return match.replace(src, fullSrc);
    }
  );

  // שלב 2: נבדוק אם הקובץ באמת קיים
  const imgTags = [...fixedHtml.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g)];

  for (const tag of imgTags) {
    const url = tag[1];
    const exists = await isImageAvailable(url);
    if (!exists) {
      // אם לא קיים — נחליף את הכתובת ל-placeholder
      fixedHtml = fixedHtml.replace(url, PLACEHOLDER_IMG);
    }
  }

  // שלב 3: תמיכה גם בבלוקי figure (עם caption)
  fixedHtml = fixedHtml.replace(
    /<figure>(.*?)<img\s+[^>]*src=["']([^"']+)["'][^>]*>(.*?)<\/figure>/gs,
    async (match, before, src, after) => {
      const exists = await isImageAvailable(src);
      const validSrc = exists ? src : PLACEHOLDER_IMG;
      return `<figure>${before}<img src="${validSrc}" alt=""><figcaption>${after}</figcaption></figure>`;
    }
  );

  return fixedHtml;
}