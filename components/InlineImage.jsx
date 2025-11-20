// components/InlineImage.jsx
'use client';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onmotormedia.com';
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL || '';

function getInlineSrc(src) {
  if (!src || typeof src !== 'string') return '';
  const s = src.trim();

  // לא http → נתיב יחסי / local
  if (!s.startsWith('http')) return s;

  // כבר בפרוקסי / הונדה
  if (s.includes('/api/proxy-honda') || s.includes('/api/proxy-media')) return s;

  // Strapi / האתר עצמו
  if (STRAPI_URL && s.startsWith(STRAPI_URL)) return s;
  if (SITE_URL && s.startsWith(SITE_URL)) return s;

  // קישור חיצוני רגיל → proxy-media
  return `${SITE_URL}/api/proxy-media?url=${encodeURIComponent(s)}`;
}

export default function InlineImage({ src, alt = '', caption = '', maxWidth = '100%' }) {
  if (!src) return null;

  const finalSrc = getInlineSrc(src);

  return (
    <div className="my-6 flex flex-col items-center gap-2">
      <img
        src={finalSrc}
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
