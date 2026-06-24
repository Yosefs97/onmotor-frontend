// app/sitemap.xml/route.js
export const dynamic = 'force-dynamic';

export async function GET() {
  const SITE_URL = "https://www.onmotormedia.com";
  const API_URL = process.env.STRAPI_API_URL || process.env.STRAPI_URL; 
  
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; 
  const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // 1. רשימת הדפים הקבועים באתר
  const staticPaths = [
    "", 
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
    "/shop/collection/oils",
    "/shop/collection/parts",
    "/shop/collection/battery",
    "/shop/collection/tires",
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

  // 2. שליפת הכתבות מ-Strapi
  let articles = [];
  try {
    const res = await fetch(
      `${API_URL}/api/articles?fields=slug,href,updatedAt&pagination[pageSize]=1000&sort=updatedAt:desc`, 
      { cache: "no-store" }
    );
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      articles = json.data.map(item => {
        const attrs = item.attributes || item;
        const slug = attrs.href || attrs.slug;
        return {
          url: `${SITE_URL}/articles/${slug}`,
          lastmod: attrs.updatedAt || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.error("Sitemap fetch error (Strapi):", err);
  }

  // 3. שליפת כל המוצרים מ-Shopify (עם פג'ינציה)
  let products = [];
  try {
    if (SHOPIFY_DOMAIN && SHOPIFY_TOKEN) {
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const query = `
          query getProductsSitemap($cursor: String) {
            products(first: 250, after: $cursor) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  handle
                  updatedAt
                }
              }
            }
          }
        `;

        const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
          },
          body: JSON.stringify({
            query,
            variables: { cursor }
          }),
          cache: "no-store"
        });

        const json = await res.json();
        
        if (json.data && json.data.products) {
          const fetchedProducts = json.data.products.edges.map(({ node }) => ({
            // מתאים לנתיב /app/shop/[handle]/page.jsx
            url: `${SITE_URL}/shop/${encodeURIComponent(node.handle)}`,
            lastmod: node.updatedAt || new Date().toISOString(),
          }));
          
          products = [...products, ...fetchedProducts];

          hasNextPage = json.data.products.pageInfo.hasNextPage;
          cursor = json.data.products.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      }
    }
  } catch (err) {
    console.error("Sitemap fetch error (Shopify):", err);
  }

  // 4. איחוד כל הכתובות
  const urls = [...staticUrls, ...articles, ...products];

  // 5. יצירת ה-XML
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