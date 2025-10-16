// app/api/comments/list/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('articleId');

  if (!articleId) {
    return new Response(JSON.stringify({ error: 'Missing articleId' }), { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.STRAPI_API_URL}/api/comments?filters[article][id][$eq]=${articleId}&populate=author,article`
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err) {
    console.error('שגיאה בשליפת תגובות:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
