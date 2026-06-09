// /components/CartUnderHeader.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CartButton from './CartButton';
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; 
import DesktopMegaMenu from './DesktopMegaMenu';

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
            w-full bg-gray-100 border-b transition-all z-30
            fixed top-[80px] left-0 right-0
            lg:relative lg:top-0 lg:bg-transparent lg:border-none lg:shadow-none lg:flex-1
            shadow-sm
        " 
        dir="rtl"
        style={{ height: 'auto' }} 
      >
        {/* במצב מחשב (lg) אנחנו דוחפים את הכל שמאלה ומגדילים גובה ל-80px שיתאים בדיוק ללוגו */}
        <div className="container mx-auto px-4 min-h-[50px] lg:min-h-[80px] flex items-center justify-between lg:justify-end gap-2 lg:gap-6">
          
          <div className="flex items-center gap-4 flex-1 lg:flex-initial overflow-visible lg:justify-end w-full lg:w-auto">
            
            <div className="w-full max-w-[220px] md:max-w-[300px] lg:max-w-[250px] xl:max-w-[300px]">
                <LiveSearchBar />
            </div>

            {/* במצב מחשב הטקסטים של הניווט הופכים ללבנים כדי לבלוט על השחור */}
            <div className="hidden lg:block text-white">
                <CategoriesNav categories={categories} />
            </div>

            <DesktopMegaMenu menuItems={menuItems} />

          </div>

          {/* צבע המחיר משתנה ללבן במצב מחשב (lg:text-white) */}
          <div className="flex items-center gap-2 pl-1 shrink-0 text-gray-800 lg:text-white">
              <div className="text-sm md:text-base font-bold whitespace-nowrap">
                  ₪{total}
              </div>
              <CartButton />
          </div>

        </div>

        {/* תפריט קטגוריות למובייל בלבד (מתחת לפס השחור) */}
        <div className="block lg:hidden w-full bg-gray-100">
             <CategoriesNav categories={categories} />
        </div>

      </div>

      {/* מרווח ביטחון למובייל בלבד */}
      <div className="h-[90px] w-full lg:hidden"></div>
    </>
  );
}