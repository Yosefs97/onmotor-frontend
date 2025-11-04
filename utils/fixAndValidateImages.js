// utils/fixAndValidateImages.js
const API_URL = process.env.STRAPI_API_URL || "https://onmotor-strapi.onrender.com";
const PLACEHOLDER_IMG = "https://www.onmotormedia.com/default-image.jpg"; // 🔁 תחליף כרצונך

// 🧩 פונקציה שבודקת אם קובץ קיים בשרת (כולל פרוקסי עם תמונות)
async function isImageAvailable(url) {
  try {
    // 🟢 אם זה תמונת פרוקסי – נשתמש ב־GET כי HEAD לא נתמך
    const method = url.includes('/api/proxy-honda') ? 'GET' : 'HEAD';

    const res = await fetch(url, {
      method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
      },
    });

    // אם חזר OK – קיים
    if (res.ok) return true;

    // חלק מהפרוקסים מחזירים 302 redirect — גם זה תקין
    if (res.status >= 300 && res.status < 400) return true;

    return false;
  } catch (err) {
    console.warn('⚠️ Image check failed:', err);
    return false;
  }
}

// 🧩 פונקציה שמתקנת נתיבים יחסיים ומחזירה HTML תקין עם בדיקת זמינות
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

  // שלב 2: בדיקת זמינות התמונות
  const imgTags = [...fixedHtml.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g)];
  for (const tag of imgTags) {
    const url = tag[1];
    const exists = await isImageAvailable(url);
    if (!exists) {
      fixedHtml = fixedHtml.replace(url, PLACEHOLDER_IMG);
    }
  }

  // שלב 3: טיפול בבלוקי figure (עם caption)
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
