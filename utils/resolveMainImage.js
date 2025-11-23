// utils/resolveMainImage.js
import { resolveImageUrl } from "@/lib/fixArticleImages";

const PLACEHOLDER_IMG = "/default-image.jpg";

/**
 * 🔥 בחירת תמונה ראשית לפי סדר העדיפות המקורי שלך:
 * 1. תמונה שלישית בגלריה
 * 2. תמונה ראשונה בגלריה
 * 3. attrs.image (Strapi relation/full object)
 * 4. external_media_links
 * 5. ברירת מחדל
 */
export function getMainImage(attrs = {}) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || "תמונה ראשית";

  // 1️⃣ שלישית בגלריה
  if (attrs.gallery?.[2]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[2].url);
    mainImageAlt = attrs.gallery[2].alternativeText || mainImageAlt;
  }

  // 2️⃣ ראשונה בגלריה
  else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  }

  // 3️⃣ תמונה ראשית מהשדה image (Strapi relation)
  else if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  }

  // 3️⃣.ב — תמונה במבנה פשוט (למקרה של אפלואד ישיר)
  else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  }

  // 4️⃣ קישורים חיצוניים
  else if (Array.isArray(attrs.external_media_links) && attrs.external_media_links.length > 0) {
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
