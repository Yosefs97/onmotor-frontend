//app/page.js
export const dynamic = "force-dynamic";

import React from "react";
import MainGridContentDesktop from "@/components/MainGridContentDesktop";
import PageContainer from "@/components/PageContainer";
import { getMainImage } from "@/utils/resolveMainImage";

async function fetchArticles() {
  const base = process.env.STRAPI_API_URL;

  if (!base) {
    console.error("❌ STRAPI_API_URL לא הוגדר");
    return [];
  }

  const url = `${base}/api/articles?populate=*`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("❌ שגיאת API:", res.status);
      return [];
    }

    const json = await res.json();

    return json.data.map((item) => {
      const attrs = item.attributes;

      const { mainImage, mainImageAlt } = getMainImage(attrs);

      // 🟢 תיקון category
      const category =
        attrs.category?.data?.attributes?.slug ||
        attrs.category?.data?.attributes?.name ||
        attrs.category ||
        "general";

      // 🟢 תיקון subcategory
      const subcategory =
        attrs.subcategory?.data?.attributes?.slug ||
        attrs.subcategory?.data?.attributes?.name ||
        attrs.subcategory ||
        "general";

      return {
        id: item.id,
        title: attrs.title,
        slug: attrs.slug,
        category,
        subcategory,
        date: attrs.date,
        description: attrs.description,
        subdescription: attrs.subdescription,
        headline: attrs.headline,
        tags: attrs.tags,
        image: mainImage,
        imageAlt: mainImageAlt,
      };
    });
  } catch (err) {
    console.error("❌ שגיאה בטעינת כתבות:", err.message);
    return [];
  }
}

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
