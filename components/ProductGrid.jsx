// /components/ProductGrid.jsx
'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getYearRangeFromMetafields, formatYearRange } from '@/lib/productYears';

export default function ProductGrid({ 
  products = [], 
  loading = false, 
  onLoadMore, 
  hasMore = false,
  currentVendor = '',
  currentModel = ''
}) {
  return (
    <div dir="rtl" className="space-y-6">
      {loading && <div className="text-center font-bold text-zinc-500 py-4">טוען מוצרים...</div>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {products.map((p) => {
          const img = p.images?.edges?.[0]?.node?.url;
          const price = p.variants?.edges?.[0]?.node?.price;

          const yr = getYearRangeFromMetafields(p.metafields);
          const yrText = formatYearRange(yr);

          const queryParams = new URLSearchParams();
          if (currentVendor) queryParams.set('vendor', currentVendor);
          if (currentModel) queryParams.set('model', currentModel);
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}${queryString}`}
              prefetch={false}
              data-name={p.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100">
                {img ? (
                  <img 
                    src={img} 
                    alt={p.title} 
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-400 text-xs">
                    אין תמונה
                  </div>
                )}
              </div>
              
              {/* הקטנו את הריווח הפנימי במובייל ל-p-3 */}
              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div>
                  <h3 
                    className="min-h-12 text-sm sm:text-base font-extrabold leading-snug text-zinc-900 line-clamp-2"
                    title={p.title}
                  >
                    {p.title}
                  </h3>
                  {yrText && (
                    <div className="mt-1.5 text-xs font-bold text-zinc-500">
                      שנים: {yrText}
                    </div>
                  )}
                </div>
                
                {/* הקטנו את המרווח הפנימי ל-gap-1.5 במובייל */}
                <div className="mt-auto flex items-center justify-between gap-1.5 sm:gap-3 pt-3 overflow-hidden">
                  {price ? (
                    /* הוספנו whitespace-nowrap כדי למנוע את שבירת סמל השקל לשורה חדשה */
                    <span className="text-base sm:text-lg font-black text-[#e60000] whitespace-nowrap">
                      {price.amount} {price.currencyCode === 'ILS' ? '₪' : price.currencyCode}
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg font-black text-[#e60000] whitespace-nowrap">לפרטים</span>
                  )}
                  {/* הגדרנו shrink-0 כדי שהחלק הזה לא יימעך */}
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-zinc-700 transition group-hover:text-[#e60000] whitespace-nowrap">
                    למוצר <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button 
            onClick={onLoadMore} 
            className="rounded-xl bg-zinc-900 px-8 py-3.5 text-base font-extrabold text-white transition hover:bg-[#e60000]"
          >
            טען מוצרים נוספים
          </button>
        </div>
      )}
    </div>
  );
}