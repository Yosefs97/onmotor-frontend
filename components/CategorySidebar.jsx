// /components/CategorySidebar.jsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SmartFilter from './SmartFilter';

export default function CategorySidebar({ filtersFromAPI = [], dynamicData = null, basePath = '' }) {
  const searchParams = useSearchParams();
  
  const productTypes = dynamicData?.types || [];
  const subTags = dynamicData?.tags || [];
  const vendors = dynamicData?.vendors || [];
  const selectedType = dynamicData?.selectedType;

  // סטייט למחיר
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // לוודא שהמחיר מסונכרן עם ה-URL
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // פונקציות ליצירת לינקים בטוחים
  const createLink = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.keys(newParams).forEach(key => {
        if (newParams[key] === null) {
            params.delete(key);
        } else {
            params.set(key, newParams[key]);
        }
    });

    return `${basePath}?${params.toString()}`;
  };

  return (
    <aside className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden text-right" dir="rtl">
      
      {/* 1. קטגוריות (Product Types) */}
      <div className="border-b border-gray-200 pb-4">
          <div className="bg-gray-50 p-4 border-b border-gray-100 mb-2">
            <h2 className="font-bold text-lg text-gray-900">קטגוריות</h2>
            {selectedType && (
                 <Link href={basePath} className="text-xs text-red-600 hover:underline">נקה הכל</Link>
            )}
          </div>
          <ul className="px-4 space-y-1">
              {productTypes.map((type) => {
                  const isActive = selectedType === type.name;
                  // בלחיצה על קטגוריה: מאפסים תגיות ויצרנים כדי להתחיל נקי, או שומרים?
                  // לרוב עדיף לאפס תגיות כי תגית של "קסדות" לא מתאימה ל"מעילים"
                  const href = isActive 
                    ? basePath 
                    : `${basePath}?type=${encodeURIComponent(type.name)}`; // משתמשים ב-URL נקי לקטגוריה

                  return (
                      <li key={type.name}>
                          <Link 
                            href={href}
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

      {/* 2. תגיות/תכונות (רק אם נבחרה קטגוריה) */}
      {selectedType && subTags.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
              <div className="bg-gray-50 p-3 border-b border-gray-100 mb-2">
                  <h3 className="font-bold text-md text-gray-800">סוג {selectedType}</h3>
              </div>
              <ul className="px-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {subTags.map((tag) => {
                      const isActive = searchParams.get('tag') === tag.name;
                      // בלחיצה על תגית: שומרים על ה-type הקיים
                      const href = createLink({ tag: isActive ? null : tag.name });

                      return (
                          <li key={tag.name}>
                              <Link 
                                href={href}
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

      {/* 3. יצרנים */}
      {vendors.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
              <div className="bg-gray-50 p-3 border-b border-gray-100 mb-2">
                  <h3 className="font-bold text-md text-gray-800">יצרן</h3>
              </div>
              <ul className="px-4 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {vendors.map((v) => {
                      const isActive = searchParams.get('vendor') === v.name;
                      const href = createLink({ vendor: isActive ? null : v.name });

                      return (
                          <li key={v.name}>
                             <Link 
                                href={href}
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

      {/* 4. סינון מחיר ומידות */}
      <div className="p-4 space-y-6 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-md border-b pb-2">סינון מתקדם</h3>
          
          {/* מחיר */}
          <div>
               <h4 className="font-bold text-gray-700 mb-2 text-sm">מחיר (₪)</h4>
               <div className="flex gap-2 items-center text-sm">
                     <input 
                        type="number" placeholder="מ-" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        onBlur={() => window.location.href = createLink({ minPrice, maxPrice })} // ניווט מלא ביציאה מהשדה
                        className="w-1/2 p-2 border border-gray-300 rounded focus:border-red-500 outline-none placeholder-gray-900" 
                     />
                     <span>-</span>
                     <input 
                        type="number" placeholder="עד" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        onBlur={() => window.location.href = createLink({ minPrice, maxPrice })} // ניווט מלא ביציאה מהשדה
                        className="w-1/2 p-2 border border-gray-300 rounded focus:border-red-500 outline-none placeholder-gray-900" 
                     />
               </div>
          </div>

          {/* מידות (חובה להגדיר בשופיפיי!) */}
          {filtersFromAPI.map((filter) => {
             // מציגים רק פילטרים שהם לא המחיר/יצרן (כי אותם כבר הצגנו למעלה)
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