// components/GuideBox.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { labelMap } from '@/utils/labelMap';  // ✅ תרגום לערכים

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function GuideBox() {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchArticles() {
      try {
        // --- ⭐️ תיקון 1: שינינו את populate=image ל-populate=gallery ⭐️ ---
        const res = await fetch(
          `${API_URL}/api/articles?filters[Values][$null]=false&populate=gallery`
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת מדריכים:', err);
      }
    }
    fetchArticles();
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  if (articles.length === 0) return null;

  const current = articles[currentIndex];
  const values = Array.isArray(current.Values) ? current.Values : [current.Values];

  // --- ⭐️ תיקון 2: הוספנו לוגיקה לשליפת התמונה מהגלריה ⭐️ ---
  const mainImageData = current.gallery?.[0];
  const imageUrl = mainImageData?.url 
                   ? `${API_URL}${mainImageData.url}` 
                   : null; // אם אין תמונה, נציג את ה-div האפור
  const imageAlt = mainImageData?.alternativeText || current.title || "תמונת מדריך";
  // --- ⭐️ סוף התיקון ⭐️ ---

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      {/* ✅ כותרת עם לינק לדף מדריכים */}
      <Link href="/blog/guides">
        <h3 className="bg-red-600 text-white font-bold text-lg px-3 py-2 cursor-pointer hover:bg-red-700 transition">
          מדריכים
        </h3>
      </Link>

      <div className="relative h-56">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Link href={`/articles/${current.slug}`}>
              <div className="w-full h-full cursor-pointer">
                
                {/* --- ⭐️ תיקון 3: שימוש במשתנים החדשים ⭐️ --- */}
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    width={400}
                    height={250}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200" />
                )}
                {/* --- ⭐️ סוף התיקון ⭐️ --- */}
                
                <p className="p-2 text-sm font-semibold text-gray-800">
                  {current.title}
                </p>
                {/* ✅ הצגת הערכים בעברית */}
                {values.map((val, idx) => (
                  <p key={idx} className="px-2 text-xs text-gray-500">
                    {labelMap[val] || val}
                  </p>
                ))}
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* חיצי ניווט */}
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
        }
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % articles.length)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ›
      </button>

      {/* נקודות אינדיקציה */}
      <div className="flex justify-center space-x-2 py-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full ${
              idx === currentIndex ? 'bg-red-600' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}