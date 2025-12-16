// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

// 🛠️ מיפוי שמות קטגוריות (Handle -> שם בעברית)
// עדכן כאן את כל הקטגוריות שיש לך במערכת
const CATEGORY_NAMES = {
  'road': 'כביש',
  'offroad': 'שטח',
  'oem': 'חלקים מקוריים',
  'tires': 'צמיגים',
  'helmets': 'קסדות',
  'accessories': 'אביזרים'
};

export default function AutoShopBreadcrumbs({ product = null, collection = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. חילוץ פרמטרים מה-URL
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const vendor = searchParams.get('vendor');

  // 2. בניית המערך הבסיסי
  const crumbs = [
    { label: <Home className="w-4 h-4" />, href: '/' },
    { label: 'חנות', href: '/shop' }
  ];

  let pageTitle = '';

  // ---------------------------------------------------------
  // 🟥 מצב A: דף קולקציה/קטגוריה
  // ---------------------------------------------------------
  if (collection) {
    const collectionUrl = `/shop/collection/${collection.handle}`;
    crumbs.push({ label: collection.title, href: collectionUrl });
    pageTitle = collection.title;

    if (type) {
      // כאן הופכים את ה"סוג" ללחיץ רק אם יש אחריו עוד סינון (כמו תגית), אחרת הוא האחרון
      const isLast = !tag && !vendor;
      crumbs.push({ 
        label: type, 
        href: isLast ? null : `${collectionUrl}?type=${encodeURIComponent(type)}` 
      });
      pageTitle = type;
    }

    if (tag) {
      crumbs.push({ label: tag, href: null });
      pageTitle = `${type || collection.title} - ${tag}`;
    } 
    else if (vendor) {
      crumbs.push({ label: vendor, href: null });
      pageTitle = `${pageTitle} - ${vendor}`;
    }
  }

  // ---------------------------------------------------------
  // 🟥 מצב B: דף מוצר בודד (כאן היה התיקון העיקרי)
  // ---------------------------------------------------------
  else if (product) {
    // זיהוי קטגוריה לפי תגית cat:xxx
    const categoryTag = product.tags?.find(t => t.startsWith('cat:'));
    let currentCatHandle = null;

    if (categoryTag) {
      currentCatHandle = categoryTag.replace('cat:', '').trim();
      // ✅ תיקון 1: שימוש במילון כדי להציג שם בעברית במקום "קטגוריה"
      const catLabel = CATEGORY_NAMES[currentCatHandle] || currentCatHandle; 
      
      crumbs.push({ 
        label: catLabel, 
        href: `/shop/collection/${currentCatHandle}` 
      });
    }

    // הוספת סוג המוצר (למשל: כפפות)
    if (product.productType) {
      // ✅ תיקון 2: יצירת לינק חזרה לקטגוריה עם הפילטר של הסוג
      let typeHref = null;
      if (currentCatHandle) {
        typeHref = `/shop/collection/${currentCatHandle}?type=${encodeURIComponent(product.productType)}`;
      }

      crumbs.push({ 
        label: product.productType, 
        href: typeHref // כעת זה לחיץ ומוביל לסינון המוצרים
      });
    }

    // שם המוצר (תמיד אחרון ולכן ללא לינק)
    crumbs.push({ label: product.title, href: null });
    pageTitle = product.title;
  }

  // ---------------------------------------------------------
  // 🟥 מצב C: חלפים / URL ידני
  // ---------------------------------------------------------
  else {
    const segments = pathname.split('/').filter(Boolean);
    
    // זיהוי תבנית /shop/vendor/NAME/MODEL
    if (segments.includes('vendor')) {
       const vendorIndex = segments.indexOf('vendor');
       const vendorName = decodeURIComponent(segments[vendorIndex + 1] || '');
       const modelName = decodeURIComponent(segments[vendorIndex + 2] || '');

       if (vendorName) {
         crumbs.push({ label: vendorName, href: `/shop/vendor/${vendorName}` });
         pageTitle = `חלקים ל-${vendorName}`;
       }
       if (modelName) {
         // ✅ תיקון 3: הוספת לינק לדגם, למקרה שנכנסים לדף חלק ספציפי בעתיד
         // כרגע זה הדף האחרון, אבל אם בעתיד תהיה היררכיה נוספת, זה מוכן
         crumbs.push({ label: modelName, href: null }); 
         pageTitle = `חלקים ל-${vendorName} ${modelName}`;
       }
    } else {
       pageTitle = 'חנות';
    }
  }

  return (
    <div className="mb-6 px-2 md:px-0">
      <nav className="flex items-center text-sm text-gray-500 mb-4" dir="rtl">
        <ul className="flex items-center gap-1 flex-wrap">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400 mx-1" />}
                
                {isLast || !crumb.href ? (
                  <span className={`font-bold ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-red-600 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="w-full border-b border-gray-200"></div>
      
      {pageTitle && (
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
          {pageTitle}
        </h1>
      )}
    </div>
  );
}