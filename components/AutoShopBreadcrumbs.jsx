// /components/AutoShopBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AutoShopBreadcrumbs({ product = null, filters = null }) {
  const pathname = usePathname();
  const [parts, setParts] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let crumbs = [{ href: '/shop', label: 'חנות' }];

    // 🟥 מצב 1: מוצר (עמוד מוצר מלא)
    if (product) {
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

    // 🟥 מצב 2: חנות עם פילטרים
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
        setTitle('מותגים');
      }

      if (filters.category) {
        crumbs.push({ href: '#', label: filters.category });
        setTitle(filters.category);
      }

      setParts(crumbs);
      return;
    }

    // 🟥 מצב 3: URL רגיל
    const segments = pathname.split('/').filter(Boolean);

    // דף חנות ראשי
    if (segments[0] === 'shop' && segments.length === 1) {
      setTitle('מותגים'); // 👈 במקום "חנות"
      setParts(crumbs);
      return;
    }

    // דף יצרן
    if (segments[0] === 'shop' && segments[1] === 'vendor' && segments.length === 3) {
      const vendor = decodeURIComponent(segments[2]);
      crumbs.push({ href: `/shop/vendor/${vendor}`, label: vendor });
      setTitle(`דגמים ${vendor}`); // 👈 במקום "חלקים"
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
    setTitle('חנות');
    setParts(crumbs);
  }, [pathname, product, filters]);

  return (
    <div className="mb-4 space-y-2">
      <nav dir="rtl" className="text-l font-bold">
        {parts.map((p, idx) => (
          <span key={idx}>
            <Link href={p.href} className="text-red-600 hover:underline">
              {p.label}
            </Link>
            {idx < parts.length - 1 && <span className="mx-1 text-2xl font-bold">›</span>}
          </span>
        ))}
      </nav>
      <div className="w-full border-b border-red-600"></div>
      {title && <h1 className="text-2xl font-bold text-red-600">{title}</h1>}
    </div>
  );
}
