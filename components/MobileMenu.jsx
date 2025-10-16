//components\MobileMenu.jsx

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import NavigationMenu from './NavigationMenu';
import SearchBar from './SearchBar';
import MobileSocialMenu from './MobileSocialMenu';
import AuthBox from './AuthBox';
import { getCurrentUser } from '@/utils/auth';
import { gsap } from 'gsap';

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

  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  return (
    <>
      {/* כפתור ההמבורגר תמיד בראש הדף */}
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

      {/* תפריט נפתח בגודל מסך */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 left-0 right-0 h-screen w-[90vw] bg-black text-white p-2 flex flex-col gap-2 z-[9999] text-right shadow-lg overflow-y-auto"
        >
          <div dir="ltr" className="flex justify-between items-center">
            <button onClick={() => setIsOpen(false)} className="text-2xl">
              <FaTimes />
            </button>
          </div>

          <div className="w-full">
            <SearchBar onSelect={() => setIsOpen(false)} />
          </div>

          <div dir="rtl">
            <NavigationMenu mobile onClose={() => setIsOpen(false)} />
          </div>

          <MobileSocialMenu />

          <div className="w-full" ref={authBoxRef}>
            <button
              onClick={() => setShowAuthBox(!showAuthBox)}
              className={`text-xl ${
                isLoggedIn ? 'bg-green-600' : 'bg-[#e60000]'
              } text-white px-3 py-2 rounded shadow hover:bg-opacity-80 transition w-full text-center`}
            >
              {isLoggedIn ? 'מחובר' : 'התחברות / הרשמה'}{' '}
              {showAuthBox ? <FaChevronUp className="inline" /> : <FaChevronDown className="inline" />}
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showAuthBox ? 'max-h-[1000px] opacity-100 scale-100 mt-4' : 'max-h-0 opacity-0 scale-95'
              }`}
            >
              <div className="bg-white text-black p-4 rounded shadow-md">
                <AuthBox mode="inline" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
