// /components/RelatedArticles.jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RelatedArticles({ tags = [] }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tags.length) return;

    (async () => {
      try {
        // בונים query ל-Strapi עם OR בין כל התגיות
        const query = tags
          .map(
            (tag, idx) =>
              `filters[$or][${idx}][tags][$containsi]=${encodeURIComponent(tag)}`
          )
          .join('&');

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/articles?${query}&populate=*`
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('❌ Error fetching related articles:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [JSON.stringify(tags)]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <div className="animate-pulse">
          <img 
            src="/OnMotorLogonoback.png" 
            alt="Loading..." 
            className="h-24 w-auto object-contain" // שנה את h-24 כדי לשלוט בגודל
          />
        </div>
        <p className="mt-4 text-gray-500 animate-bounce">טוען כתובת...</p>
      </div>
    );
  }
  if (!articles.length) return null;

  return (
    <div className="mt-10" dir="rtl">
      <h3 className="text-xl font-bold mb-4">כתבות קשורות</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => {
          const attr = article.attributes;
          return (
            <Link
              key={article.id}
              href={attr.href || `/articles/${attr.slug}`}
              prefetch={false}
              className="border rounded-lg overflow-hidden hover:shadow"
            >
              {attr.image && (
                <img
                  src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${attr.image}`}
                  alt={attr.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3">
                <h2 className="text-base font-semibold mb-2">
                  {attr.headline || attr.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {attr.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
