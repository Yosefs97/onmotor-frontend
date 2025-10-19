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
      slug: item.slug || item.attributes?.slug, // ✅ שדה slug נדרש
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
      content: Array.isArray(item.content)
        ? item.content
            .map((block) =>
              block.children?.map((child) => child.text).join(' ')
            )
            .join('\n')
        : item.content || item.attributes?.content || '',
      author: item.author || item.attributes?.author,
      date: item.date || item.attributes?.date,
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
    })) || []
  );
}

/* 🟨 קבלת שרשור בודד לפי מזהה */
export async function fetchThreadById(id) {
  const res = await fetch(`${API_URL}/api/forum-threads/${id}?populate=*`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('שגיאה בטעינת דיון');
  const json = await res.json();
  const item = json.data;

  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title || item.attributes?.title,
    content: Array.isArray(item.content)
      ? item.content
          .map((block) => block.children?.map((child) => child.text).join(' '))
          .join('\n')
      : item.content || item.attributes?.content || '',
    author: item.author || item.attributes?.author,
    date: item.date || item.attributes?.date,
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

/* 🟧 קבלת תגובות לפי מזהה שרשור */
export async function fetchComments(threadId) {
  const res = await fetch(
    `${API_URL}/api/forum-comments?filters[forum_thread][id][$eq]=${threadId}&sort[0]=createdAt:asc&populate=*`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת תגובות');
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

/* 🟥 הוספת תגובה חדשה */
export async function addComment({ threadId, text, author }) {
  const res = await fetch(`${API_URL}/api/forum-comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { text, author, forum_thread: threadId },
    }),
  });
  if (!res.ok) throw new Error('שגיאה בשליחת תגובה');
  const json = await res.json();
  return json.data;
}

/* 🟦 פתיחת שרשור חדש לפי slug */
export async function addThread({ title, content, author, categorySlug }) {
  try {
    // שלב 1: מצא את ה-ID של הקטגוריה לפי ה-slug
    const catRes = await fetch(
      `${API_URL}/api/forum-categories?filters[slug][$eq]=${categorySlug}`
    );
    const catJson = await catRes.json();
    const categoryId = catJson?.data?.[0]?.id;

    if (!categoryId) throw new Error('לא נמצאה קטגוריה מתאימה ל-slug');

    // שלב 2: צור דיון חדש עם ID של הקטגוריה
    const res = await fetch(`${API_URL}/api/forum-threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { title, content, author, category: categoryId },
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
