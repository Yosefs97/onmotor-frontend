// components/ShopLayoutInternal.jsx
'use client';
import { Suspense } from 'react';
import ShopSidebar from '@/components/ShopSidebar'; // זה מנוע החיפוש הישן שלך
import MobileShopFilterBar from '@/components/MobileShopFilterBar';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

// 👇 הוספתי את customSidebar לרשימת ה-props
function ShopLayoutInternalContent({ children, product = null, hideBreadcrumbs = false, customSidebar = null }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = Object.fromEntries(searchParams.entries());

  const handleSearch = (newFilters) => {
    const url = buildUrlFromFilters(newFilters, pathname, product);
    router.push(url, { scroll: false });
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-6" dir="rtl">
      
      {/* --- עמודת הסרגל הצדדי --- */}
      <div className="hidden md:block">
        {customSidebar ? (
          // אם קיבלנו סרגל מותאם אישית (כמו בקטגוריות) - נציג אותו
          customSidebar
        ) : (
          // אחרת - נציג את ברירת המחדל (מנוע חיפוש חלפים)
          <ShopSidebar onFilterChange={handleSearch} product={product} />
        )}
      </div>

      {/* --- עמודת התוכן --- */}
      <div className="md:col-span-3 space-y-6">
        
        {!hideBreadcrumbs && (
            <AutoShopBreadcrumbs filters={filters} product={product} />
        )}

        <div className="md:hidden">
          {/* מציגים את הפילטר מובייל הישן רק אם אנחנו לא במצב "סרגל מותאם" */}
          {/* בעתיד נרצה ליצור גם מובייל-פילטר מותאם לקטגוריות */}
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