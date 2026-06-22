// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, Store } from 'lucide-react';
import BatterySearchWidget from './BatterySearchWidget';

const toSlug = (str) => {
  if (!str || typeof str !== 'string') return '';
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
  const modelParam = searchParams.get('model');

  // אובייקט הבסיס שתמיד יחזיר לעמוד הראשי של החנות
  const crumbs = [
    { label: <Store className="w-4 h-4" />, href: '/shop' }
  ];

  let pageTitle = '';

  try {
    // ---------------------------------------------------------
    // 🟥 מצב A: אנחנו בתוך דף קולקציה/קטגוריה
    // ---------------------------------------------------------
    if (collection) {
      const collectionUrl = `/shop/collection/${collection.handle || ''}`;
      crumbs.push({ label: collection.title || 'קולקציה', href: collectionUrl });
      pageTitle = collection.title || '';

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
      const tags = Array.isArray(product.tags) ? product.tags : [];

      // חיפוש ועיבוד תגית מבוססת מבנה Fit
      // דוגמה: fit:APRILIA:TUONO 1100:tuono1100v4
      const foundFitTag = tags.find(t => typeof t === 'string' && t.toLowerCase().startsWith('fit:'));
      let modelNameFromTag = null;
      let modelSlugFromTag = null;

      if (foundFitTag) {
        const parts = foundFitTag.split(':');
        if (parts.length >= 3) {
          modelNameFromTag = parts[2].trim(); // TUONO 1100
          // אם יש אינדקס 4 בפיצול (הסלאג), נשתמש בו. אחרת נייצר סלאג אוטומטי
          modelSlugFromTag = parts[3] ? parts[3].trim().toLowerCase() : toSlug(modelNameFromTag);
        }
      }

      const foundCatTag = tags.find(t => typeof t === 'string' && t.toLowerCase().startsWith('cat:'));
      const categoryTag = foundCatTag ? foundCatTag.toLowerCase().replace('cat:', '').trim() : null;
      
      const activeVendor = (typeof vendorParam === 'string' && vendorParam) 
        ? vendorParam 
        : (typeof product.vendor === 'string' ? product.vendor : null);
        
      const activeModelName = (typeof modelParam === 'string' && modelParam) 
        ? modelParam 
        : modelNameFromTag;

      // אם המודל הגיע מה-URL, נייצר לו סלאג רגיל. אם הוא הגיע מהתגית, נשתמש בסלאג המדויק שמוגדר בה
      const activeModelSlug = (typeof modelParam === 'string' && modelParam)
        ? toSlug(modelParam)
        : modelSlugFromTag;

      // בדיקה חכמה: האם זה חלק חילוף?
      const isPart = activeModelName || 
                     (typeof product.productType === 'string' && product.productType.includes('חילוף')) || 
                     categoryTag === 'parts' ||
                     categoryTag === 'oem';

      // 1. מסלול חלקי חילוף
      if (isPart) {
        crumbs.push({ label: 'חלקי חילוף', href: '/shop/parts' });
        
        if (activeVendor && activeVendor.toLowerCase() !== 'unknown') {
          const vendorSlug = toSlug(activeVendor);
          crumbs.push({ 
            label: String(activeVendor).toUpperCase(), 
            href: `/shop/vendor/${vendorSlug}` 
          });

          if (activeModelName && activeModelSlug) {
            crumbs.push({ 
              label: String(activeModelName).toUpperCase(), 
              href: `/shop/vendor/${vendorSlug}/${activeModelSlug}` 
            });
          }
        }
      } 
      // 2. מסלול ציוד ואביזרים
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

        if (product.productType && typeof product.productType === 'string') {
          let typeHref = currentCatHandle 
            ? `/shop/collection/${currentCatHandle}?type=${encodeURIComponent(product.productType)}` 
            : `/shop?type=${encodeURIComponent(product.productType)}`;
          
          crumbs.push({ label: product.productType, href: typeHref });
        }

        if (activeVendor && activeVendor.toLowerCase() !== 'unknown') {
          let vendorHref = currentCatHandle
            ? `/shop/collection/${currentCatHandle}?vendor=${encodeURIComponent(activeVendor)}`
            : `/shop?vendor=${encodeURIComponent(activeVendor)}`;
            
          if (product.productType && typeof product.productType === 'string') {
            vendorHref += `&type=${encodeURIComponent(product.productType)}`;
          }

          crumbs.push({ label: String(activeVendor).toUpperCase(), href: vendorHref });
        }
      }

      crumbs.push({ label: product.title || '', href: null });
      pageTitle = product.title || '';
    }

    // ---------------------------------------------------------
    // 🟥 מצב C: דפדוף ידני ב-URL (ללא דף מוצר)
    // ---------------------------------------------------------
    else {
      const segments = (pathname || '').split('/').filter(Boolean);
      
      if (segments.length === 2 && segments[0] === 'shop' && segments[1] === 'parts') {
        crumbs.push({ label: 'חלקי חילוף', href: null });
        pageTitle = 'חלקי חילוף';
      } 
      else if (segments.includes('vendor')) {
        crumbs.push({ label: 'חלקי חילוף', href: '/shop/parts' });

        const vendorIndex = segments.indexOf('vendor');
        const rawVendor = segments[vendorIndex + 1];
        const rawModel = segments[vendorIndex + 2];
        
        const vName = rawVendor ? decodeURIComponent(rawVendor) : '';
        const mName = rawModel ? decodeURIComponent(rawModel) : '';

        if (vName) {
          crumbs.push({ label: String(vName).toUpperCase(), href: `/shop/vendor/${rawVendor}` });
          pageTitle = `דגמי ${vName}`;
        }
        if (mName) {
          crumbs.push({ label: String(mName).toUpperCase(), href: null });
          pageTitle = `חלקים ל-${vName} ${mName}`;
        }
      } else {
        pageTitle = 'חנות';
      }
    }
  } catch (error) {
    console.error("AutoShopBreadcrumbs Error:", error);
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