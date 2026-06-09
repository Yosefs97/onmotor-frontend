// components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';

export default function MainCategoriesGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  const getGridClass = (handle) => {
    switch (handle) {
      case 'parts':
        return 'md:col-span-2 md:row-span-2 h-64 md:h-full';
      case 'road':
        return 'md:col-span-2 md:row-span-1 h-64 md:h-64';
      case 'offroad':
      case 'oils':
        return 'md:col-span-1 md:row-span-1 h-64 md:h-64';
      case 'tires':
      case 'battery':
        return 'md:col-span-2 md:row-span-1 h-64 md:h-64';
      default:
        return 'md:col-span-1 md:row-span-1 h-64 md:h-64'; 
    }
  };

  return (
    <div className="w-[calc(100%+2rem)] -mx-4 md:w-full md:mx-auto max-w-7xl" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-2 auto-rows-min">
        {categories.map((category) => {
          const imageUrl = category.image?.url || category.image || '/images/placeholder-category.jpg';

          return (
            <Link
              key={category.handle}
              href={category.href}
              className={`group relative w-full overflow-hidden rounded-none bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#e60000] flex items-end ${getGridClass(category.handle)}`}
            >
              <img
                src={imageUrl}
                alt={category.title}
                className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="relative z-10 w-full p-5 text-right">
                <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-[#e60000] transition-colors duration-300 drop-shadow-md">
                  {category.title}
                </h2>
                <span className="inline-block mt-1 text-sm font-bold text-gray-200 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  לכניסה &larr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}