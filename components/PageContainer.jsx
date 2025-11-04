// components/PageContainer.jsx
'use client';
import React from 'react';
import Breadcrumbs from './Breadcrumbs';

export default function PageContainer({ title, breadcrumbs = [], children }) {
  return (
    <div className="w-full overflow-x-hidden bg-[#f9f9f9]">
      <main dir="rtl" className="min-h-screen px-2 text-right">
        {/* 🔴 ברדקרמבס */}
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

        {/* תוכן משתנה */}
        <div className="py-2">
          {children}
        </div>
      </main>
    </div>
  );
}
