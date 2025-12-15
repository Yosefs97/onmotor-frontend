// /components/CategorySidebar.jsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SmartFilter from './SmartFilter';

export default function CategorySidebar({ filtersFromAPI = [], dynamicData = null, basePath = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // חילוץ נתונים דינמיים
  const productTypes = dynamicData?.types || [];
  const subTags = dynamicData?.tags || [];
  const vendors = dynamicData?.vendors || [];
  const selectedType = dynamicData?.selectedType;

  // פונקציה לבניית URL כשלוחצים על סוג מוצר
  const createTypeUrl = (typeName) => {
      const params = new URLSearchParams(); // מתחיל נקי כשיש החלפת קטגוריה
      if (typeName) params.set('type', typeName);
      return `${basePath}?${params.toString()}`;
  };

  // פונקציה לבניית URL כשלוחצים על תגית (חורף/קיץ) - זה מוסיף לקיים
  const createTagUrl = (tagName) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentTag = params.get('tag');
      
      if (currentTag === tagName) {
          params.delete('tag'); // ביטול לחיצה
      } else {
          params.set('tag', tagName);
      }
      return `${basePath}?${params.toString()}`;
  };
  
  const currentTag = searchParams.get('tag');

  return (
    <aside className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden text-right" dir="rtl">
      
      {/* 1. כותרת ותתי-קטגוריות ראשיות (Product Types) */}
      <div className="border-b border-gray-200 pb-4">
          <div className="bg-gray-50 p-4 border-b border-gray-100 mb-2">
            <h2 className="font-bold text-lg text-gray-900">קטגוריות</h2>
            {selectedType && (
                 <Link href={basePath} className="text-xs text-red-600 hover:underline">חזור להכל</Link>
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
                              <span className="text-xs bg-gray-100 px-2 rounded-full text-gray-500">
                                  {type.count}
                              </span>
                          </Link>
                      </li>
                  );
              })}
          </ul>
      </div>

      {/* 2. סינון לפי תכונות/תגיות (רק אם נבחר סוג מוצר, למשל "כפפות") */}
      {selectedType && subTags.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
              <div className="bg-gray-50 p-3 border-b border-gray-100 mb-2">
                  <h3 className="font-bold text-md text-gray-800">סוג {selectedType}</h3>
              </div>
              <ul className="px-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {subTags.map((tag) => {
                      const isActive = currentTag === tag.name;
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

      {/* 3. סינונים נוספים (יצרן, מחיר) */}
      <div className="p-4 space-y-6 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-md border-b pb-2">סינון מתקדם</h3>
          
          {/* יצרנים (דינמי מהקוד החדש) */}
          {vendors.length > 0 && (
              <div>
                  <h4 className="font-bold text-gray-700 mb-2 text-sm">יצרן</h4>
                  <ul className="space-y-1 pr-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {vendors.map((v) => (
                          <li key={v.name} className="flex items-center justify-between text-sm text-gray-600">
                              {/* כאן אפשר להשתמש ב-SmartFilter אם רוצים צ'קבוקסים מרובים, או לינק פשוט */}
                              <span>{v.name}</span>
                              <span className="text-xs text-gray-400">({v.count})</span>
                          </li>
                      ))}
                  </ul>
              </div>
          )}

          {/* סינון מחיר */}
          <div>
               <h4 className="font-bold text-gray-700 mb-2 text-sm">מחיר</h4>
               <div className="flex gap-2 items-center text-sm">
                     <input type="number" placeholder="מ-" className="w-1/2 p-2 border rounded bg-white" />
                     <span>-</span>
                     <input type="number" placeholder="עד" className="w-1/2 p-2 border rounded bg-white" />
               </div>
          </div>
      </div>

    </aside>
  );
}