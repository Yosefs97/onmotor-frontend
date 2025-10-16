'use client';
import React, { useState } from 'react';

export default function Gallery({ images = [] }) {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const next = () => setCurrent((current + 1) % images.length);
  const prev = () => setCurrent((current - 1 + images.length) % images.length);

  return (
    <div className="mt-8 w-full flex flex-col items-center gap-4">
      {/* תמונה ראשית גדולה */}
      <div className="relative w-full max-w-3xl aspect-[3/2] overflow-hidden rounded shadow-lg">
        <img
          src={images[current].src}
          alt={images[current].alt || `תמונה ${current + 1}`}
          className="w-full h-full object-cover"
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
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt || `תמונה ${i + 1}`}
            className={`w-20 h-16 object-cover rounded cursor-pointer transition ring-offset-2 ${i === current ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
