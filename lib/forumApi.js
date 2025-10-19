// lib/forumApi.js
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  'https://onmotor-strapi.onrender.com';

/* 🟩 קבלת כל הקטגוריות */
export async function fetchForumCategories() {
  const res = await fetch(`${API_URL}/api/forum-categories?populate=*`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('שגיאה בטעינת קטגוריות');
  const json = await res.json();

  return (
    json.data?.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.name || item.attributes?.name,
      slug: item.slug || item.attributes?.slug,
      description: item.description || item.attributes?.description,
    })) || []
  );
}

/* 🟦 קבלת כל השרשורים לפי slug של קטגוריה */
export async function fetchThreadsByCategorySlug(slug) {
  const res = await fetch(
    `${API_URL}/api/forum-threads?filters[category][slug][$eq]=${slug}&populate=*`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת דיונים לפי קטגוריה');
  const json = await res.json();

  return (
    json.data?.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title || item.attributes?.title,
      slug: item.slug || item.attributes?.slug, // ✅ עבודה לפי slug בלבד
      content: item.content || item.attributes?.content || '',
      author: item.author || item.attributes?.author,
      date: item.date || item.attributes?.date,
      category:
        item.category?.name ||
        item.attributes?.category?.data?.attributes?.name ||
        null,
    })) || []
  );
}

/* 🟨 קבלת שרשור בודד לפי slug */
export async function fetchThreadBySlug(threadSlug) {
  const res = await fetch(
    `${API_URL}/api/forum-threads?filters[slug][$eq]=${threadSlug}&populate=*`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת דיון לפי slug');
  const json = await res.json();
  const item = json.data?.[0];
  if (!item) throw new Error('דיון לא נמצא');

  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title || item.attributes?.title,
    slug: item.slug || item.attributes?.slug,
    content: item.content || item.attributes?.content || '',
    author: item.author || item.attributes?.author,
    category:
      item.category?.name ||
      item.attributes?.category?.data?.attributes?.name ||
      null,
    comments:
      item.comments ||
      item.attributes?.comments?.data?.map((c) => ({
        id: c.id,
        text: c.text || c.attributes?.text,
        author: c.author || c.attributes?.author,
        date: c.date || c.attributes?.date,
      })) ||
      [],
  };
}

/* 🟧 קבלת תגובות לפי slug של דיון */
export async function fetchCommentsByThreadSlug(threadSlug) {
  const res = await fetch(
    `${API_URL}/api/forum-comments?filters[forum_thread][slug][$eq]=${threadSlug}&sort[0]=createdAt:asc&populate=*`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת תגובות לפי slug');
  const json = await res.json();

  return (
    json.data?.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      text: c.text || c.attributes?.text,
      author: c.author || c.attributes?.author,
      date: c.date || c.attributes?.date,
    })) || []
  );
}

/* 🟥 הוספת תגובה לפי slug של דיון */
export async function addCommentByThreadSlug({ threadSlug, text, author }) {
  // שלב 1: שליפת מזהה הדיון לפי slug
  const threadRes = await fetch(
    `${API_URL}/api/forum-threads?filters[slug][$eq]=${threadSlug}`
  );
  const threadJson = await threadRes.json();
  const threadId = threadJson?.data?.[0]?.id;
  if (!threadId) throw new Error('לא נמצא דיון תואם ל-slug');

  // שלב 2: יצירת תגובה חדשה
  const res = await fetch(`${API_URL}/api/forum-comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { text, author, forum_thread: threadId },
    }),
  });

  if (!res.ok) throw new Error('שגיאה בשליחת תגובה לפי slug');
  const json = await res.json();
  return json.data;
}

/* 🟦 פתיחת שרשור חדש לפי slug קטגוריה */
export async function addThread({ title, content, author, categorySlug }) {
  try {
    // שלב 1: מציאת ID של הקטגוריה לפי ה-slug
    const catRes = await fetch(
      `${API_URL}/api/forum-categories?filters[slug][$eq]=${categorySlug}`
    );
    const catJson = await catRes.json();
    const categoryId = catJson?.data?.[0]?.id;
    if (!categoryId) throw new Error('לא נמצאה קטגוריה מתאימה ל-slug');

    // שלב 2: יצירת slug ייחודי לדיון
    const threadSlug = encodeURIComponent(
      title.trim().toLowerCase().replace(/\s+/g, '-')
    );

    // שלב 3: יצירת דיון חדש
    const res = await fetch(`${API_URL}/api/forum-threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { title, slug: threadSlug, content, author, category: categoryId },
      }),
    });

    if (!res.ok) throw new Error('שגיאה ביצירת דיון חדש');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('⚠️ addThread error:', err);
    throw err;
  }
}
