// components/MobileCategoryNav.jsx
'use client';

import Link from 'next/link';

export default function MobileCategoryNav({ menuItems = [] }) {
  // אם אין פריטים, לא מציגים כלום
  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden w-full bg-white border-b border-gray-200 sticky top-[180px] z-20 shadow-sm">
      {/* Container לגלילה אופקית:
          overflow-x-auto: מאפשר גלילה לצדדים
          whitespace-nowrap: מונע שבירת שורות
          no-scrollbar: (אופציונלי) אם יש לך הגדרה כזו ב-tailwind להסתרת הפס גלילה
      */}
      <div 
        className="flex items-center gap-3 px-4 py-3 overflow-x-auto whitespace-nowrap custom-scrollbar"
        dir="rtl"
      >
        {menuItems.map((item, index) => (
          <Link
            key={item.id || index} // עדיף להשתמש ב-ID אם יש, אחרת אינדקס
            href={item.url}
            className="
              px-4 py-2 
              bg-gray-50 
              border border-gray-200 
              rounded-full 
              text-sm font-bold text-gray-700 
              hover:bg-red-50 hover:text-red-600 hover:border-red-200 
              transition-colors
              flex-shrink-0
            "
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}