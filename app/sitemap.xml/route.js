// app/sitemap.xml/route.js
export const dynamic = 'force-dynamic';

export async function GET() {
  const SITE_URL = "https://www.onmotormedia.com";
  // שימוש בשם המשתנה התואם ל-layout.js
  const API_URL = process.env.STRAPI_API_URL || process.env.STRAPI_URL; 

  // 1. רשימת הדפים הקבועים באתר
  const staticPaths = [
    "", // דף הבית
    "/gear",
    "/gear/offroad",
    "/gear/road",
    "/gear/adventure",
    "/gear/custom",
    "/reviews",
    "/reviews/motorcycles",
    "/reviews/motorcyclestests",
    "/reviews/gear",
    "/reviews/video",
    "/shop",
    "/shop/vendor",
    "/shop/collection/offroad",
    "/shop/collection/road",
    "/shop/collection/adventure",
    "/shop/collection/custom",

    // ✅ עודכן: אזור "חוק ומשפט" החדש
    "/laws",
    "/laws/legal-articles",
    "/laws/ask-question",
    "/laws/book",

    "/blog",
    "/blog/podcast",
    "/blog/tips",
    "/blog/paper",
    "/blog/in-helmet",
    "/blog/guides",
    "/blog/guides/guide-tech",
    "/blog/guides/guide-beginner",
    "/blog/guides/guide-advanced",
    "/news",
    "/news/machine",
    "/news/local",
    "/news/global",
    "/news/racing",
    "/contact",
    "/PrivacyPolicy",
    "/TermsOfService",
    "/data-deletion-instructions",
    "/accessibility",
    "/AdvertisingPolicy",
    "/about",
    "/tags"
  ];

  const staticUrls = staticPaths.map(path => ({
    url: `${SITE_URL}${path}`,
    lastmod: new Date().toISOString()
  }));

  let articles = [];

  try {
    // 2. שליפת הכתבות מ-Strapi
    // הוספתי את שדה href לשליפה למקרה שיש כתובות מותאמות אישית
    const res = await fetch(
      `${API_URL}/api/articles?fields=slug,href,updatedAt&pagination[pageSize]=1000`, 
      { cache: "no-store" }
    );

    const json = await res.json();

    if (json.data && Array.isArray(json.data)) {
      articles = json.data.map(item => {
        const attrs = item.attributes || item;
        
        // לוגיקה חכמה: קדימות ל-href על פני slug
        const slug = attrs.href || attrs.slug;

        return {
          url: `${SITE_URL}/articles/${slug}`,
          lastmod: attrs.updatedAt || new Date().toISOString(),
        };
      });
    }

  } catch (err) {
    console.error("Sitemap fetch error:", err);
  }

  // 3. איחוד כל הכתובות
  const urls = [...staticUrls, ...articles];

  // 4. יצירת ה-XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `<url>
  <loc>${u.url}</loc>
  <lastmod>${u.lastmod}</lastmod>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}