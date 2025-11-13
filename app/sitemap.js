import { fetch } from 'node-fetch';

const SITE_URL = "https://onmotormedia.com";
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// פונקציה שמביאה כתבות מסטרפי
async function getArticles() {
  try {
    const res = await fetch(`${API_URL}/api/articles?fields=slug,updatedAt&pagination[pageSize]=1000`, { cache: "no-store" });
    const json = await res.json();
    return json.data?.map(item => ({
      url: `${SITE_URL}/articles/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt,
    })) || [];
  } catch {
    return [];
  }
}

// קטגוריות
async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories?fields=slug,updatedAt&pagination[pageSize]=1000`, { cache: "no-store" });
    const json = await res.json();
    return json.data?.map(item => ({
      url: `${SITE_URL}/news/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt,
    })) || [];
  } catch {
    return [];
  }
}

// תגיות
async function getTags() {
  try {
    const res = await fetch(`${API_URL}/api/tags?fields=slug,updatedAt&pagination[pageSize]=1000`, { cache: "no-store" });
    const json = await res.json();
    return json.data?.map(item => ({
      url: `${SITE_URL}/tag/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt,
    })) || [];
  } catch {
    return [];
  }
}

// פורום – קטגוריות ושרשורים
async function getForum() {
  let result = [];

  try {
    // קטגוריות פורום
    const categories = await fetch(`${API_URL}/api/forum-categories?fields=slug,updatedAt&pagination[pageSize]=1000`);
    const categoriesJson = await categories.json();

    const categoryUrls = categoriesJson.data?.map(item => ({
      url: `${SITE_URL}/forum/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt,
    })) || [];

    result.push(...categoryUrls);
  } catch {}

  try {
    // שרשורים בפורום
    const threads = await fetch(`${API_URL}/api/forum-threads?fields=slug,updatedAt&pagination[pageSize]=1000`);
    const threadsJson = await threads.json();

    const threadUrls = threadsJson.data?.map(item => ({
      url: `${SITE_URL}/forum/${item.attributes.slugCategory}/${item.attributes.slug}`,
      lastModified: item.attributes.updatedAt,
    })) || [];

    result.push(...threadUrls);
  } catch {}

  return result;
}

export default async function sitemap() {
  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/contact`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
  ];

  const [articles, categories, tags, forum] = await Promise.all([
    getArticles(),
    getCategories(),
    getTags(),
    getForum(),
  ]);

  return [
    ...staticRoutes,
    ...articles,
    ...categories,
    ...tags,
    ...forum,
  ];
}
