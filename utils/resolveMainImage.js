// utils/resolveMainImage.js
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

/* ✅ ממירה כל URL לתמונה תקינה (Strapi / Cloudinary / קישור חיצוני) */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
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
      mainImage = validLinks[1].trim(); // השני
    } else if (validLinks.length > 0) {
      mainImage = validLinks[0].trim(); // הראשון
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
