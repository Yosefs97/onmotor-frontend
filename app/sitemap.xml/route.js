// app/sitemap.xml/route.js
export const dynamic = 'force-dynamic';

export async function GET() {
  const SITE_URL = "https://www.onmotormedia.com";
  const API_URL = process.env.STRAPI_URL;

  // 1. רשימת הדפים הקבועים באתר (ללא הדומיין, רק הנתיב)
  const staticPaths = [
    "", // דף הבית
    "/gear",
    "/gear/offroad",
    "/gear/road",
    "/gear/adventure",
    "/gear/custom",
    "/reviews",
    "/reviews/motorcycles",
    "/reviews/gear",
    "/reviews/video",
    "/shop",
    "/law-book",
    "/law-book/ask-question",
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
    "/contact",
    "/PrivacyPolicy",
    "/TermsOfService",
    "/data-deletion-instructions"
  ];

  // המרה של הרשימה למבנה שמתאים למפת האתר
  const staticUrls = staticPaths.map(path => ({
    url: `${SITE_URL}${path}`,
    lastmod: new Date().toISOString()
  }));

  let articles = [];

  try {
    // 2. שליפת הכתבות מ-Strapi
    const res = await fetch(
      `${API_URL}/api/articles?fields=slug,updatedAt&pagination[pageSize]=1000`, // הגדלתי ל-1000 ליתר ביטחון
      { cache: "no-store" }
    );

    const json = await res.json();

    articles = json.data?.map(item => ({
      url: `${SITE_URL}/articles/${item.slug}`,
      lastmod: item.updatedAt,
    })) || [];

  } catch (err) {
    console.error("Sitemap fetch error:", err);
  }

  // 3. איחוד כל הכתובות (סטטיות + כתבות)
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