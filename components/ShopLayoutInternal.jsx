// /components/ShopLayoutInternal.jsx
'use client';

import { Suspense, useState } from 'react';
import ShopSidebar from '@/components/ShopSidebar';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Filter } from 'lucide-react'; // הסרנו את X כי נשתמש ב-SVG ידני
import MobileCategoryNav from '@/components/MobileCategoryNav';

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
      
      {/* --- כפתור מובייל: מציגים רק אם הסרגל לא מוסתר --- */}
      {!hideSidebar && (
        <div className="md:hidden mb-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // שיניתי ל-Toggle
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md active:bg-gray-800"
          >
            <Filter className="w-5 h-5" />
            {customSidebar ? 'סינון וקטגוריות' : 'חיפוש חלפים מתקדם'}
          </button>
        </div>
      )}

      {/* מיקום קטגוריות מובייל */}
      <MobileCategoryNav menuItems={menuItems} />

      {/* --- מגירה למובייל (מותאמת לפתיחה מלמעלה) --- */}
      {isMobileMenuOpen && !hideSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden flex-col" dir="rtl">
          
          {/* רקע כהה (אופציונלי - אם רוצים ללחוץ עליו כדי לסגור) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* הקונטיינר הראשי - נפתח מלמעלה מתחת להדר */}
          <div className="relative w-full bg-white shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-top duration-300 top-[80px] h-[calc(100vh-80px)]">
            
            {/* כותרת וכפתור סגירה */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">תפריט סינון</h3>
              
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-800 hover:text-gray-600 transition p-1"
              >
                {/* אותו SVG דק מהתפריט הראשי */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-8 h-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* תוכן הסינון */}
            <div className="p-4 pb-20">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* --- סרגל צד (דסקטופ) --- */}
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