// /app/shop/vendor/[vendor]/[model]/page.jsx
'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ScrollSearchBar from '@/components/ScrollSearchBar';

export default function ModelPage() {
  const { vendor: vendorParam, model: modelParam } = useParams();
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);

  const containerRef = useRef(null);

  const vendor = filters.vendor || vendorParam;
  const model = filters.model || modelParam;

  const getInitialCount = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 6 : 12; 
    }
    return 12;
  };

  useEffect(() => {
    const fetchModel = async () => {
      setLoading(true);
      const params = new URLSearchParams({ vendor, model, ...filters, limit: '100' });
      const res = await fetch(`/api/shopify/search?${params.toString()}`);
      const json = await res.json();

      // ✅ מיון אלפביתי
      const sorted = (json.items || []).sort((a, b) =>
        a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
      );

      setItems(sorted);
      setVisibleCount(getInitialCount());
      setLoading(false);
    };

    fetchModel();
  }, [vendor, model, JSON.stringify(filters)]);

  const handleLoadMore = () => {
    if (typeof window !== 'undefined') {
      const increment = window.innerWidth < 768 ? 6 : 12;
      setVisibleCount((prev) => prev + increment);
    }
  };

  return (
    <ShopLayoutInternal>
      {loading && <div className="text-center py-6">טוען...</div>}

      {!loading && (
        <div>
          {/* 🔎 חיפוש מוצר */}
          <ScrollSearchBar
            placeholder={`חפש חלק בדגם ${vendor} ${model}`}
            containerRef={containerRef}
          />

          {/* גריד מוצרים עם כפתור "טען עוד" */}
          <div ref={containerRef}>
            <ProductGrid products={items.slice(0, visibleCount)} />
          </div>

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
        </div>
      )}
    </ShopLayoutInternal>
  );
}
