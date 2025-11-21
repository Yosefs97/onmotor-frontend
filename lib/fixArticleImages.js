// lib/fixArticleImages.js
const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

/* ----------------------------------------------------
   🤍 Cloudinary whitelist — אסור לעטוף אותם בפרוקסי
---------------------------------------------------- */
function isCloudinary(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

/* ----------------------------------------------------
   פנימי (Strapi / אתר / פרוקסי אחר)
---------------------------------------------------- */
function isInternalUrl(url) {
  if (!url || typeof url !== "string") return false;
  const s = url.trim();
  if (!s.startsWith("http")) return false;
  if (PUBLIC_API_URL && s.startsWith(PUBLIC_API_URL)) return true;
  if (SITE_URL && s.startsWith(SITE_URL)) return true;
  if (s.includes("/api/proxy-honda") || s.includes("/api/proxy-media")) return true;
  return false;
}

/* ----------------------------------------------------
   עטיפה דרך proxy-media לקישורים חיצוניים בלבד
   ❗ NOT Cloudinary
---------------------------------------------------- */
function wrapWithProxyMedia(url) {
  if (!url) return PLACEHOLDER_IMG;
  const s = url.trim();

  if (!s.startsWith("http")) return s;
  if (isInternalUrl(s)) return s;
  if (isCloudinary(s)) return s;        // ← ❗ Cloudinary לא עובר פרוקסי

  return `${SITE_URL}/api/proxy-media?url=${encodeURIComponent(s)}`;
}

/* ----------------------------------------------------
   עטיפה מיוחדת ל-Honda
---------------------------------------------------- */
export function wrapHondaProxy(url) {
  if (!url) return null;
  if (url.includes("hondanews.eu")) {
    return `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/* ----------------------------------------------------
   תיקון תמונות בתוך HTML (בפסקאות RichText)
---------------------------------------------------- */
export function fixRelativeImages(html) {
  if (!html) return html;

  return html.replace(/<img\s+[^>]*src=["']([^"']+)["']/g, (match, src) => {
    let fullSrc = src;

    // הונדה תמיד עוברת דרך הפרוקסי הייעודי
    if (src.includes("hondanews.eu")) {
      fullSrc = `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(src)}`;
    }
    else if (isCloudinary(src)) {
      fullSrc = src;                    // ← ❗ Cloudinary לא עטוף
    }
    else if (src.includes("content2.kawasaki.com")) {
      fullSrc = src.split("?")[0];      // הסרת פרמטרים מיותרים
    }
    else if (!src.startsWith("http")) {
      fullSrc = src.startsWith("/")
        ? `${PUBLIC_API_URL}${src}`
        : `${PUBLIC_API_URL}/uploads/${src}`;
    }

    // עטיפה של קישורים חיצוניים אמיתיים
    if (fullSrc.startsWith("http") && !isInternalUrl(fullSrc)) {
      fullSrc = wrapWithProxyMedia(fullSrc);
    }

    return match.replace(src, fullSrc);
  });
}

/* ----------------------------------------------------
   ResolveImageUrl — מחליטה כיצד לטעון תמונה
---------------------------------------------------- */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;

  const url = String(rawUrl).trim();

  if (url.includes("hondanews.eu")) {
    return `${SITE_URL}/api/proxy-honda?url=${encodeURIComponent(url)}`;
  }

  if (isCloudinary(url)) {
    return url;                          // ← ❗ Cloudinary ישיר
  }

  if (url.startsWith("http")) {
    if (isInternalUrl(url)) return url;
    return wrapWithProxyMedia(url);      // רק חיצוניים אמיתיים
  }

  return `${PUBLIC_API_URL}${url.startsWith("/") ? url : `/uploads/${url}`}`;
}
