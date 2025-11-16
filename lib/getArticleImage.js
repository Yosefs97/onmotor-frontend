// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

/**
 * מחלץ תמונה ראשית ל־OG / Metadata
 * על בסיס כל השדות בכתבה — ללא סינון וללא חסימה.
 * פשוט: אם יש תמונה איפשהו → מחזיר אותה.
 */

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  const FALLBACK = "https://www.onmotormedia.com/default-og.jpg";

  // 🟦 1. גלריה (בדוק כל פריט)
  if (Array.isArray(article.gallery?.data) && article.gallery.data.length > 0) {
    for (const item of article.gallery.data) {
      const img = item?.attributes?.url;
      if (img) {
        return img.startsWith("http")
          ? img
          : `${PUBLIC_API_URL}${img}`;
      }
    }
  }

  // 🟦 2. image.data.attributes.url
  const mainImage = article?.image?.data?.attributes?.url;
  if (mainImage) {
    return mainImage.startsWith("http")
      ? mainImage
      : `${PUBLIC_API_URL}${mainImage}`;
  }

  // 🟦 3. image.url
  if (article.image?.url) {
    return resolveImageUrl(article.image.url);
  }

  // 🟦 4. external_media_links (מעבר על כל השדה)
  if (Array.isArray(article.external_media_links)) {
    for (const link of article.external_media_links) {
      if (typeof link === "string" && link.startsWith("http")) {
        return link.trim();
      }
    }
  }

  // 🟦 5. externalImageUrls
  if (Array.isArray(article.externalImageUrls)) {
    for (const link of article.externalImageUrls) {
      if (typeof link === "string" && link.startsWith("http")) {
        return link.trim();
      }
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
    return inlineMatch[1];
  }

  // 🟦 7. fallback
  return FALLBACK;
}
