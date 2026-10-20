// components/DesktopMegaMenu.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

// הפונקציה שמתרגמת כתובות שופיפיי לכתובות מקומיות באתר
const formatUrl = (rawUrl) => {
  if (!rawUrl || rawUrl === '#') return '#';
  try {
    const urlObj = new URL(rawUrl);
    let newPath = urlObj.pathname;
    
    // החלפת /collections/ ל- /shop/collection/
    if (newPath.startsWith('/collections/')) {
      newPath = newPath.replace('/collections/', '/shop/collection/');
    }
    
    // מחזיר את הנתיב המקומי יחד עם כל פרמטר סינון (כמו ?type=קסדות)
    return newPath + decodeURIComponent(urlObj.search);
  } catch (e) {
    return rawUrl;
  }
};

export default function DesktopMegaMenu({ menuItems = [] }) {
  if (!menuItems || menuItems.length === 0) return null;

  return (
    <nav className="hidden lg:flex items-center gap-6 mr-4 h-full relative z-[60]" dir="rtl">
      {menuItems.map((category) => {
        const hasSubItems = category.items && category.items.length > 0;

        return (
          <div key={category.title} className="relative h-full flex items-center group">
            
            <Link
              href={formatUrl(category.url)}
              // כאן השארנו את הלבן עבור שורת התפריט העליונה
              className="flex items-center gap-1 text-sm font-bold text-white hover:text-red-600 transition-colors py-8 px-2"
            >
              {category.title}
              {hasSubItems && (
                <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
              )}
            </Link>

            {hasSubItems && (
              <div 
                className="absolute top-full right-0 w-[800px] hidden group-hover:block bg-white shadow-xl border border-gray-200 rounded-b-lg z-[100]"
                style={{ marginTop: '-1px' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600" />

                <div className="p-6 grid grid-cols-4 gap-6">
                  {category.items.map((group, idx) => {
                    const hasDeepItems = group.items && group.items.length > 0;

                    return (
                      <div key={idx} className="space-y-3">
                        {/* כותרת עמודה פנימית - אדומה באילוץ כדי למנוע דריסה */}
                        <Link 
                          href={formatUrl(group.url)} 
                          className="block font-bold !text-red-600 text-sm border-b pb-1 border-gray-100 hover:!text-red-800 transition-colors"
                        >
                          {group.title}
                        </Link>
                        
                        {hasDeepItems && (
                          <ul className="space-y-2">
                            {group.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={formatUrl(item.url)}
                                  // פריט פנימי - אפור כהה באילוץ כדי שלא ייצבע בלבן!
                                  className="block !text-gray-800 hover:!text-red-600 text-sm font-medium transition-colors hover:translate-x-[-2px]"
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