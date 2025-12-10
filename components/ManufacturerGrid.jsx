// /components/ManufacturerGrid.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from './ScrollSearchBar';

export default function ManufacturerGrid({ manufacturers }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  // משתמשים ב-Ref כדי לעקוב אחרי הסטטוס בלי לגרום לרינדור מחדש בתוך הלולאה
  const isUserInteracting = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = null;
    let timeoutId;

    const stopAnimation = () => {
      isUserInteracting.current = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const animate = (timestamp) => {
      if (isUserInteracting.current) return; // עצירה אם המשתמש נגע

      if (!start) start = timestamp;
      const duration = 2500; // 2.5 שניות לכל התנועה (הלוך חזור)
      const progress = timestamp - start;

      // חישוב התקדמות (0 עד 1 וחזרה ל-0)
      // Math.PI מבטיח חצי עיגול של סינוס (עולה ויורד)
      const ease = Math.sin((Math.min(progress / duration, 1)) * Math.PI);
      
      // המרחק: 60% מהמסך או מינימום 200 פיקסלים
      const amountToScroll = Math.max(el.clientWidth * 0.6, 200);
      
      el.scrollLeft = ease * amountToScroll;

      if (progress < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // וידוא בסיום שהחזרנו ל-0
        el.scrollLeft = 0;
      }
    };

    // מתחילים את האנימציה בדיליי קצר
    timeoutId = setTimeout(() => {
        if(!isUserInteracting.current) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, 1000);

    // מאזינים רק לאינטראקציה ישירה של משתמש (ולא ל-scroll הכללי)
    const events = ['touchstart', 'wheel', 'mousedown', 'keydown'];
    events.forEach(evt => el.addEventListener(evt, stopAnimation, { once: true }));

    return () => {
      events.forEach(evt => el.removeEventListener(evt, stopAnimation));
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timeoutId);
    };
  }, []); // רוץ רק פעם אחת בטעינה

  if (!manufacturers.length)
    return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן או החלק שמאלה" containerRef={containerRef} />

      <div
        ref={containerRef}
        // הסרתי את scroll-smooth כדי למנוע התנגשות עם ה-JS
        className="scroll-container flex overflow-x-scroll space-x-1 pb-4 px-2 snap-x snap-mandatory"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            prefetch={false}
            data-name={m.title}
            // הוספתי select-none כדי למנוע סימון טקסט בזמן גרירה
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white select-none"
          >
            {m.image?.url && (
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={m.image.url}
                  alt={m.image.altText || m.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  // מונע גרירה של התמונה עצמה במקום הגלילה
                  draggable={false} 
                />
              </div>
            )}
            <p className="text-center font-semibold text-gray-900 hover:text-[#e60000] transition-colors duration-200">
              {m.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}