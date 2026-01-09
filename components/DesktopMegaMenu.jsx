// /components/DesktopMegaMenu.jsx
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
    }, 200);
  };

  return (
    <nav className="hidden lg:flex items-center gap-6 mr-4 h-full relative z-[60]">
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
              href={category.url}
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
                className="absolute top-full right-0 w-[600px] bg-white shadow-xl border border-gray-200 rounded-b-lg animate-in fade-in slide-in-from-top-1 duration-150 z-[100]" 
                /* 👆 z-[100] מבטיח שזה יצוף מעל הכל */
                style={{ marginTop: '-1px' }} /* סוגר רווח מיקרוסקופי אם קיים */
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600" />

                <div className="p-6 grid grid-cols-3 gap-6">
                  {category.items.map((group, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="font-bold text-red-600 text-sm border-b pb-1 border-gray-100">
                        {group.title}
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item.title}>
                            <Link
                              href={item.url}
                              className="text-gray-600 hover:text-red-600 text-xs block font-medium transition-colors hover:translate-x-[-2px]"
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}