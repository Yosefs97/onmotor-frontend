// utils/resolveMainImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

const PLACEHOLDER_IMG = "/default-image.jpg";

/**
 * בוחר תמונה ראשית לכתבה לפי סדר עדיפות:
 * 1. תמונה שלישית בגלריה (gallery[2])
 * 2. תמונה ראשונה בגלריה (gallery[0])
 * 3. תמונה מהשדה image
 * 4. קישור חיצוני מתוך external_media_links
 * 5. ברירת מחדל
 */
export function getMainImage(attrs = {}) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || "תמונה ראשית";

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
  // 3️⃣ ניסיון: image
  else if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  } else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  }
  // 4️⃣ ניסיון: קישורים חיצוניים
  else if (
    Array.isArray(attrs.external_media_links) &&
    attrs.external_media_links.length > 0
  ) {
    const valid = attrs.external_media_links
      .filter((l) => typeof l === "string" && l.startsWith("http"))
      .map((s) => s.trim());

    if (valid.length > 1) {
      mainImage = resolveImageUrl(valid[1]);
    } else if (valid.length > 0) {
      mainImage = resolveImageUrl(valid[0]);
    }

    mainImageAlt = "תמונה מהמדיה החיצונית";
  }

  return { mainImage, mainImageAlt };
}
