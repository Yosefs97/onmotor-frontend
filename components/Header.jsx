// components/Header.jsx
'use client';
import React, { useLayoutEffect, useRef } from 'react'; // שינוי ל-useLayoutEffect
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

  // שימוש ב-useLayoutEffect מונע את ה"קפיצה" הראשונית כי הוא רץ לפני הציור על המסך
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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
    }, containerRef); // Scope ל-GSAP לניקוי זיכרון יעיל

    return () => ctx.revert(); // ניקוי האנימציה כשהקומפוננטה יוצאת
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
    // שינוי קריטי כאן: הסרתי את 'fixed' והשארתי רק 'sticky'
    // זה מונע מהתוכן מתחת לקפוץ בטעינה
    <header className="sticky top-0 z-50 h-[80px] w-full flex flex-row-reverse items-center justify-between px-2 md:px-6 py-2 bg-om-header text-om-chrome font-display shadow-header border-b border-om-steel relative after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gradient-to-l after:from-om-ember after:via-om-blaze after:to-om-blood">
      <div
        ref={containerRef}
        className="flex flex-row-reverse items-center gap-2 min-w-0 cursor-pointer"
        onClick={handleClick}
      >
        <div className="hidden lg:block z-50" dir="rtl">
          <AuthStatusButton />
        </div>

        <img
          ref={logoRef}
          src="/OnMotorLogonoback.png"
          alt="OnMotor Logo"
          className="w-20 shrink-0 z-50 drop-shadow-[0_0_18px_rgba(255,59,0,0.45)]"
          dir="rtl"
        />

        <div className="truncate overflow-visible">
          <h1
            dir="ltr"
            className="text-2xl lg:text-4xl font-black tracking-tightish whitespace-nowrap z-50 flex"
          >
            {logoText.map((part, i) => (
              <span
                key={i}
                ref={(el) => (lettersRef.current[i] = el)}
                className={`inline-block opacity-0 ${part.red ? 'text-om-ember' : 'text-white'}`}
              >
                {part.char}
              </span>
            ))}
          </h1>
          <p className="text-[10px] lg:text-xs font-bold tracking-racing uppercase text-om-mist text-right whitespace-nowrap truncate">
            איפה שמנוע וגלגלים פוגשים מדיה
          </p>
        </div>
      </div>

      <div className="hidden mobileMenu:hidden lg:flex items-end flex-shrink-0 z-50 suppressHydrationWarning">
        <div dir="ltr" className="flex items-center">
          <div className="w-0 h-15 gap-2">
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
    </header>
  );
}