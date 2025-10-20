//components\Header.jsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import NavigationMenu from './NavigationMenu';
import SearchBar from './SearchBar';
import SocialIcons from './SocialIcons';
import { useAuthModal } from '@/contexts/AuthModalProvider';

export default function Header() {
  const { user, openModal, hydrated } = useAuthModal();
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

    tl.to(containerRef.current, {
      x: -4,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'power1.inOut',
    });

    tl.to(
      logoRef.current,
      { rotate: '+=720', duration: 1.2, ease: 'power3.out' },
      '-=0.2'
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
    <header className="sticky top-0 z-50 bg-black text-[#C0C0C0] h-[80px] fixed w-full flex flex-row-reverse items-center justify-between px-2 md:px-6 py-2 shadow-md border-b border-gray-800">
      <div
        ref={containerRef}
        className="flex flex-row-reverse items-center gap-2 min-w-0 cursor-pointer"
        onClick={handleClick}
      >
        <div className="hidden lg:block z-50" dir="rtl">
          {!hydrated ? (
            <div className="w-[80px] h-[32px]" />
          ) : user?.email ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('inline', 'התנתקות');
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap"
            >
              {user?.email?.charAt(0).toUpperCase()} מחובר
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('inline', 'התחברות / הרשמה');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap"
            >
              התחבר
            </button>
          )}
        </div>

        <img
          ref={logoRef}
          src="/OnMotorLogonoback.png"
          alt="OnMotor Logo"
          className="w-20 shrink-0 z-50"
          dir="rtl"
        />

        <div className="truncate overflow-visible">
          <h1 dir="ltr" className="text-2xl lg:text-4xl font-bold whitespace-nowrap z-50 flex">
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
