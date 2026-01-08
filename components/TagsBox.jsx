// components/TagsBox.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  
  // 👇 1. התחלה מ-20 תגיות (כ-4 שורות בערך)
  const [visibleCount, setVisibleCount] = useState(20); 
  const [loading, setLoading] = useState(true);

  // טעינת נתונים
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

  // 👇 2. לוגיקה לגלילה אוטומטית לתחתית בכל פתיחה
  useEffect(() => {
    // מבצע גלילה רק אם המשתמש כבר טען עוד תגיות (לא בטעינה ראשונית)
    if (visibleCount > 20) {
      // Timeout קטן כדי לוודא שה-DOM התעדכן והגובה החדש נתפס
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [visibleCount]);

  const handleShowMore = () => {
    // 👇 הוספת 15 תגיות בכל לחיצה
    setVisibleCount(prev => prev + 15);
  };

  const handleCollapse = () => {
    setVisibleCount(20); // חזרה ל-4 שורות (20 תגיות)
  };

  if (!loading && tags.length === 0) return null;

  const visibleTags = tags.slice(0, visibleCount);
  const isExpanded = visibleCount > 20;
  const hasMore = visibleCount < tags.length;

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      {/* כותרת */}
      <div className="bg-red-600 text-white font-bold text-lg px-3 py-2 flex justify-between items-center">
        <span>אינדקס תגיות</span>
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
            {/* 👇 3. שינוי העיצוב: רשימה זורמת עם קווים מפרידים */}
            <div className="flex flex-wrap text-sm leading-7 text-gray-800 dir-rtl">
              {visibleTags.map((tag, index) => (
                <span key={tag} className="flex items-center">
                  <Link
                    href={`/tags/${slugify(tag)}`}
                    prefetch={false}
                    // טקסט רגיל, בריחוף הופך לאדום
                    className="hover:text-red-600 transition-colors px-2"
                  >
                    {tag}
                  </Link>
                  {/* קו מפריד אדום (מופיע אחרי כל תג חוץ מהאחרון ברשימה הנוכחית) */}
                  {index < visibleTags.length - 1 && (
                    <span className="text-red-600 select-none h-3 border-l border-red-600"></span>
                  )}
                </span>
              ))}
            </div>

            {/* כפתור טען עוד */}
            {hasMore && (
              <button
                onClick={handleShowMore}
                className="w-full text-center text-red-600 text-sm font-bold hover:underline py-2 border-t border-gray-100 mt-2 flex items-center justify-center gap-1"
              >
                <span>הצג עוד תגיות</span>
                <FaChevronDown className="text-xs" />
              </button>
            )}
            
            {/* כפתור סגירה למטה */}
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