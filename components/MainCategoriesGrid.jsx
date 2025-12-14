// /components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

// עכשיו הקומפוננטה מקבלת את הקטגוריות מבחוץ (props)
export default function MainCategoriesGrid({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center gap-0.5 mb-8">
        <div className="w-1.5 h-8 bg-red-600 rounded-full" />
        <h2 className="text-3xl font-bold text-gray-900">
          החנות לרוכב
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.handle} 
            href={cat.href}
            className="group relative h-48 md:h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
          >
            {/* תמונת רקע משופיפיי */}
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              // פלייסהולדר למקרה שאין תמונה בשופיפיי
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                <span>אין תמונה</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 w-full p-4 text-center">
              <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md">
                {cat.title}
              </h3>
              <span className="text-red-400 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 block mt-1">
                צפה במוצרים &larr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}