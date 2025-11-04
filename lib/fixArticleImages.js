// lib/fixArticleImages.js
const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

/**
 * ✅ מזהה אם קישור שייך ל-Honda ומחזיר עטיפה בפרוקסי
 */
export function wrapHondaProxy(url) {
  if (!url) return null;
  if (url.includes("hondanews.eu")) {
    return `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * ✅ מתקנת נתיבי תמונות יחסיים בתוך HTML
 * כולל עטיפה של קישורי Honda דרך הפרוקסי.
 */
export function fixRelativeImages(html) {
  if (!html) return html;

  return html.replace(
    /<img\s+[^>]*src=["']([^"']+)["']/g,
    (match, src) => {
      let fullSrc = src;

      // 🟢 עטיפה אוטומטית לתמונות Honda
      if (src.includes("hondanews.eu")) {
        fullSrc = `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(src)}`;
      }
      // 🟠 נתיב יחסי
      else if (!src.startsWith("http")) {
        fullSrc = src.startsWith("/")
          ? `${PUBLIC_API_URL}${src}`
          : `${PUBLIC_API_URL}/uploads/${src}`;
      }

      return match.replace(src, fullSrc);
    }
  );
}

/**
 * ✅ ממירה כתובת תמונה לנתיב מלא
 * כולל עטיפה בפרוקסי להונדה.
 */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;

  if (rawUrl.includes("hondanews.eu")) {
    return `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(rawUrl)}`;
  }

  if (rawUrl.startsWith("http")) return rawUrl;

  return `${PUBLIC_API_URL}${rawUrl.startsWith("/") ? rawUrl : `/uploads/${rawUrl}`}`;
}
