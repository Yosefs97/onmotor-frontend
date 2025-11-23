export const revalidate = 60; // Cache בצד השרת

export async function GET() {
  const base = process.env.STRAPI_API_URL;

  try {
    const url = `${base}/api/articles?populate=*`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    return Response.json(json.data);
  } catch (e) {
    console.error("❌ API main-grid error:", e);
    return Response.json([], { status: 500 });
  }
}
