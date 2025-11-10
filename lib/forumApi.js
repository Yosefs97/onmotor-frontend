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

  console.log("📁 קטגוריות שהתקבלו:", json.data);

  return (
    json.data?.map((item) => {
      const attrs = item.attributes || {};
      return {
        id: item.id,
        documentId: item.documentId,
        name: attrs.name || item.name || "ללא שם",
        slug: attrs.slug || item.slug || "",
        description: attrs.description || item.description || "",
      };
    }) || []
  );
}

/* 🟦 קבלת כל השרשורים לפי slug קטגוריה */
export async function fetchThreadsByCategorySlug(slug) {
  const decodedSlug = decodeURIComponent(slug || "").trim();

  const res = await fetch(
    `${API_URL}/api/forum-threads?filters[category][slug][$eq]=${decodedSlug}&sort=pinned:desc,lastActivity:desc&populate=*`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("שגיאה בטעינת דיונים לפי קטגוריה");
  const json = await res.json();
  console.log("📦 תגובה מלאה מ־Strapi:", JSON.stringify(json, null, 2));

  return (
    json.data?.map((item) => {
      const attrs = item.attributes || {};
      return {
        id: item.id,
        documentId: item.documentId,
        title: attrs.title || item.title,
        slug: attrs.slug || item.slug,
        content: extractText(attrs.content || item.content),
        author: attrs.author || item.author,
        date: attrs.date || item.date,
        pinned: attrs.pinned,
        locked: attrs.locked,
        views: attrs.views || 0,
        lastActivity: attrs.lastActivity,
        category:
          attrs.category?.data?.attributes?.name ||
          item.category?.name ||
          null,
      };
    }) || []
  );
}

/* 🔹 חילוץ טקסט מ־Rich Text Blocks */
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

// lib/forumApi.js
export async function fetchThreadBySlug(threadSlug) {
  try {
    const decodedSlug = decodeURIComponent(threadSlug || "").trim();
    console.log("📎 טוען דיון לפי slug:", decodedSlug);

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com";
    const proxyUrl = `${SITE_URL}/api/forum-thread?slug=${encodeURIComponent(decodedSlug)}`;

    console.log("🌐 קריאה דרך proxy:", proxyUrl);
    const res = await fetch(proxyUrl, { cache: "no-store" });

    if (!res.ok) {
      console.error("❌ שגיאה בקריאה דרך proxy:", res.status, res.statusText);
      throw new Error("שגיאה בטעינת דיון דרך proxy");
    }

    const json = await res.json();
    console.log("📦 תגובת Proxy:", json);

    const item = json.data?.[0];
    if (!item) {
      console.warn("⚠️ לא נמצא דיון עם slug:", decodedSlug);
      throw new Error("דיון לא נמצא");
    }

    // 🟢 תמיכה גם במבנה החדש של Strapi (data ישירות, לא attributes)
    const attrs = item.attributes ? item.attributes : item;

    return {
      id: item.id,
      documentId: item.documentId,
      title: attrs.title || "ללא כותרת",
      slug: attrs.slug || "",
      content: Array.isArray(attrs.content)
        ? attrs.content.map((block) =>
            block.children?.map((c) => c.text || "").join(" ")
          ).join("\n\n")
        : attrs.content || "",
      author: attrs.author || "לא צוין",
      date: attrs.date || null,
      pinned: attrs.pinned || false,
      locked: attrs.locked || false,
      views: attrs.views || 0,
      lastActivity: attrs.lastActivity || null,
      category:
        attrs.category?.data?.attributes?.name ||
        attrs.category?.name ||
        null,
      comments: (attrs.comments || []).map((c) => ({
        id: c.id,
        text: c.text || "",
        author: c.author || "אנונימי",
        date: c.date || c.createdAt,
        reply_to: c.reply_to?.id || null,
      })),
    };
  } catch (err) {
    console.error("❌ fetchThreadBySlug (proxy) error:", err);
    throw err;
  }
}



/* 🟧 קבלת תגובות לפי slug */
export async function fetchCommentsByThreadSlug(threadSlug) {
  try {
    const decodedSlug = decodeURIComponent(threadSlug);
    const query = new URLSearchParams({
      "filters[forum_thread][slug][$eq]": decodedSlug,
      populate: "reply_to",
      sort: "createdAt:asc",
    });

    const res = await fetch(`${API_URL}/api/forum-comments?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("שגיאה בטעינת תגובות לדיון");
    const json = await res.json();

    return (
      json.data?.map((c) => ({
        id: c.id,
        text: c.attributes?.text,
        author: c.attributes?.author,
        date: c.attributes?.createdAt,
        reply_to: c.attributes?.reply_to?.data?.id || null,
      })) || []
    );
  } catch (err) {
    console.error("❌ fetchCommentsByThreadSlug error:", err);
    return [];
  }
}

/* 🟥 הוספת תגובה לפי slug של דיון */
export async function addCommentByThreadSlug({ threadSlug, text, author, reply_to }) {
  console.log("📨 שליחת תגובה חדשה...");
  console.log("🧩 slug שהתקבל:", threadSlug);

  const decodedSlug = decodeURIComponent(threadSlug);
  const query = new URLSearchParams({
    "filters[slug][$eq]": decodedSlug,
  });

  const threadRes = await fetch(`${API_URL}/api/forum-threads?${query.toString()}`);
  const threadJson = await threadRes.json();
  const threadId = threadJson?.data?.[0]?.id;

  if (!threadId) {
    console.error("❌ לא נמצא דיון תואם ל-slug:", decodedSlug);
    throw new Error("לא נמצא דיון תואם ל-slug");
  }

  const body = {
    data: {
      text,
      author,
      forum_thread: threadId,
      reply_to: reply_to || null,
      date: new Date().toISOString(),
    },
  };

  const res = await fetch(`${API_URL}/api/forum-comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  console.log("📩 תגובת Strapi (תגובה):", responseText);

  if (!res.ok) {
    console.error("❌ שגיאה בשליחת תגובה:", res.status, res.statusText);
    throw new Error(`שגיאה בשליחת תגובה (${res.status})`);
  }

  let json = null;
  try {
    json = JSON.parse(responseText);
  } catch {
    console.log("📩 תגובה לא בפורמט JSON:", responseText);
  }

  await updateLastActivity(threadId);
  console.log("✅ תגובה נוצרה:", json);
  return json?.data;
}

/* 🟨 פתיחת שרשור חדש */
export async function addThread({ title, content, author, categorySlug }) {
  try {
    const catRes = await fetch(
      `${API_URL}/api/forum-categories?filters[slug][$eq]=${categorySlug}`
    );
    const catJson = await catRes.json();
    const categoryId = catJson?.data?.[0]?.id;

    if (!categoryId) throw new Error("לא נמצאה קטגוריה מתאימה ל-slug");

    const normalizeSlug = (text) => {
      return text
        .normalize("NFD")
        .replace(/[\u0590-\u05FF]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
    };

    const threadSlug = normalizeSlug(title) || `thread-${Date.now()}`;

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
        pinned: false,
        locked: false,
        views: 0,
        lastActivity: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    };

    console.log("📦 BODY שנשלח ל־Strapi:", JSON.stringify(body, null, 2));

    const res = await fetch(`${API_URL}/api/forum-threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    let json = null;

    try {
      json = JSON.parse(responseText);
    } catch {
      console.log("📩 תגובה לא בפורמט JSON:", responseText);
    }

    if (!res.ok) {
      console.error("❌ שגיאה ביצירת דיון חדש:", res.status, res.statusText);
      console.log("📩 תגובת שרת מלאה:", responseText);
      throw new Error(`שגיאה ביצירת דיון חדש (${res.status})`);
    }

    console.log("✅ נוצר דיון:", json);
    return json?.data;
  } catch (err) {
    console.error("⚠️ addThread error:", err);
    throw err;
  }
}

/* 🟦 העלאת views */
export async function incrementThreadViews(threadId, currentViews = 0) {
  try {
    await fetch(`${API_URL}/api/forum-threads/${threadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { views: currentViews + 1 },
      }),
    });
  } catch (err) {
    console.error("⚠️ incrementThreadViews:", err);
  }
}

/* 🟪 עדכון תאריך פעילות אחרון */
export async function updateLastActivity(threadId) {
  try {
    await fetch(`${API_URL}/api/forum-threads/${threadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { lastActivity: new Date().toISOString() },
      }),
    });
  } catch (err) {
    console.error("⚠️ updateLastActivity:", err);
  }
}
