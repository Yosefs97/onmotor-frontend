// /components/CategoriesNav.jsx
'use client';

import Link from 'next/link';

export default function CategoriesNav({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <>
      {/* === תצוגת מובייל === */}
      <div className="md:hidden w-full overflow-x-auto bg-white border-t border-gray-100 py-1.5">
        <div className="flex items-center px-4">
          {categories.map((cat, index) => (
            <div key={cat.handle || cat.title} className="flex items-center shrink-0">
              
              {/* קו מפריד אדום */}
              {index > 0 && <div className="w-px h-3 bg-red-600 mx-3" />}

              <Link
                href={cat.href || `/collections/${cat.handle}`}
                className="text-gray-800 hover:text-red-600 text-sm font-bold whitespace-nowrap transition-colors"
              >
                {cat.title}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* === תצוגת מחשב === */}
      <div className="hidden md:flex items-center px-2">
        {categories.map((cat, index) => (
          <div key={cat.handle || cat.title} className="flex items-center">
            
            {/* קו מפריד אדום */}
            {index > 0 && <div className="w-px h-4 bg-red-600 mx-3" />}
            
            <Link
              href={cat.href || `/collections/${cat.handle}`}
              className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
            >
              {cat.title}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}