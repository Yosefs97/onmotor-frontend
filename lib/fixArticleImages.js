// lib/fixArticleImages.js
const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

/* ✅ URL פנימי (Strapi / האתר / כבר בפרוקסי) */
function isInternalUrl(url) {
  if (!url || typeof url !== "string") return false;
  const s = url.trim();
  if (!s.startsWith("http")) return false;
  if (PUBLIC_API_URL && s.startsWith(PUBLIC_API_URL)) return true;
  if (SITE_URL && s.startsWith(SITE_URL)) return true;
  if (s.includes("/api/proxy-honda") || s.includes("/api/proxy-media")) return true;
  return false;
}

/* ✅ עטיפה כללית ל־proxy-media עבור קישורים חיצוניים בלבד */
function wrapWithProxyMedia(url) {
  if (!url) return PLACEHOLDER_IMG;
  const s = url.trim();

  if (!s.startsWith("http")) return s;
  if (isInternalUrl(s)) return s;

  return `${SITE_URL}/api/proxy-media?url=${encodeURIComponent(s)}`;
}

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
      // ✅ תמיכה בקישורי Kawasaki
      else if (src.includes("content2.kawasaki.com")) {
        // הסר פרמטרים כמו ?w=400
        fullSrc = src.split("?")[0];
      }
      // 🟠 נתיב יחסי → Strapi
      else if (!src.startsWith("http")) {
        fullSrc = src.startsWith("/")
          ? `${PUBLIC_API_URL}${src}`
          : `${PUBLIC_API_URL}/uploads/${src}`;
      }

      // ✅ עטיפת קישורים חיצוניים (לא Strapi / לא האתר / לא פרוקסי הונדה)
      if (fullSrc.startsWith("http") && !isInternalUrl(fullSrc)) {
        fullSrc = wrapWithProxyMedia(fullSrc);
      }

      return match.replace(src, fullSrc);
    }
  );
}

/**
 * ✅ ממירה כתובת תמונה לנתיב מלא
 * כולל עטיפה בפרוקסי להונדה ו־proxy-media לשאר
 */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;

  const url = String(rawUrl).trim();

  // הונדה – דרך proxy-honda
  if (url.includes("hondanews.eu")) {
    return `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(url)}`;
  }

  // קישור חיצוני אחר → proxy-media
  if (url.startsWith("http")) {
    if (isInternalUrl(url)) return url;
    return wrapWithProxyMedia(url);
  }

  // נתיב יחסי → Strapi
  return `${PUBLIC_API_URL}${url.startsWith("/") ? url : `/uploads/${url}`}`;
}
