//components/ShopHeader.jsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CartUnderHeader from "@/components/CartUnderHeader";

export default function ShopHeader() {
  const logoRef = useRef(null);
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const isAnimating = useRef(false);

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
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = '/shop';
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
    { char: 'P', red: true },
    { char: 'arts' },
  ];

  return (
    // השינוי כאן: flex-row-reverse מצמיד אותו לשמאל בדיוק כמו במגזין
    <header className="sticky top-0 z-50 bg-black text-[#C0C0C0] h-[80px] w-full flex flex-row-reverse items-center px-2 md:px-6 py-2 shadow-md border-b border-gray-800">
      
      <div
        ref={containerRef}
        className="flex flex-row-reverse items-center gap-2 min-w-0 cursor-pointer"
        onClick={handleClick}
      >
        <img
          ref={logoRef}
          src="/OnMotorLogonoback.png"
          alt="OnMotor Parts Logo"
          className="w-20 shrink-0 z-50"
          dir="rtl"
        />

        <div className="truncate overflow-visible text-right">
          <h1
            dir="ltr"
            className="text-2xl lg:text-4xl font-bold whitespace-nowrap z-50 flex justify-end"
          >
            {logoText.map((part, i) => (
              <span
                key={i}
                ref={(el) => (lettersRef.current[i] = el)}
                className={`inline-block opacity-0 ${part.red ? 'text-[#e60000]' : ''}`}
              >
                {part.char}
              </span>
            ))}
          </h1>
          <p className="text-xs lg:text-sm font-bold whitespace-nowrap truncate">
            החנות המקצועית לחלפים וציוד רכיבה
          </p>
        </div>
      </div>
      <CartUnderHeader menuItems={menuItems} categories={categories} />

    </header>
  );
}