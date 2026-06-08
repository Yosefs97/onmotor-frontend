// /components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';

export default function MainCategoriesGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  // פונקציית עזר שמתאימה לכל קטגוריה את הגודל שלה ברשת לפי ה-handle שלה בשופיפיי
  const getGridClass = (handle) => {
    switch (handle) {
      case 'parts': // חלקי חילוף
        return 'md:col-span-2 md:row-span-2 h-64 md:h-full';
      case 'road': // כביש
        return 'md:col-span-2 md:row-span-1 h-64 md:h-64';
      case 'offroad': // שטח
      case 'oils': // שמנים ונוזלים
        return 'md:col-span-1 md:row-span-1 h-64 md:h-64';
      case 'tires': // צמיגים
      case 'battery': // מצברים
        return 'md:col-span-2 md:row-span-1 h-64 md:h-64';
      default:
        // ברירת מחדל אם הוספת משהו חדש לשופיפיי
        return 'md:col-span-1 md:row-span-1 h-64 md:h-64'; 
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
        {categories.map((category) => {
          // שולפים את התמונה שמגיעה משופיפיי (או שמים ברירת מחדל אם חסר)
          const imageUrl = category.image?.url || category.image || '/images/placeholder-category.jpg';

          return (
            <Link
              key={category.handle}
              href={category.href}
              className={`group relative w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#e60000] flex items-end ${getGridClass(category.handle)}`}
            >
              {/* תמונת הרקע משופיפיי */}
              <img
                src={imageUrl}
                alt={category.title} // הכותרת (alt) מגיעה משופיפיי
                className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />

              {/* גרדיאנט שחור בתחתית */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

              {/* טקסט */}
              <div className="relative z-10 w-full p-6 text-right">
                <h2 className="text-3xl font-black text-white group-hover:text-[#e60000] transition-colors duration-300 drop-shadow-lg">
                  {category.title} {/* 🌟 הכותרת מוצגת ישירות מהנתונים של שופיפיי! 🌟 */}
                </h2>
                <span className="inline-block mt-2 text-sm font-bold text-gray-200 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
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