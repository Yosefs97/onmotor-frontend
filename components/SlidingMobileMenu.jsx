//components\SlidingMobileMenu.jsx
'use client';
import React, { useState, useEffect } from 'react';
import NavigationMenu from './NavigationMenu';
import AuthNewsletterBox from './AuthNewsletterBox';
import SearchBar from './SearchBar';
import MobileSocialMenu from './MobileSocialMenu';
import MobileMenuButton from './MobileMenuButton';

export default function SlidingMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthBox, setShowAuthBox] = useState(false);

  // למנוע גלילה של הרקע כשפתוח
  useEffect(() => {
    const html = document.querySelector('html');
    const body = document.body;

    if (isOpen) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
    }

    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden fixed inset-0 z-40">
      {/* כפתור המבורגר */}
      <MobileMenuButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

      {/* תפריט צד מחליק */}
      <div
        className={`fixed top-0 h-screen bottom-16 right-0  w-[90vw] bg-black text-white z-50 shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-5 flex flex-col gap-6 text-right">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-right w-full">תפריט</span>
            <button onClick={() => setIsOpen(false)} className="text-2xl">
              ×
            </button>
          </div>

          <SearchBar />
          <NavigationMenu mobile />
          <MobileSocialMenu />

          <button
            onClick={() => setShowAuthBox(!showAuthBox)}
            className="bg-[#e60000] text-white px-3 py-2 rounded text-sm"
          >
            {showAuthBox ? 'סגור התחברות / הרשמה' : 'התחברות / הרשמה'}
          </button>

          {showAuthBox && (
            <div className="bg-white text-black rounded p-4 shadow-md">
              <AuthNewsletterBox inline={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
