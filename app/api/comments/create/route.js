import { parse } from 'cookie';

export async function POST(req) {
  try {
    const body = await req.json();

    const content = body.content ?? body.comment;
    const articleIdRaw = body.articleId ?? body.article;
    const parentId = body.parentId ?? null;

    if (!content || !articleIdRaw) {
      return new Response(JSON.stringify({ error: 'Missing fields', got: body }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // שליפת JWT מה-cookie
    const cookies = parse(req.headers.get('cookie') || '');
    const token = cookies.token;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const articleId = Number(articleIdRaw);

    // ✅ יצירה ב-Strapi – בלי connect
    const createRes = await fetch(`${process.env.STRAPI_API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          content,
          article: articleId,   // 👈 השינוי
          parent_id: parentId,
        },
      }),
    });

    const created = await createRes.json();
    if (!createRes.ok) {
      return new Response(JSON.stringify({ error: created?.error || created }), {
        status: createRes.status, headers: { 'Content-Type': 'application/json' },
      });
    }

    const newCommentId = created?.data?.id;

    // שליפה חוזרת עם populate כדי להחזיר ל-frontend author ו-article
    const fetchRes = await fetch(
      `${process.env.STRAPI_API_URL}/api/comments/${newCommentId}?populate=author,article`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const populated = await fetchRes.json();

    return new Response(JSON.stringify({ data: populated.data }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
