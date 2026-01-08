// components/TagsBox.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaTags } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-א-ת]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function TagsBox() {
  const [tags, setTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // ברירת מחדל: 10
  const [loading, setLoading] = useState(true);

  // טעינת התגיות (זהה ללוגיקה בדף התגיות כדי לשמור על עקביות)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?fields[0]=tags&sort=createdAt:desc&pagination[limit]=100`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();

        if (isMounted) {
          const tagCounts = {};
          
          (json.data || []).forEach(a => {
            const articleTags = a.tags || [];
            if (Array.isArray(articleTags)) {
              articleTags.forEach(t => {
                const tagName = typeof t === 'string' ? t : t.name;
                if (tagName) {
                  tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                }
              });
            }
          });

          // מיון לפי כמות כתבות (פופולריות)
          const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
          setTags(sortedTags);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const handleCollapse = () => {
    setVisibleCount(10);
  };

  if (!loading && tags.length === 0) return null;

  const visibleTags = tags.slice(0, visibleCount);
  const isExpanded = visibleCount > 10;
  const hasMore = visibleCount < tags.length;

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      {/* כותרת בעיצוב זהה לקיימים */}
      <div className="bg-red-600 text-white font-bold text-lg px-3 py-2 flex justify-between items-center">
        <span>אינדקס תגיות</span>
        {/* כפתור סגירה בראש הקופסא כפי שביקשת */}
        {isExpanded && (
          <button 
            onClick={handleCollapse}
            className="text-white hover:bg-red-700 rounded-full p-1 text-xs transition-colors"
            title="סגור תגיות"
          >
            <FaChevronUp />
          </button>
        )}
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center text-gray-400 text-sm">טוען...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {visibleTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${slugify(tag)}`}
                  prefetch={false}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded transition-colors border border-gray-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* כפתור טען עוד למטה */}
            {hasMore && (
              <button
                onClick={handleShowMore}
                className="w-full text-center text-red-600 text-sm font-bold hover:underline py-1 border-t border-gray-100 mt-1 flex items-center justify-center gap-1"
              >
                <span>הצג עוד תגיות</span>
                <FaChevronDown className="text-xs" />
              </button>
            )}
            
            {/* אופציה נוספת לסגירה למטה אם אין עוד תגיות והרשימה ארוכה */}
            {!hasMore && isExpanded && (
               <button
               onClick={handleCollapse}
               className="w-full text-center text-gray-400 text-sm hover:text-red-600 py-1 mt-1"
             >
               סגור
             </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}