// /components/ProductGrid.jsx
'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // 🌟 הוספתי את החץ לעיצוב האחיד
import { getYearRangeFromMetafields, formatYearRange } from '@/lib/productYears';

export default function ProductGrid({ 
  products = [], 
  loading = false, 
  onLoadMore, 
  hasMore = false,
  currentVendor = '', // 🌟 קבלת היצרן הנוכחי מהעמוד
  currentModel = ''   // 🌟 קבלת הדגם הנוכחי מהעמוד
}) {
  return (
    <div dir="rtl" className="space-y-6">
      {loading && <div className="text-center font-bold text-zinc-500 py-4">טוען מוצרים...</div>}
      
      {/* 🌟 שיניתי את הרווחים מ gap-0.5 לריווחים התקניים של האתר (gap-3 sm:gap-5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {products.map((p) => {
          const img = p.images?.edges?.[0]?.node?.url;
          const price = p.variants?.edges?.[0]?.node?.price;

          const yr = getYearRangeFromMetafields(p.metafields);
          const yrText = formatYearRange(yr);

          // 🌟 בניית הפרמטרים השקטים עבור פירורי הלחם של עמוד המוצר
          const queryParams = new URLSearchParams();
          if (currentVendor) queryParams.set('vendor', currentVendor);
          if (currentModel) queryParams.set('model', currentModel);
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}${queryString}`} // 🌟 הזרקת הקונטקסט לקישור
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
              
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 
                    className="min-h-12 text-base font-extrabold leading-snug text-zinc-900 line-clamp-2"
                    title={p.title}
                  >
                    {p.title}
                  </h3>
                  {/* 🌟 הצגת השנים מתחת לכותרת בצורה משתלבת ואלגנטית */}
                  {yrText && (
                    <div className="mt-1.5 text-xs font-bold text-zinc-500">
                      שנים: {yrText}
                    </div>
                  )}
                </div>
                
                {/* 🌟 שורת המחיר הממורכזת והתחתונה בדיוק כמו בקומפוננטות האחרות */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  {price ? (
                    <span className="text-lg font-black text-[#e60000]">
                      {price.amount} {price.currencyCode === 'ILS' ? '₪' : price.currencyCode}
                    </span>
                  ) : (
                    <span className="text-lg font-black text-[#e60000]">לפרטים</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition group-hover:text-[#e60000]">
                    למוצר <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* 🌟 שדרוג הנראות של כפתור 'טען עוד' שיתאים לסגנון הכפתורים הכללי */}
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