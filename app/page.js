//app\page.js
export const dynamic = "force-dynamic";
import React from 'react';
import MainGridContentDesktop from '@/components/MainGridContentDesktop';
import PageContainer from '@/components/PageContainer';

/* -----------------------------------------------------------
   ⚙️ שלב 1: טעינת כתבות מ־Strapi (Server Component)
   - הקריאה נעשית בצד השרת כדי לשפר ביצועים (SSR)
   - התוצאה נשמרת בקאש ל־60 שניות (revalidate)
----------------------------------------------------------- */
async function fetchArticles() {
  const base = process.env.STRAPI_API_URL;

  if (!base) {
    throw new Error('❌ STRAPI_API_URL לא הוגדר בקובץ הסביבה');
  }

  const url = `${base}/api/articles?populate=*`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // ✅ קאש 60 שניות
    if (!res.ok) {
      throw new Error(`שגיאה בטעינה מה־API (${res.status})`);
    }

    const json = await res.json();
    return json.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (err) {
    console.error('❌ שגיאה בטעינת כתבות מהשרת:', err);
    return [];
  }
}

/* -----------------------------------------------------------
   🏠 שלב 2: עמוד הבית
   - עטוף בתוך PageContainer כדי לשמור על מבנה אחיד
   - מבטיח שהסיידרים יגללו באופן יחסי (sticky תקין)
   - שומר על רקע אחיד, RTL מלא ו־SEO תקין
----------------------------------------------------------- */
export default async function HomePage() {
  const articles = await fetchArticles();

  return (
    <PageContainer
      title="דף הבית"
      breadcrumbs={[]}
    >
      

      <MainGridContentDesktop articles={articles} />

      <h1 className="text-2xl font-bold text-[#e60000] px-4 mt-4">
        OnMotor Media - מגזין אופנועים ישראלי
      </h1>

      <p className="px-4 mt-2 mb-4 text-gray-700">
         .מגזין אופנועים בישראל - חדשות, סקירות, מבחני דרכים, ציוד, טיפים לקהילת הרוכבים התוססת בישראל
      </p>

    </PageContainer>
  );
}
