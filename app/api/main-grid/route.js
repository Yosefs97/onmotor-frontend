// app/api/main-grid/route.js
export const revalidate = 60;

export async function GET() {
  const base = process.env.STRAPI_API_URL;

  try {
    // התיקון כאן: הוספנו limit=100 כדי להביא מספיק כתבות מכל הסוגים
    // והוספנו sort כדי לוודא שמגיעות החדשות ביותר
    const url = `${base}/api/articles?populate=*&pagination[limit]=100&sort=date:desc`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();

    return Response.json(json);
  } catch (e) {
    console.error("❌ API main-grid error:", e);
    return Response.json({ data: [] }, { status: 500 });
  }
}