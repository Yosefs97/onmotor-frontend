// components/SidebarFixed.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveBoxGrid from './ResponsiveBoxGrid';
import BoxWrapper from './BoxWrapper';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/* ✅ פונקציה מאוחדת לזיהוי כתובת מדיה (Cloudinary / Strapi / חיצוני) */
function resolveMediaUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

/* ✅ פונקציה לנרמול לינקים מ-Google Drive */
function normalizeDriveUrl(url) {
  if (!url) return url;

  // אם זה ID בלבד
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return `/api/drive-proxy?id=${url}`;
  }

  // אם זה לינק רגיל של דרייב
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match && match[1]) {
      return `/api/drive-proxy?id=${match[1]}`;
    }
  }

  return url;
}

export default function SidebarFixed() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ✅ טעינת מודעות מ-Strapi */
  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch(
          `${API_URL}/api/sidebar-middles?populate=image&populate=video`
        );
        const json = await res.json();
        setAds(json.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת sidebar-middle:', err);
      }
    }
    fetchAds();
  }, []);

  /* ✅ קרוסלה מתחלפת כל 5 שניות */
  useEffect(() => {
    if (ads.length > 2) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 2) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  /* ✅ החזרת מודעה לפי אינדקס */
  const getAdAt = (index) => {
    if (!ads.length) return null;
    return ads[index % ads.length];
  };

  /* ✅ כרטיס מודעה עם לוגיקת תמונה חדשה */
  const AdCard = ({ ad }) => {
    if (!ad) return null;

    const attrs = ad; // הנתונים מגיעים מ-Strapi

    // נורמליזציה של כל הנתיבים
    const driveUrl = normalizeDriveUrl(attrs.mediaUrl || null);

    // תמונה מ-Strapi (Cloudinary או יחסית)
    const imageUrl = Array.isArray(attrs.image) && attrs.image.length > 0
      ? resolveMediaUrl(attrs.image[0].url)
      : resolveMediaUrl(attrs.image?.url);

    // וידאו מ-Strapi
    const videoUrl = Array.isArray(attrs.video) && attrs.video.length > 0
      ? resolveMediaUrl(attrs.video[0].url)
      : resolveMediaUrl(attrs.video?.url);

    // ✅ סדר עדיפויות: mediaUrl (דרייב/חיצוני) > video > image
    let finalUrl = driveUrl || videoUrl || imageUrl;
    let isVideo =
      (finalUrl && finalUrl.endsWith('.mp4')) ||
      finalUrl?.includes('youtube') ||
      finalUrl?.includes('vimeo');

    let content = null;

    if (!finalUrl) {
      content = (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
          אין מדיה זמינה
        </div>
      );
    } else if (isVideo) {
      content = (
        <video
          src={finalUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      );
    } else {
      content = (
        <img
          src={finalUrl}
          alt={attrs.title || 'ad'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      );
    }

    return (
      <div className="border-[3px] border-[#e60000] rounded-xl overflow-hidden shadow-lg bg-black">
        <div className="w-full aspect-video">{content}</div>

        {/* כותרת */}
        {attrs.title && (
          <p className="mt-2 text-center font-bold text-[#e60000] px-2 py-2">
            {attrs.title}
          </p>
        )}

        {/* כפתורים */}
        <div className="flex justify-around gap-2 p-2">
          {attrs.slug && (
            <a
              href={`/articles/${attrs.slug}`}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
            >
              לכתבה
            </a>
          )}
          {attrs.link && (
            <a
              href={attrs.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800 text-sm"
            >
             לאתר המפרסם
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-gray-900 py-4 sticky top-25">
      <ResponsiveBoxGrid>
        <BoxWrapper>
          <div className="overflow-hidden flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <AdCard ad={getAdAt(currentIndex)} />
              </motion.div>
              <motion.div
                key={currentIndex + 1}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
              >
                <AdCard ad={getAdAt(currentIndex + 1)} />
              </motion.div>
            </AnimatePresence>
          </div>
        </BoxWrapper>
      </ResponsiveBoxGrid>
    </div>
  );
}
