// components/Gallery.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// מחלץ כתובות URL תקניות מכל מחרוזת או מערך
function extractUrls(input) {
  if (!input) return [];

  // אם זה מערך — ננקה ונחזיר
  if (Array.isArray(input)) {
    return input
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  }

  // אם זה מחרוזת — נשתמש ב־regex בלבד, בלי split
  if (typeof input === "string") {
    // מחפש את כל הקישורים שמתחילים ב־http/https
    const matches = input.match(/https?:\/\/[^\s,;'"<>]+/gi);
    if (!matches) return [];
    return [...new Set(matches.map((s) => s.trim()))];
  }

  return [];
}


export default function Gallery({
  images = [],
  externalImageUrls = [],
}) {
  const [current, setCurrent] = useState(0);
  const [externalMediaImages, setExternalMediaImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const { directLinks, pagesToScrape } = useMemo(() => {
    const urls = extractUrls(externalImageUrls);
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    const direct = urls.filter(url => imageExtensions.test(url));
    const pages = urls.filter(url => !imageExtensions.test(url) && url.startsWith('http'));

    return { directLinks: direct, pagesToScrape: pages };
  }, [externalImageUrls]);

  const scrapeUrlString = useMemo(() => pagesToScrape.join(','), [pagesToScrape]);

  useEffect(() => {
    let active = true;

    async function fetchAllExternalMedia() {
      if (!scrapeUrlString) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const urlsToFetch = scrapeUrlString.split(',');

      try {
        const allResults = await Promise.all(
          urlsToFetch.map(url =>
            fetch(`/api/fetch-external-images?url=${encodeURIComponent(url)}`)
              .then(res => res.json())
          )
        );

        if (active) {
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
  }, [scrapeUrlString]);

  const allImages = useMemo(() => {
    const strapiImages = (images || [])
      .map(img => ({
        src: img?.url || img?.src,
        alt: img?.alternativeText || img?.alt || '',
      }))
      .filter(img => !!img.src);

    const externalLinks = directLinks.map(url => ({ src: url, alt: '' }));
    const combined = [...strapiImages, ...externalLinks, ...externalMediaImages];
    return combined.filter((img, i, arr) => img.src && arr.findIndex(x => x.src === img.src) === i);
  }, [images, directLinks, externalMediaImages]);

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

  const setInlineFallback = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" font-size="42" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          אין תמונה
        </text>
      </svg>
    `);
  };

  return (
    <div className="mt-8 w-full flex flex-col items-center gap-0">
      {/* תמונה ראשית */}
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg bg-gray-100">
        <img
          key={current}
          src={getImageUrl(allImages[current].src)}
          alt={allImages[current].alt || `תמונה ${current + 1}`}
          loading="eager"
          className="w-full h-full object-contain transition-opacity duration-500 bg-white p-2"
          onError={setInlineFallback}
        />
        
      </div>

      {/* תמונות ממוזערות */}
      <div className="flex gap-2 mt-3 overflow-x-auto px-2 scrollbar-hide">
        {allImages.map((img, i) => (
          <img
            key={i}
            src={getImageUrl(img.src)}
            alt={img.alt || `תמונה ${i + 1}`}
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