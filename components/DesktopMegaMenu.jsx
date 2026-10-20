// components/DesktopMegaMenu.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function DesktopMegaMenu({ menuItems = [] }) {
  // הדפסת הנתונים לטרמינל כדי לוודא שהרמות הפנימיות נמשכות בהצלחה
  console.log("MEGA MENU DATA:", JSON.stringify(menuItems, null, 2));
  if (!menuItems || menuItems.length === 0) return null;

  return (
    <nav className="hidden lg:flex items-center gap-6 mr-4 h-full relative z-[60]" dir="rtl">
      {menuItems.map((category) => {
        const hasSubItems = category.items && category.items.length > 0;

        return (
          // הוספת המחלקה group - כל מה שבפנים יגיב לריחוף על ה-div הזה
          <div key={category.title} className="relative h-full flex items-center group">
            
            <Link
              href={category.url || '#'}
              className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors py-8 px-2"
            >
              {category.title}
              {hasSubItems && (
                <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
              )}
            </Link>

            {hasSubItems && (
              <div 
                // החלון מוסתר כברירת מחדל (hidden) ומופיע בעת ריחוף (group-hover:block)
                className="absolute top-full right-0 w-[800px] hidden group-hover:block bg-white shadow-xl border border-gray-200 rounded-b-lg z-[100]"
                style={{ marginTop: '-1px' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600" />

                <div className="p-6 grid grid-cols-4 gap-6">
                  {category.items.map((group, idx) => {
                    const hasDeepItems = group.items && group.items.length > 0;

                    return (
                      <div key={idx} className="space-y-3">
                        <Link 
                          href={group.url || '#'} 
                          className="block font-bold text-red-600 text-sm border-b pb-1 border-gray-100 hover:text-red-800 transition-colors"
                        >
                          {group.title}
                        </Link>
                        
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