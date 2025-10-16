export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const res = await fetch(`${process.env.STRAPI_API_URL}/api/comments/${id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie'),
      },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err) {
    console.error('💥 Error liking comment:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
