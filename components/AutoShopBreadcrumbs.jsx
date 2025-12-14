// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// 👇 הוספתי את prop ה-collection
export default function AutoShopBreadcrumbs({ product = null, filters = null, collection = null }) {
  const pathname = usePathname();
  const [parts, setParts] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let crumbs = [{ href: '/shop', label: 'חנות' }];

    // 🟥 מצב 1: עמוד אוסף/קטגוריה (החדש!)
    if (collection) {
      crumbs.push({ 
        href: `/shop/collection/${collection.handle}`, 
        label: collection.title 
      });
      setTitle(collection.title);
      setParts(crumbs);
      return;
    }

    // 🟥 מצב 2: מוצר (עמוד מוצר מלא)
    if (product) {
      // אם המוצר שייך לאוסף ספציפי (למשל קסדות), אפשר להוסיף כאן לוגיקה בעתיד
      
      if (product.vendor) {
        crumbs.push({ href: `/shop/vendor/${product.vendor}`, label: product.vendor });
      }
      const modelTag = product.tags?.find((t) => t.startsWith('model:'));
      if (modelTag) {
        const model = modelTag.replace('model:', '');
        crumbs.push({ href: `/shop/vendor/${product.vendor}/${model}`, label: model });
        setTitle(`חלקים ${product.vendor} ${model}`);
      } else {
        setTitle(`חלקים ${product.vendor}`);
      }
      crumbs.push({ href: `/shop/${product.handle}`, label: product.title });
      setTitle(product.title);
      setParts(crumbs);
      return;
    }

    // 🟥 מצב 3: חנות עם פילטרים (חלפים)
    if (filters && (filters.vendor || filters.model || filters.category)) {
      if (filters.vendor) {
        crumbs.push({ href: `/shop/vendor/${filters.vendor}`, label: filters.vendor });

        if (filters.model) {
          crumbs.push({ href: `/shop/vendor/${filters.vendor}/${filters.model}`, label: filters.model });
          setTitle(`חלקים ${filters.vendor} ${filters.model}`);
        } else {
          setTitle(`דגמים ${filters.vendor}`);
        }
      } else {
        setTitle('דגמים');
      }

      if (filters.category) {
        crumbs.push({ href: '#', label: filters.category });
        setTitle(filters.category);
      }

      setParts(crumbs);
      return;
    }

    // 🟥 מצב 4: URL רגיל (ניתוח הנתיב)
    const segments = pathname.split('/').filter(Boolean);

    // דף חנות ראשי
    if (segments[0] === 'shop' && segments.length === 1) {
      setTitle('דגמים');
      setParts(crumbs);
      return;
    }

    // 👇 טיפול במקרה שמגיעים בלי Prop (למשל ריענון) לקטגוריה
    if (segments[0] === 'shop' && segments[1] === 'collection' && segments.length === 3) {
      // במקרה הזה הכותרת אולי תהיה באנגלית (ה-Handle) אם לא הועבר prop, 
      // אבל זה גיבוי טוב.
      const handle = segments[2];
      crumbs.push({ href: pathname, label: handle }); 
      // אם יש collection prop הוא ידרוס את זה למעלה, אז זה רק Fallback
      setTitle(collection?.title || handle); 
      setParts(crumbs);
      return;
    }

    // דף יצרן
    if (segments[0] === 'shop' && segments[1] === 'vendor' && segments.length === 3) {
      const vendor = decodeURIComponent(segments[2]);
      crumbs.push({ href: `/shop/vendor/${vendor}`, label: vendor });
      setTitle(`דגמים ${vendor}`);
      setParts(crumbs);
      return;
    }

    // דף דגם
    if (segments[0] === 'shop' && segments[1] === 'vendor' && segments.length === 4) {
      const vendor = decodeURIComponent(segments[2]);
      const model = decodeURIComponent(segments[3]);
      crumbs.push({ href: `/shop/vendor/${vendor}`, label: vendor });
      crumbs.push({ href: `/shop/vendor/${vendor}/${model}`, label: model });
      setTitle(`חלקים ${vendor} ${model}`);
      setParts(crumbs);
      return;
    }

    // דף תגיות
    if (segments[0] === 'tags' && segments.length === 2) {
      const tag = decodeURIComponent(segments[1]);
      crumbs.push({ href: `/tags/${tag}`, label: `תגית: ${tag}` });
      setTitle(`תגית: ${tag}`);
      setParts(crumbs);
      return;
    }

    // fallback
    // setTitle('חנות'); // אפשר להשאיר ריק אם רוצים
    setParts(crumbs);
  }, [pathname, product, filters, collection]); // הוספתי collection ל-dependency array

  return (
    <div className="mb-4 space-y-2 px-2 md:px-0">
      <nav dir="rtl" className="text-sm md:text-base font-bold text-gray-600">
        {parts.map((p, idx) => (
          <span key={idx} className="inline-flex items-center">
            {/* הלינק האחרון לא לחיץ (כי אנחנו בו) */}
            {idx === parts.length - 1 ? (
              <span className="text-gray-900">{p.label}</span>
            ) : (
              <Link href={p.href} className="text-red-600 hover:underline" prefetch={false}>
                {p.label}
              </Link>
            )}
            
            {idx < parts.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </span>
        ))}
      </nav>
      
      <div className="w-full border-b border-gray-200"></div>
      
      {/* כותרת הדף מוצגת רק אם הוגדרה */}
      {title && <h1 className="text-3xl font-bold text-gray-900 mt-2">{title}</h1>}
    </div>
  );
}