// app/api/articles/route.js
export const revalidate = 60; // אפשר לשנות ל-30 או 120

export async function GET(request) {
  try {
    const base = process.env.STRAPI_API_URL;
    if (!base) {
      console.error('❌ STRAPI_API_URL לא מוגדר');
      return Response.json({ data: [] }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);

    // בונים את ה-URL ל-Strapi כולל populate ו-filters
    const params = new URLSearchParams(searchParams);
    if (!params.has('populate')) {
      params.set('populate', '*');
    }

    const url = `${base}/api/articles?${params.toString()}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error('❌ שגיאת Strapi:', res.status, await res.text());
      return Response.json({ data: [] }, { status: res.status });
    }

    const json = await res.json();
    return Response.json(json);
  } catch (err) {
    console.error('❌ API /api/articles error:', err);
    return Response.json({ data: [] }, { status: 500 });
  }
}
