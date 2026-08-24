// app/page.js
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

  // ✅ מוודאים ש-href נמצא ברשימת השדות
  const url =
    `${base}/api/articles?` +
    `fields=title,slug,href,category,date,headline,subdescription,description,tags_txt&` +
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

    return json.data.map((item) => {
      // ✅ חישוב הסלאג הנכון (עברית אם יש, אנגלית אם אין)
      const correctSlug = item.attributes.href || item.attributes.slug;

      return {
        id: item.id,
        ...item.attributes,
        // אנו מעדכנים את הסלאג שיהיה העברית
        slug: correctSlug,
        // ✅ וזה החלק החשוב ביותר: יצירת נתיב מלא ללינק
        href: `/articles/${correctSlug}`, 
      };
    });
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
      <div className="bg-om-void text-om-chrome -mx-1 sm:-mx-4">
        <MainGridContentDesktop articles={articles} />

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tightish text-white px-4 mt-8">
          OnMotor Media - מגזין אופנועים ישראלי
        </h1>

        <p className="px-4 mt-3 mb-8 text-om-mist font-medium leading-relaxed">
          מגזין אופנועים בישראל - חדשות, סקירות, מבחני דרכים, ציוד, טיפים
          לקהילת הרוכבים התוססת בישראל.
        </p>
      </div>
    </PageContainer>
  );
}