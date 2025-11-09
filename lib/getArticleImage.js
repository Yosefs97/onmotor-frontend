// lib/getArticleImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

export function getArticleImage(article) {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
  let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";

  // 1️⃣ external_media_links
  if (Array.isArray(article.external_media_links)) {
    const validExternal = article.external_media_links.find(
      (link) => typeof link === "string" && link.startsWith("http")
    );
    if (validExternal) return validExternal.trim();
  }

  // 2️⃣ image.data.attributes.url
  if (article.image?.data?.attributes?.url) {
    const relative = article.image.data.attributes.url;
    return relative.startsWith("http")
      ? relative
      : `${PUBLIC_API_URL}${relative}`;
  }

  // 3️⃣ image.url
  if (article.image?.url) {
    return resolveImageUrl(article.image.url);
  }

  // 4️⃣ gallery
  if (Array.isArray(article.gallery?.data) && article.gallery.data.length > 0) {
    const firstGalleryItem = article.gallery.data[0]?.attributes?.url;
    if (firstGalleryItem) {
      return firstGalleryItem.startsWith("http")
        ? firstGalleryItem
        : `${PUBLIC_API_URL}${firstGalleryItem}`;
    }
  }

  // 5️⃣ externalImageUrls
  if (
    Array.isArray(article.externalImageUrls) &&
    article.externalImageUrls.length > 0
  ) {
    const firstExternal = article.externalImageUrls.find((u) =>
      u.startsWith("http")
    );
    if (firstExternal) return firstExternal;
  }

  return imageUrl; // fallback
}
