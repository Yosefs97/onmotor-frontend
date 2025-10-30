// components/Gallery.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function Gallery({
  images = [],
  externalImageUrls = [], // יכול להיות מערך או טקסט עם שורות
  externalMediaUrl = null, // קישור לעמוד מדיה
}) {
  const [current, setCurrent] = useState(0);
  const [externalMediaImages, setExternalMediaImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ אם התקבל שדה טקסט מ-Strapi — מפרקים אותו לשורות
  const parsedExternalUrls = useMemo(() => {
    if (typeof externalImageUrls === 'string') {
      return externalImageUrls
        .split(/\r?\n|,/)
        .map((url) => url.trim())
        .filter(
          (url) =>
            url &&
            (url.startsWith('http://') || url.startsWith('https://')) &&
            /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url)
        );
    }
    if (Array.isArray(externalImageUrls)) {
      return externalImageUrls.filter(
        (url) =>
          typeof url === 'string' &&
          url.trim() !== '' &&
          (url.startsWith('http://') || url.startsWith('https://'))
      );
    }
    return [];
  }, [externalImageUrls]);

  // ✅ טעינת תמונות חיצוניות מדף יצרן (אם יש externalMediaUrl)
  useEffect(() => {
    let active = true;

    async function fetchExternalMedia() {
      if (!externalMediaUrl) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/fetch-external-images?url=${encodeURIComponent(externalMediaUrl)}`
        );
        const data = await res.json();

        if (active && Array.isArray(data.images)) {
          const valid = data.images
            .map((img) => ({
              src: img.src?.trim(),
              alt: img.alt || '',
            }))
            .filter(
              (img) =>
                img.src &&
                img.src.startsWith('http') &&
                /\.(jpg|jpeg|png|webp|gif)$/i.test(img.src)
            );

          setExternalMediaImages(valid);
        }
      } catch (err) {
        console.error('❌ Error fetching external media images:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchExternalMedia();
    return () => {
      active = false;
    };
  }, [externalMediaUrl]);

  // ✅ מאחד את כל סוגי התמונות
  const allImages = useMemo(() => {
    const strapiImages = (images || [])
      .map((img) => ({
        src: img?.url || img?.src,
        alt: img?.alternativeText || img?.alt || '',
      }))
      .filter((img) => img.src);

    const externalLinks = parsedExternalUrls.map((url) => ({
      src: url,
      alt: '',
    }));

    const combined = [...strapiImages, ...externalLinks, ...externalMediaImages];

    const unique = combined.filter(
      (img, i, arr) =>
        img.src &&
        arr.findIndex((x) => x.src === img.src) === i &&
        /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(img.src)
    );

    return unique;
  }, [images, parsedExternalUrls, externalMediaImages]);

  // ✅ אם עדיין טוען
  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        טוען את הגלריה...
      </div>
    );
  }

  // ✅ אם סיים טעינה אבל אין תמונות
  if (!allImages.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        לא נמצאו תמונות בגלריה.
      </div>
    );
  }

  const next = () => setCurrent((prev) => (prev + 1) % allImages.length);
  const prev = () => setCurrent((prev) => (prev - 1 + allImages.length) % allImages.length);

  const getImageUrl = (src) => {
    if (!src || typeof src !== 'string') return '/default-image.jpg';
    const trimmed = src.trim();
    if (trimmed.startsWith('http')) return trimmed;
    return `${PUBLIC_API_URL}${trimmed.startsWith('/') ? trimmed : `/uploads/${trimmed}`}`;
  };

  return (
    <div className="mt-8 w-full flex flex-col items-center gap-4">
      {/* תמונה ראשית */}
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg bg-gray-100">
        <img
          key={current}
          src={getImageUrl(allImages[current].src)}
          alt={allImages[current].alt || `תמונה ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
                <rect width="100%" height="100%" fill="#ddd"/>
                <text x="50%" y="50%" font-size="40" fill="#555" text-anchor="middle" dominant-baseline="middle">
                  אין תמונה
                </text>
              </svg>
            `);
          }}
        />
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 text-3xl px-3 py-1 rounded-full transition"
        >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 text-3xl px-3 py-1 rounded-full transition"
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
            className={`w-20 h-16 object-cover rounded cursor-pointer transition ring-offset-2 ${
              i === current ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
