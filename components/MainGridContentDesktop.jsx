// components/MainGridContentDesktop.jsx
'use client';
import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCards/ArticleCard';
import SectionWithHeader from './SectionWithHeader';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function MainGridContentDesktop() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_URL}/api/articles?populate=*`);
        const json = await res.json();

        const mapped =
          json.data?.map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            image: a.image?.url ? `${API_URL}${a.image.url}` : '/default-image.jpg',
            imageAlt: a.imageAlt || '',
            category: a.category || 'general',
            date: a.date,
            subcategory: Array.isArray(a.subcategory)
              ? a.subcategory
              : [a.subcategory ?? 'general'],
            description: a.description,
            headline: a.headline || a.title,
            subdescription: a.subdescription,
            href: `/articles/${a.slug}`,
            tags: a.tags || [],
          })) || [];

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

// יצירת רשימת קטגוריות מהמאמרים + מיון לפי הסדר הרצוי
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
