export default async function sitemap() {
  const SITE_URL = "https://onmotormedia.com";
  const API_URL = process.env.STRAPI_URL;

  console.log("SITEMAP STRAPI_URL:", API_URL);

  // מביא את הכתבות מסטרפי
  async function getArticles() {
    try {
      const res = await fetch(
        `${API_URL}/api/articles?fields=slug,updatedAt&pagination[pageSize]=500`,
        { cache: "no-store" }
      );

      const json = await res.json();

      return json.data?.map(item => ({
        url: `${SITE_URL}/articles/${item.attributes.slug}`,
        lastModified: item.attributes.updatedAt || new Date().toISOString(),
      })) || [];
    } catch (err) {
      console.error("Error fetching articles:", err);
      return [];
    }
  }

  const articles = await getArticles();

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date().toISOString(),
    },
  ];

  return [...staticPages, ...articles];
}
