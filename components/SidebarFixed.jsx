// components/SidebarFixed.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveBoxGrid from './ResponsiveBoxGrid';
import BoxWrapper from './BoxWrapper';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/* פונקציה לזיהוי כתובת מדיה */
function resolveMediaUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

/* נרמול גוגל דרייב */
function normalizeDriveUrl(url) {
  if (!url) return url;

  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return `/api/drive-proxy?id=${url}`;
  }

  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match && match[1]) {
      return `/api/drive-proxy?id=${match[1]}`;
    }
  }

  return url;
}

export default function SidebarFixed({ ads }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  /* 🔁 קרוסלה מתחלפת כל 5 שניות */
  useEffect(() => {
    if (ads.length > 2) {
      const interval = setInterval(
        () => setCurrentIndex((prev) => (prev + 2) % ads.length),
        5000
      );
      return () => clearInterval(interval);
    }
  }, [ads]);

  const getAdAt = (i) => {
    if (!ads || !ads.length) return null;
    return ads[i % ads.length];
  };

  const AdCard = ({ ad }) => {
    if (!ad) return null;

    const attrs = ad;

    const driveUrl = normalizeDriveUrl(attrs.mediaUrl || null);

    const imageUrl = Array.isArray(attrs.image) && attrs.image.length > 0
      ? resolveMediaUrl(attrs.image[0].url)
      : resolveMediaUrl(attrs.image?.url);

    const videoUrl = Array.isArray(attrs.video) && attrs.video.length > 0
      ? resolveMediaUrl(attrs.video[0].url)
      : resolveMediaUrl(attrs.video?.url);

    const finalUrl = driveUrl || videoUrl || imageUrl;

    const isVideo =
      (finalUrl && finalUrl.endsWith('.mp4')) ||
      finalUrl?.includes('youtube') ||
      finalUrl?.includes('vimeo');

    const content = !finalUrl ? (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
        אין מדיה זמינה
      </div>
    ) : isVideo ? (
      <video
        src={finalUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    ) : (
      <img
        src={finalUrl}
        alt={attrs.title || 'ad'}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );

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
