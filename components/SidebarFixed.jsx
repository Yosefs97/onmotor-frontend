// components/SidebarFixed.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveBoxGrid from './ResponsiveBoxGrid';
import BoxWrapper from './BoxWrapper';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/* ✅ פונקציה מאוחדת לזיהוי כתובת מדיה (Cloudinary / Strapi / חיצוני) */
function resolveMediaUrl(rawUrl) {
  if (!rawUrl) return null;
  // אם זה קישור מלא (כמו Cloudinary), נחזיר אותו כמו שהוא
  if (rawUrl.startsWith('http') || rawUrl.startsWith('https')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

export default function SidebarFixed() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasFetched = useRef(false);

  /* ✅ טעינת מודעות מ-Strapi */
  useEffect(() => {
    if (!API_URL) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchAds() {
      try {
        const res = await fetch(
          `${API_URL}/api/sidebar-middles?populate=image&populate=video`
        );
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data?.map((item) => ({
            id: item.id,
            ...item.attributes,
          })) || [];
        setAds(items);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAds();
  }, []);

  /* ✅ קרוסלה */
  useEffect(() => {
    if (ads.length > 2) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 2) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  const getAdAt = (index) => {
    if (!ads.length) return null;
    return ads[index % ads.length];
  };

  /* ✅ כרטיס מודעה המעודכן */
  const AdCard = ({ ad }) => {
    if (!ad) return null;

    const attrs = ad;

    // 1. שליפת שדה mediaUrl ישיר (למשל מ-Cloudinary)
    const directMediaUrl = resolveMediaUrl(attrs.mediaUrl);

    // 2. תמונה מ-Strapi
    const imageUrl = Array.isArray(attrs.image) && attrs.image.length > 0
      ? resolveMediaUrl(attrs.image[0].url)
      : resolveMediaUrl(attrs.image?.url);

    // 3. וידאו מ-Strapi
    const videoUrl = Array.isArray(attrs.video) && attrs.video.length > 0
      ? resolveMediaUrl(attrs.video[0].url)
      : resolveMediaUrl(attrs.video?.url);

    // ✅ סדר עדיפויות מעודכן: mediaUrl > video > image
    let finalUrl = directMediaUrl || videoUrl || imageUrl;

    // זיהוי אם זה וידאו (כולל בדיקה ל-Cloudinary שמסתיים ב-mp4/webm/mov)
    let isVideo =
      (finalUrl && (finalUrl.endsWith('.mp4') || finalUrl.endsWith('.webm') || finalUrl.endsWith('.mov'))) ||
      finalUrl?.includes('youtube') ||
      finalUrl?.includes('vimeo') ||
      (finalUrl?.includes('cloudinary') && finalUrl?.includes('/video/')); // זיהוי ספציפי ל-Cloudinary Video

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
      <div className="border-[3px] border-[#e60000] rounded-xl overflow-hidden shadow-xl bg-black transition-all hover:shadow-[#e60000]/50">
        <div className="w-full aspect-[16/8]">{content}</div>
        <div className="flex justify-center gap-2 p-3">
          {attrs.link && (
            <a
              href={attrs.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-gradient-to-r from-[#1f1f1f] to-[#3a3a3a] text-white font-bold px-4 py-2 rounded-lg text-center text-sm transition-all duration-300 hover:scale-105 hover:from-[#e60000] hover:to-[#b50000]"
            >
              {attrs.title ? attrs.title : 'לאתר המפרסם'}
            </a>
          )}
          {attrs.slug && (
            <a
              href={`/articles/${attrs.slug}`}
              className="bg-[#e60000] text-white px-3 py-2 rounded-md hover:bg-[#b50000] text-sm transition-all duration-300"
            >
              לכתבה
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