// components/ProfessionalsBox.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

function normalizeDriveUrl(url) {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return `/api/drive-proxy?id=${url}`;
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match && match[1]) return `/api/drive-proxy?id=${match[1]}`;
  }
  return url;
}

export default function ProfessionalsBox() {
  const [pros, setPros] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ שליפת אנשי מקצוע
  useEffect(() => {
    async function fetchProfessionals() {
      try {
        const res = await fetch(`${API_URL}/api/prosses?populate=*`);
        const json = await res.json();
        setPros(json.data || []);
      } catch (err) {
        console.error('❌ שגיאה בטעינת בעלי מקצוע:', err);
      }
    }
    fetchProfessionals();
  }, []);

  // ✅ שליפת כתבות
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_URL}/api/articles?fields=slug,title,tags`);
        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error('❌ שגיאה בטעינת כתבות:', err);
      }
    }
    fetchArticles();
  }, []);

  // ✅ בדיקה לתג תואם
  function findArticleByTag(tagName) {
    if (!tagName) return null;
    const match = articles.find(
      (a) =>
        Array.isArray(a.attributes?.tags) &&
        a.attributes.tags.some((t) => t.trim() === tagName.trim())
    );
    return match || null;
  }

  // ✅ החלקה אוטומטית
  useEffect(() => {
    if (pros.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % pros.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [pros]);

  // ✅ החלקת מגע במובייל
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // שמאלה
        setCurrentIndex((prev) => (prev + 1) % pros.length);
      } else {
        // ימינה
        setCurrentIndex((prev) => (prev - 1 + pros.length) % pros.length);
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const current = pros[currentIndex];
  if (!current) return null;

  const article = findArticleByTag(current.tag_name);
  const mediaUrl = normalizeDriveUrl(current?.mediaUrl || '');
  const imageUrl = current?.image?.url
    ? `${API_URL}${current.image.url}`
    : current?.image?.[0]?.url
    ? `${API_URL}${current.image[0].url}`
    : null;

  const getMediaElement = () => {
    if (mediaUrl) {
      const isVideo =
        mediaUrl.endsWith('.mp4') ||
        mediaUrl.includes('youtube') ||
        mediaUrl.includes('vimeo');
      return isVideo ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={mediaUrl}
          alt={current.title_pros || 'בעל מקצוע'}
          className="w-full h-full object-cover"
        />
      );
    }
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={current.title_pros || 'בעל מקצוע'}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
        אין מדיה זמינה
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      <h3 className="bg-red-600 text-white font-bold text-lg px-3 py-2">
        בעלי מקצוע ואנשים בתחום
      </h3>

      <div
        className="relative h-72"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.documentId || current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="relative w-full h-full">
              {getMediaElement()}

              {/* ✅ כפתור כתבה אם קיים tag */}
              {article && (
                <Link
                  href={`/articles/${article.attributes.slug}`}
                  className="absolute top-3 left-3 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow hover:bg-gray-900 transition z-10"
                >
                  לכתבה על {current.title_pros}
                </Link>
              )}

              {/* ✅ כפתור לאתר של בעל המקצוע */}
              {current.website && (
                <a
                  href={current.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-1.5 left-0 px-3 py-1 bg-red-600 text-white text-s rounded-md shadow hover:bg-red-700 transition z-10"
                >
                  לאתר של {current.title_pros}
                </a>
              )}

              {/* שם בעל המקצוע */}
              <div className="absolute bottom-0 w-full bg-black/50 text-red-600 p-2 text-xl font-bold">
                {current.title_pros || '—'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* חיצים */}
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + pros.length) % pros.length)
        }
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % pros.length)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
      >
        ›
      </button>

      {/* נקודות */}
      <div className="flex justify-center space-x-2 py-2">
        {pros.map((_, idx) => (
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
