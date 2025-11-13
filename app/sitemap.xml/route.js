export const dynamic = 'force-dynamic';

export async function GET() {
  const SITE_URL = "https://www.onmotormedia.com";
  const API_URL = process.env.STRAPI_URL;

  let articles = [];

  try {
    const res = await fetch(
      `${API_URL}/api/articles?fields=slug,updatedAt&pagination[pageSize]=500`,
      { cache: "no-store" }
    );

    const json = await res.json();

    articles = json.data?.map(item => ({
      url: `${SITE_URL}/articles/${item.attributes.slug}`,
      lastmod: item.attributes.updatedAt,
    })) || [];

  } catch (err) {
    console.error("Sitemap fetch error:", err);
  }

  const staticUrls = [
    { url: SITE_URL, lastmod: new Date().toISOString() },
    { url: `${SITE_URL}/contact`, lastmod: new Date().toISOString() },
    { url: `${SITE_URL}/about`, lastmod: new Date().toISOString() },
  ];

  const urls = [...staticUrls, ...articles];

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
