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

// פונקציה לעיבוד הנתונים שהגיעו מהשרת לפורמט של ArticleCard
function mapArticles(data) {
  return data.map((a) => {
    const attrs = a.attributes || a; // תמיכה במבנה שטוח או מקונן
    let mainImage = PLACEHOLDER_IMG;
    let mainImageAlt = attrs.title || 'תמונה ראשית';

    const galleryItem = attrs.gallery?.data?.[0]?.attributes || attrs.gallery?.[0];
    const imageItem = attrs.image?.data?.attributes || attrs.image;

    if (galleryItem?.url) {
      mainImage = resolveImageUrl(galleryItem.url);
      mainImageAlt = galleryItem.alternativeText || mainImageAlt;
    } else if (imageItem?.url) {
      mainImage = resolveImageUrl(imageItem.url);
      mainImageAlt = imageItem.alternativeText || mainImageAlt;
    } else if (
      Array.isArray(attrs.external_media_links) &&
      attrs.external_media_links.length > 0
    ) {
      const validLinks = attrs.external_media_links.filter(
        (l) => typeof l === 'string' && l.startsWith('http')
      );
      if (validLinks.length > 1) mainImage = validLinks[1].trim();
      else if (validLinks.length > 0) mainImage = validLinks[0].trim();
      mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
    }

    return {
      id: a.id,
      title: attrs.title,
      slug: attrs.slug,
      href: `/articles/${attrs.slug}`,
      headline: attrs.headline || attrs.title,
      description: attrs.description || '',
      date: attrs.date,
      image: mainImage,
      imageAlt: mainImageAlt,
    };
  });
}

// 👇 הקומפוננטה כעת מקבלת `articles` מוכנים מהשרת
export default function SimilarArticles({ articles = [] }) {
  const [similar, setSimilar] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 👉 עיבוד הנתונים הראשוני
  useEffect(() => {
    if (articles && articles.length > 0) {
      setSimilar(mapArticles(articles));
    }
  }, [articles]);

  // 👉 Swipe states
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  
  const nextGroup = () => setCurrentGroup((prev) => (prev + 1) % groups.length);
  const prevGroup = () => setCurrentGroup((prev) => (prev - 1 + groups.length) % groups.length);

  const handleSwipe = () => {
    if (!isMobile) return;
    const dx = touchEndX - touchStartX;
    if (dx < -50) prevGroup(); // RTL logic
    if (dx > 50) nextGroup();  // RTL logic
  };

  // זיהוי מובייל
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // חלוקה לקבוצות
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
            className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchMove={(e) => setTouchEndX(e.touches[0].clientX)}
            onTouchEnd={handleSwipe}
          >
            {groups[currentGroup].map((article) => (
              <ArticleCard key={article.slug || article.id} article={article} />
            ))}
          </motion.div>
        </AnimatePresence>

        {groups.length > 1 && (
          <>
            <button onClick={nextGroup} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-600/90 hover:bg-red-600/60 text-white p-3 rounded-full text-2xl transition">›</button>
            <button onClick={prevGroup} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600/90 hover:bg-red-600/60 text-white p-3 rounded-full text-2xl transition">‹</button>
          </>
        )}
      </div>

      {groups.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {groups.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentGroup(idx)}
              className={`w-3 h-3 rounded-full transition ${idx === currentGroup ? 'bg-red-600' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}