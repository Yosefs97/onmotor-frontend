// components/PageContainer.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FaTh } from 'react-icons/fa'; // אייקון של גריד/קוביות
import Breadcrumbs from './Breadcrumbs';
import useIsMobile from '@/hooks/useIsMobile';

/**
 * 📦 PageContainer — גרסה מעודכנת עם כפתור תגיות
 * ---------------------------------------
 */
export default function PageContainer({ title, breadcrumbs = [], children }) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0 lg:border-l border-[#e60000] bg-[#f9f9f9]">
      {/* תוכן מוצמד מתחת לכותרת */}
      <div className="sticky top-[70px] min-h-screen flex flex-col text-right px-1 sm:px-4">
        
        {/* 🔴 ברדקרמבס */}
        {breadcrumbs.length > 0 && (
          <div className="mb-1">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* 🔶 אזור הכותרת + כפתור תגיות */}
        {title && (
          <div className="flex items-end justify-between border-b-2 border-[#e60000] mb-2 pb-1">
            {/* הכותרת עצמה */}
            <h1 className="text-2xl sm:text-3xl font-bold text-black leading-none">
              {title}
            </h1>

            {/* 🏷️ כפתור לאינדקס תגיות (משמאל לכותרת) */}
            <Link 
              href="/tags"
              className="flex items-center gap-1.5 bg-gray-200 hover:bg-[#e60000] text-gray-700 hover:text-white px-3 py-1.5 rounded-md transition-all duration-300 text-xs font-bold shadow-sm"
              title="מעבר לאינדקס נושאים"
            >
              <span className="hidden sm:inline">אינדקס נושאים</span>
              <FaTh className="text-sm" /> {/* אייקון גריד */}
            </Link>
          </div>
        )}

        {/* 🟢 תוכן דינמי */}
        <div className="flex-1 w-full px-0 mx-0">{children}</div>
      </div>
    </div>
  );
}