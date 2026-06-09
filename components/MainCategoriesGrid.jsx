// components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';

export default function MainCategoriesGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  const getGridClass = (handle) => {
    switch (handle) {
      case 'parts':
        return 'md:col-span-2 md:row-span-2 h-72 md:h-full';
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
    <>
      {/* אנימציית הדינמיות לרקע (תזוזה עדינה ויוקרתית) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes smoothPan {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1.0); }
        }
        .animate-smooth-pan {
          animation: smoothPan 20s infinite ease-in-out;
        }
      `}} />

      {/* קיזוז מדויק של שולי העמוד (16 פיקסלים מכל צד) ליצירת פריסה מקצה לקצה */}
      <div className="-mx-4 w-[calc(100%+2rem)] md:w-full md:mx-auto md:max-w-7xl" dir="rtl">
        {/* רווח עדין של 2 פיקסלים בין הקוביות למראה נקי */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[2px] md:gap-2 auto-rows-min">
          {categories.map((category, index) => {
            const imageUrl = category.image?.url || category.image || '/images/placeholder-category.jpg';

            return (
              <Link
                key={category.handle}
                href={category.href}
             
                className={`group relative w-full overflow-hidden rounded-none bg-black shadow-sm transition-all duration-300 ring-0 hover:ring-4 hover:ring-[#e60000] hover:ring-inset flex items-end ${getGridClass(category.handle)}`}
              >
                {/* התמונה מקבלת את אנימציית הזום עם דיליי משתנה */}
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700 ease-in-out animate-smooth-pan"
                  style={{ animationDelay: `${index * 1.5}s` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                <div className="relative z-10 w-full p-5 text-right pointer-events-none">
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
    </>
  );
}