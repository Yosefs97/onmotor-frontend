// /components/MainCategoriesGrid.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MainCategoriesGrid({ categories = [], isSidebar = false }) {
  if (!categories.length) return null;

  return (
    <section 
      className={`py-4 px-1 ${isSidebar ? 'w-full mt-4' : 'max-w-7xl mx-auto'}`} 
      dir="rtl"
    >
      
      {/* כותרת ראשית - מוצגת רק כשהקומפוננטה בגוף הדף (לא בסיידבר) */}
      {!isSidebar && (
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-8 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            החנות לרוכב
          </h2>
        </div>
      )}

      {/* כותרת משנית - מוצגת רק בתוך הסיידבר */}
      {isSidebar && (
        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-lg text-gray-800">
                קטגוריות
            </h3>
        </div>
      )}
      
      {/* הגריד משתנה:
         בסיידבר (isSidebar=true) -> תמיד 2 טורים.
         בראשי -> רספונסיבי (2 במובייל, 4 בטאבלט, 6 בדסקטופ).
      */}
      <div className={`grid gap-1 ${
          isSidebar 
            ? 'grid-cols-2' 
            : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0.5'
        }`}
      > 
        {categories.map((cat) => (
          <Link 
            key={cat.handle} 
            href={cat.href}
            className="group relative w-full aspect-square rounded overflow-hidden border border-gray-200 bg-white hover:border-red-600 transition-colors duration-300"
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes={isSidebar ? "150px" : "(max-width: 768px) 50vw, 16vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-xs">אין תמונה</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            
            <div className="absolute bottom-0 w-full p-2 text-center">
              <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}