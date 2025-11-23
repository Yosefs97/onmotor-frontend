// app/api/sidebar-middle/route.js

export const revalidate = 120; // שמור פעמיים בדקה

export async function GET() {
  const base = process.env.STRAPI_API_URL;

  try {
    const res = await fetch(
      `${base}/api/sidebar-middles?populate=image&populate=video`,
      { next: { revalidate: 120 } }
    );

    const json = await res.json();

    return Response.json({ items: json.data || [] });
  } catch (err) {
    return Response.json({ items: [], error: err.message }, { status: 500 });
  }
}
