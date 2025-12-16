// /components/ShopLayoutInternal.jsx
'use client';

import { Suspense, useState } from 'react';
import ShopSidebar from '@/components/ShopSidebar';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';
// 👇 1. ייבוא הקומפוננטה החדשה
import MobileCategoryNav from '@/components/MobileCategoryNav';

function ShopLayoutInternalContent({ 
  children, 
  product = null, 
  customSidebar = null, 
  hideSidebar = false,
  menuItems = [] // 👇 2. קבלת הנתונים כ-Prop (ברירת מחדל מערך ריק)
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
      
      {/* --- כפתור מובייל: מציגים רק אם הסרגל לא מוסתר --- */}
      {!hideSidebar && (
        <div className="md:hidden mb-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md active:bg-gray-800"
          >
            <Filter className="w-5 h-5" />
            {customSidebar ? 'סינון וקטגוריות' : 'חיפוש חלפים מתקדם'}
          </button>
        </div>
      )}

      {/* 👇👇👇 3. המיקום החדש: מתחת לכפתור הסינון 👇👇👇 */}
      {/* הקומפוננטה עצמה כבר דואגת להיות מוסתרת בדסקטופ (md:hidden) */}
      <MobileCategoryNav menuItems={menuItems} />
      {/* 👆👆👆 ------------------------------------- 👆👆👆 */}

      {/* --- מגירה למובייל --- */}
      {isMobileMenuOpen && !hideSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden" dir="rtl">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">תפריט סינון</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="p-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* --- סרגל צד (דסקטופ): מציגים רק אם לא הוסתר --- */}
      {!hideSidebar && (
        <div className="hidden md:block">
          {sidebarContent}
        </div>
      )}

      {/* --- אזור התוכן הראשי --- */}
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