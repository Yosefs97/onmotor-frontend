// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

/**
 * מחלץ תמונה ל־OG / WhatsApp / Facebook
 * סדר עדיפויות מלא:
 * 1. גלריה (תמיד הכי יציב)
 * 2. image
 * 3. external_media_links (רק אם מקור מותאם)
 * 4. externalImageUrls (רק אם מקור מותאם)
 * 5. inline images מתוך התוכן
 * 6. fallback
 *
 * בנוסף — מסנן תמונות חיצוניות שעלולות להיחסם בוואטסאפ
 */

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  // 🟥 תמונת OG נקייה ומאוחסנת אצלך (וכך מתאימה לוואטסאפ)
  const FALLBACK = "https://www.onmotormedia.com/default-og.jpg";

  // 🟦 פונקציה פנימית למניעת שימוש במקורות בעייתיים (KTM, Yamaha וכו’)
  const isSafeSource = (url) => {
    if (!url) return false;

    // רק אם התמונה היא מהאתר שלך → 100% בטוח
    if (url.includes("onmotormedia.com")) return true;

    // תמונות חיצוניות:
    // KTM, Yamaha PDP, Honda News וכו' — וואטסאפ חוסם/לא מראה
    const forbidden = [
      "press.ktm.com",
      "hondanews.eu",
      "yamaha-motor.eu",
      "content2.kawasaki.com",
      "#",    // כל hash-breaking
    ];

    return !forbidden.some((domain) => url.includes(domain));
  };

  // 🟦 1. גלריה
  if (Array.isArray(article.gallery?.data) && article.gallery.data.length > 0) {
    for (const item of article.gallery.data) {
      const img = item?.attributes?.url;
      if (img) {
        const full = img.startsWith("http") ? img : `${PUBLIC_API_URL}${img}`;
        if (isSafeSource(full)) return full; // רק אם מקור בטוח
      }
    }
  }

  // 🟦 2. image.data.attributes.url
  const mainImage = article?.image?.data?.attributes?.url;
  if (mainImage) {
    const full = mainImage.startsWith("http")
      ? mainImage
      : `${PUBLIC_API_URL}${mainImage}`;

    if (isSafeSource(full)) return full;
  }

  // 🟦 3. image.url
  if (article.image?.url) {
    const full = resolveImageUrl(article.image.url);
    if (isSafeSource(full)) return full;
  }

  // 🟦 4. external_media_links
  if (Array.isArray(article.external_media_links)) {
    for (const u of article.external_media_links) {
      if (typeof u === "string" && u.startsWith("http")) {
        if (isSafeSource(u)) return u;
      }
    }
  }

  // 🟦 5. externalImageUrls
  if (Array.isArray(article.externalImageUrls)) {
    for (const u of article.externalImageUrls) {
      if (u.startsWith("http") && isSafeSource(u)) return u;
    }
  }

  // 🟦 6. inline images מתוך התוכן
  const content = Array.isArray(article.content)
    ? JSON.stringify(article.content)
    : String(article.content || "");

  const inlineMatch = content.match(
    /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp|gif))/i
  );

  if (inlineMatch) {
    const inlineUrl = inlineMatch[1];
    if (isSafeSource(inlineUrl)) return inlineUrl;
  }

  // 🟦 7. fallback (בטוח לוואטסאפ)
  return FALLBACK;
}
