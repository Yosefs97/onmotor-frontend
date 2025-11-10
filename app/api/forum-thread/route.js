// app/api/forum-thread/route.js
import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "https://onmotor-strapi.onrender.com";

/**
 * 🔹 Proxy route לדיון לפי slug – גרסה תואמת Strapi v5
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    // ✅ populate לפי הפורמט החדש של Strapi v5
    const strapiUrl = `${STRAPI_URL}/api/forum-threads?filters[slug][$eq]=${encodeURIComponent(
      slug
    )}&populate[comments][populate][reply_to]=true&populate[category]=true`;

    console.log("🌍 Fetching from Strapi:", strapiUrl);

    const res = await fetch(strapiUrl, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Strapi fetch failed:", text);
      return NextResponse.json({ error: "Failed to fetch from Strapi" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
