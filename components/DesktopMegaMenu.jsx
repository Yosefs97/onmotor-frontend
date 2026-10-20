// components/DesktopMegaMenu.jsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function DesktopMegaMenu({ menuItems = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
    }, 200); // השהייה של 200ms
  };

  return (
    <nav className="hidden lg:flex items-center gap-6 mr-4 h-full relative z-[60]" dir="rtl">
      {menuItems.map((category, index) => {
        const isOpen = activeIndex === index;
        const hasSubItems = category.items && category.items.length > 0;

        return (
          <div
            key={category.title}
            className="relative h-full flex items-center"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={category.url || '#'}
              className={`
                flex items-center gap-1 text-sm font-bold transition-colors py-4 px-2
                ${isOpen ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}
              `}
            >
              {category.title}
              {hasSubItems && (
                <ChevronDown 
                  className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              )}
            </Link>

            {hasSubItems && isOpen && (
              <div 
                // שינוי לרוחב 800px כדי להכיל יפה את 4 העמודות
                className="absolute top-full right-0 w-[800px] bg-white shadow-xl border border-gray-200 rounded-b-lg animate-in fade-in slide-in-from-top-1 duration-150 z-[100]"
                style={{ marginTop: '-1px' }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600" />

                {/* שינוי ל- grid-cols-4 כדי שכל תת-קטגוריה תקבל עמודה משלה */}
                <div className="p-6 grid grid-cols-4 gap-6">
                  {category.items.map((group, idx) => {
                    const hasDeepItems = group.items && group.items.length > 0;

                    return (
                      <div key={idx} className="space-y-3">
                        {/* הפיכת כותרת העמודה ללחיצה */}
                        <Link 
                          href={group.url || '#'} 
                          className="block font-bold text-red-600 text-sm border-b pb-1 border-gray-100 hover:text-red-800 transition-colors"
                        >
                          {group.title}
                        </Link>
                        
                        {/* רינדור הרמה השלישית (כמו קסדות, כפפות וכו') */}
                        {hasDeepItems && (
                          <ul className="space-y-2">
                            {group.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={item.url || '#'}
                                  className="text-gray-600 hover:text-red-600 text-sm block font-medium transition-colors hover:translate-x-[-2px]"
                                >
                                  {item.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}