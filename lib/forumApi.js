// lib/forumApi.js
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "https://onmotor-strapi.onrender.com";

/* 🟩 קבלת כל הקטגוריות */
export async function fetchForumCategories() {
  const res = await fetch(`${API_URL}/api/forum-categories?populate=*`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("שגיאה בטעינת קטגוריות");
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

/* 🟦 קבלת כל השרשורים לפי slug קטגוריה */
export async function fetchThreadsByCategorySlug(slug) {
  const res = await fetch(
    `${API_URL}/api/forum-threads?filters[category][slug][$eq]=${slug}&populate=*`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("שגיאה בטעינת דיונים לפי קטגוריה");
  const json = await res.json();

  return (
    json.data?.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title || item.attributes?.title,
      slug: item.slug || item.attributes?.slug,
      content: extractText(item.content || item.attributes?.content),
      author: item.author || item.attributes?.author,
      date: item.date || item.attributes?.date,
      category:
        item.category?.name ||
        item.attributes?.category?.data?.attributes?.name ||
        null,
    })) || []
  );
}

/* 🔹 פונקציה פנימית שמחלצת טקסט מ־Rich Text Blocks */
function extractText(blocks) {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks;
  if (Array.isArray(blocks)) {
    return blocks
      .map((b) => b.children?.map((child) => child.text).join(" "))
      .join("\n");
  }
  return "";
}

/* 🟨 קבלת שרשור בודד לפי slug */
export async function fetchThreadBySlug(threadSlug) {
  try {
    const decodedSlug = decodeURIComponent(threadSlug);

    // 🔹 חיפוש גם לפי decoded וגם לפי encoded
    const query = new URLSearchParams({
      "filters[$or][0][slug][$eq]": decodedSlug,
      "filters[$or][1][slug][$eq]": threadSlug,
      populate: "*",
    });

    const res = await fetch(`${API_URL}/api/forum-threads?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("שגיאה בטעינת דיון לפי slug");
    const json = await res.json();

    const item = json.data?.[0];
    if (!item) throw new Error("דיון לא נמצא");

    return {
      id: item.id,
      documentId: item.documentId,
      title: item.title || item.attributes?.title,
      slug: item.slug || item.attributes?.slug,
      content: extractText(item.content || item.attributes?.content),
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
  } catch (err) {
    console.error("❌ שגיאה בטעינת דיון לפי slug:", err);
    throw err;
  }
}

/* 🟧 קבלת תגובות לפי slug של דיון */
export async function fetchCommentsByThreadSlug(threadSlug) {
  const decodedSlug = decodeURIComponent(threadSlug);
  const res = await fetch(
    `${API_URL}/api/forum-comments?filters[forum_thread][slug][$eq]=${decodedSlug}&sort[0]=createdAt:asc&populate=*`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("שגיאה בטעינת תגובות לפי slug");
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

/* 🟥 שליחת תגובה דרך API צד שרת */
export async function addCommentByThreadSlug({ threadSlug, text, author }) {
  console.log("🟦 ניסיון לשלוח תגובה:", { threadSlug, author, text });

  const res = await fetch("/api/forum/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadSlug, text, author }),
  });

  const responseText = await res.text();
  console.log("📩 תגובת שרת מקומית:", responseText);

  if (!res.ok) {
    console.error("❌ שגיאה בשליחת תגובה:", res.status, res.statusText);
    throw new Error(`שגיאה בשליחת תגובה (${res.status})`);
  }

  const json = JSON.parse(responseText);
  console.log("✅ תגובה נשלחה בהצלחה:", json);
  return json.data;
}

/* 🟦 פתיחת שרשור חדש לפי slug קטגוריה */
export async function addThread({ title, content, author, categorySlug }) {
  try {
    console.log("🚀 יצירת דיון חדש...");
    console.log("➡️ categorySlug:", categorySlug);

    // שליפת מזהה קטגוריה לפי slug
    const catRes = await fetch(
      `${API_URL}/api/forum-categories?filters[slug][$eq]=${categorySlug}`
    );
    const catJson = await catRes.json();
    const categoryId = catJson?.data?.[0]?.id;
    if (!categoryId) throw new Error("לא נמצאה קטגוריה מתאימה ל-slug");

    // יצירת slug ייחודי לכותרת
    const threadSlug = encodeURIComponent(
      title.trim().toLowerCase().replace(/\s+/g, "-")
    );

    // Rich Text Blocks
    const contentBlocks = [
      {
        type: "paragraph",
        children: [{ type: "text", text: content }],
      },
    ];

    const body = {
      data: {
        title,
        slug: threadSlug,
        content: contentBlocks,
        author,
        category: categoryId,
      },
    };

    console.log("📤 גוף הבקשה ל-Strapi:", body);

    const res = await fetch(`${API_URL}/api/forum-threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    console.log("📩 תגובת Strapi:", responseText);

    if (!res.ok) {
      console.error("❌ שגיאה ביצירת דיון חדש:", res.status, res.statusText);
      throw new Error(`שגיאה ביצירת דיון חדש (${res.status})`);
    }

    const json = JSON.parse(responseText);
    console.log("✅ נוצר דיון:", json);
    return json.data;
  } catch (err) {
    console.error("⚠️ addThread error:", err);
    throw err;
  }
}
