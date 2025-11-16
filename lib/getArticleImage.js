// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  // תמונת ברירת מחדל (לא הלוגו)
  const FALLBACK = "https://www.onmotormedia.com/default-image.jpg";

  // 1️⃣ גלריה – לפי הקוד שלך ב־page.jsx
  if (
    Array.isArray(article.gallery?.data) &&
    article.gallery.data.length > 0
  ) {
    const img = article.gallery.data[0]?.attributes?.url;
    if (img) {
      return img.startsWith("http")
        ? img
        : `${PUBLIC_API_URL}${img}`;
    }
  }

  // 2️⃣ image.data.attributes.url (תמונה ראשית מ־Strapi)
  if (article.image?.data?.attributes?.url) {
    const url = article.image.data.attributes.url;
    return url.startsWith("http") ? url : `${PUBLIC_API_URL}${url}`;
  }

  // 3️⃣ image.url (מקרים חריגים)
  if (article.image?.url) {
    return resolveImageUrl(article.image.url);
  }

  // 4️⃣ external_media_links (לפי page.jsx לוקחים את האינדקס 1)
  if (
    Array.isArray(article.external_media_links) &&
    article.external_media_links.length > 1
  ) {
    const url = article.external_media_links[1];
    if (typeof url === "string" && url.startsWith("http")) {
      return url.trim();
    }
  }

  // 5️⃣ externalImageUrls
  if (
    Array.isArray(article.externalImageUrls) &&
    article.externalImageUrls.length > 0
  ) {
    const first = article.externalImageUrls.find((u) => u.startsWith("http"));
    if (first) return first;
  }

  // 6️⃣ fallback (לא הלוגו)
  return FALLBACK;
}
