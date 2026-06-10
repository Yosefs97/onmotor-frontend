//components/ShopMobileMenu.jsx

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useSwipeable } from 'react-swipeable';
import { MessageCircle, User } from 'lucide-react'; // הוספנו את User
import ShopInfoAccordion from './ShopInfoAccordion';

export default function ShopMobileMenu({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ פתיחה חלקה מהצד (ימין)
  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { x: '100%', opacity: 0.5 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  // ✅ סגירה חלקה ימינה
  const closeMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        x: '100%',
        opacity: 0.5,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    if (isOpen) closeMenu();
    else setIsOpen(true);
  };

  // ✅ החלקה ימינה לסגירת התפריט
  const handlers = useSwipeable({
    onSwipedRight: () => isOpen && closeMenu(),
    trackTouch: true,
    delta: 30,
    preventScrollOnSwipe: true,
    swipeDuration: 250,
  });

  return (
    <>
      {/* כפתור ההמבורגר - מותאם אישית לחנות */}
      <button
        onClick={toggleMenu}
        className="flex flex-col items-center justify-center gap-[4px] p-2 bg-transparent z-[70] relative"
        aria-label="פתח תפריט חנות"
      >
        <span className={`h-[3px] w-[24px] rounded-sm bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`h-[3px] w-[24px] rounded-sm bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`h-[3px] w-[24px] rounded-sm bg-[#e60000] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px] bg-white' : ''}`} />
      </button>

      {/* רקע כהה חצי שקוף מאחורי התפריט */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[99998]" 
          onClick={closeMenu}
        />
      )}

      {/* חלון התפריט עצמו */}
      {isOpen && (
        <div
          {...handlers}
          ref={menuRef}
          className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[400px] bg-white text-black flex flex-col z-[99999] shadow-2xl"
          dir="rtl"
        >
          {/* 🔝 אזור עליון: כותרת וכפתור סגירה */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <span className="font-black text-xl text-black">תפריט חנות</span>
            <button onClick={closeMenu} className="text-gray-500 hover:text-black transition p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ⚙️ גוף התפריט הנגלל */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            
            {/* 🌟 כפתור לאזור האישי (חדש) 🌟 */}
            <Link 
              href="/shop/account" 
              onClick={closeMenu}
              className="flex items-center gap-3 bg-zinc-900 text-white p-4 rounded-xl shadow-md hover:bg-black transition"
            >
              <div className="bg-[#e60000] p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">החשבון שלי</span>
                <span className="text-xs text-gray-300">היסטוריית הזמנות ומעקב</span>
              </div>
            </Link>

            {/* 1. קטגוריות החנות (בתצוגה אנכית נוחה למובייל) */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">קטגוריות</h3>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <Link 
                    key={cat.handle} 
                    href={cat.href}
                    onClick={closeMenu}
                    className="py-3 text-lg font-bold text-gray-800 border-b border-gray-100 hover:text-[#e60000]"
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            </section>

            {/* 2. מידע על החנות (האקורדיון שלך) */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">מידע שימושי</h3>
              <div className="border border-gray-200 rounded-lg shadow-sm">
                <ShopInfoAccordion />
              </div>
            </section>
          </div>

          {/* 💬 אזור תחתון קבוע - כפתור וואטסאפ בולט */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <a
              href="https://wa.me/972506129664"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-5 py-3 rounded-xl text-lg font-bold hover:bg-[#1ebe57] transition shadow-md"
            >
              <MessageCircle className="w-6 h-6" />
              דברו איתנו בוואטסאפ
            </a>
          </div>

        </div>
      )}
    </>
  );
}