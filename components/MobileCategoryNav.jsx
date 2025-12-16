//components/MobileCategoryNav.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MobileCategoryNav({ menuItems }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (title) => {
    if (activeCategory === title) {
      setActiveCategory(null); // סגירה אם לוחצים על אותו אחד
    } else {
      setActiveCategory(title); // פתיחה של החדש (וסגירה של הקודם אוטומטית)
    }
  };

  if (!menuItems || menuItems.length === 0) return null;

  // מציאת הקטגוריה הפעילה כדי להציג את התוכן שלה
  const activeItemData = menuItems.find(item => item.title === activeCategory);

  return (
    <div className="w-full md:hidden mb-4">
      
      {/* --- שורת הכפתורים (נגללת אופקית) --- */}
      <div className="flex overflow-x-auto gap-2 px-2 pb-2 no-scrollbar items-center">
        {menuItems.map((category) => {
          const isActive = activeCategory === category.title;
          
          return (
            <button
              key={category.title}
              onClick={() => toggleCategory(category.title)}
              className={`
                flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 border rounded-md text-sm font-bold transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}
              `}
            >
              {category.title}
              {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          );
        })}
      </div>

      {/* --- התפריט שנפתח (2 עמודות) --- */}
      {activeItemData && activeItemData.items.length > 0 && (
        <div className="bg-gray-50 border-t border-b border-gray-200 p-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            
            {activeItemData.items.map((group, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                {/* כותרת הקבוצה (למשל: ציוד רכיבה) */}
                <h4 className="font-bold text-red-600 text-xs border-b border-gray-300 pb-1 mb-1">
                  {group.title}
                </h4>
                
                {/* הפריטים (למשל: מגפיים, קסדות) */}
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.title}>
                      <Link 
                        href={item.url}
                        className="block text-gray-700 text-xs hover:text-red-600 font-medium leading-tight"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* כפתור "לכל המוצרים" שיופיע בסוף */}
            <div className="col-span-2 mt-2">
                <Link 
                    href={activeItemData.url}
                    className="block w-full text-center bg-gray-200 text-gray-800 text-xs py-2 rounded font-bold"
                >
                    לכל מוצרי {activeItemData.title}
                </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}