export const revalidate = 60;

export async function GET() {
  const base = process.env.STRAPI_API_URL;

  try {
    const url = `${base}/api/articles?populate=*`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();

    // תחזיר את המבנה המקורי בדיוק
    return Response.json(json);
  } catch (e) {
    console.error("❌ API main-grid error:", e);
    return Response.json({ data: [] }, { status: 500 });
  }
}
