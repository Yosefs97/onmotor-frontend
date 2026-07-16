// /app/shop/vendor/[vendor]/[model]/ModelPageInner.jsx
'use client';

// 👇 1. הוספנו את useCallback לייבוא
import { useRef, useState, useEffect, useCallback } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ScrollSearchBar from '@/components/ScrollSearchBar';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';

export default function ModelPageInner({ items, vendor, model }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const containerRef = useRef(null);
  
  // 👇 2. רפרנס חדש לאלמנט שבתחתית העמוד (הטריגר שלנו)
  const loaderRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVisibleCount(window.innerWidth < 768 ? 6 : 12);
    }
  }, []);

  // 👇 3. עטפנו את הפונקציה ב-useCallback כדי שה-useEffect של הגלילה לא ירוץ מחדש סתם
  const handleLoadMore = useCallback(() => {
    if (typeof window !== 'undefined') {
      const inc = window.innerWidth < 768 ? 6 : 12;
      setVisibleCount(prev => prev + inc);
    }
  }, []);

  // 👇 4. הקסם של הגלילה האוטומטית: מתצפת על ה-loaderRef 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // אם האלמנט נכנס לפריים ויש עוד מוצרים לטעון - תפעיל את הטעינה
        if (entries[0].isIntersecting && visibleCount < items.length) {
          handleLoadMore();
        }
      },
      {
        root: null,
        // הוספנו 200 פיקסלים לשוליים כדי שהטעינה תתחיל טיפה לפני שהמשתמש מגיע ממש לסוף - לחוויה חלקה יותר
        rootMargin: '200px', 
        threshold: 0.1,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleLoadMore, visibleCount, items.length]);

  const decodedVendor = decodeURIComponent(vendor).replace(/-/g, ' ');
  const decodedModel = decodeURIComponent(model);

  const searchOptions = items.map((item) => ({
    id: item.id || item.handle,
    title: item.title, 
    href: `/shop/${item.handle}` 
  }));

  return (
    <ShopLayoutInternal>
      
      <div className="px-2 md:px-0 mt-2">
         <AutoShopBreadcrumbs filters={{ vendor: decodedVendor, model: decodedModel }} />
      </div>

      <ScrollSearchBar
        placeholder={`חפש חלק בדגם ${decodedVendor} ${decodedModel}`}
        containerRef={containerRef}
        manufacturers={searchOptions}
      />

      <div ref={containerRef}>
        <ProductGrid 
          products={items.slice(0, visibleCount)} 
          currentVendor={vendor}
          currentModel={model}
        />
      </div>

      {/* 👇 5. החלפנו את הכפתור ב-div ריק שעליו אנחנו עוקבים, עם עיגול טעינה מעוצב */}
      {visibleCount < items.length && (
        <div ref={loaderRef} className="flex justify-center mt-8 pb-8">
          <div className="w-8 h-8 border-4 border-[#e60000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </ShopLayoutInternal>
  );
}