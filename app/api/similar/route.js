import { NextResponse } from "next/server";

export const revalidate = 300; // Cache 5 דקות

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");

  const API = process.env.STRAPI_API_URL;

  const url =
    `${API}/api/articles?filters[slug][$ne]=${slug}` +
    `&filters[category][$eq]=${category}` +
    `&fields=title,slug,date,headline,description` +
    `&populate[image][fields]=url,alternativeText` +
    `&populate[gallery][fields]=url,alternativeText`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  const json = await res.json();

  return NextResponse.json(json.data || []);
}
