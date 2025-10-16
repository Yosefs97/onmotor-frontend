// components/PageContainer.jsx
'use client';
import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import SidebarMiddleLayer from './SidebarMiddleLayer';
import SidebarLeftLayer from './SidebarLeftLayer';
import useIsMobile from '@/hooks/useIsMobile';

export default function PageContainer({ title, breadcrumbs = [], children }) {
  const isMobile = useIsMobile();

  return (
    <div className="w-screen sm:w-full overflow-x-hidden sm:overflow-visible bg-[#f9f9f9]">
      <main
        dir="rtl"
        className="min-h-screen flex-1 mb-0 px-0 sm:px-0 pt-[1px] pb-[2px] text-right"
      >
        {/* 🔴 ברדקרמבס */}
        {breadcrumbs.length > 0 && (
          <div className="mb-1">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* 🔶 כותרת ראשית */}
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-black-100 mb-2 border-b-2 border-[#e60000] pb-1">
            {title}
          </h1>
        )}

        {/* 🔵 שלושת הבלוקים */}
        <div className="w-full flex flex-col lg:flex-row min-h-screen bg-gray-100">
          
          {/* ✅ תוכן ראשי – Sticky */}
          <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0 lg:border-l border-[#e60000]">
            <div className="sticky top-[70px]"> 
              {children}
            </div>
          </div>

          {/* סיידר אמצעי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-l border-[#e60000]' : ''
            }`}
          >
            <SidebarMiddleLayer />
          </div>

          {/* סיידר שמאלי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-r border-[#e60000]' : ''
            }`}
          >
            <SidebarLeftLayer />
          </div>
        </div>
      </main>
    </div>
  );
}
