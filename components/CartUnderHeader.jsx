// components/CartUnderHeader.jsx
'use client';

import { useEffect, useState } from 'react';
import CartButton from './CartButton';
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; 

export default function CartUnderHeader({ categories = [] }) {
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
      {/* הקומפוננטה הזו מוסתרת לחלוטין במחשב (md:hidden). 
        במובייל היא נצמדת למטה מתחת להידר השחור.
      */}
      <div 
        className="block md:hidden w-full bg-gray-100 border-b transition-all z-30 fixed top-[80px] left-0 right-0 shadow-sm" 
        dir="rtl"
        style={{ height: 'auto' }} 
      >
        <div className="px-4 py-2 flex items-center justify-between gap-3">
          
          <div className="flex-1">
            <LiveSearchBar />
          </div>

          <div className="flex items-center gap-2 text-gray-800 shrink-0">
            <span className="text-sm font-bold whitespace-nowrap">₪{total}</span>
            <CartButton />
          </div>

        </div>

        <div className="w-full pb-1 border-t border-gray-200">
             <CategoriesNav categories={categories} />
        </div>
      </div>

      {/* בלוק ריק ששומר על המקום כדי שהתוכן לא ייכנס מתחת להידר הצף */}
      <div className="h-[95px] w-full md:hidden"></div>
    </>
  );
}