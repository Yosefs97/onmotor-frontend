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
    const modelTag = product.tags?.find(t => t.startsWith('model:'));

    if (modelTag) {
      // אם זה חלק חילוף, נוסיף את קטגוריית האב "חלקי חילוף" בדרך ליצרן ולדגם
      crumbs.push({ label: 'חלקי חילוף', href: '/shop/parts' });
      
      const vendorName = product.vendor;
      const vendorSlug = toSlug(vendorName);

      if (vendorName) {
        crumbs.push({ 
          label: vendorName.toUpperCase(), 
          href: `/shop/vendor/${vendorSlug}` 
        });
      }

      const modelName = modelTag.replace('model:', '').trim();
      const modelSlug = toSlug(modelName);

      if (modelName) {
        crumbs.push({ 
          label: modelName.toUpperCase(), 
          href: `/shop/vendor/${vendorSlug}/${modelSlug}` 
        });
      }

    } else {
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
        if (currentCatHandle) {
          typeHref = `/shop/collection/${currentCatHandle}?type=${encodeURIComponent(product.productType)}`;
        }
        crumbs.push({ 
          label: product.productType, 
          href: typeHref 
        });
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
    
    // בדיקה האם אנחנו בדיוק בתוך עמוד חלקי החילוף החדש
    if (segments.length === 2 && segments[0] === 'shop' && segments[1] === 'parts') {
      crumbs.push({ label: 'חלקי חילוף', href: null });
      pageTitle = 'חלקי חילוף';
    } 
    // בדיקה האם אנחנו בתוך עמוד יצרן או דגם (למשל shop/vendor/ducati)
    else if (segments.includes('vendor')) {
      // מוסיף את חלקי חילוף כשלב אמצעי בדרך
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