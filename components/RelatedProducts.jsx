// /components/RelatedProducts.jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RelatedProducts({ vendor, productType, model, excludeHandle }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams({
        vendor: vendor || '',
        productType: productType || '',
        model: model || '',
        limit: '8',
        excludeHandle: excludeHandle || '', // ✅ שולח ל-API
      });

      const res = await fetch(`/api/shopify/related?${params.toString()}`);
      const json = await res.json();
      setItems(json.items || []);
    })();
  }, [vendor, productType, model, excludeHandle]);

  if (!items.length) return null;

  return (
    <div dir="rtl" className="space-y-3 mt-8">
      <h3 className="font-bold text-lg text-gray-900">מוצרים נוספים לדגם</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => {
          const img = p.images?.edges?.[0]?.node?.url;
          const price = p.variants?.edges?.[0]?.node?.price;
          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}`}
              prefetch={false}
              className="border rounded-lg overflow-hidden hover:shadow"
            >
              {img && <img src={img} alt={p.title} className="w-full h-32 object-cover" />}
              <div className="p-2">
                <div className="text-sm font-medium text-gray-900 ">{p.title}</div>
                {price && (
                  <div className="text-xs opacity-70 text-gray-900">
                    {price.amount} {price.currencyCode}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
