// components/MainGridContentDesktop.jsx
'use client';
import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCards/ArticleCard';
import SectionWithHeader from './SectionWithHeader';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

/* ✅ פונקציה מאוחדת לתמונות (Strapi / Cloudinary / קישורים חיצוניים) */
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl; // Cloudinary או אתר חיצוני
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

/* ✅ פונקציה מרכזית לבחירת תמונה מכל סוג שדה */
function getMainImage(attrs) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || 'תמונה ראשית';

  // 1️⃣ תמונה ראשית משדה image.data.attributes.url
  if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  }
  // 2️⃣ תמונה ישירה מהשדה image.url
  else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  }
  // 3️⃣ תמונה ראשונה מהגלריה
  else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  }
  // 4️⃣ external_media_links (למשל קישורים חיצוניים של KTM וכו')
  else if (
    Array.isArray(attrs.external_media_links) &&
    attrs.external_media_links.length > 0
  ) {
    const validLinks = attrs.external_media_links.filter(
      (l) => typeof l === 'string' && l.startsWith('http')
    );
    if (validLinks.length > 1) {
      mainImage = validLinks[1].trim(); // השני
    } else if (validLinks.length > 0) {
      mainImage = validLinks[0].trim(); // הראשון
    }
    mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
  }

  return { mainImage, mainImageAlt };
}

export default function MainGridContentDesktop() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_URL}/api/articles?populate=*`, { cache: 'no-store' });
        const json = await res.json();

        const mapped =
          json.data?.map((a) => {
            const attrs = a.attributes || a;
            const { mainImage, mainImageAlt } = getMainImage(attrs);

            return {
              id: a.id,
              title: attrs.title,
              slug: attrs.slug,
              image: mainImage,
              imageAlt: mainImageAlt,
              category: attrs.category || 'general',
              date: attrs.date,
              subcategory: Array.isArray(attrs.subcategory)
                ? attrs.subcategory
                : [attrs.subcategory ?? 'general'],
              description: attrs.description,
              headline: attrs.headline || attrs.title,
              subdescription: attrs.subdescription,
              href: `/articles/${attrs.slug}`,
              tags: attrs.tags || [],
            };
          }) || [];

        setArticles(mapped);
      } catch (err) {
        console.error('❌ שגיאה בטעינת כתבות:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  // סדר קבוע של קטגוריות
  const desiredOrder = ['news', 'reviews', 'blog', 'gear'];

  // יצירת רשימת קטגוריות מהמפות
  const categories = [...new Set(articles.map((a) => a.category))].sort(
    (a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
  );

  if (loading) return <p className="text-center text-gray-500">טוען כתבות...</p>;

  return (
    <div className="bg-white p-0 shadow space-y-0">
      {categories.map((category) => {
        const articlesInCategory = articles
          .filter((a) => a.category === category && a.slug && a.href)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        if (articlesInCategory.length < 5) return null;

        const [first, second, third, fourth, fifth] = articlesInCategory;

        return (
          <div key={category} className="space-y-0">
            <SectionWithHeader title={category} href={`/${category}`} />
            <div className="grid grid-cols-3 gap-0 w-full">
              <div className="col-span-1">
                <ArticleCard article={first} size="medium" />
              </div>
              <div className="col-span-2 row-span-1">
                <ArticleCard article={second} size="large" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={third} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fourth} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fifth} size="small" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
