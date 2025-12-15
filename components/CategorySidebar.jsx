// /components/CategorySidebar.jsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// 👇 התיקון: הוספתי את /shop/ לנתיב הייבוא
import { CATEGORY_FILTERS } from '@/lib/shop/categoryFilters';

export default function CategorySidebar({ filtersFromAPI = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const segments = pathname.split('/');
  const collectionHandle = segments[segments.length - 1];
  const currentCategoryConfig = CATEGORY_FILTERS[collectionHandle];
  const activeTag = searchParams.get('tag');

  return (
    <aside className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden text-right" dir="rtl">
      
      {/* --- חלק א': ניווט קטגוריות (סטטי) --- */}
      {currentCategoryConfig && (
        <div className="border-b border-gray-200 pb-4">
          <div className="bg-gray-50 p-4 border-b border-gray-100 mb-2">
            <h2 className="font-bold text-lg text-gray-900">
              {currentCategoryConfig.title}
            </h2>
            {activeTag && (
              <Link href={pathname} className="text-xs text-red-600 hover:underline">נקה הכל</Link>
            )}
          </div>
          
          <div className="px-4 space-y-4">
            {currentCategoryConfig.groups.map((group) => (
              <div key={group.key}>
                <h3 className="font-bold text-gray-800 mb-2 text-sm">{group.title}</h3>
                <ul className="space-y-1 pr-2">
                  {group.options.map((option) => (
                    <li key={option.label}>
                      {option.href ? (
                        <Link href={option.href} className="text-sm text-gray-600 hover:text-red-600 flex justify-between">
                          {option.label} <span className="text-xs">➚</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => router.push(activeTag === option.tag ? pathname : `${pathname}?tag=${option.tag}`)}
                          className={`text-sm w-full text-right ${activeTag === option.tag ? 'text-red-600 font-bold' : 'text-gray-600'}`}
                        >
                          {option.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- חלק ב': סינון חכם (API) - מידה, צבע, מגדר --- */}
      {filtersFromAPI.length > 0 && (
        <div className="p-4 space-y-6 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-md border-b pb-2">סינון מתקדם</h3>
          
          {filtersFromAPI.map((filter) => (
            <div key={filter.id}>
              <h4 className="font-bold text-gray-700 mb-2 text-sm">{filter.label}</h4>
              
              {/* רשימת צ'קבוקסים */}
              {(filter.type === 'LIST' || filter.type === 'BOOLEAN') && (
                <ul className="space-y-1 pr-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {filter.values.map((val) => (
                    <li key={val.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id={val.id}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        onChange={() => alert("פונקציונליות סינון מלאה תתווסף בקרוב")} 
                      />
                      <label htmlFor={val.id} className="text-sm text-gray-600 cursor-pointer flex-grow flex justify-between">
                        <span>{val.label}</span>
                        <span className="text-xs text-gray-400">({val.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {filter.type === 'PRICE_RANGE' && (
                <div className="text-sm text-gray-500 italic">
                  טווח מחיר
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}