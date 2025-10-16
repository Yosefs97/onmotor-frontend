// lib/generateSearchSuggestions.js
import staticSuggestions from "@/data/searchSuggestions";

// שימוש נכון ב־.env צד שרת בלבד
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;


/**
 * מחזיר הצעות חיפוש מ-Strapi + הצעות סטטיות
 * @returns {Promise<Array<{ title: string, path: string }>>}
 */
export default async function generateSearchSuggestions() {
  try {
    if (!API_URL) throw new Error("STRAPI_API_URL לא הוגדר בקובץ .env.local");

    const res = await fetch(`${API_URL}/api/articles?fields=title,slug&pagination[pageSize]=100`, {
      next: { revalidate: 60 }, // או 'no-store' אם צריך שליפה חיה תמיד
    });

    if (!res.ok) {
      throw new Error(`שגיאת Fetch מה־Strapi: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const data = json.data || [];

    const articleSuggestions = data.map((item) => ({
      title: item.title || "כתבה ללא כותרת",
      path: `/articles/${item.slug}`,
    }));

    return [...staticSuggestions, ...articleSuggestions];
  } catch (err) {
    console.error("❌ שגיאה בטעינת הצעות חיפוש מ-Strapi:", err.message);
    return [...staticSuggestions];
  }
}
