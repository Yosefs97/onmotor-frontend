// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

export default function AutoShopBreadcrumbs({ product = null, collection = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. חילוץ פרמטרים מה-URL (עבור המערכת החדשה)
  const type = searchParams.get('type');   // למשל: "כפפות"
  const tag = searchParams.get('tag');     // למשל: "חורף"
  const vendor = searchParams.get('vendor'); // למשל: "Alpinestars"

  // 2. בניית המערך הבסיסי
  const crumbs = [
    { label: 'חנות', href: '/shop' }
  ];

  let pageTitle = '';

  // ---------------------------------------------------------
  // 🟥 מצב A: אנחנו בתוך דף קטגוריה (למשל: כביש/שטח)
  // ---------------------------------------------------------
  if (collection) {
    // שלב 1: הוספת הקטגוריה הראשית (למשל: כביש)
    const collectionUrl = `/shop/collection/${collection.handle}`;
    crumbs.push({ label: collection.title, href: collectionUrl });
    pageTitle = collection.title;

    // שלב 2: אם נבחר סוג מוצר (למשל: כפפות)
    if (type) {
      crumbs.push({ 
        label: type, 
        href: `${collectionUrl}?type=${encodeURIComponent(type)}` 
      });
      pageTitle = type;
    }

    // שלב 3: אם נבחרה תגית ספציפית (למשל: חורף)
    if (tag) {
      // כאן אין לינק, כי זה המיקום הנוכחי
      crumbs.push({ label: tag, href: null });
      pageTitle = `${type || collection.title} - ${tag}`;
    } 
    // שלב 4: אם נבחר יצרן (ולא תגית)
    else if (vendor) {
      crumbs.push({ label: vendor, href: null });
      pageTitle = `${pageTitle} - ${vendor}`;
    }
  }

  // ---------------------------------------------------------
  // 🟥 מצב B: אנחנו בתוך דף מוצר בודד
  // ---------------------------------------------------------
  else if (product) {
    // ננסה להבין לאיזו קטגוריה ראשית המוצר שייך לפי התגיות (cat:road וכד')
    const categoryTag = product.tags?.find(t => t.startsWith('cat:'));
    
    if (categoryTag) {
      const catHandle = categoryTag.replace('cat:', '').trim();
      // אנחנו מניחים שהשם של האוסף הוא ה-Handle באנגלית (או שצריך מיפוי, כרגע נשתמש בזה)
      // לשיפור: אפשר להעביר את שם הקולקציה כ-Prop אם יש אותו
      crumbs.push({ label: 'קטגוריה', href: `/shop/collection/${catHandle}` });
    }

    // הוספת סוג המוצר אם קיים (Product Type)
    if (product.productType) {
        // אין לנו לינק מדויק חזרה לקולקציה כי חסר לנו ה-Handle של הקולקציה בדף מוצר,
        // אז נוותר על הלינק או שנכוון לחיפוש כללי
        crumbs.push({ label: product.productType, href: null });
    }

    // שם המוצר
    crumbs.push({ label: product.title, href: null });
    pageTitle = product.title;
  }

  // ---------------------------------------------------------
  // 🟥 מצב C: חלפים (Fallback למערכת הישנה אם תרצה לשמור אותה)
  // ---------------------------------------------------------
  else {
    // זיהוי לפי ה-URL (למשל /shop/vendor/ktm)
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.includes('vendor')) {
       const vendorIndex = segments.indexOf('vendor');
       const vendorName = decodeURIComponent(segments[vendorIndex + 1] || '');
       const modelName = decodeURIComponent(segments[vendorIndex + 2] || '');

       if (vendorName) {
         crumbs.push({ label: vendorName, href: `/shop/vendor/${vendorName}` });
         pageTitle = `חלקים ל-${vendorName}`;
       }
       if (modelName) {
         crumbs.push({ label: modelName, href: null });
         pageTitle = `חלקים ל-${vendorName} ${modelName}`;
       }
    } else {
        // ברירת מחדל
        pageTitle = 'חנות';
    }
  }

  return (
    <div className="mb-6 px-2 md:px-0">
      {/* ניווט פירורים */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" dir="rtl">
        <ul className="flex items-center gap-1 flex-wrap">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400 mx-1" />}
                
                {isLast || !crumb.href ? (
                  <span className={`font-bold ${isLast ? 'text-red-900' : 'text-red-600'}`}>
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

      {/* קו מפריד וכותרת */}
      <div className="w-full border-b border-gray-200"></div>
      
      {pageTitle && (
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
          {pageTitle}
        </h1>
      )}
    </div>
  );
}