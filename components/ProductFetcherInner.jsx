// /components/ProductFetcher.jsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';

export default function ProductFetcher({ excludeHandle = null, vendor = null, model = null, category = null }) {
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });

  const fetchProducts = async (cursor, reset = false) => {
    try {
      setLoading(true);

      // ✅ בניית פרמטרים עם vendor/model אם נשלחו
      const params = new URLSearchParams({ ...filters, limit: '24' });
      if (vendor) params.set('vendor', vendor);
      if (model) params.set('model', model);
      if (category) params.set('category', category);
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/shopify/search?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("❌ API החזיר שגיאה:", res.status);
        setProducts([]);
        setLoading(false);
        return;
      }

      const json = await res.json().catch(() => ({ items: [], pageInfo: {} }));
      let items = json.items || [];

      if (excludeHandle) {
        items = items.filter((p) => p.handle !== excludeHandle);
      }

      setProducts(prev =>
        reset ? items : cursor ? [...prev, ...items] : items
      );

      setPageInfo(json.pageInfo || { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("❌ שגיאת חיפוש:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setPageInfo({ hasNextPage: false, endCursor: null });
    fetchProducts(null, true);
  }, [JSON.stringify(filters), excludeHandle, vendor, model, category]);

  return (
    <>
      {loading && <div className="text-center py-6">טוען מוצרים...</div>}
      {!loading && products.length === 0 && (
        <div className="text-center py-6 text-gray-600">
          לא נמצאו מוצרים מתאימים לחיפוש שלך
        </div>
      )}
      <ProductGrid
        products={products}
        loading={loading}
        onLoadMore={() => fetchProducts(pageInfo.endCursor)}
        hasMore={pageInfo.hasNextPage}
      />
    </>
  );
}
