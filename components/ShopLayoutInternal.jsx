// /components/ShopLayoutInternal.jsx
'use client';

import { Suspense, useState } from 'react';
import ShopSidebar from '@/components/ShopSidebar';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';


function ShopLayoutInternalContent({ 
  children, 
  product = null, 
  customSidebar = null, 
  hideSidebar = false,
  menuItems = [] 
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (newFilters) => {
    const url = buildUrlFromFilters(newFilters, pathname, product);
    router.push(url, { scroll: false });
    setIsMobileMenuOpen(false);
  };

  const sidebarContent = customSidebar ? (
    customSidebar
  ) : (
    <ShopSidebar onFilterChange={handleSearch} product={product} />
  );

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-6 relative" dir="rtl">
      
      {/* --- כפתור מובייל קבוע (Fixed) --- */}
      {!hideSidebar && (
        <>
          {/* החישוב החדש:
             Top 0-80px: הדר ראשי
             Top 80px-130px: עגלה (CartUnderHeader)
             Top 130px+: כפתור הסינון הזה
          */}
          <div 
            className="md:hidden fixed left-0 right-0 z-30 bg-gray-100 border-b border-gray-200 shadow-sm" 
            style={{ top: '130px', height: '50px' }} 
          >
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full h-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold text-sm active:bg-gray-800"
            >
              <Filter className="w-4 h-4" />
              {customSidebar ? 'סינון וקטגוריות' : 'חיפוש חלפים מתקדם'}
            </button>
          </div>

          {/* ספייסר עבור הכפתור הזה כדי שלא יסתיר את המוצרים */}
          <div className="md:hidden h-[50px]"></div>
        </>
      )}

      

      {/* --- מגירה למובייל --- */}
      {isMobileMenuOpen && !hideSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden flex-col" dir="rtl">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* המגירה נפתחת מתחת להדר (80px) */}
          <div className="relative w-full bg-white shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-top duration-300 top-[80px] h-[calc(100vh-80px)]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">תפריט סינון</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 pb-20">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* --- דסקטופ --- */}
      {!hideSidebar && (
        <div className="hidden md:block">
          {sidebarContent}
        </div>
      )}

      <div className={`${hideSidebar ? 'md:col-span-4' : 'md:col-span-3'} space-y-6`}>
        {children}
        <ShopInfoAccordion />
      </div>
    </div>
  );
}

export default function ShopLayoutInternal(props) {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען...</div>}>
      <ShopLayoutInternalContent {...props} />
    </Suspense>
  );
}