//app/page.js
export const dynamic = "force-dynamic"; // ❗ חייב להישאר

import React from "react";
import MainGridContentDesktop from "@/components/MainGridContentDesktop";
import PageContainer from "@/components/PageContainer";

/* -----------------------------------------------------------
   ⚙️ טעינת כתבות מ־Strapi (Server Component)
   - דינאמי כדי למנוע נפילת build
   - עם revalidate כדי לחסוך Edge Requests
----------------------------------------------------------- */
async function fetchArticles() {
  const base = process.env.STRAPI_API_URL;

  if (!base) {
    console.error("❌ STRAPI_API_URL לא הוגדר");
    return [];
  }

  const url = `${base}/api/articles?populate=*`;

  try {
    // ⏳ הגבלת זמן כדי לא להתקע אם Strapi לא מגיב
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7 שניות

    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache ל־60 שניות
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("❌ שגיאת API:", res.status);
      return [];
    }

    const json = await res.json();

    return json.data.map((item) => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (err) {
    console.error("❌ שגיאה בטעינת כתבות:", err.message);
    return []; // fallback בטוח כדי לא להפיל את האתר
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
