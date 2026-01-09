// /components/CategoriesNav.jsx
'use client';

import Link from 'next/link';

export default function CategoriesNav({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <>
      {/* === תצוגת מובייל: כפתורים נגללים === */}
      {/* no-scrollbar מסתיר את פס הגלילה, overflow-x-auto מאפשר גלילה אופקית */}
      <div className="md:hidden w-full overflow-x-auto bg-white border-t border-gray-100 pb-1">
        <div className="flex items-center gap-2 px-4 py-2">
          {categories.map((cat) => (
            <Link
              key={cat.handle || cat.title}
              href={cat.href || `/collections/${cat.handle}`}
              className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      {/* === תצוגת מחשב: שורה עם מפרידים === */}
      <div className="hidden md:flex items-center gap-3 px-2">
        {categories.map((cat, index) => (
          <div key={cat.handle || cat.title} className="flex items-center gap-3">
            {/* קו מפריד (מופיע רק החל מהפריט השני) */}
            {index > 0 && <div className="w-px h-3 bg-gray-300" />}
            
            <Link
              href={cat.href || `/collections/${cat.handle}`}
              className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap"
            >
              {cat.title}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}