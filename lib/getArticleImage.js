// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

/**
 * מחלץ תמונה ראשית ל־OG / Metadata
 * סדר עדיפויות:
 * 1. גלריה
 * 2. image
 * 3. external_media_links
 * 4. externalImageUrls
 * 5. תמונה מתוך התוכן (inline image)
 * 6. fallback
 */

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  const FALLBACK = "https://www.onmotormedia.com/default-og.jpg";

  // 🟦 1. גלריה
  if (Array.isArray(article.gallery?.data) && article.gallery.data.length > 0) {
    for (const item of article.gallery.data) {
      const img = item?.attributes?.url;
      if (img) {
        return img.startsWith("http") ? img : `${PUBLIC_API_URL}${img}`;
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

  // 🟦 4. external_media_links
  if (Array.isArray(article.external_media_links)) {
    const valid = article.external_media_links.find(
      (u) => typeof u === "string" && u.startsWith("http")
    );
    if (valid) return valid.trim();
  }

  // 🟦 5. externalImageUrls
  if (Array.isArray(article.externalImageUrls)) {
    const valid = article.externalImageUrls.find((u) => u.startsWith("http"));
    if (valid) return valid;
  }

  // 🟦 6. תמונה מתוך תוכן (inline image)
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
