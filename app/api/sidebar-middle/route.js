// /app/api/sidebar-middle/route.js

const STRAPI_URL =
  process.env.STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL;

export const revalidate = 120; // 2 דקות קאש בצד השרת

export async function GET() {
  if (!STRAPI_URL) {
    console.error("❌ STRAPI_URL is not defined");
    return Response.json(
      { items: [], error: "STRAPI_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/sidebar-middles?populate=image&populate=video`,
      { cache: "no-store" } // כאן מותר no-store, הקאש מתבצע בשכבת ה־fetch מהדף
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("❌ Strapi sidebar-middles error:", res.status, text);
      return Response.json(
        { items: [], error: "Strapi error" },
        { status: 500 }
      );
    }

    const json = await res.json();

    // אם יש attributes – נשטח אותם, אחרת נחזיר כמו שהוא
    const items =
      json.data?.map((item) => {
        if (item.attributes) {
          return {
            id: item.id,
            ...item.attributes,
          };
        }
        return item;
      }) || [];

    return Response.json({ items }, { status: 200 });
  } catch (err) {
    console.error("❌ sidebar-middle fetch failed:", err);
    return Response.json(
      { items: [], error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
