// components/MobileMenu.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // הסרתי את FaTimes כי יצרנו אייקון דק ידנית
import NavigationMenu from './NavigationMenu';
import SearchBar from './SearchBar';
import MobileSocialMenu from './MobileSocialMenu';
import AuthBox from './AuthBox';
import LegalLinks from '@/components/LegalLinks';
import { getCurrentUser } from '@/utils/auth';
import { gsap } from 'gsap';
import { useSwipeable } from 'react-swipeable';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthBox, setShowAuthBox] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const authBoxRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (showAuthBox && authBoxRef.current) {
      setTimeout(() => {
        authBoxRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 350);
    }
  }, [showAuthBox]);

  // ✅ פתיחה חלקה
  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  // ✅ סגירה חלקה
  const closeMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  // ✅ פונקציית טוגל לכפתור ההמבורגר
  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
  };

  // ✅ החלקה דו־כיוונית לסגירה
  const handlers = useSwipeable({
    onSwipedLeft: () => isOpen && closeMenu(),
    onSwipedRight: () => isOpen && closeMenu(),
    trackTouch: true,
    delta: 25,
    preventScrollOnSwipe: true,
    swipeDuration: 250,
  });

  return (
    <>
      {/* כפתור ההמבורגר - תמיד מוצג כעת */}
      <button
        onClick={toggleMenu}
        className="h-[50px] w-[50px] flex flex-col items-center justify-center gap-2 bg-transparent z-[100000] relative"
      >
        {/* שינוי ויזואלי קטן: אם פתוח, אולי נרצה לשנות צבע או אנימציה, כרגע השארתי זהה */}
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-[5px] w-[45px] rounded-sm transition-all duration-300 ${
              isLoggedIn ? 'bg-green-600' : 'bg-red-600'
            }`}
          />
        ))}
      </button>

      {isOpen && (
        <div
          {...handlers}
          ref={menuRef}
          // שינוי: top-[50px] כדי להתחיל מתחת להמבורגר, וחישוב גובה בהתאם
          className="fixed top-[50px] left-0 right-0 h-[calc(100vh-50px)] w-[90vw] bg-black text-white flex flex-col z-[99999] text-right shadow-lg"
          style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
        >
          {/* 🔝 אזור עליון קבוע */}
          <div className="sticky top-0 bg-black z-[50] border-b border-neutral-800 pb-2">
            
            {/* שינוי: הוספת מרווחים (pt-3, mb-4) לאזור האיקס */}
            <div dir="ltr" className="flex justify-between items-center px-2 pt-3 mb-4">
              <button onClick={closeMenu} className="text-white hover:text-gray-300 transition p-1">
                {/* שינוי: אייקון איקס דק (SVG ידני) במקום FaTimes */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-8 h-8" // גודל האיקס
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-2">
              <SearchBar onSelect={closeMenu} />
            </div>
          </div>

          {/* ⚙️ גוף התפריט */}
          <div
            className="flex-1 px-2 mt-3 space-y-4 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 160px)' }} // התאמה קלה לגובה החדש
          >
            <div dir="rtl" className="relative z-[1]">
              <NavigationMenu mobile onClose={closeMenu} />
            </div>

            <div className="mt-3">
              <MobileSocialMenu />
            </div>

            {/* 🔐 התחברות / הרשמה + מדיניות */}
            <div className="w-full mt-auto pb-6" ref={authBoxRef}>
              <button
                onClick={() => setShowAuthBox(!showAuthBox)}
                className={`text-xl ${
                  isLoggedIn ? 'bg-green-600' : 'bg-[#e60000]'
                } text-white px-3 py-2 rounded shadow hover:bg-opacity-80 transition w-full text-center`}
              >
                {isLoggedIn ? 'מחובר' : 'התחברות / הרשמה'}{' '}
                {showAuthBox ? (
                  <FaChevronUp className="inline" />
                ) : (
                  <FaChevronDown className="inline" />
                )}
              </button>

              {/* תיבת ההתחברות */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showAuthBox
                    ? 'max-h-[1000px] opacity-100 scale-100 mt-4'
                    : 'max-h-0 opacity-0 scale-95'
                }`}
              >
                <div className="bg-white text-black p-4 rounded shadow-md relative z-[2]">
                  <AuthBox mode="inline" />
                </div>
              </div>

              {/* ✅ כפתור מדיניות האתר מתחת להרשמה */}
              <div className="mt-3">
                <LegalLinks isMobile={true} onLinkClick={closeMenu}/>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}