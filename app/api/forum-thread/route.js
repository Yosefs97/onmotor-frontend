// app/api/forum-thread/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const url = `https://onmotor-strapi.onrender.com/api/forum-threads?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=comments,comments.reply_to,category`;

  console.log("🔁 Proxying to Strapi:", url);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Proxy fetch error:", err);
    return new Response(JSON.stringify({ error: "Proxy failed", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
