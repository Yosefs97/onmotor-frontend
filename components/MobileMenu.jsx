// components/MobileMenu.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
  const [showPolicies, setShowPolicies] = useState(false);
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
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  // ✅ סגירה חלקה
  const closeMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-[50px] w-[50px] flex flex-col items-center justify-center gap-2 bg-transparent"
        >
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-[5px] w-[45px] rounded-sm transition-all duration-300 ${
                isLoggedIn ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          ))}
        </button>
      )}

      {isOpen && (
        <div
          {...handlers}
          ref={menuRef}
          className="fixed top-0 left-0 right-0 h-screen w-[90vw] bg-black text-white flex flex-col z-[9999] text-right shadow-lg"
          style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
        >
          {/* 🔝 אזור עליון קבוע */}
          <div className="sticky top-0 bg-black z-[50] border-b border-neutral-800 pb-2">
            <div dir="ltr" className="flex justify-between items-center px-2 pt-2 mb-1">
              <button onClick={closeMenu} className="text-2xl">
                <FaTimes />
              </button>
            </div>
            <div className="px-2">
              <SearchBar onSelect={closeMenu} />
            </div>
          </div>

          {/* ⚙️ גוף התפריט */}
          <div
            className="flex-1 px-2 mt-3 space-y-4 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 110px)' }}
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
