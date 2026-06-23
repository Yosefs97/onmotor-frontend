// /components/ProductGrid.jsx
'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation'; // 👈 1. ייבוא ההוקים לקריאת ה-URL
import { getYearRangeFromMetafields, formatYearRange } from '@/lib/productYears';

export default function ProductGrid({ products = [], loading = false, onLoadMore, hasMore = false }) {
  // 👈 2. שליפת ההקשר הנוכחי מהנתיב (Vendor ו-Model)
  const params = useParams();
  const searchParams = useSearchParams();
  
  const currentVendor = params?.vendor || searchParams?.get('vendor');
  const currentModel = params?.model || searchParams?.get('model');

  return (
    <div dir="rtl" className="space-y-4">
      {loading && <div>טוען...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
        {products.map((p) => {
          const img = p.images?.edges?.[0]?.node?.url;
          const price = p.variants?.edges?.[0]?.node?.price;

          const yr = getYearRangeFromMetafields(p.metafields);
          const yrText = formatYearRange(yr);

          // 👈 3. בניית הלינק החכם ש"סוחב" איתו את ההקשר
          const baseUrl = `/shop/${p.handle}`;
          const urlParams = new URLSearchParams();
          
          if (currentVendor) urlParams.append('vendor', currentVendor);
          if (currentModel) urlParams.append('model', currentModel);
          
          const queryString = urlParams.toString();
          const productUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

          return (
            <Link
              key={p.id}
              href={productUrl} // 👈 4. שימוש בלינק המשודרג
              prefetch={false}
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