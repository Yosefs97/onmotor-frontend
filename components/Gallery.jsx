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
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ טעינת תמונות חיצוניות מדף יצרן (כמו KTM Press)
  useEffect(() => {
    let isCancelled = false;

    async function fetchExternalMedia() {
      if (!externalMediaUrl) return;

      try {
        const res = await fetch(
          `/api/fetch-external-images?url=${encodeURIComponent(externalMediaUrl)}`
        );
        const data = await res.json();

        if (!isCancelled && Array.isArray(data.images)) {
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
      }
    }

    fetchExternalMedia();

    return () => {
      isCancelled = true;
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

    const externalLinks = (externalImageUrls || [])
      .filter((url) => typeof url === 'string' && url.trim() !== '')
      .map((url) => ({ src: url.trim(), alt: '' }))
      .filter((img) => img.src.startsWith('http'));

    const combined = [...strapiImages, ...externalLinks, ...externalMediaImages];

    const unique = combined.filter(
      (img, i, arr) =>
        img.src &&
        arr.findIndex((x) => x.src === img.src) === i &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(img.src)
    );

    return unique;
  }, [images, externalImageUrls, externalMediaImages]);

  // ✅ טעינה ראשונית
  useEffect(() => {
    if (allImages.length > 0) {
      setIsLoaded(true);
    }
  }, [allImages.length]);

  if (!isLoaded || !allImages.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        טוען גלריה...
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
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg">
        <img
          key={current}
          src={getImageUrl(allImages[current].src)}
          alt={allImages[current].alt || `תמונה ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.target.src = '/default-image.jpg';
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
            onError={(e) => {
              e.target.src = '/default-image.jpg';
            }}
          />
        ))}
      </div>
    </div>
  );
}
