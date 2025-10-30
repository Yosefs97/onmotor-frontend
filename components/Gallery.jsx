'use client';
import React, { useState, useEffect, useMemo } from 'react';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function Gallery({
  images = [],
  externalImageUrls = [],
  externalMediaUrl = null, // קישור לעמוד מדיה (כמו KTM Press)
}) {
  const [current, setCurrent] = useState(0);
  const [externalMediaImages, setExternalMediaImages] = useState([]);

  // ✅ טעינת תמונות חיצוניות מדף יצרן (אם יש externalMediaUrl)
  useEffect(() => {
    async function fetchExternalMedia() {
      if (!externalMediaUrl) return;
      try {
        console.log('📡 Fetching external media from:', externalMediaUrl);
        const res = await fetch(
          `/api/fetch-external-images?url=${encodeURIComponent(externalMediaUrl)}`
        );
        const data = await res.json();

        if (Array.isArray(data.images) && data.images.length > 0) {
          const validImages = data.images
            .map((img) => ({
              src: img.src?.trim(),
              alt: img.alt || '',
            }))
            .filter((img) => img.src && img.src.startsWith('http'));

          console.log('✅ External media images loaded:', validImages.length);
          setExternalMediaImages(validImages);
        } else {
          console.warn('⚠️ No valid external images found for', externalMediaUrl);
        }
      } catch (err) {
        console.error('❌ Error fetching external media images:', err);
      }
    }

    fetchExternalMedia();
  }, [externalMediaUrl]);

  // ✅ מאחד בין כל סוגי התמונות
  const allImages = useMemo(() => {
    const strapiImages = images
      .map((img) => ({
        src: img?.url || img?.src,
        alt: img?.alternativeText || img?.alt || '',
      }))
      .filter((img) => img.src);

    const externalLinks = externalImageUrls
      .filter((url) => typeof url === 'string' && url.trim() !== '')
      .map((url) => ({ src: url.trim(), alt: '' }))
      .filter((img) => img.src.startsWith('http'));

    const combined = [...strapiImages, ...externalLinks, ...externalMediaImages];

    // מסנן כפילויות ונתיבים לא חוקיים
    const unique = combined.filter(
      (img, index, self) =>
        img.src &&
        img.src.length > 10 &&
        self.findIndex((i) => i.src === img.src) === index
    );

    return unique;
  }, [images, externalImageUrls, externalMediaImages]);

  if (!allImages.length) {
    console.warn('⚠️ No images to display in gallery.');
    return null;
  }

  const next = () => setCurrent((current + 1) % allImages.length);
  const prev = () => setCurrent((current - 1 + allImages.length) % allImages.length);

  // ✅ תיקון URL יחסי
  const getImageUrl = (src) => {
    if (!src || typeof src !== 'string') return '/default-image.jpg';
    const trimmed = src.trim();
    if (trimmed.startsWith('http')) return trimmed;
    return `${PUBLIC_API_URL}${trimmed.startsWith('/') ? trimmed : `/uploads/${trimmed}`}`;
  };

  return (
    <div className="mt-8 w-full flex flex-col items-center gap-4">
      {/* תמונה ראשית */}
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg">
        <img
          src={getImageUrl(allImages[current].src)}
          alt={allImages[current].alt || `תמונה ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            e.target.src = '/default-image.jpg';
            console.warn('🖼️ Image failed to load:', allImages[current].src);
          }}
        />
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 text-3xl px-3 py-1 rounded-full transition"
        >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 text-3xl px-3 py-1 rounded-full transition"
        >
          ▶
        </button>
      </div>

      {/* תמונות ממוזערות */}
      <div className="flex gap-2 mt-2 overflow-x-auto px-2 scrollbar-hide">
        {allImages.map((img, i) => (
          <img
            key={i}
            src={getImageUrl(img.src)}
            alt={img.alt || `תמונה ${i + 1}`}
            className={`w-20 h-16 object-cover rounded cursor-pointer transition ring-offset-2 ${
              i === current ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setCurrent(i)}
            onError={(e) => {
              e.target.src = '/default-image.jpg';
              console.warn('🖼️ Thumbnail failed to load:', img.src);
            }}
          />
        ))}
      </div>
    </div>
  );
}
