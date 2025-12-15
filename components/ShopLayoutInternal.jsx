// components/ShopLayoutInternal.jsx
'use client';
import { Suspense, useState } from 'react'; // הוספתי useState
import ShopSidebar from '@/components/ShopSidebar';
import MobileShopFilterBar from '@/components/MobileShopFilterBar';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
// ❌ הסרתי את AutoShopBreadcrumbs מכאן כדי למנוע כפילויות
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react'; // אייקונים לתפריט מובייל

function ShopLayoutInternalContent({ children, product = null, customSidebar = null }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // מצב לפתיחת/סגירת התפריט במובייל
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (newFilters) => {
    const url = buildUrlFromFilters(newFilters, pathname, product);
    router.push(url, { scroll: false });
    setIsMobileMenuOpen(false); // סגור תפריט אחרי סינון
  };

  // משתנה שמחזיק את תוכן הסרגל (כדי להציג אותו גם בדסקטופ וגם במובייל)
  const sidebarContent = customSidebar ? (
    customSidebar
  ) : (
    <ShopSidebar onFilterChange={handleSearch} product={product} />
  );

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-6 relative" dir="rtl">
      
      {/* --- 1. כפתור פתיחת תפריט למובייל בלבד --- */}
      <div className="md:hidden mb-2">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md active:bg-gray-800"
        >
          <Filter className="w-5 h-5" />
          {customSidebar ? 'סינון וקטגוריות' : 'חיפוש חלפים מתקדם'}
        </button>
      </div>

      {/* --- 2. המגירה הנפתחת למובייל (Mobile Drawer) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" dir="rtl">
          {/* רקע שחור חצי שקוף */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* התוכן של המגירה */}
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
              {/* כאן אנחנו מרנדרים את אותו סרגל בדיוק כמו בדסקטופ */}
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* --- 3. עמודת הסרגל הצדדי (Desktop Only) --- */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* --- 4. עמודת התוכן --- */}
      <div className="md:col-span-3 space-y-6">
        
        {/* במובייל: אם אין סרגל מותאם, אפשר להשאיר את הפילטר הקטן הישן מתחת לכפתור הגדול, או להסיר אותו */}
        <div className="md:hidden">
          {!customSidebar && (
             <MobileShopFilterBar onFilterChange={handleSearch} product={product} />
          )}
        </div>

        {children}

        <ShopInfoAccordion />
      </div>
    </div>
  );
}

export default function ShopLayoutInternal(props) {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען רכיבי חנות...</div>}>
      <ShopLayoutInternalContent {...props} />
    </Suspense>
  );
}