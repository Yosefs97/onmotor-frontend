'use client';
import React, { useEffect, useState } from 'react';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function SimilarArticles({ currentSlug, category }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    async function fetchSimilarArticles() {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?populate=*&filters[slug][$ne]=${currentSlug}&filters[category][$eq]=${category}&pagination[limit]=3`
        );
        const json = await res.json();
        const data = json.data || [];

        const mapped = data.map((a) => {
          // --- ⭐️ לוגיקה חדשה: משיכת תמונה ראשית מהגלריה ⭐️ ---
          const mainImageData = a.gallery?.[0];
          const image = mainImageData?.url 
                          ? `${API_URL}${mainImageData.url}` 
                          : '/default-image.jpg';
          const imageAlt = a.imageAlt || mainImageData?.alternativeText || a.title;
          // --- ⭐️ סוף לוגיקה חדשה ⭐️ ---

          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            href: `/articles/${a.slug}`,
            headline: a.headline || a.title,
            description: a.description || '',
            date: a.date,
            // --- ⭐️ שימוש בלוגיקה החדשה ⭐️ ---
            image: image,
            imageAlt: imageAlt,
            // --- ⭐️ סוף שימוש ⭐️ ---
          };
        });

        setSimilar(mapped);
      } catch (err) {
        console.error('שגיאה בטעינת כתבות דומות:', err);
      }
    }

    fetchSimilarArticles();
  }, [currentSlug, category]);

  if (!similar.length) return null;

  return (
    <div className="mt-0">
      <h4 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-0">כתבות דומות</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {similar.map((article) => (
          <ArticleCard key={article.slug || article.id} article={article} />
        ))}
      </div>
    </div>
  );
}