// components/PageContainer.jsx
'use client';
import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import useIsMobile from '@/hooks/useIsMobile';

/**
 * 📦 PageContainer — גרסה מעודכנת
 * ---------------------------------------
 * - משמשת להצגת תוכן הדף בלבד (צד ימין).
 * - הסיידרים (אמצעי + שמאלי) הועברו ל-ClientLayout.jsx כדי למנוע ריענון.
 * - שומרת על יחס הגודל: 1/2 מסך בצד ימין עם גבול שמאלי.
 */
export default function PageContainer({ title, breadcrumbs = [], children }) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0 lg:border-l border-[#e60000] bg-[#f9f9f9]">
      {/* תוכן מוצמד מתחת לכותרת */}
      <div className="sticky top-[70px] min-h-screen flex flex-col text-right px-1 sm:px-4">
        
        {/* 🔴 ברדקרמבס (מתעדכנים לפי הנתיב, לא נטענים מחדש) */}
        {breadcrumbs.length > 0 && (
          <div className="mb-1">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* 🔶 כותרת ראשית */}
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 border-b-2 border-[#e60000] pb-1">
            {title}
          </h1>
        )}

        {/* 🟢 תוכן דינמי (כתבות / קטגוריות / עמודים) */}
        <div className="flex-1 w-full px-0 mx-0">{children}</div>
      </div>
    </div>
  );
}
