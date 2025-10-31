// components/Gallery.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// מחלץ כתובות URL מכל מחרוזת (גם אם הופרדו בשורות/פסיקים/רווחים)
function extractUrls(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map(s => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    // מפרק לפי שורות/פסיקים/נקודה-פסיק/רווחים, וגם מזהה URL-ים עם Regex
    const bySeparators = input.split(/[\r\n,; ]+/).filter(Boolean);
    const byRegex = [...input.matchAll(/https?:\/\/[^\s"']+/gi)].map(m => m[0]);
    return Array.from(new Set([...bySeparators, ...byRegex])).map(s => s.trim());
  }
  return [];
}

export default function Gallery({
  images = [],
  externalImageUrls = [], // ✅ זה השדה היחיד שנקבל עכשיו לקישורים חיצוניים
}) {
  const [current, setCurrent] = useState(0);
  const [externalMediaImages, setExternalMediaImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 שינוי: מפרק את ה-URLs ומחלק אותם לקישורים ישירים ולדפים לגרוטאות
  const { directLinks, pagesToScrape } = useMemo(() => {
    const urls = extractUrls(externalImageUrls);
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    const direct = urls.filter(url => imageExtensions.test(url));
    const pages = urls.filter(url => !imageExtensions.test(url) && url.startsWith('http'));

    return { directLinks: direct, pagesToScrape: pages };
  }, [externalImageUrls]);

  // 🔄 שינוי: משתמש במזהה ייחודי של הדפים לגרוטאות כדי להפעיל את ה-useEffect
  const scrapeUrlString = useMemo(() => pagesToScrape.join(','), [pagesToScrape]);

  // 🔄 שינוי: טוען תמונות מדפים חיצוניים על בסיס pagesToScrape
  useEffect(() => {
    let active = true;

    async function fetchAllExternalMedia() {
      // אם אין דפים לגרוטאות, נסיים את הטעינה
      if (!scrapeUrlString) {
        setLoading(false);
        return;
      }

      setLoading(true); // מתחילים טעינה
      const urlsToFetch = scrapeUrlString.split(',');

      try {
        // מבצע קריאות API במקביל לכל הדפים שצריך לגרוט
        const allResults = await Promise.all(
          urlsToFetch.map(url =>
            fetch(`/api/fetch-external-images?url=${encodeURIComponent(url)}`)
              .then(res => res.json())
          )
        );

        if (active) {
          // מאחד את כל התמונות מכל הדפים שנגרטו
          const combinedImages = allResults
            .flatMap(data => data.images || [])
            .map(img => ({ src: img?.src?.trim(), alt: img?.alt || '' }))
            .filter(img => img.src && img.src.startsWith('http'));

          setExternalMediaImages(combinedImages);
        }

      } catch (e) {
        console.error('❌ fetchAllExternalMedia error:', e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAllExternalMedia();
    return () => { active = false; };
  }, [scrapeUrlString]); // תלוי במחרוזת ה-URLs

  // 🔄 שינוי: מאחד: Strapi images + קישורים ישירים + תמונות שנגרטו
  const allImages = useMemo(() => {
    const strapiImages = (images || [])
      .map(img => ({
        src: img?.url || img?.src,
        alt: img?.alternativeText || img?.alt || '',
      }))
      .filter(img => !!img.src);

    // משתמש בקישורים הישירים שסוננו קודם
    const externalLinks = directLinks.map(url => ({ src: url, alt: '' }));

    // externalMediaImages מגיע מה-useEffect
    const combined = [...strapiImages, ...externalLinks, ...externalMediaImages];

    // הסרת כפילויות
    return combined.filter((img, i, arr) => img.src && arr.findIndex(x => x.src === img.src) === i);
  }, [images, directLinks, externalMediaImages]); // תלויות מעודכנות

  if (loading) {
    return <div className="text-center text-gray-500 py-8">טוען את הגלריה...</div>;
  }

  if (!allImages.length) {
    return <div className="text-center text-gray-500 py-8">לא נמצאו תמונות בגלריה.</div>;
  }

  const next = () => setCurrent(prev => (prev + 1) % allImages.length);
  const prev = () => setCurrent(prev => (prev - 1 + allImages.length) % allImages.length);

  const getImageUrl = (src) => {
    if (!src || typeof src !== 'string') return '';
    const s = src.trim();
    if (s.startsWith('http')) return s;
    return `${PUBLIC_API_URL}${s.startsWith('/') ? s : `/uploads/${s}`}`;
  };

  // Fallback inline SVG במקום default-image.jpg כדי להימנע מ-403 על קובץ חסר
  const setInlineFallback = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" font-size="42" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          אין תמונה
        </text>
      </svg>
    `);
  };

  return (
    <div className="mt-8 w-full flex flex-col items-center gap-4">
      {/* תמונה ראשית */}
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg bg-gray-100">
        <img
          key={current}
          src={getImageUrl(allImages[current].src)}
          alt={allImages[current].alt || `תמונה ${current + 1}`}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="eager"
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={setInlineFallback}
        />
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 text-3xl px-3 py-1 rounded-full transition"
T      >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 text-3xl px-3 py-1 rounded-full transition"
        >
          ▶
        </button>
      </div>

      {/* תמונות ממוזערות */}
      <div className="flex gap-2 mt-3 overflow-x-auto px-2 scrollbar-hide">
        {allImages.map((img, i) => (
          <img
            key={i}
            src={getImageUrl(img.src)}
            alt={img.alt || `תמונה ${i + 1}`}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="lazy"
            className={`w-20 h-16 object-cover rounded cursor-pointer transition ring-offset-2 ${
              i === current ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setCurrent(i)}
            onError={setInlineFallback}
          />
        ))}
      </div>
    </div>
  );
}