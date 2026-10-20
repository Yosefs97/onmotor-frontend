// components/DesktopMegaMenu.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

// פונקציה חכמה שמתרגמת כתובות שופיפיי לכתובות מקומיות ומונעת קפיצות מיותרות
const formatUrl = (rawUrl) => {
  if (!rawUrl) return '#';
  
  if (rawUrl === '#' || rawUrl.endsWith('#') || rawUrl === 'https://nwjhcm-gf.myshopify.com/') {
    return '#';
  }
  
  try {
    const urlObj = new URL(rawUrl);
    let newPath = urlObj.pathname;
    
    if (newPath === '/' && !urlObj.search) {
       return '#';
    }
    
    // החלפת הניתוב של שופיפיי לניתוב הדינמי שלך ב-Next.js
    if (newPath.startsWith('/collections/')) {
      newPath = newPath.replace('/collections/', '/shop/collection/');
    }
    
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
                    const groupUrl = formatUrl(group.url);

                    return (
                      <div key={idx} className="space-y-3">
                        
                        {/* תת-קטגוריה: אם זה לינק אמיתי נרנדר Link, אם זה סולמית נרנדר טקסט רגיל */}
                        {groupUrl !== '#' ? (
                          <Link 
                            href={groupUrl} 
                            className="block font-bold !text-red-600 text-sm border-b pb-1 border-gray-100 hover:!text-red-800 transition-colors"
                          >
                            {group.title}
                          </Link>
                        ) : (
                          <span className="block font-bold !text-red-600 text-sm border-b pb-1 border-gray-100 cursor-default">
                            {group.title}
                          </span>
                        )}
                        
                        {hasDeepItems && (
                          <ul className="space-y-2">
                            {group.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={formatUrl(item.url)}
                                  // הגנת צבע אפור כדי שההידר לא יצבע את זה בלבן
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