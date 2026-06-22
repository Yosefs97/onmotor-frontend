// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Store } from 'lucide-react';
import BatterySearchWidget from './BatterySearchWidget';

const toSlug = (str) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, '-');
};

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

  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const vendorParam = searchParams.get('vendor');
  const modelParam = searchParams.get('model'); // משיכת הדגם מכתובת ה-URL

  // אובייקט הבסיס שתמיד יחזיר לעמוד הקוביות הראשי של החנות
  const crumbs = [
    { label: <Store className="w-4 h-4" />, href: '/shop' }
  ];

  let pageTitle = '';

  // ---------------------------------------------------------
  // 🟥 מצב A: אנחנו בתוך דף קולקציה/קטגוריה (ציוד כביש, שטח וכו')
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
  // 🟥 מצב B: דף מוצר בודד
  // ---------------------------------------------------------
  else if (product) {
    // שליפה בטוחה של התגיות מתוך המוצר
    const foundModelTag = product.tags?.find(t => t?.toLowerCase().startsWith('model:'));
    const modelTag = foundModelTag ? foundModelTag.toLowerCase().replace('model:', '').trim() : null;

    const foundCatTag = product.tags?.find(t => t?.toLowerCase().startsWith('cat:'));
    const categoryTag = foundCatTag ? foundCatTag.toLowerCase().replace('cat:', '').trim() : null;
    
    // עדיפות לפרמטרים מכתובת ה-URL כדי לשמור על הקשר הניווט, אחרת ניקח מהמוצר
    const activeVendor = vendorParam || product.vendor;
    const activeModel = modelParam || modelTag;

    // 1. מסלול חלקי חילוף (אם יש דגם פעיל ב-URL או בתגיות המוצר)
    if (activeModel) {
      crumbs.push({ label: 'חלקי חילוף', href: '/shop/parts' });
      
      if (activeVendor) {
        crumbs.push({ 
          label: activeVendor.toUpperCase(), 
          href: `/shop/vendor/${toSlug(activeVendor)}` 
        });
      }

      crumbs.push({ 
        label: activeModel.toUpperCase(), 
        href: activeVendor ? `/shop/vendor/${toSlug(activeVendor)}/${toSlug(activeModel)}` : null 
      });
    } 
    // 2. מסלול ציוד ואביזרים (ללא דגם ספציפי)
    else {
      let currentCatHandle = null;

      if (categoryTag) {
        currentCatHandle = categoryTag;
        const catLabel = CATEGORY_NAMES[currentCatHandle] || currentCatHandle;
        crumbs.push({ 
          label: catLabel, 
          href: `/shop/collection/${currentCatHandle}` 
        });
      }

      if (product.productType) {
        let typeHref = currentCatHandle 
          ? `/shop/collection/${currentCatHandle}?type=${encodeURIComponent(product.productType)}` 
          : `/shop?type=${encodeURIComponent(product.productType)}`;
        
        crumbs.push({ label: product.productType, href: typeHref });
      }

      // 🔴 תיקון: הוספת היצרן תמיד, גם אם זה לא חלק חילוף אלא קסדה או מעיל
      if (activeVendor && activeVendor.toLowerCase() !== 'unknown') {
        let vendorHref = currentCatHandle
          ? `/shop/collection/${currentCatHandle}?vendor=${encodeURIComponent(activeVendor)}`
          : `/shop?vendor=${encodeURIComponent(activeVendor)}`;
          
        if (product.productType) {
          vendorHref += `&type=${encodeURIComponent(product.productType)}`;
        }

        crumbs.push({ label: activeVendor.toUpperCase(), href: vendorHref });
      }
    }

    crumbs.push({ label: product.title, href: null });
    pageTitle = product.title;
  }

  // ---------------------------------------------------------
  // 🟥 מצב C: דפדוף ידני ב-URL של חלפים (ללא דף מוצר)
  // ---------------------------------------------------------
  else {
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length === 2 && segments[0] === 'shop' && segments[1] === 'parts') {
      crumbs.push({ label: 'חלקי חילוף', href: null });
      pageTitle = 'חלקי חילוף';
    } 
    else if (segments.includes('vendor')) {
      crumbs.push({ label: 'חלקי חילוף', href: '/shop/parts' });

      const vendorIndex = segments.indexOf('vendor');
      const vendorName = decodeURIComponent(segments[vendorIndex + 1] || '');
      const modelName = decodeURIComponent(segments[vendorIndex + 2] || '');

      if (vendorName) {
        crumbs.push({ label: vendorName.toUpperCase(), href: `/shop/vendor/${segments[vendorIndex + 1]}` });
        pageTitle = `דגמי ${vendorName}`;
      }
      if (modelName) {
        crumbs.push({ label: modelName.toUpperCase(), href: null });
        pageTitle = `חלקים ל-${vendorName} ${modelName}`;
      }
    } else {
      pageTitle = 'חנות';
    }
  }

  const isBatteriesPage = 
    pageTitle === 'מצברים' || 
    collection?.title === 'מצברים' || 
    type === 'מצברים' ||
    collection?.handle === 'batteries';

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
                  <span className="font-bold text-red-600">
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

      {isBatteriesPage && (
        <div className="mt-1">
          <BatterySearchWidget />
        </div>
      )}
    </div>
  );
}