// /scripts/migrate-tags.js
/**
 * שימוש:
 * 1) הגדר קובץ .env מקומי עם:
 *    STRAPI_URL=http://localhost:1337
 *    STRAPI_TOKEN=xxx   // API token עם Full access זמנית
 * 2) הרץ: node scripts/migrate-tags.js
 */

const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_TOKEN;

if (!TOKEN) {
  console.error('❌ Missing STRAPI_TOKEN');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function getAllArticles() {
  // מושך עמודים ברצף (Strapi v4 – pagination)
  const pageSize = 100;
  let page = 1;
  let all = [];

  while (true) {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
      { headers }
    );
    const json = await res.json();
    const rows = json.data || [];
    all = all.concat(rows);
    const total = json.meta?.pagination?.total || 0;
    if (page * pageSize >= total) break;
    page++;
  }
  return all;
}

async function findOrCreateTagByName(name) {
  const q = new URLSearchParams({
    'filters[name][$eqi]': name,
  }).toString();

  const findRes = await fetch(`${STRAPI_URL}/api/tags?${q}`, { headers });
  const findJson = await findRes.json();
  const existing = findJson.data?.[0];
  if (existing) return existing;

  // צור תג חדש
  const createRes = await fetch(`${STRAPI_URL}/api/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: { name } }),
  });
  const createJson = await createRes.json();
  return createJson.data;
}

async function updateArticleTags(articleId, tagIds) {
  await fetch(`${STRAPI_URL}/api/articles/${articleId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ data: { tags: tagIds } }),
  });
}

(async () => {
  try {
    console.log('🔎 Fetching articles...');
    const articles = await getAllArticles();

    for (const a of articles) {
      const attrs = a.attributes || a; // תלוי איך החזרת את המודל בעבר
      // נסה לתפוס את התגים הישנים: יכול להיות שדה טקסט/JSON בשם tags
      const oldTags =
        Array.isArray(attrs.tags) ? attrs.tags :
        Array.isArray(attrs.tags?.data) ? attrs.tags.data.map(t => t.attributes?.name).filter(Boolean) :
        [];

      // אם אין תגים במערך – דלג
      if (!oldTags.length) continue;

      // מצא/צור IDs של tags חדשים
      const tagIds = [];
      for (const raw of oldTags) {
        const name = String(raw).trim();
        if (!name) continue;
        const tag = await findOrCreateTagByName(name);
        if (tag?.id) tagIds.push(tag.id);
      }

      if (tagIds.length) {
        console.log(`✍️  Article ${a.id} -> tags: ${tagIds.join(',')}`);
        await updateArticleTags(a.id, tagIds);
      }
    }

    console.log('✅ Done migration.');
  } catch (e) {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  }
})();
