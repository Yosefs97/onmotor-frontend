// /app/shop/vendor/[vendor]/[model]/ModelPageInner.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ScrollSearchBar from '@/components/ScrollSearchBar';

export default function ModelPageInner({ items, vendor, model }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const containerRef = useRef(null);

  // התאמה מובייל
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

  return (
    <ShopLayoutInternal>
      {/* חיפוש */}
      <ScrollSearchBar
        placeholder={`חפש חלק בדגם ${vendor} ${model}`}
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
