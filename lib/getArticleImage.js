// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

/**
 * מחלץ תמונה ראשית ל־OG / Metadata
 * על בסיס כל השדות בכתבה — ללא סינון וללא חסימה.
 * אם יש תמונה — נבחרת.
 * אם אין — fallback.
 */

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  const FALLBACK = "https://www.onmotormedia.com/default-og.jpg";

  // --------------------------------------------------------
  // 🟦 1. גלריה – תומך בשני מקרים: עם/בלי gallery.data
  // --------------------------------------------------------

  // gallery.data (Strapi format)
  if (Array.isArray(article.gallery?.data) && article.gallery.data.length > 0) {
    for (const item of article.gallery.data) {
      const img = item?.attributes?.url || item?.url;
      if (img) {
        return img.startsWith("http") ? img : `${PUBLIC_API_URL}${img}`;
      }
    }
  }

  // gallery without .data (in case of manual JSON)
  if (Array.isArray(article.gallery) && article.gallery.length > 0) {
    const first = article.gallery.find((img) => img?.url || typeof img === "string");
    if (first) {
      const url = first.url || first;
      return url.startsWith("http") ? url : `${PUBLIC_API_URL}${url}`;
    }
  }

  // --------------------------------------------------------
  // 🟦 2. תמונה מתוך image.data.attributes
  // --------------------------------------------------------
  const mainImage =
    article?.image?.data?.attributes?.formats?.large?.url ||
    article?.image?.data?.attributes?.formats?.medium?.url ||
    article?.image?.data?.attributes?.formats?.small?.url ||
    article?.image?.data?.attributes?.url;

  if (mainImage) {
    return mainImage.startsWith("http")
      ? mainImage
      : `${PUBLIC_API_URL}${mainImage}`;
  }

  // --------------------------------------------------------
  // 🟦 3. תמונה מתוך image.url
  // --------------------------------------------------------
  if (article.image?.url) {
    return resolveImageUrl(article.image.url);
  }

  // --------------------------------------------------------
  // 🟦 4. external_media_links (תומך במערך או מחרוזת)
  // --------------------------------------------------------
  if (Array.isArray(article.external_media_links)) {
    for (const link of article.external_media_links) {
      if (typeof link === "string" && link.startsWith("http")) {
        return link.trim();
      }
    }
  }

  if (typeof article.external_media_links === "string" &&
      article.external_media_links.startsWith("http")) {
    return article.external_media_links.trim();
  }

  // --------------------------------------------------------
  // 🟦 5. externalImageUrls
  // --------------------------------------------------------
  if (Array.isArray(article.externalImageUrls)) {
    for (const link of article.externalImageUrls) {
      if (typeof link === "string" && link.startsWith("http")) {
        return link.trim();
      }
    }
  }

  // --------------------------------------------------------
  // 🟦 6. inline images מתוך התוכן (rich text / string)
  // --------------------------------------------------------
  const content =
    Array.isArray(article.content)
      ? JSON.stringify(article.content)
      : String(article.content || "");

  const inlineMatch = content.match(
    /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp|gif))/i
  );

  if (inlineMatch) return inlineMatch[1];

  // --------------------------------------------------------
  // 🟦 7. fallback – תמיד קיים
  // --------------------------------------------------------
  return FALLBACK;
}
