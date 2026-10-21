'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useSwipeable } from 'react-swipeable';
import { MessageCircle, User, ChevronDown } from 'lucide-react';
import ShopInfoAccordion from './ShopInfoAccordion'; 

const formatUrl = (rawUrl) => {
  if (!rawUrl) return '#';
  if (rawUrl === '#' || rawUrl.endsWith('#') || rawUrl === 'https://nwjhcm-gf.myshopify.com/') return '#';
  try {
    const urlObj = new URL(rawUrl);
    let newPath = urlObj.pathname;
    if (newPath === '/' && !urlObj.search) return '#';
    if (newPath.startsWith('/collections/')) newPath = newPath.replace('/collections/', '/shop/collection/');
    return newPath + decodeURIComponent(urlObj.search);
  } catch (e) {
    return rawUrl;
  }
};

const MobileMenuItem = ({ item, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.items && item.items.length > 0;
  const itemUrl = formatUrl(item.url);

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center justify-between">
        {itemUrl !== '#' ? (
          <Link href={itemUrl} onClick={closeMenu} className="flex-1 py-3 text-lg font-bold text-gray-800 hover:text-[#e60000]">
            {item.title}
          </Link>
        ) : (
          <span className="flex-1 py-3 text-lg font-bold text-gray-800 cursor-default">
            {item.title}
          </span>
        )}
        
        {hasSubItems && (
          <button onClick={() => setIsOpen(!isOpen)} className="p-3 text-gray-500 flex items-center justify-center">
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#e60000]' : ''}`} />
          </button>
        )}
      </div>

      {hasSubItems && isOpen && (
        <div className="pl-0 pr-4 pb-3 space-y-4 bg-gray-50/50">
          {item.items.map((subItem, idx) => {
            const hasDeepItems = subItem.items && subItem.items.length > 0;
            const subItemUrl = formatUrl(subItem.url);

            return (
              <div key={idx} className="space-y-2 mt-2">
                {subItemUrl !== '#' ? (
                  <Link href={subItemUrl} onClick={closeMenu} className="block text-base font-bold text-[#e60000]">
                    {subItem.title}
                  </Link>
                ) : (
                  <span className="block text-base font-bold text-[#e60000]">
                    {subItem.title}
                  </span>
                )}

                {hasDeepItems && (
                  <ul className="pr-3 space-y-2 border-r-2 border-gray-200">
                    {subItem.items.map((deepItem, deepIdx) => (
                      <li key={deepIdx}>
                        <Link href={formatUrl(deepItem.url)} onClick={closeMenu} className="block text-sm text-gray-600 hover:text-[#e60000] py-1">
                          {deepItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function ShopMobileMenu({ menuItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(menuRef.current, { x: '100%', opacity: 0.5 }, { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' });
    }
  }, [isOpen]);

  const closeMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, { x: '100%', opacity: 0.5, duration: 0.35, ease: 'power3.in', onComplete: () => setIsOpen(false) });
    } else {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => isOpen ? closeMenu() : setIsOpen(true);

  const handlers = useSwipeable({
    onSwipedRight: () => isOpen && closeMenu(),
    trackTouch: true,
    delta: 30,
    preventScrollOnSwipe: true,
    swipeDuration: 250,
  });

  return (
    <>
      <button onClick={toggleMenu} className="flex flex-col items-center justify-center gap-[4px] p-2 bg-transparent z-[70] relative" aria-label="פתח תפריט חנות">
        <span className={`h-[3px] w-[24px] rounded-sm bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`h-[3px] w-[24px] rounded-sm bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`h-[3px] w-[24px] rounded-sm bg-[#e60000] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px] bg-white' : ''}`} />
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/60 z-[99998]" onClick={closeMenu} />}

      {isOpen && (
        <div {...handlers} ref={menuRef} className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[400px] bg-white text-black flex flex-col z-[99999] shadow-2xl" dir="rtl">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <span className="font-black text-xl text-black">תפריט חנות</span>
            <button onClick={closeMenu} className="text-gray-500 hover:text-black transition p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            <Link href="/shop/account" onClick={closeMenu} className="flex items-center gap-3 bg-zinc-900 text-white p-4 rounded-xl shadow-md hover:bg-black transition">
              <div className="bg-[#e60000] p-2 rounded-full"><User className="w-6 h-6 text-white" /></div>
              <div className="flex flex-col"><span className="font-bold text-lg">החשבון שלי</span><span className="text-xs text-gray-300">היסטוריית הזמנות ומעקב</span></div>
            </Link>

            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">קטגוריות</h3>
              <div className="flex flex-col gap-1">
                {menuItems.map((item, idx) => (
                  <MobileMenuItem key={idx} item={item} closeMenu={closeMenu} />
                ))}
                <a href="https://www.onmotormedia.com/" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="py-3 text-lg font-bold text-[#e60000] border-b border-gray-100 hover:text-red-700 transition-colors">
                  למגזין
                </a>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">מידע שימושי</h3>
              <div className="border border-gray-200 rounded-lg shadow-sm"><ShopInfoAccordion /></div>
            </section>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <a href="https://wa.me/972506129664" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-5 py-3 rounded-xl text-lg font-bold hover:bg-[#1ebe57] transition shadow-md">
              <MessageCircle className="w-6 h-6" /> דברו איתנו בוואטסאפ
            </a>
          </div>
        </div>
      )}
    </>
  );
}