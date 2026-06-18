// components/CartUnderHeader.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import CartButton from './CartButton';
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; 

export default function CartUnderHeader({ categories = [] }) {
  const [total, setTotal] = useState(0);
  
  // 🌟 סטייטים למנגנון ההחלקה בגלילה 🌟
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  // 🌟 מעקב אחרי הגלילה להסתרת/הצגת הסרגל 🌟
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // מסתירים רק אם גוללים למטה ועברנו לפחות 100px (כדי לא להסתיר מיד בתחילת העמוד)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // מציגים בחזרה כשגוללים למעלה
      else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div 
        className={`block md:hidden w-full bg-gray-100 border-b transition-transform duration-300 ease-in-out z-30 fixed top-[80px] left-0 right-0 shadow-sm ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`} 
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

      {/* בלוק שתופס מקום (Placeholder) כדי שהתוכן בעמוד לא יקפוץ למעלה מתחת להידר */}
      <div className="h-[95px] w-full md:hidden shrink-0"></div>
    </>
  );
}