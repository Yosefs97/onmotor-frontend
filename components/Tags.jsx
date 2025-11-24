// /components/Tags.jsx
'use client';
import React from 'react';
import Link from 'next/link';

// פונקציה ליצירת slug נקי
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // רווחים -> מקף
    .replace(/[^\w\-א-ת]+/g, '') // מסיר תווים חריגים חוץ מאותיות/מספרים/עברית
    .replace(/\-\-+/g, '-');     // מקפים רצופים -> מקף יחיד
}

export default function Tags({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm text-gray-400 mb-2">תגיות:</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const name = typeof tag === 'string' ? tag : tag?.name || '';
          const slug = slugify(name);

          return (
            <Link
              key={index}
              href={`/tags/${slug}`}
              prefetch={false}
              className="bg-gray-800 text-gray-100 px-2 py-1 text-sm rounded hover:bg-gray-700"
            >
              #{name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
