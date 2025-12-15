// /components/CategorySidebar.jsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CATEGORY_FILTERS } from '@/lib/shop/categoryFilters';
// 👇 ייבוא הרכיב החדש
import SmartFilter from './SmartFilter';

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

      {/* --- חלק ב': סינון חכם (API) - מופרד לרכיב חיצוני --- */}
      {filtersFromAPI.length > 0 && (
        <div className="p-4 space-y-6 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-md border-b pb-2">סינון מתקדם</h3>
          
          {filtersFromAPI.map((filter) => (
            <div key={filter.id}>
              {/* בדיקה אם זה פילטר מסוג רשימה (מידה, צבע, יצרן) */}
              {(filter.type === 'LIST' || filter.type === 'BOOLEAN') ? (
                // 👇 כאן השימוש ברכיב החדש
                <SmartFilter filter={filter} />
              ) : (
                // טיפול במחיר (יישאר כאן או יופרט גם הוא בעתיד)
                <div className="text-sm text-gray-500 italic">
                  {filter.label}: טווח מחיר
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}