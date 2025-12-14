// /components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MainCategoriesGrid({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="py-4 px-2 max-w-7xl mx-auto" dir="rtl">
      
      {/* כותרת */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1.5 h-8 bg-red-600 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-900">
          החנות לרוכב
        </h2>
      </div>
      
      {/* גריד צפוף ומרובע */}
      {/* grid-cols-3 בנייד נותן מראה של אפליקציה צפופה, אפשר לשנות ל-2 אם זה קטן מדי */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"> 
        {categories.map((cat) => (
          <Link 
            key={cat.handle} 
            href={cat.href}
            // 👇 עיצוב הקוביה:
            // aspect-square = ריבוע מושלם
            // border-gray-300 = מסגרת ברורה
            className="group relative w-full aspect-square rounded-lg overflow-hidden border border-gray-300 bg-white hover:border-red-600 transition-colors duration-300 shadow-sm"
          >
            {/* תמונה */}
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-xs">אין תמונה</span>
              </div>
            )}
            
            {/* שכבת כהות עדינה כדי שהטקסט יבלוט */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* טקסט למטה */}
            <div className="absolute bottom-0 w-full p-2 text-center">
              <h3 className="text-white font-bold text-xs md:text-base leading-tight drop-shadow-md">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}