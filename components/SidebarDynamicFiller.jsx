'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function SidebarDynamicFiller() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?filters[tags][$contains]=${encodeURIComponent(
            'תוכן שאולי יעניין אותך'
          )}&populate=image&pagination[limit]=5`
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('❌ שגיאה בשליפת כתבות מומלצות:', err);
      }
    }

    fetchRecommended();
  }, []);

  if (!articles.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-md p-3 mt-6">
      <h3 className="text-xl font-bold text-[#e60000] mb-3 text-center">
        תוכן שאולי יעניין אותך
      </h3>

      <div className="space-y-3">
        {articles.map((a) => {
          const attrs = a.attributes;
          const title = attrs?.title || 'כתבה ללא כותרת';
          const slug = attrs?.slug;
          const img = attrs?.image?.data?.attributes?.url;

          // הגנה על כתבות חסרות slug
          if (!slug) return null;

          return (
            <Link
              key={a.id}
              href={`/articles/${slug}`}
              className="block rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              {img && (
                <img
                  src={img.startsWith('http') ? img : `${API_URL}${img}`}
                  alt={attrs?.imageAlt || title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-2">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
