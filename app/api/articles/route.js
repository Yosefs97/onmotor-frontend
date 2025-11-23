export const revalidate = 60;

export async function GET(request) {
  try {
    const base = process.env.STRAPI_API_URL;
    const { searchParams } = new URL(request.url);

    const params = searchParams.toString(); // מאפשר filters דינמיים
    const url = `${base}/api/articles?populate=*&${params}`;

    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();

    return Response.json(json);
  } catch (err) {
    console.error('❌ API /articles error:', err);
    return Response.json({ data: [] }, { status: 500 });
  }
}
