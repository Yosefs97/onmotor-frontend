// /components/CartUnderHeader.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CartButton from './CartButton';
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; 
import DesktopMegaMenu from './DesktopMegaMenu'; // 👈 1. ייבוא

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
            md:sticky md:top-[80px] md:relative md:z-30
            shadow-sm
        " 
        dir="rtl"
        style={{ height: 'auto' }} 
      >
        <div className="container mx-auto px-4 min-h-[50px] flex items-center justify-between gap-2">
          
          {/* 👇 2. overflow-visible חובה כאן! */}
          <div className="flex items-center gap-4 flex-1 overflow-visible">
              
              <div className="w-full max-w-[220px] md:max-w-[300px]">
                  <LiveSearchBar />
              </div>

              <div className="hidden md:block">
                  <CategoriesNav categories={categories} />
              </div>

              {/* 👇 3. שימוש בקומפוננטה החדשה */}
              <DesktopMegaMenu menuItems={menuItems} />

          </div>

          <div className="flex items-center gap-2 pl-1 shrink-0">
              <div className="text-sm md:text-base font-bold text-gray-800 whitespace-nowrap">
                  ₪{total}
              </div>
              <CartButton />
          </div>

        </div>

        <div className="block md:hidden w-full">
             <CategoriesNav categories={categories} />
        </div>

      </div>

      <div className="h-[90px] w-full md:hidden"></div>
    </>
  );
}