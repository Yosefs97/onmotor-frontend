export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const res = await fetch(`${process.env.STRAPI_API_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: { cookie: req.headers.get('cookie') },
    });

    if (!res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ error: data.error }), { status: res.status });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('💥 Error deleting comment:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
