// ✅ components/InlineImage.jsx
'use client';
import React from 'react';

export default function InlineImage({ src, alt = '', caption = '', maxWidth = '100%' }) {
  if (!src) return null;

  return (
    <div className="my-6 flex flex-col items-center gap-2">
      <img
        src={src}
        alt={alt}
        style={{ maxWidth }}
        className="rounded-md border border-gray-300 shadow-sm"
      />
      {caption && (
        <p className="text-sm text-gray-500 text-center max-w-[90%]">{caption}</p>
      )}
    </div>
  );
}
