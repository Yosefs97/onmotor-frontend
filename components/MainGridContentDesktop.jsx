// components/MainGridContentDesktop.jsx
'use client';
import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCards/ArticleCard';
import SectionWithHeader from './SectionWithHeader';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/* ✅ פונקציה מאוחדת לתמונות (Strapi / Cloudinary / קישורים חיצוניים) */
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return '/default-image.jpg';
  if (rawUrl.startsWith('http')) return rawUrl; // Cloudinary או אתר חיצוני
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

export default function MainGridContentDesktop() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_URL}/api/articles?populate=*`);
        const json = await res.json();

        const mapped =
          json.data?.map((a) => {
            const attrs = a.attributes || a;

            // --- ⭐️ לוגיקת תמונות אחידה ⭐️ ---
            let imageUrl = null;

            // עדיפות 1: תמונה ראשית בשדה image
            if (attrs.image?.data?.attributes?.url) {
              imageUrl = attrs.image.data.attributes.url;
            } 
            // עדיפות 2: תמונה ישירה בשדה image.url
            else if (attrs.image?.url) {
              imageUrl = attrs.image.url;
            } 
            // עדיפות 3: תמונה ראשונה מהגלריה
            else if (attrs.gallery?.[0]?.url) {
              imageUrl = attrs.gallery[0].url;
            }

            const image = resolveImageUrl(imageUrl);
            const imageAlt =
              attrs.imageAlt ||
              attrs.gallery?.[0]?.alternativeText ||
              'תמונה ראשית';

            // --- ⭐️ סוף לוגיקת תמונות ⭐️ ---

            return {
              id: a.id,
              title: attrs.title,
              slug: attrs.slug,
              image,
              imageAlt,
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
