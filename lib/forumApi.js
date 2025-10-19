// lib/forumApi.js

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://onmotor-strapi.onrender.com';

// 🟩 קבלת כל הקטגוריות
export async function fetchForumCategories() {
  const res = await fetch(`${API_URL}/api/forum/categories?populate=*`, { cache: 'no-store' });
  if (!res.ok) throw new Error('שגיאה בטעינת קטגוריות');
  const json = await res.json();
  return json.data?.map(item => ({
    id: item.id,
    name: item.attributes.name,
    description: item.attributes.description
  })) || [];
}

// 🟦 קבלת כל השרשורים בקטגוריה מסוימת
export async function fetchThreadsByCategory(categoryId) {
  const res = await fetch(
    `${API_URL}/api/forum/threads?filters[category][id][$eq]=${categoryId}&populate=*`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת דיונים לפי קטגוריה');
  const json = await res.json();
  return json.data?.map(item => ({
    id: item.id,
    title: item.attributes.title,
    content: item.attributes.content,
    author: item.attributes.author,
    date: item.attributes.date,
    comments: item.attributes.comments?.data || []
  })) || [];
}

// 🟨 קבלת שרשור בודד לפי מזהה
export async function fetchThreadById(id) {
  const res = await fetch(`${API_URL}/api/forum/threads/${id}?populate[comments][populate]=*`);
  if (!res.ok) throw new Error('שגיאה בטעינת דיון');
  const json = await res.json();
  const item = json.data;
  return {
    id: item.id,
    title: item.attributes.title,
    content: item.attributes.content,
    author: item.attributes.author,
    date: item.attributes.date,
    comments: item.attributes.comments?.data || []
  };
}

// 🟧 קבלת תגובות לפי מזהה שרשור
export async function fetchComments(threadId) {
  const res = await fetch(
    `${API_URL}/api/forum/comments?filters[thread][id][$eq]=${threadId}&sort[0]=date:asc`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('שגיאה בטעינת תגובות');
  const json = await res.json();
  return json.data?.map(c => ({
    id: c.id,
    text: c.attributes.text,
    author: c.attributes.author,
    date: c.attributes.date
  })) || [];
}

// 🟥 הוספת תגובה חדשה
export async function addComment({ threadId, text, author }) {
  const res = await fetch(`${API_URL}/api/forum/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { text, author, thread: threadId }
    })
  });
  if (!res.ok) throw new Error('שגיאה בשליחת תגובה');
  const json = await res.json();
  return json.data;
}

// 🟦 פתיחת שרשור חדש
export async function addThread({ title, content, author, categoryId }) {
  const res = await fetch(`${API_URL}/api/forum/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { title, content, author, category: categoryId }
    })
  });
  if (!res.ok) throw new Error('שגיאה ביצירת דיון חדש');
  const json = await res.json();
  return json.data;
}
