export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const url = `https://onmotor-strapi.onrender.com/api/forum-threads?filters[slug][$eq]=${slug}&populate=comments,comments.reply_to,category`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("❌ Proxy fetch error:", err);
    return new Response(JSON.stringify({ error: "Proxy failed" }), { status: 500 });
  }
}
