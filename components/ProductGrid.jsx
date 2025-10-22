// /components/ProductGrid.jsx
'use client';
import Link from 'next/link';
import { getYearRangeFromMetafields, formatYearRange } from '@/lib/productYears';

export default function ProductGrid({ products = [], loading = false, onLoadMore, hasMore = false }) {
  return (
    <div dir="rtl" className="space-y-4">
      {loading && <div>טוען...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const img = p.images?.edges?.[0]?.node?.url;
          const price = p.variants?.edges?.[0]?.node?.price;

          const yr = getYearRangeFromMetafields(p.metafields);
          const yrText = formatYearRange(yr);

          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}`}
              data-name={p.title}
              className="border rounded-lg overflow-hidden hover:shadow transition"
            >
              {img && <img src={img} alt={p.title} className="w-full h-40 object-cover" />}
              <div className="p-3 space-y-1">
                <div className="font-medium text-gray-900">{p.title}</div>
                {price && (
                  <div className="text-sm opacity-70 text-gray-900">
                    {price.amount} {price.currencyCode}
                  </div>
                )}
                {yrText && (
                  <div className="text-sm opacity-70 text-gray-900">שנים: {yrText}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <button onClick={onLoadMore} className="border px-4 py-2 rounded-md">
            טען עוד
          </button>
        </div>
      )}
    </div>
  );
}
