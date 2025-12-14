// /app/shop/vendor/[vendor]/[model]/ModelPageInner.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ScrollSearchBar from '@/components/ScrollSearchBar';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; // 👈 1. הוספת הייבוא

export default function ModelPageInner({ items, vendor, model }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVisibleCount(window.innerWidth < 768 ? 6 : 12);
    }
  }, []);

  const handleLoadMore = () => {
    if (typeof window !== 'undefined') {
      const inc = window.innerWidth < 768 ? 6 : 12;
      setVisibleCount(prev => prev + inc);
    }
  };

  // מפענחים את ה-URL params כדי שיוצגו יפה בעברית/אנגלית
  const decodedVendor = decodeURIComponent(vendor);
  const decodedModel = decodeURIComponent(model);

  return (
    <ShopLayoutInternal>
      
      {/* 👈 2. מיקום הפירורים: מעבירים יצרן ודגם */}
      <div className="px-2 md:px-0 mt-2">
         <AutoShopBreadcrumbs filters={{ vendor: decodedVendor, model: decodedModel }} />
      </div>

      {/* חיפוש */}
      <ScrollSearchBar
        placeholder={`חפש חלק בדגם ${decodedVendor} ${decodedModel}`}
        containerRef={containerRef}
      />

      {/* גריד מוצרים */}
      <div ref={containerRef}>
        <ProductGrid products={items.slice(0, visibleCount)} />
      </div>

      {/* כפתור טען עוד */}
      {visibleCount < items.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            טען עוד
          </button>
        </div>
      )}
    </ShopLayoutInternal>
  );
}