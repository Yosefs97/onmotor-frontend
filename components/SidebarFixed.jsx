// components/SidebarFixed.jsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveBoxGrid from './ResponsiveBoxGrid';
import BoxWrapper from './BoxWrapper';



const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// פונקציה להמרת לינקים/ID של דרייב לנתיב Proxy
function normalizeDriveUrl(url) {
  if (!url) return url;

  // אם הכנסתי ישירות File ID (20+ תווים אלפאנומריים)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return `/api/drive-proxy?id=${url}`;
  }

  // אם זה לינק בפורמט /file/d/.../view
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match && match[1]) {
      return `/api/drive-proxy?id=${match[1]}`;
    }
  }

  // אם זה כבר קישור תקין (לא דרייב) – מחזירים כמו שהוא
  return url;
}

export default function SidebarFixed() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ טעינת תוכן מ-Strapi
  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch(
          `${API_URL}/api/sidebar-middles?populate[image][fields][0]=url&populate[video][fields][0]=url`
        );
        const json = await res.json();
        setAds(json.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת sidebar-middle:', err);
      }
    }
    fetchAds();
  }, []);

  // ✅ קרוסלה אינסופית – החלפה כל 5 שניות
  useEffect(() => {
    if (ads.length > 2) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 2) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  // עוזר לשלוף מודעה לפי אינדקס
  const getAdAt = (index) => {
    if (!ads.length) return null;
    return ads[index % ads.length];
  };

  // ✅ רנדר של מודעה
  const AdCard = ({ ad }) => {
    if (!ad) return null;

    const attrs = ad; // הנתונים מגיעים ישירות מ-Strapi

    // שדות המדיה
    const mediaUrl = normalizeDriveUrl(attrs.mediaUrl || null);

    const videoUrl =
      Array.isArray(attrs.video) && attrs.video.length > 0
        ? `${API_URL}${attrs.video[0].url}`
        : null;

    const imageUrl =
      Array.isArray(attrs.image) && attrs.image.length > 0
        ? `${API_URL}${attrs.image[0].url}`
        : null;

    // סדר עדיפויות: mediaUrl > video > image
    let content = null;
    if (mediaUrl) {
      const isVideo =
        mediaUrl.endsWith('.mp4') ||
        mediaUrl.includes('youtube') ||
        mediaUrl.includes('vimeo');

      if (isVideo) {
        content = (
          <video
            src={mediaUrl}
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
            src={mediaUrl}
            alt={attrs.title || 'ad'}
            className="w-full h-full object-cover"
          />
        );
      }
    } else if (videoUrl) {
      content = (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      );
    } else if (imageUrl) {
      content = (
        <img
          src={imageUrl}
          alt={attrs.title || 'ad'}
          className="w-full h-full object-cover"
        />
      );
    } else {
      content = (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
          אין מדיה זמינה
        </div>
      );
    }

    return (
      <div className="border-[3px] border-[#e60000] rounded-xl overflow-hidden shadow-lg bg-black">
        <div className=" w-full aspect-video">{content}</div>

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
              לפרסומת
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-gray-900 py-4 sticky top-25">
      <ResponsiveBoxGrid>
        {/* 🟣 קרוסלה דו-קומתית */}
        <BoxWrapper>
          <div className="overflow-hidden flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 1, }}
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
