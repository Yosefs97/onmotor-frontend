const SITE_URL = "https://onmotormedia.com";
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// מביא את הרשימה של כל הכתבות מסטרפי
async function getArticles() {
  try {
    const res = await fetch(
      `${API_URL}/api/articles?fields=slug,updatedAt&pagination[pageSize]=1000`,
      { cache: "no-store" }
    );
    const json = await res.json();

    return json.data?.map(item => ({
      url: `${SITE_URL}/articles/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt || new Date().toISOString(),
    })) || [];
  } catch (err) {
    console.error("Article fetch error:", err);
    return [];
  }
}

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/contact`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/about`, lastModified: new Date().toISOString() },
  ];

  const articles = await getArticles();

  return [...staticPages, ...articles];
}
