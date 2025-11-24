// components/GuideBox.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { labelMap } from '@/utils/labelMap';
import { getMainImage } from '@/utils/resolveMainImage';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function GuideBox() {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ✅ שליפת כתבות עם ערך במשתנה Values */
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?filters[Values][$null]=false&populate=*`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת מדריכים:', err);
      }
    }
    fetchArticles();
  }, []);

  /* ✅ מעבר אוטומטי בין כתבות */
  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  if (articles.length === 0) return null;

  const current = articles[currentIndex].attributes || articles[currentIndex];
  const values = Array.isArray(current.Values) ? current.Values : [current.Values];

  // ✅ שימוש בפונקציה האחידה לבחירת תמונה
  const { mainImage, mainImageAlt } = getMainImage(current);

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      {/* כותרת עם לינק לדף מדריכים */}
      <Link href="/blog/guides" prefetch={false}>
        <h3 className="bg-red-600 text-white font-bold text-lg px-3 py-2 cursor-pointer hover:bg-red-700 transition">
          מדריכים
        </h3>
      </Link>

      {/* ✅ קרוסלת מדריכים */}
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
            <Link href={`/articles/${current.slug}`} prefetch={false}> 
              <div className="w-full h-full cursor-pointer">
                <Image
                  src={mainImage}
                  alt={mainImageAlt || current.title || 'תמונת מדריך'}
                  width={400}
                  height={250}
                  className="w-full h-40 object-cover"
                />
                <p className="p-2 text-sm font-semibold text-gray-800">
                  {current.title}
                </p>
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

      {/* ✅ חיצי ניווט */}
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
        }
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ›
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % articles.length)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ‹
      </button>

      {/* ✅ נקודות אינדיקציה */}
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
