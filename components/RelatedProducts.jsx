// /components/RelatedProducts.jsx
'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import BatterySearchWidget from './BatterySearchWidget';

export default function RelatedProducts({ partVendor, productType, compatibleModels, excludeHandle }) {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const modelName = compatibleModels?.[0]?.modelName || '';

      const params = new URLSearchParams({
        vendor: partVendor || '',
        productType: productType || '',
        model: modelName,
        limit: '10', // מביא עד 10 מוצרים לדפדוף נוח
        excludeHandle: excludeHandle || '', 
      });

      const res = await fetch(`/api/shopify/related?${params.toString()}`);
      const json = await res.json();
      setItems(json.items || []);
    })();
  }, [partVendor, productType, compatibleModels, excludeHandle]);

  if (!items.length) return null;

  // מנגנון הניווט (RTL) - שמאלה מוביל הלאה ברשימה
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'next' ? -200 : 200; 
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 🌟 מחרוזת קלאסים משותפת לחיצים האדומים 🌟
  const arrowClasses = "absolute top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-100 shadow-xl p-1.5 rounded-full text-[#e60000] hover:bg-gray-50 transition-all hover:scale-110";

  return (
    <div dir="rtl" className="mt-8 border-t border-gray-100 pt-6">
      
      {/* פקודות CSS גלובליות להסתרת פס הגלילה רק לאזור הזה */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-3 mb-4">
        <h3 className="font-bold text-xl text-gray-900 pr-1">מוצרים נוספים לדגם</h3>
        <div className="w-full xl:w-auto">
          <BatterySearchWidget compact={true} />
        </div>
      </div>

      <div className="relative group">
        
        {/* חיצי הניווט (יוצגו רק בדסקטופ ורק אם יש מעל 2 מוצרים) */}
        {/* 🔥 השינוי: החצים תמיד גלויים (`block` במקום `hidden group-hover:block`) 🔥 */}
        {items.length > 2 && (
          <>
            <button
              onClick={() => scroll('prev')}
              className={`${arrowClasses} right-0 translate-x-1/3 hidden md:block`}
              aria-label="הקודם"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={() => scroll('next')}
              className={`${arrowClasses} left-0 -translate-x-1/3 hidden md:block`}
              aria-label="הבא"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </>
        )}

        {/* מיכל הגלילה של הקרוסלה */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((p) => {
            const img = p.images?.edges?.[0]?.node?.url;
            const price = p.variants?.edges?.[0]?.node?.price;
            return (
              <Link
                key={p.id}
                href={`/shop/${p.handle}`}
                prefetch={false}
                // רוחב קבוע שמייצר את הגלילה: במובייל 160px (כך שהשלישי "מציץ"), בדסקטופ 180px
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex-shrink-0 snap-start bg-white w-[160px] md:w-[180px]"
              >
                {/* תמונה */}
                {img ? (
                  <div className="bg-gray-50 aspect-square w-full">
                     <img src={img} alt={p.title} className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="bg-gray-50 aspect-square w-full flex items-center justify-center text-gray-300">אין תמונה</div>
                )}
                
                {/* פרטים */}
                <div className="p-3">
                  <div className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{p.title}</div>
                  {price && (
                    <div className="text-red-600 font-black mt-2 text-lg">
                      {price.amount} <span className="text-sm">{price.currencyCode}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}