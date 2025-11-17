// components/SimilarArticles.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// פונקציה לתיקון כתובת תמונה
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

export default function SimilarArticles({ currentSlug, category }) {
  const [similar, setSimilar] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 👉 Swipe states
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleSwipe = () => {
    if (!isMobile) return;

    if (touchStartX - touchEndX > 50) {
      nextGroup();
    }
    if (touchEndX - touchStartX > 50) {
      prevGroup();
    }
  };

  // זיהוי מובייל
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // שליפת כתבות דומות
  useEffect(() => {
    async function fetchSimilarArticles() {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?populate=*&filters[slug][$ne]=${currentSlug}&filters[category][$eq]=${category}`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        const data = json.data || [];

        const mapped = data.map((a) => {
          let mainImage = PLACEHOLDER_IMG;
          let mainImageAlt = a.title || 'תמונה ראשית';

          const galleryItem = a.gallery?.[0];
          if (galleryItem?.url) {
            mainImage = resolveImageUrl(galleryItem.url);
            mainImageAlt = galleryItem.alternativeText || mainImageAlt;
          } else if (a.image?.url) {
            mainImage = resolveImageUrl(a.image.url);
            mainImageAlt = a.image.alternativeText || mainImageAlt;
          } else if (
            Array.isArray(a.external_media_links) &&
            a.external_media_links.length > 0
          ) {
            const validLinks = a.external_media_links.filter(
              (l) => typeof l === 'string' && l.startsWith('http')
            );

            if (validLinks.length > 1) {
              mainImage = validLinks[1].trim();
            } else if (validLinks.length > 0) {
              mainImage = validLinks[0].trim();
            }

            mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
          }

          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            href: `/articles/${a.slug}`,
            headline: a.headline || a.title,
            description: a.description || '',
            date: a.date,
            image: mainImage,
            imageAlt: mainImageAlt,
          };
        });

        setSimilar(mapped);
      } catch (err) {
        console.error('שגיאה בטעינת כתבות דומות:', err);
      }
    }

    fetchSimilarArticles();
  }, [currentSlug, category]);

  // חלוקה לקבוצות (3 לדסקטופ, 2 למובייל)
  const groupSize = isMobile ? 2 : 3;
  const groups = [];
  for (let i = 0; i < similar.length; i += groupSize) {
    groups.push(similar.slice(i, i + groupSize));
  }

  // מעבר אוטומטי — רק במחשב
  useEffect(() => {
    if (isMobile) return;
    if (groups.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGroup((prev) => (prev + 1) % groups.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [groups.length, isMobile]);

  if (!similar.length) return null;

  const nextGroup = () =>
    setCurrentGroup((prev) => (prev + 1) % groups.length);

  const prevGroup = () =>
    setCurrentGroup((prev) => (prev - 1 + groups.length) % groups.length);

  return (
    <div className="mt-10 relative bg-white p-4 rounded-md shadow-md">
      <h4 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
        כתבות דומות
      </h4>

      <div className="overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGroup}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`grid ${
              isMobile ? 'grid-cols-2' : 'grid-cols-3'
            } gap-4`}
            
            // 👉 תמיכה בהחלקה במובייל
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchMove={(e) => setTouchEndX(e.touches[0].clientX)}
            onTouchEnd={handleSwipe}
          >
            {groups[currentGroup].map((article) => (
              <ArticleCard
                key={article.slug || article.id}
                article={article}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {groups.length > 1 && (
          <>
            <button
              onClick={prevGroup}
              className="absolute left-2 top-1/2 transform -translate-y-1/2
              bg-red-600/90 hover:bg-red-600/60 text-white p-3 rounded-full text-2xl transition"
              aria-label="הקודם"
            >
              ›
            </button>
            <button
              onClick={nextGroup}
              className="absolute right-2 top-1/2 transform -translate-y-1/2
              bg-red-600/90 hover:bg-red-600/60 text-white p-3 rounded-full text-2xl transition"
              aria-label="הבא"
            >
              ‹
            </button>
          </>
        )}
      </div>

      {groups.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {groups.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentGroup(idx)}
              className={`w-3 h-3 rounded-full transition ${
                idx === currentGroup ? 'bg-red-600' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
