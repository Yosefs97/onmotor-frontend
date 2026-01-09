// /components/CartUnderHeader.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CartButton from './CartButton';
import { ChevronDown } from 'lucide-react';
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; // 👈 1. ייבוא הקומפוננטה החדשה

// 👇 2. הוספת categories ל-props
export default function CartUnderHeader({ menuItems = [], categories = [] }) {
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
        const res = await fetch('/api/shopify/cart/get');
        const json = await res.json();
        setTotal(json.cart?.estimatedCost?.totalAmount?.amount || 0);
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  return (
    <>
      <div 
        className="
            w-full bg-gray-100 border-b transition-all z-40
            fixed top-[80px] left-0 right-0
            md:sticky md:top-[80px] md:relative md:z-30
            shadow-sm
        " 
        dir="rtl"
        // 👇 3. שינינו ל-auto כדי לאפשר גובה דינמי במובייל (שתי שורות)
        style={{ height: 'auto' }} 
      >
        <div className="container mx-auto px-4 min-h-[50px] flex items-center justify-between gap-2">
          
          {/* === צד ימין: חיפוש + קטגוריות + תפריט === */}
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
              
              {/* מנוע החיפוש */}
              <div className="w-full max-w-[220px] md:max-w-[300px]">
                  <LiveSearchBar />
              </div>

              {/* 👇 4. תצוגת מחשב: הקטגוריות מופיעות ליד החיפוש */}
              <div className="hidden md:block">
                  <CategoriesNav categories={categories} />
              </div>

              {/* תפריט דסקטופ (Mega Menu) - מוסתר במובייל */}
              <nav className="hidden lg:flex items-center gap-6 mr-2">
                  {menuItems.map((category) => (
                      <div key={category.title} className="group relative">
                          <Link 
                              href={category.url}
                              className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors py-2"
                          >
                              {category.title}
                              {category.items.length > 0 && (
                                  <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                              )}
                          </Link>
                          
                          {category.items.length > 0 && (
                              <div className="absolute top-full right-0 w-[600px] bg-white shadow-xl border border-gray-200 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 z-50">
                                  <div className="p-6 grid grid-cols-3 gap-6">
                                      {category.items.map((group, idx) => (
                                          <div key={idx} className="space-y-3">
                                              <h3 className="font-bold text-red-600 text-sm border-b pb-1">{group.title}</h3>
                                              <ul className="space-y-1">
                                                  {group.items.map((item) => (
                                                      <li key={item.title}>
                                                          <Link href={item.url} className="text-gray-600 hover:text-red-600 text-xs block font-medium">
                                                              {item.title}
                                                          </Link>
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
              </nav>
          </div>

          {/* === צד שמאל: סה"כ + כפתור עגלה === */}
          <div className="flex items-center gap-2 pl-1 shrink-0">
              <div className="text-sm md:text-base font-bold text-gray-800 whitespace-nowrap">
                  ₪{total}
              </div>
              <CartButton />
          </div>

        </div>

        {/* 👇 5. תצוגת מובייל בלבד: שורה נפרדת למטה לקטגוריות */}
        <div className="block md:hidden w-full">
             <CategoriesNav categories={categories} />
        </div>

      </div>

      {/* 👇 6. הגדלת ה-Spacer למובייל כי ה-Header עכשיו גבוה יותר (כ-90px) */}
      <div className="h-[95px] w-full md:hidden"></div>
    </>
  );
}