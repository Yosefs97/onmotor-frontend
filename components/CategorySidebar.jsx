// /components/CategorySidebar.jsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SmartFilter from './SmartFilter';

export default function CategorySidebar({ filtersFromAPI = [], dynamicData = null, basePath = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // נתונים מהעץ הדינמי
  const productTypes = dynamicData?.types || [];
  const subTags = dynamicData?.tags || [];
  const vendors = dynamicData?.vendors || [];
  const selectedType = dynamicData?.selectedType;

  // סטייט מקומי למחירים (כדי לאפשר הקלדה רציפה)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // עדכון הסטייט כשה-URL משתנה חיצונית
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // פונקציות עזר ל-URL
  const createUrl = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    // אם משנים פילטר ראשי, אולי נרצה לאפס עמודים, אבל נשאיר פשוט כרגע
    return `${basePath}?${params.toString()}`;
  };

  const createTypeUrl = (typeName) => {
      // כשבוחרים קטגוריה חדשה, מנקים תגיות ישנות אבל משאירים יצרן/מחיר?
      // בדרך כלל עדיף להתחיל נקי בקטגוריה
      const params = new URLSearchParams(); 
      params.set('type', typeName);
      return `${basePath}?${params.toString()}`;
  };

  const createTagUrl = (tagName) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentTag = params.get('tag');
      if (currentTag === tagName) params.delete('tag');
      else params.set('tag', tagName);
      return `${basePath}?${params.toString()}`;
  };

  // הפעלת סינון מחיר
  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') applyPriceFilter();
  };

  return (
    <aside className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden text-right" dir="rtl">
      
      {/* 1. קטגוריות (Product Types) */}
      <div className="border-b border-gray-200 pb-4">
          <div className="bg-gray-50 p-4 border-b border-gray-100 mb-2">
            <h2 className="font-bold text-lg text-gray-900">קטגוריות</h2>
            {selectedType && (
                 <Link href={basePath} className="text-xs text-red-600 hover:underline">הצג הכל</Link>
            )}
          </div>
          <ul className="px-4 space-y-1">
              {productTypes.map((type) => {
                  const isActive = selectedType === type.name;
                  return (
                      <li key={type.name}>
                          <Link 
                            href={isActive ? basePath : createTypeUrl(type.name)}
                            className={`flex justify-between text-sm py-1 ${isActive ? 'text-red-600 font-bold' : 'text-gray-600 hover:text-red-600'}`}
                          >
                              <span>{type.name}</span>
                              <span className="text-xs bg-gray-100 px-2 rounded-full text-gray-500">{type.count}</span>
                          </Link>
                      </li>
                  );
              })}
          </ul>
      </div>

      {/* 2. תגיות/תכונות (חורף, קיץ...) */}
      {selectedType && subTags.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
              <div className="bg-gray-50 p-3 border-b border-gray-100 mb-2">
                  <h3 className="font-bold text-md text-gray-800">סוג {selectedType}</h3>
              </div>
              <ul className="px-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {subTags.map((tag) => {
                      const isActive = searchParams.get('tag') === tag.name;
                      return (
                          <li key={tag.name}>
                              <Link 
                                href={createTagUrl(tag.name)}
                                className={`flex justify-between text-sm py-1 ${isActive ? 'text-red-600 font-bold' : 'text-gray-600 hover:text-red-600'}`}
                              >
                                  <span>{tag.name}</span>
                                  <span className="text-xs text-gray-400">({tag.count})</span>
                              </Link>
                          </li>
                      );
                  })}
              </ul>
          </div>
      )}

      {/* 3. יצרנים (עכשיו לחיצים!) */}
      {vendors.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
              <div className="bg-gray-50 p-3 border-b border-gray-100 mb-2">
                  <h3 className="font-bold text-md text-gray-800">יצרן</h3>
              </div>
              <ul className="px-4 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {vendors.map((v) => {
                      const isActive = searchParams.get('vendor') === v.name;
                      return (
                          <li key={v.name}>
                             <Link 
                                href={createUrl('vendor', isActive ? '' : v.name)}
                                className={`flex justify-between text-sm py-1 ${isActive ? 'text-red-600 font-bold' : 'text-gray-600 hover:text-red-600'}`}
                             >
                                <span>{v.name}</span>
                                <span className="text-xs text-gray-400">({v.count})</span>
                             </Link>
                          </li>
                      );
                  })}
              </ul>
          </div>
      )}

      {/* 4. סינון מתקדם (מידות + מחיר) */}
      <div className="p-4 space-y-6 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-md border-b pb-2">סינון מתקדם</h3>
          
          {/* מחיר */}
          <div>
               <h4 className="font-bold text-gray-700 mb-2 text-sm">מחיר (₪)</h4>
               <div className="flex gap-2 items-center text-sm">
                     <input 
                        type="number" 
                        placeholder="מ-" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        onBlur={applyPriceFilter}
                        onKeyDown={handlePriceKeyDown}
                        className="w-1/2 p-2 border border-gray-300 rounded focus:border-red-500 outline-none" 
                     />
                     <span>-</span>
                     <input 
                        type="number" 
                        placeholder="עד" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        onBlur={applyPriceFilter}
                        onKeyDown={handlePriceKeyDown}
                        className="w-1/2 p-2 border border-gray-300 rounded focus:border-red-500 outline-none" 
                     />
               </div>
          </div>

          {/* מידות ושאר פילטרים משופיפיי */}
          {filtersFromAPI.map((filter) => {
             // אנחנו מסננים החוצה את הפילטרים שכבר הצגנו ידנית (כמו יצרן ומחיר ומלאי)
             // כדי להציג כאן רק את הוריאציות (מידה, צבע וכו')
             if (filter.type === 'LIST' && !filter.label.includes('Price') && !filter.label.includes('Vendor')) {
                 return (
                    <div key={filter.id} className="pt-2">
                         <SmartFilter filter={filter} />
                    </div>
                 );
             }
             return null;
          })}
      </div>

    </aside>
  );
}