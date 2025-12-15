// components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

export default function AutoShopBreadcrumbs({ collection }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // חילוץ פרמטרים מה-URL
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const vendor = searchParams.get('vendor');

  // בניית הנתיב הבסיסי של הקולקציה
  const collectionBasePath = pathname.split('?')[0];

  // כותרת דינמית לדף
  let pageTitle = collection?.title || 'חנות';
  if (type) pageTitle = type;
  if (tag) pageTitle = `${type || collection?.title} - ${tag}`;
  if (vendor && !tag && !type) pageTitle = `${collection?.title} - ${vendor}`;

  return (
    <div className="mb-6 px-2 md:px-0">
      
      {/* 1. שורת הפירורים (ניווט) */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" dir="rtl">
        <ul className="flex items-center gap-1 flex-wrap">
          
          <li>
            <Link href="/" className="hover:text-red-600 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
          </li>
          <ChevronLeft className="w-4 h-4 text-gray-400" />

          <li>
            <Link href="/shop" className="hover:text-red-600">
              חנות
            </Link>
          </li>
          <ChevronLeft className="w-4 h-4 text-gray-400" />

          <li>
            {type || tag || vendor ? (
               <Link href={collectionBasePath} className="hover:text-red-600 font-medium">
                 {collection?.title || 'קטגוריה'}
               </Link>
            ) : (
               <span className="font-bold text-gray-900">{collection?.title || 'קטגוריה'}</span>
            )}
          </li>

          {type && (
            <>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <li>
                {tag || vendor ? (
                  <Link href={`${collectionBasePath}?type=${encodeURIComponent(type)}`} className="hover:text-red-600 font-medium">
                    {type}
                  </Link>
                ) : (
                  <span className="font-bold text-gray-900">{type}</span>
                )}
              </li>
            </>
          )}

          {tag && (
            <>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <li>
                <span className="font-bold text-gray-900">{tag}</span>
              </li>
            </>
          )}

          {vendor && !tag && (
             <>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <li>
                <span className="font-bold text-gray-900">{vendor}</span>
              </li>
            </>
          )}

        </ul>
      </nav>

      {/* 2. קו מפריד */}
      <div className="w-full border-b border-gray-200"></div>

      {/* 3. כותרת H1 ראשית */}
      <h1 className="text-3xl font-bold text-gray-900 mt-4">
        {pageTitle}
      </h1>
      
    </div>
  );
}