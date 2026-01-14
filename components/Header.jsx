// components/Header.jsx
'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import NavigationMenu from './NavigationMenu';
import SearchBar from './SearchBar';
import SocialIcons from './SocialIcons';
import AuthStatusButton from './AuthStatusButton';

export default function Header() {
  const logoRef = useRef(null);
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      logoRef.current,
      { rotate: -90, scale: 0.8 },
      { rotate: 0, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' }
    );

    tl.fromTo(
      lettersRef.current,
      { y: 15, opacity: 0, rotate: -10 },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.7)',
      },
      '-=0.9'
    );
  }, []);

  const handleClick = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = '/';
      },
    });

    tl.to(
      logoRef.current,
      { rotate: '+=720', duration: 1.2, ease: 'power3.out' },
      'start'
    );

    tl.to(
      lettersRef.current,
      {
        y: -10,
        x: 5,
        rotate: 5,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power1.out',
        yoyo: true,
        repeat: 1,
      },
      '-=1'
    );
  };

  const logoText = [
    { char: 'O', red: true },
    { char: 'n' },
    { char: 'M', red: true },
    { char: 'otor\u00A0' },
    { char: 'M', red: true },
    { char: 'edia' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black text-[#C0C0C0] h-[80px] w-full flex flex-row-reverse items-center justify-between px-2 md:px-6 py-2 shadow-md border-b border-gray-800">
      
      {/* --- אזור הלוגו --- */}
      <div
        ref={containerRef}
        className="flex flex-row-reverse items-center gap-2 min-w-0 cursor-pointer shrink-0" // הוספתי shrink-0 כדי שהלוגו לא יתכווץ
        onClick={handleClick}
      >
        <div className="hidden lg:block z-50" dir="rtl">
          <AuthStatusButton />
        </div>

        <img
          ref={logoRef}
          src="/OnMotorLogonoback.png"
          alt="OnMotor Logo"
          className="w-20 shrink-0 z-50"
          dir="rtl"
        />

        <div className="truncate overflow-visible">
          <h1
            dir="ltr"
            className="text-2xl lg:text-4xl font-bold whitespace-nowrap z-50 flex"
          >
            {logoText.map((part, i) => (
              <span
                key={i}
                ref={(el) => (lettersRef.current[i] = el)}
                className={`inline-block ${part.red ? 'text-[#e60000]' : ''}`}
              >
                {part.char}
              </span>
            ))}
          </h1>
          <p className="text-xs lg:text-sm font-bold text-right whitespace-nowrap truncate">
            איפה שמנוע וגלגלים פוגשים מדיה
          </p>
        </div>
      </div>

      {/* --- אזור החיפוש והתפריט ---
          שינוי קריטי: החלפתי את lg:flex ב-xl:flex
          זה אומר: "תציג את התפריט הרגיל רק אם המסך רחב יותר מ-1280 פיקסלים".
          אחרת - הוא מוסתר (כמו במובייל).
       */}
      <div className="hidden mobileMenu:hidden xl:flex items-end flex-shrink-0 z-50 suppressHydrationWarning">
        <div dir="ltr" className="flex items-center">
          
          {/* תיקון: w-0 הוחלף ב-w-auto כדי לאפשר לחיפוש לתפוס מקום */}
          <div className="w-auto h-15 gap-2">
            <SearchBar />
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center h-10 top-0">
              <SocialIcons size="text-3xl" />
            </div>
            <div dir="ltr" className="flex items-center h-0">
              <NavigationMenu />
            </div>
          </div>
        </div>
      </div>
      
      {/* הערה: כאן בדרך כלל אמור להיות כפתור המבורגר למובייל שיוצג כאשר ה-div העליון מוסתר (hidden) */}
      
    </header>
  );
}