// components/ShopHeader.jsx
'use client';

import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import Link from 'next/link'; // 👈 ייבוא Link
import { gsap } from 'gsap';
import { User } from 'lucide-react'; // 👈 ייבוא אייקון המשתמש
import LiveSearchBar from './LiveSearchBar';
import CategoriesNav from './CategoriesNav'; 
import DesktopMegaMenu from './DesktopMegaMenu';
import CartButton from './CartButton';
import ShopMobileMenu from './ShopMobileMenu';

export default function ShopHeader({ menuItems = [], categories = [] }) {
  const logoRef = useRef(null);
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const isAnimating = useRef(false);

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(logoRef.current, { rotate: -90, scale: 0.8 }, { rotate: 0, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
      tl.fromTo(
        lettersRef.current,
        { y: 15, opacity: 0, rotate: -10 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.6, stagger: 0.05, ease: 'back.out(1.7)' },
        '-=0.9'
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const tl = gsap.timeline({ onComplete: () => { window.location.href = '/shop'; } });
    tl.to(logoRef.current, { rotate: '+=720', duration: 1.2, ease: 'power3.out' }, 'start');
    tl.to(
      lettersRef.current,
      { y: -10, x: 5, rotate: 5, duration: 0.4, stagger: 0.05, ease: 'power1.out', yoyo: true, repeat: 1 },
      '-=1'
    );
  };

  const logoText = [
    { char: 'O', red: true }, { char: 'n' }, { char: 'M', red: true },
    { char: 'otor\u00A0' }, { char: 'P', red: true }, { char: 'arts' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] bg-black text-white h-[80px] flex items-center justify-between px-2 md:px-6 py-2 shadow-md border-b border-gray-800" dir="rtl">
        
        {/* כפתור המבורגר למובייל */}
        <div className="md:hidden flex items-center pr-2">
          <ShopMobileMenu categories={categories} />
        </div>

        {/* הלוגו */}
        <div ref={containerRef} className="flex flex-row-reverse items-center gap-2 cursor-pointer shrink-0" onClick={handleClick}>
          <img ref={logoRef} src="/OnMotorLogonoback.png" alt="OnMotor Parts Logo" className="w-16 md:w-20 shrink-0 z-50" />
          <div className="truncate overflow-visible text-left">
            <h1 dir="ltr" className="text-3xl lg:text-4xl font-bold whitespace-nowrap z-50 flex justify-start md:justify-end">
              {logoText.map((part, i) => (
                <span key={i} ref={(el) => (lettersRef.current[i] = el)} className={`inline-block opacity-0 ${part.red ? 'text-[#e60000]' : 'text-white'}`}>
                  {part.char}
                </span>
              ))}
            </h1>
            <p className="text-sm lg:text-base font-bold whitespace-nowrap truncate text-[#C0C0C0] mt-0.5" dir="rtl">
              החנות המקצועית לחלפים וציוד רכיבה
            </p>
          </div>
        </div>

        {/* צד שמאל: ניווט, חיפוש ועגלה */}
        <div className="hidden md:flex items-center gap-6 justify-end flex-1 pl-2">
          
          <div className="flex items-center gap-4 text-white font-medium [&_a]:!text-white [&_span]:!text-white hover:[&_a]:!text-[#e60000] transition-colors">
            <CategoriesNav categories={categories} />
            <DesktopMegaMenu menuItems={menuItems} />
          </div>

          <div className="w-[200px] lg:w-[300px]">
            <LiveSearchBar />
          </div>

          {/* 🌟 אזור הכלים: כפתור אזור אישי + עגלה 🌟 */}
          <div className="flex items-center gap-2">
            
            {/* כפתור אזור אישי */}
            <Link 
              href="/shop/account" 
              className="flex items-center justify-center bg-zinc-900 w-10 h-10 rounded-full border border-gray-800 text-white hover:text-[#e60000] hover:border-[#e60000] transition-colors"
              title="לאזור האישי"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* עגלת קניות */}
            <div className="flex items-center gap-2 font-bold text-white shrink-0 bg-zinc-900 px-3 h-10 rounded-full border border-gray-800">
              <span className="text-base">₪{total}</span>
              <CartButton />
            </div>

          </div>

        </div>
      </header>
      
      <div className="h-[80px] w-full shrink-0"></div>
    </>
  );
}