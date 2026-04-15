// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Store } from 'lucide-react';
// 1. ייבוא הקומפוננטה החדשה שיצרנו
import BatterySearchWidget from './BatterySearchWidget';

// פונקציית עזר להפוך טקסט ל-Slug (למשל: "S 1000RR" -> "s-1000rr")
const toSlug = (str) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, '-');
};

// מיפוי שמות קטגוריות (לציוד/אביזרים)
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

  // 1. חילוץ פרמטרים
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const vendorParam = searchParams.get('vendor'); // vendor מה-URL

  // 2. בסיס
  const crumbs = [
    { label: <Store className="w-4 h-4" />, href: '/shop' }
  ];

  let pageTitle = '';

  // ---------------------------------------------------------
  // 🟥 מצב A: אנחנו בתוך דף קולקציה/קטגוריה (לא דף מוצר)
  // ---------------------------------------------------------
  if (collection) {
    const collectionUrl = `/shop/collection/${collection.handle}`;
    crumbs.push({ label: collection.title, href: collectionUrl });
    pageTitle = collection.title;

    if (type) {
      const isLast = !tag && !vendorParam;
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
    else if (vendorParam) {
      crumbs.push({ label: vendorParam, href: null });
      pageTitle = `${pageTitle} - ${vendorParam}`;
    }
  }

  // ---------------------------------------------------------
  // 🟥 מצב B: דף מוצר בודד (הלוגיקה החדשה והמשולבת)
  // ---------------------------------------------------------
  else if (product) {
    
    // בדיקה 1: האם זה מוצר "חלק חילוף" (יש לו תגית דגם)?
    const modelTag = product.tags?.find(t => t.startsWith('model:'));

    if (modelTag) {
      // === לוגיקה לחלקי חילוף (BMW > S 1000RR) ===
      
      // 1. חילוץ היצרן (למשל BMW)
      const vendorName = product.vendor; // BMW
      const vendorSlug = toSlug(vendorName);

      if (vendorName) {
        crumbs.push({ 
          label: vendorName, 
          href: `/shop/vendor/${vendorSlug}` 
        });
      }

      // 2. חילוץ הדגם (למשל S 1000RR)
      const modelName = modelTag.replace('model:', '').trim(); // "s 1000rr"
      const modelSlug = toSlug(modelName); // "s-1000rr"

      if (modelName) {
        crumbs.push({ 
          label: modelName.toUpperCase(), // להציג יפה (S 1000RR)
          href: `/shop/vendor/${vendorSlug}/${modelSlug}` 
        });
      }

    } else {
      // === לוגיקה לציוד (כפפות, קסדות וכו') ===
      
      const categoryTag = product.tags?.find(t => t.startsWith('cat:'));
      let currentCatHandle = null;

      if (categoryTag) {
        currentCatHandle = categoryTag.replace('cat:', '').trim();
        const catLabel = CATEGORY_NAMES[currentCatHandle] || currentCatHandle;
        
        crumbs.push({ 
          label: catLabel, 
          href: `/shop/collection/${currentCatHandle}` 
        });
      }

      if (product.productType) {
        let typeHref = null;
        // אם ידועה הקטגוריה, הלינק יסנן לפי הסוג בתוכה
        if (currentCatHandle) {
          typeHref = `/shop/collection/${currentCatHandle}?type=${encodeURIComponent(product.productType)}`;
        }
        crumbs.push({ 
          label: product.productType, 
          href: typeHref 
        });
      }
    }

    // בסוף: שם המוצר
    crumbs.push({ label: product.title, href: null });
    pageTitle = product.title;
  }

  // ---------------------------------------------------------
  // 🟥 מצב C: דפדוף ידני ב-URL של חלפים (ללא דף מוצר)
  // ---------------------------------------------------------
  else {
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.includes('vendor')) {
       const vendorIndex = segments.indexOf('vendor');
       const vendorName = decodeURIComponent(segments[vendorIndex + 1] || '');
       const modelName = decodeURIComponent(segments[vendorIndex + 2] || '');

       if (vendorName) {
         // כאן אנחנו מניחים שה-URL כבר בפורמט נכון, אז משתמשים בו
         crumbs.push({ label: vendorName.toUpperCase(), href: `/shop/vendor/${vendorName}` });
         pageTitle = `דגמי ${vendorName}`;
       }
       if (modelName) {
         crumbs.push({ label: modelName.toUpperCase(), href: null }); // דף נוכחי
         pageTitle = `חלקים ל-${vendorName} ${modelName}`;
       }
    } else {
       pageTitle = 'חנות';
    }
  }

  // 2. בדיקה האם אנחנו בעמוד מצברים
  // אם השם של הקולקציה, או סוג המוצר הוא "מצברים" (תתאים את המילה למה שמוגדר אצלך בשופיפיי אם זה שונה)
  const isBatteriesPage = 
    pageTitle === 'מצברים' || 
    collection?.title === 'מצברים' || 
    type === 'מצברים' ||
    collection?.handle === 'batteries'; // במידה וה-handle באנגלית

  return (
    <div className="mb-2 px-2 md:px-0">
      <nav className="flex items-center text-sm text-gray-500 mb-2" dir="rtl">
        <ul className="flex items-center gap-1 flex-wrap">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400 mx-1" />}
                
                {isLast || !crumb.href ? (
                  <span className={`font-bold text-red-600`}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-red-600 transition-colors capitalize">
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 capitalize">
          {pageTitle}
        </h1>
      )}

      {/* 3. רינדור מותנה: מציג את הווידג'ט רק אם אנחנו בעמוד מצברים */}
      {isBatteriesPage && (
        <div className="mt-1">
          <BatterySearchWidget />
        </div>
      )}
    </div>
  );
}