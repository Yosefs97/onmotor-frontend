//app/page.js
export const revalidate = 60;

import React from "react";
import MainGridContentDesktop from "@/components/MainGridContentDesktop";
import PageContainer from "@/components/PageContainer";

/* -----------------------------------------------------------
   ⚙️ טעינת כתבות מ־Strapi (Server Component)
----------------------------------------------------------- */
async function fetchArticles() {
  const base = process.env.STRAPI_API_URL;
  if (!base) return [];

  const url =
    `${base}/api/articles?` +
    `fields=title,slug,category,date,headline,subdescription,description,tags_txt&` +
    `populate[image][fields]=url,alternativeText&` +
    `populate[gallery][fields]=url,alternativeText&` +
    `populate[external_media_links]=*&` +
    `pagination[limit]=120&` +
    `sort=date:desc`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const json = await res.json();

    return json.data.map((item) => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch {
    return [];
  }
}

/* -----------------------------------------------------------
   🏠 עמוד הבית
----------------------------------------------------------- */
export default async function HomePage() {
  const articles = await fetchArticles();

  return (
    <PageContainer title="דף הבית" breadcrumbs={[]}>
      <MainGridContentDesktop articles={articles} />

      <h1 className="text-2xl font-bold text-[#e60000] px-4 mt-4">
        OnMotor Media - מגזין אופנועים ישראלי
      </h1>

      <p className="px-4 mt-2 mb-4 text-gray-700">
        מגזין אופנועים בישראל - חדשות, סקירות, מבחני דרכים, ציוד, טיפים
        לקהילת הרוכבים התוססת בישראל.
      </p>
    </PageContainer>
  );
}
