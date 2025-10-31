// components/IroadsBox.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getMainImage, resolveImageUrl } from '@/utils/resolveMainImage';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

export default function IroadsBox() {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ✅ שליפת כתבות עם תגית iroads */
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(
          `${API_URL}/api/articles?filters[tags_txt][$contains]=iroads&populate=*`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת כתבות נתיבי ישראל:', err);
      }
    }
    fetchArticles();
  }, []);

  /* ✅ מעבר אוטומטי בין שקופיות */
  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (articles.length + 1)); // +1 עבור הלוגו
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  if (articles.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4 p-4 text-center">
        <p className="text-gray-600 text-sm">
          לא נמצאו כתבות עם תג "נתיבי ישראל"
        </p>
      </div>
    );
  }

  const rawArticles = articles.map((a) => (a.attributes ? a.attributes : a));
  const slides = [{ type: 'logo' }, ...rawArticles];
  const current = slides[currentIndex];

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      {/* ✅ כותרת עליונה */}
      <Link href="https://www.iroads.co.il/" target="_blank">
        <h3 className="bg-red-600 text-white font-bold text-lg px-3 py-2 cursor-pointer hover:bg-red-700 transition text-right">
          בכבישי הארץ
        </h3>
      </Link>

      {/* ✅ קרוסלה */}
      <div className="relative h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.type === 'logo' ? 'logo' : current.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {current.type === 'logo' ? (
              <div className="relative w-full h-full">
                {/* ✅ כפתור תלונה */}
                <a
                  href="https://www.iroads.co.il/support-form/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600 text-white text-sm rounded-md shadow hover:bg-red-700 transition z-10"
                >
                  לחצו להגשת תלונה
                </a>

                {/* ✅ וידאו רקע */}
                <a
                  href="https://www.iroads.co.il/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <video
                    src="https://www.iroads.co.il/media/fgpprdnd/%D7%95%D7%99%D7%93%D7%90%D7%95-%D7%A2%D7%9E%D7%95%D7%93-%D7%94%D7%91%D7%99%D7%AA-%D7%9C%D7%9C%D7%90-%D7%A1%D7%90%D7%95%D7%A0%D7%931.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            ) : (
              // ✅ שקופית כתבה
              (() => {
                const attrs = current;
                const { mainImage, mainImageAlt } = getMainImage(attrs);

                return (
                  <Link href={attrs.slug ? `/articles/${attrs.slug}` : '#'}>
                    <div className="relative w-full h-full cursor-pointer">
                      <Image
                        src={mainImage || PLACEHOLDER_IMG}
                        alt={mainImageAlt || 'תמונה'}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 w-full bg-black/50 text-white p-2 text-sm font-semibold">
                        {attrs.title || 'ללא כותרת'}
                      </div>
                    </div>
                  </Link>
                );
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ חיצים */}
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ›
      </button>

      {/* ✅ נקודות אינדיקציה */}
      <div className="flex justify-center space-x-2 py-2">
        {slides.map((_, idx) => (
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
