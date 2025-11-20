// utils/resolveMainImage.js
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onmotormedia.com';
const PLACEHOLDER_IMG = '/default-image.jpg';

/* ✅ עוזר: בודק אם ה־URL כבר "שלנו" (Strapi / אתר) */
function isInternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http')) return false;
  if (API_URL && trimmed.startsWith(API_URL)) return true;
  if (SITE_URL && trimmed.startsWith(SITE_URL)) return true;
  if (trimmed.includes('/api/proxy-media') || trimmed.includes('/api/proxy-honda')) return true;
  return false;
}

/* ✅ עוטף קישור חיצוני דרך proxy-media (Vercel Blob) */
function wrapWithProxyMedia(url) {
  if (!url) return PLACEHOLDER_IMG;
  const trimmed = url.trim();

  // לא מתחיל ב־http → נתיב יחסי, נטפל בו בפונקציה הראשית
  if (!trimmed.startsWith('http')) return trimmed;

  // כתובת פנימית / כבר בפרוקסי → נשאיר כמו שהיא
  if (isInternalUrl(trimmed)) return trimmed;

  return `${SITE_URL}/api/proxy-media?url=${encodeURIComponent(trimmed)}`;
}

/* ✅ ממירה כל URL לתמונה תקינה (Strapi / קישור חיצוני) */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;

  const trimmed = String(rawUrl).trim();

  // קישור חיצוני → דרך proxy-media
  if (trimmed.startsWith('http')) {
    return wrapWithProxyMedia(trimmed);
  }

  // נתיב יחסי → Strapi
  return `${API_URL}${trimmed.startsWith('/') ? trimmed : `/uploads/${trimmed}`}`;
}

/**
 * ✅ בחירת תמונה עיקרית מכל סוג שדה לפי סדר עדיפות:
 * 1️⃣ תמונה שלישית בגלריה (gallery[2])
 * 2️⃣ תמונה ראשונה בגלריה (gallery[0])
 * 3️⃣ תמונה משדה image (image.url או image.data.attributes.url)
 * 4️⃣ תמונה מתוך external_media_links (עדיפות לשני [1], אחרת ראשון [0])
 * 5️⃣ ברירת מחדל: /default-image.jpg
 */
export function getMainImage(attrs = {}) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || 'תמונה ראשית';

  // 1️⃣ ניסיון: תמונה שלישית בגלריה
  if (attrs.gallery?.[2]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[2].url);
    mainImageAlt = attrs.gallery[2].alternativeText || mainImageAlt;
  }
  // 2️⃣ ניסיון: תמונה ראשונה בגלריה
  else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  }
  // 3️⃣ ניסיון: תמונה מהשדה image
  else if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  } else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  }
  // 4️⃣ ניסיון: קישור חיצוני מתוך external_media_links
  else if (Array.isArray(attrs.external_media_links) && attrs.external_media_links.length > 0) {
    const validLinks = attrs.external_media_links.filter(
      (l) => typeof l === 'string' && l.startsWith('http')
    );
    if (validLinks.length > 1) {
      mainImage = resolveImageUrl(validLinks[1].trim()); // השני
    } else if (validLinks.length > 0) {
      mainImage = resolveImageUrl(validLinks[0].trim()); // הראשון
    }
    mainImageAlt = 'תמונה מהמדיה החיצונית';
  }
  // 5️⃣ ברירת מחדל
  else {
    mainImage = PLACEHOLDER_IMG;
    mainImageAlt = 'תמונה חסרה';
  }

  return { mainImage, mainImageAlt };
}
